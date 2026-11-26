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
    openCards: document.querySelectorAll('details[open]').length,
  };
})()
```

```bash
node scripts/shot.mjs "file://$PWD/index.html" .shot/smoke.png --width 390 --height 844 --eval /tmp/smoke.js
```

必须覆盖：两个开关（含 localStorage 记忆）、词表搜索与词性筛选、折叠卡开合、朗读按钮（`speechSynthesis` 不存在时应已移除）、**点一条文法原句后 `location.hash` 落到 `#pN` 且该段命中 `:target`**、横向溢出为 0。

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
