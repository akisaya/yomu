# 验证流程

页面是单文件、无构建，所以验证全靠“渲染出来看”和“结构对一遍”。下面四步按顺序做，能拦住几乎所有返工。

> 脚本路径相对本 skill 目录；HTML 路径相对当前项目。

## 零、源档核对

逐篇检查页面目录中的 `<slug>/source.md`：

- 每篇都有自己的 `<slug>/source.md` 与 `index.html`；同作品文章也不合进一份 Markdown。题眼、出处和页面链接完整。
- 每份源档的 `## 第 N 段` 连续，Markdown 中的日文与中文段数分别等于同目录 HTML 的 `.para` 数量。
- 去掉 HTML 的 `<rt>` / `<rp>` 后，两处每段原文逐字相同；中文译文也逐字相同。不能把带振假名读音的 `textContent` 直接拿来比对。
- 原文、译文或分段要修改时，先改 Markdown，再同步 HTML。只在 HTML 改内容会让源档和展示页漂移。

新增源档属于增量交付。已有 HTML 和用户未提交的页面改动必须保留；除非用户明确要求迁移，否则不改旧文档的位置、格式或历史。

## 一、结构自检

```bash
python3 scripts/check_page.py index.html
```

输出示例（真实页面）：

```
文件      saikou-no-rikon/index.html  (… KB, … 行)
语言      zh-CN
小节      letter → close-reading → vocab
正文段落  12
精读卡    12
振假名    70 处
词表      55 行
文法原句  76 条（12 卡，全部命中所属段落）
外链      2
结构检查通过
```

会拦下：标签未闭合/错位、重复 id、指向不存在锚点的链接、`target=_blank` 缺 `rel=noopener`、`img` 缺 `alt`、段落与精读卡数量不一致、仍存在独立 `#grammar` 节、**文法原句片段不是该段原文子串**、原句回跳指错段落、某张卡缺 `原文 ↑`。有问题时退出码为 1。

原句子串校验是脚本里最值钱的一条：手写片段时把逗号、送假名或振假名改一个字，页面上照样渲染，只有逐条比对才发现。

## 二、截图

### 为什么必须用 CDP

```bash
# 这样看不到 390px
chrome --headless --screenshot=x.png --window-size=390,844
```

Chrome 无头窗口有 **500px 最小宽度**，`--window-size=390` 实际渲染成 500px 再裁切，右侧内容会被切掉，看起来像溢出。必须用 `Emulation.setDeviceMetricsOverride`——`scripts/shot.mjs` 已经封装好。

### 常用配方

```bash
# 桌面首屏
node scripts/shot.mjs "file://$PWD/index.html" .shot/top.png --width 1440 --height 900

# 定位到某一节 / 某一段
node scripts/shot.mjs "file://$PWD/index.html" .shot/letter.png --width 1280 --height 950 --selector "#p9"

# 真手机宽度（390）
node scripts/shot.mjs "file://$PWD/index.html" .shot/m.png --width 390 --height 844 --selector "#letter"

# 整页长图（注意 scale 用默认 1，否则图太大）
node scripts/shot.mjs "file://$PWD/index.html" .shot/full.png --width 1280 --full

# 高分屏看细节
node scripts/shot.mjs "file://$PWD/index.html" .shot/hero@2x.png --width 1000 --height 620 --scale 2
```

脚本会自动拉起 Chrome（若端口没有实例），结束时不关闭用户已有的浏览器。

### 长图切段

`sips` 的 `--cropOffset` 是 **top left**，不是 left top：

```bash
sips -c 1800 1280 --cropOffset 3600 0 .shot/full.png --out .shot/crop-2.png
```

整页 12000px 的图直接看会糊，按 1800px 一段切开逐段看。

### 字体

Google Fonts 在 `load` 之后才落地，截图前留 `--wait 600` 以上，否则拍到的是回退字体，误判"明朝体没生效"。

## 三、脚本语法

页面里的脚本是内联的，浏览器控制台不会在截图里报错。抽出来检查：

```bash
python3 - <<'PY'
import re
s = open('index.html', encoding='utf-8').read()
m = re.findall(r'<script>(.*?)</script>', s, re.S)
open('/tmp/page.js', 'w').write(m[-1])
PY
node --check /tmp/page.js
```

## 四、交互冒烟

`shot.mjs --eval` 会在截图前执行一段 JS 并打印返回值，适合一次性验完所有交互：

