# 验证流程

页面是单文件、无构建，所以验证全靠“渲染出来看”和“结构对一遍”。下面四步按顺序做，能拦住几乎所有返工。

> 脚本路径相对本 skill 目录；HTML 路径相对当前项目。

## 一、结构自检

```bash
python3 scripts/check_page.py index.html
```

输出示例（真实页面）：

```
文件      saikou-no-rikon/index.html  (114.1 KB, 2422 行)
语言      zh-CN
小节      letter → close-reading → vocab → grammar
正文段落  12
精读卡    12
振假名    70 处
词表      55 行
语法卡    16
外链      2
结构检查通过
```

会拦下：标签未闭合/错位、重复 id、指向不存在锚点的链接、`target=_blank` 缺 `rel=noopener`、`img` 缺 `alt`、段落与精读卡数量不一致。有问题时退出码为 1。

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

必须覆盖：两个开关（含 localStorage 记忆）、词表搜索与词性筛选、折叠卡开合、朗读按钮（`speechSynthesis` 不存在时应已移除）、横向溢出为 0。

## 五、目视清单

- 振假名有没有被行高裁掉上缘（`rt` 小于 `.45em` 会裁）
- 行末是否参差（`word-break:auto-phrase` 的典型症状）
- 竖排标题的假名是否侧躺（`text-orientation` 必须是 `upright`）
- 段号与正文是否在同一条基线上
- 窄屏下词表是否横向溢出
- 首屏、页脚里的段数/词数/句型数与实际数量是否一致
- 关掉 JS（DevTools 禁用）后正文是否仍然可见

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
