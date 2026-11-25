#!/usr/bin/env node
/**
 * Screenshot a page through the Chrome DevTools Protocol.
 *
 * Why not `chrome --headless --screenshot --window-size=390,...`?
 * Chrome clamps the window to a 500px minimum, so that flag cannot show a real
 * phone viewport. Emulation.setDeviceMetricsOverride can.
 *
 * usage:
 *   node shot.mjs <url> <out.png> [options]
 *
 * options:
 *   --width 390        CSS viewport width (default 1280)
 *   --height 844       CSS viewport height (default 900)
 *   --scale 2          device scale factor (default 1; keep 1 for --full)
 *   --selector "#p1"   scroll this element to the top, then capture the viewport
 *   --full             capture the whole page (height capped at 16000px)
 *   --wait 800         extra wait after load, ms
 *   --eval file.js     evaluate a JS file first and print its JSON result
 *   --mobile           emulate a mobile device (default false)
 *   --port 9222        CDP port
 *
 * Chrome is started automatically when nothing is listening on the port.
 */
import { spawn } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const argv = process.argv.slice(2);
if (argv.length < 2) {
  console.error('usage: node shot.mjs <url> <out.png> [--width 390] [--height 844] [--scale 2] [--selector "#p1"] [--full] [--eval file.js]');
  process.exit(2);
}
const [url, out] = argv;
const opt = (name, def) => {
  const i = argv.indexOf('--' + name);
  return i === -1 ? def : argv[i + 1];
};
const has = (name) => argv.includes('--' + name);

const width = Number(opt('width', 1280));
const height = Number(opt('height', 900));
const scale = Number(opt('scale', 1));
const waitMs = Number(opt('wait', 800));
const port = Number(opt('port', 9222));
const selector = opt('selector', null);
const evalFile = opt('eval', null);
const full = has('full');
const mobile = has('mobile');

const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdpAlive() {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`);
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureChrome() {
  if (await cdpAlive()) return null;
  const child = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-crashpad', '--disable-gpu',
    '--hide-scrollbars', '--no-first-run',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/chrome-shot-${process.pid}`,
    'about:blank',
  ], { detached: true, stdio: 'ignore' });
  child.unref();
  for (let i = 0; i < 60; i++) {
    await sleep(250);
    if (await cdpAlive()) return child;
  }
  throw new Error(`Chrome did not expose CDP on port ${port}`);
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.handlers = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        for (const fn of this.handlers.get(msg.method) || []) fn(msg.params);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  once(method) {
    return new Promise((resolve) => {
      const fn = (params) => {
        this.handlers.set(method, (this.handlers.get(method) || []).filter((f) => f !== fn));
        resolve(params);
      };
      this.handlers.set(method, [...(this.handlers.get(method) || []), fn]);
    });
  }
}

async function main() {
  const spawned = await ensureChrome();
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  const cdp = new CDP(ws);

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: scale, mobile,
  });

  const loaded = cdp.once('Page.loadEventFired');
  await cdp.send('Page.navigate', { url });
  await Promise.race([loaded, sleep(8000)]);
  await sleep(waitMs);

  if (evalFile) {
    const expression = readFileSync(evalFile, 'utf8');
    const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true,
    });
    if (exceptionDetails) {
      console.error('EVAL ERROR:', exceptionDetails.text || exceptionDetails.exception?.description);
    } else {
      console.log(JSON.stringify(result.value, null, 2));
    }
  }

  if (selector) {
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return 'not-found';
        const y = el.getBoundingClientRect().top + window.scrollY - 12;
        window.scrollTo({ top: y, behavior: 'instant' });
        return 'ok';
      })()`,
      returnByValue: true,
    });
    await sleep(500);
  }

  let clip = null;
  if (full) {
    const { result } = await cdp.send('Runtime.evaluate', {
      expression: 'Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)',
      returnByValue: true,
    });
    clip = { x: 0, y: 0, width, height: Math.min(result.value, 16000), scale: 1 };
  }

  const shot = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: full,
    ...(clip ? { clip } : {}),
  });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log(`${out}  ${width}x${clip ? clip.height : height} @${scale}x`);

  ws.close();
  try { await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`); } catch {}
  if (spawned) { try { process.kill(-spawned.pid); } catch {} }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