```js
// /tmp/smoke.js
(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const before = document.documentElement.dataset.furigana;

  document.querySelector('[data-toggle="furigana"]').click();
  await sleep(120);
  const after = document.documentElement.dataset.furigana;

  const input = document.querySelector('#vsearch');
  input.value = 'かわ';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await sleep(80);
  const filtered = [...document.querySelectorAll('#vbody tr')].filter(t => !t.hidden).length;

  return {
    before, after,
    rtHidden: getComputedStyle(document.querySelector('rt')).display === 'none',
    filtered,
    rows: document.querySelectorAll('#vbody tr').length,
    overflow: document.documentElement.scrollWidth - innerWidth,
    foldsClosed: [...document.querySelectorAll('details.fold')].every(d => !d.open),
    openCards: document.querySelectorAll('details[open]').length,   // 加载后应为 0
  };
})()
```

```bash
node scripts/shot.mjs "file://$PWD/index.html" .shot/smoke.png --width 390 --height 844 --eval /tmp/smoke.js
```

必须覆盖：两个开关（含 localStorage 记忆）、词表搜索与词性筛选、折叠卡开合、音频（全篇条能播能拖、段落 ▶ 从 `data-start` 起播并在 `data-end` 自动停、音频 404 时回退 TTS；纯 TTS 页则检查 `speechSynthesis` 不存在时按钮已移除）、**点一条文法原句后 `location.hash` 落到 `#pN` 且该段命中 `:target`**、横向溢出为 0。加载后 `details[open]` 必须是 0（精読、単語帳、所有精读卡都收起）；再点首屏「学習ノート」或页脚「精読」，对应 `details.fold` 变 `open`，落点 `top`≈80。

## 五、目视清单

- 振假名有没有被行高裁掉上缘（`rt` 小于 `.45em` 会裁）
- 行末是否参差（`word-break:auto-phrase` 的典型症状）
- 竖排标题的假名是否侧躺（`text-orientation` 必须是 `upright`）
- 段号与正文是否在同一条基线上
- 窄屏下词表是否横向溢出；卡片里的「句型名 + 原句片段」折行是否清楚
- 首屏、页脚里的段数/词数与实际数量是否一致；删掉文法节后没有残留「16 句型」
- 点原句片段能否跳回正确段落，示位闪动是否克制（不是静态色块）
- 关掉 JS（DevTools 禁用）后正文是否仍然可见
- 有剧照时：图在开头块与 `#p1` 之间、宽高比 3:2、没有字幕/台标/水印；边框与信纸内侧对齐；1440 与 390 都看过，窄屏没有把头切掉

## 常见故障对照

| 现象 | 原因 | 处理 |
|---|---|---|
| 整页空白 | `.reveal` 的初始隐藏没被 JS 解除 | 隐藏规则挂到 `.js` 下，并加 `<noscript>` 兜底 |
| 手机截图右侧被切 | 用了 `--window-size=390` | 改用 `shot.mjs`（CDP 模拟） |
| 振假名顶部被截 | `rt` 太小或行高太紧 | `rt{font-size:.5em}`，正文 `line-height` ≥ 2 |
| 行末大片空白 | `word-break:auto-phrase` | 删掉，只留 `line-break:strict` |
| 竖排假名侧躺 | `text-orientation:mixed` | 改 `upright` |
| 竖排标题只有一行 | 用 `block-size` 限宽 | 竖排的"宽度"是 `inline-size` |
| 改了默认开关但页面没变 | localStorage 里存着旧值 | 升 `STORE` key 的版本号 |
| 本地双击打开是文件列表 | 链接写成了 `dir/` | 写 `dir/index.html` |

## 从视频双语字幕取台词（无台本、无字幕文件时）

日剧台词站与公众号的「名台词合集」只给短句，遇到需要整场对白时，最可靠的来源是**带中日双语硬字幕的片源**。整条链路可离线完成，不需要 OCR 服务：

1. **定位分 P 与时间码**。B 站整剧投稿多为一个 BV、每集一个分 P。用户给的时间码是「第几 P 的第几分钟」时，先 `yt-dlp -F <url>?p=N` 确认时长与格式。
2. **只下这一段**（不整集下载）：
   `yt-dlp -f "30064+30280" --download-sections "*36:00-45:00" --force-keyframes-at-cuts -o g9.%(ext)s <url>?p=9`
   `30064` 是 720p AVC、`30280` 是 103k 音轨，字幕清晰度够；低清 480p 的小字会糊。
3. **抽帧 + 裁字幕条**：字幕固定在画面底部，裁掉上方剧情画面，OCR 更准、图更小。
   `ffmpeg -i g9.mp4 -vf "fps=1.6,crop=1280:150:0:570" -start_number 0 subs/%04d.png`
   `fps=1.6`（约 0.6 秒一帧）能覆盖 1–2 秒的短句；再密就是浪费。
