# 排版与实现细节

单文件、无构建。以下代码都在同仓库的 `saikou-no-rikon/index.html` 里跑过，可直接取用。

## 设计 token

```css
:root{
  --paper:#f7f4ec; --paper-hi:#fdfbf6;
  --ink:#211e1a; --ink-2:#514a42; --ink-3:#8d8377;
  --line:#e2dacc; --line-soft:#ece5d8;
  --shu:#b23a2b;            /* 朱红，只用于强调：印章、编号、悬停线、高亮 */
  --serif-jp:"Shippori Mincho","Hiragino Mincho ProN","Yu Mincho",serif;
  --serif-cn:"Noto Serif SC","Songti SC","STSong",serif;
  --sans:"Inter","Hiragino Sans","PingFang SC",system-ui,sans-serif;
  --mono:"SFMono-Regular",ui-monospace,monospace;
  --maxw:1120px;
}
```

字体走 Google Fonts（`Shippori Mincho` + `Noto Serif SC`），必须带系统回退，断网时仍是明朝体/宋体。正文 `font-size:16px; line-height:1.7`，中文段落 `letter-spacing:.02em; text-align:justify`。

## 竖排标题

```css
.hero-title h1{
  margin:0;
  writing-mode:vertical-rl;
  text-orientation:upright;     /* 关键：mixed 会让假名侧躺 */
  inline-size:4.55em;           /* 关键：竖排时列宽是 inline-size，不是 block-size */
  font-family:var(--serif-jp);
  font-size:clamp(34px,4.6vw,58px);
  line-height:1.05;
  letter-spacing:.08em;
  color:var(--ink);
  white-space:normal;
}
.hero-title h1 .sm{             /* 「さまへ」自动排成第二列 */
  font-size:.64em;
  letter-spacing:.16em;
  color:var(--ink-2);
}
```

标记：`<h1 lang="ja">星野結夏<span class="sm">さまへ</span></h1>`

窄屏改成横排，不要试图保留竖排：

```css
@media (max-width:760px){
  .hero-title h1{
    writing-mode:horizontal-tb;
    inline-size:auto;
    font-size:clamp(30px,9vw,46px);
    line-height:1.25;
    letter-spacing:.02em;
  }
  .seal{display:none}
}
```

朱印：固定像素尺寸（`clamp(30px,3.6vw,44px)`），不要用 `em` 继承标题字号，否则会被放大成方块。

## 振假名与译文

```css
ruby{ruby-position:over}
rt{font-size:.5em;font-weight:400;letter-spacing:.03em;color:#9a8f81;line-height:1}
html[data-furigana="off"] rt{display:none}

.cn{
  margin:.85em 0 0;
  padding-left:1.05em;
  border-left:2px solid rgba(178,58,43,.22);
  font-family:var(--serif-cn);
  font-size:14px; line-height:2;
  color:var(--ink-3);
}
html[data-cn="off"] .cn{display:none}
```

- 只在汉字词上加 `<ruby>`，送假名留在外面。
- `rt` 小于 `.45em` 会被裁切，`.5em` 是下限。
- 高亮名句不要用 `<mark>` 底色（换行会断），用背景渐变：

```css
.hl{
  background-image:linear-gradient(transparent 58%,rgba(178,58,43,.18) 58%);
  background-repeat:no-repeat; background-size:100% 100%;
}
```

## 开关

```css
.toggle{
  display:inline-flex; align-items:center; gap:6px;
  height:32px; padding:0 11px;
  border:1px solid var(--line); border-radius:999px;
  font-size:12px; color:var(--ink-2); background:rgba(255,255,255,.5);
}
.toggle[aria-pressed="true"]{
  border-color:rgba(178,58,43,.4); color:var(--shu); background:rgba(178,58,43,.06);
}
```

```js
const STORE = 'yomu.letter.ui.v2';          // 改默认值时必须升版本号
let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (e) {}

const apply = (name, on) => {
  root.dataset[name] = on ? 'on' : 'off';
  buttons.forEach(b => b.dataset.toggle === name && b.setAttribute('aria-pressed', String(on)));
  saved[name] = on;
  try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch (e) {}
};
apply(name, saved[name] !== false);         // 没记录过 = 开；只有显式关过才关
```

默认值要同时写进 `<html data-furigana="on" data-cn="on">` 与按钮的 `aria-pressed="true"`，否则首帧会闪一下。

## 折叠卡

用原生 `<details>`，箭头用 mask，一个图形管开合：

```css
details.drill > summary{list-style:none;display:flex;align-items:baseline;gap:16px;cursor:pointer}
details.drill > summary::-webkit-details-marker{display:none}
details.drill > summary::before{
  content:""; order:9; margin-left:auto;
  inline-size:.62em; block-size:.62em; flex:none; align-self:center;
  background-color:var(--ink-3);
  -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 6l5 5 5-5' fill='none' stroke='%23000' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center/contain;
  mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 6l5 5 5-5' fill='none' stroke='%23000' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center/contain;
  rotate:-90deg;
}
details.drill[open] > summary::before{rotate:0deg}
```

不要在 `summary` 里放标题以外的内容；开合动画只在支持的浏览器做增强：

```css
@supports selector(::details-content){
  :root{interpolate-size:allow-keywords}   /* 没有这句，block-size:auto 不能过渡 */
  details::details-content{
    block-size:0; overflow:hidden;
    transition:block-size .28s, content-visibility .28s allow-discrete;
  }
  details[open]::details-content{block-size:auto}
}
```

旧浏览器（或不支持 `interpolate-size` 的）退化为瞬开，内容不受影响。不要为此引入 JS 高度计算。

## 进场动画：必须由 JS 门控

```html
<script>document.documentElement.classList.add('js')</script>
```

```css
.js .reveal{opacity:0;transform:translateY(14px);transition:opacity .7s,transform .7s}
.js .reveal.in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.js .reveal{opacity:1;transform:none;transition:none}}
```

否则脚本一报错，整页就是空白。

## 断行

- 日文正文：`line-break:strict`，`font-feature-settings:"palt" 0`。
- **不要用 `word-break:auto-phrase`**：Chrome 会按短语断行，行末留下大片空白，看起来像排版坏了。
- 中文段落 `text-align:justify`，但标题与引文不要 justify。

## 移动端

- 词表转卡片：`thead` 隐藏，`tr` 变 grid，三列信息叠在左侧，段号固定在右上。

```css
@media (max-width:560px){
  table.vocab{display:block}
  table.vocab thead{display:none}
  table.vocab tr{display:grid;grid-template-columns:minmax(0,1fr) auto;
    grid-template-areas:"w n" "r n" "m n";gap:2px 12px;padding:12px 14px}
  table.vocab td{display:block;border:0;padding:0}
  table.vocab td:nth-child(1){grid-area:w}
  table.vocab td:nth-child(2){grid-area:r}
  table.vocab td:nth-child(3){display:none}   /* 词性在窄屏意义不大 */
  table.vocab td:nth-child(4){grid-area:m}
  table.vocab td:nth-child(5){grid-area:n}
}
```

- 正文 `font-size:16.5px; line-height:2.08`，纸卡 `padding:26px 20px 32px`。
- 段号宽度收到 `1.3rem`，朗读按钮在窄屏隐藏。

## 打印

```css
@media print{
  .bar,.rail,.play,.hero-actions,.filters,.search,.to-top{display:none}
  body{background:#fff}
  .paper{box-shadow:none;border:0;padding:0}
  .cn{display:block !important}
  details::details-content{content-visibility:visible !important}
}
```