4. **本地 OCR**（macOS，无需装 tesseract）：用 Vision 框架写十几行 Swift，`recognitionLanguages = ["ja-JP","zh-Hans"]`、`usesLanguageCorrection = false`（字幕短，纠错会改坏字）。编译一次可反复用。
   按 `boundingBox.minY` 排序——**日文行在下方**，先输出日文、后中文，正好配对。
5. **清洗**：去空帧 → 归一化空白 → 相邻完全相同或互为子串的合并（OCR 抖动与滚动补全）。1.6fps 下 9 分钟约 850 帧、去重后约 170 条。
6. **逐条核对可疑字形**：`ょ/よ`、`ず/す`、`ッ`、浊点最容易被认错。挑出含专有名词、数字、方言的帧，用 `ViewImage` 看原图确认（例：字幕实为「いずっぱこ」，与通行写法「いすっぱこ」不同）。
7. **按语序重组，不要按字幕行号照抄**：字幕的一行常常不是一句话。一句会被切成两三行，而「插进去的追问」也单独占一行，照行号排下来就会错位。
   实例（『ごめんね青春』第 9 話，36:22–36:31）：
   `ご飯作りました 手羽先の煮たヤツ` ／ `好きなんでしょ？` ／ `あと おかず いくつか`
   三行是同一句，「好きなんでしょ？」是插在列举中间的，不是独立的一句。判断依据只有两条：语法能否接上、说话人是否连续；拿不准就回到画面看口型与镜头。
8. **补点与合并要写进源档**：字幕多不带标点，页面上可按语气补最少的「。」「、」，但必须在 `source.md` 说明补点位置与合并情况，并注明「依字幕读出，非台本」；语序、字词一律不动。
9. **同一句内的片段也不能重排**：把几行字幕并成一句时，别按「读起来顺」调顺序，片段先后必须等于字幕出现先后。实例（『ごめんね青春』第 9 話，36:49 / 38:00–38:08）：「えッ？　待って待って」曾被并作「待って待って。えッ？…」；「それから　ロケット花火20本」／「そのあと　全部打ち込んで」／「手持ちの打ち上げ花火20連発も打ち込んで」三行曾被并作「…20本、全部打ち込んで。そのあと、手持ちの…」，把「そのあと」挪到了下一句。订正办法：对可疑句按时间码逐帧截字幕条（`ffmpeg -ss T -i g9f.mp4 -frames:v 1`），用 `ViewImage` 读原帧；ASR 只能判断语音先后，硬字幕才是断句与语序的依据。

**注意**：硬字幕本身就是听写产物，仍可能有个别错字；页面与源档都要写明来源，不能宣称「台本原文」。

## 新增/拆分页面时的组件清单（结构自检查不到，需人工对照母版）

`check_page.py` 只校验正文段落、精读卡、词表与文法片段，**不检查首屏与页脚的组件是否齐全**。曾出现拆分页漏掉首屏第三个按钮、页脚出处参考行的情况。交付前对照任一既有篇（如 `hirugao/`）逐项确认：

1. `.hero-actions` 三个按钮：`a.btn.primary`（读正文）／`a.btn`（学習ノート）／`a.btn.ext`「映像で見る」，外链须 `target="_blank" rel="noopener noreferrer"`。
2. 页脚左侧出处段有「片段影像：[Bilibili「作品名」集数 时间码 ↗](...)」一行，与首屏按钮指向同一 URL。
3. 页脚右侧有前篇/后篇互链（若有）、作品一覧、ページ上部へ。
4. 首页 `.entries` 新增条目后同步 `収録 N 本` 与页脚计数。

链接时间码：B 站整剧投稿按分 P 组织，`?p=N&t=秒数`；**不带 `p` 默认打开第 1 話**。HTML 里 `&` 必须写 `&amp;`。

5. 正文开头（`addressee` / `episode-break` 之后、`#p1` 之前）放一张 `<figure class="scene">`：`img` 为 960×640 的 webp，带 `alt` / `width` / `height` / `loading="lazy"`，`figcaption` 写「第N話 · 场景」。
6. 本机**没有 PIL**，截图转站内剧照用 ffmpeg + cwebp：
   `ffmpeg -i shot.jpg -vf "scale=-2:640,crop=960:640:(iw-960)/2:0" -frames:v 1 /tmp/x.png` → `cwebp -q 86 /tmp/x.png -o /tmp/x.webp`。
   `scale=-2:640` 按高度等比缩放并保证宽度为偶数，`crop` 用 `(iw-960)/2` 居中裁成 3:2；`-2` 不可写成 `-1`（奇数宽会让 crop 偏移取整）。
