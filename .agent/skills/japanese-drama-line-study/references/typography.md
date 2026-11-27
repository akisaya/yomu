# 排版与实现细节

单文件、无构建。以下代码都在同仓库的 `saikou-no-rikon/index.html` 里跑过，可直接取用。

## 设计 token

```css
:root{
  --paper:#f7f4ec; --paper-hi:#fdfbf6;
  --ink:#211e1a; --ink-2:#514a42; --ink-3:#8d8377;
  --line:#e2dacc; --line-soft:#ece5d8;
  --shu:#b23a2b;            /* 朱红，只用于强调：印章、编号、悬停线、高亮 */
  --serif-jp:"Shippori Mincho","Hiragino Mincho ProN","Yu Mincho",serif;                        /* 标题层，自托管子集 */
  --serif-jp-text:"Hiragino Mincho ProN","Yu Mincho","YuMincho","Noto Serif JP",serif;          /* 正文层，系统字体 */
  --serif-cn:"Songti SC","STSong","SimSun","Noto Serif SC",serif;                               /* 中文，系统字体 */
  --sans:"Inter","Hiragino Sans","PingFang SC",system-ui,sans-serif;
  --mono:"SFMono-Regular",ui-monospace,monospace;
  --maxw:1120px;
}
```

## 字族分层：标题用 webfont，正文用系统字体

两个日文变量，不要合并：

| 变量 | 字族 | 用在哪 | 为什么 |
| --- | --- | --- | --- |
| `--serif-jp` | Shippori Mincho（自托管子集） | 站名、竖排标题、题眼、小节标题、卡片标题 | 笔画细、留白多，大字有味道 |
| `--serif-jp-text` | Hiragino → Yu Mincho → Noto（系统优先） | `.jp` 正文、`.s-jp` 精读卡原句、`.g-src` 语法原句、`.d-preview`、`.sig`、`.w`/`.r` 词汇、`.rail a` 索引 | 整页正文的面积最大，绝不能等字体 |
| `--serif-cn` | Songti SC → SimSun → Noto（系统优先） | 译文栏 `.cn`、中文小字、章节副题 | 同上，中文栏比日文栏字数还多 |

判据两条：

1. **读者要逐字辨认的走正文层，用来定调子的走标题层。** 引文必须跟正文同族——`.g-src` 是可点回正文的原句片段，跳转前后字形不能变。
2. **正文永远不放 webfont。** CJK 一个字重 4–8MB，Google Fonts 按 `unicode-range` 切片，一篇正文要拉 120 多片、3.8MB，字体必然晚于首帧到达，`display:swap` 一到位就整页换字形——从首页点进详情页时那一下「闪」就是这么来的。标题字数少、切片少、首页已缓存，用 webfont 才划算。

实测（同一台机、冷缓存，改前 → 改后）：详情页字体 **125 片 / 3844KB → 3 个文件 / 466KB**，FCP **1.2–3.5s → 0.1s**，正文与标题都不再中途替换。

正文 `clamp(15.5px,1.5vw,18px)`。全角字宽恒为 1em，字号直接决定每行字数：18px 下约 31 字，落在 30–40 的舒适区。

中文段落 `letter-spacing:.02em; text-align:justify`。

## 标题字体：自托管 + 子集 + preload

只留一个 webfont，就别再走第三方 CDN。Google Fonts 的 CJK 字体按 `unicode-range` 切成上百片，浏览器要等 CSS 解析完、排完版才知道要哪几片，字体必然晚于首帧——`display:swap` 一到，整块竖排标题的视觉重量就变一次，看起来像「缩放了一下」。自托管之后字体和页面同源，可以 preload，首帧即正体。

```html
<link rel="preload" href="../assets/fonts/shippori-mincho-500.woff2" as="font" type="font/woff2" crossorigin>
```

```css
@font-face{font-family:"Shippori Mincho";src:url("../assets/fonts/shippori-mincho-500.woff2") format("woff2");font-weight:500;font-style:normal;font-display:block}
```

三条规矩：

1. **preload 只给 500**（竖排标题与站名的字重），400/600 出在首屏以下，交给浏览器按需取。
2. **`font-display:block`** 而不是 `swap`：同源 preload 之后字体基本在首帧前就绪，block 的空白窗口看不见；万一慢，宁可晚一点出现，也不要「先回退再换」。
3. **子集只收标题层的字**。`assets/fonts/glyphs.txt` 是字符清单（当前 701 字），由浏览器按 computed `font-family` 精确收集；`scripts/build_title_fonts.sh` 从 `google/fonts` 拉完整 TTF，用 `pyftsubset --layout-features='*'` 裁成三个 woff2。

`--layout-features='*'` 不能省，竖排标点靠 `vert` / `vrt2`，砍掉之后 `、`「」` 会横着躺。重建后必查：竖排标题里的 `、` 是否还在格的右上角。

**新增作品后**：新标题若含 `glyphs.txt` 里没有的字，那个字会回退成 Hiragino（不报错，只是字形突变），把新字补进 `glyphs.txt` 再跑一次脚本即可。

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

标题本身是一句话、不需要主副两级时（如「あと、ひと駅」），**整句同字号排成一列**，不要用 `.sm` 缩出一行小字——一大会一小看着不齐。此时 `inline-size` 必须按字数算够，否则浏览器会自己折成两列：

```
inline-size ≈ 字数 ×（line-height + letter-spacing）
例：6 字 ×（1.05 + .08）＝ 6.78em → 取 6.9em
```

标记只写一行：`<h1 lang="ja">あと、ひと駅</h1>`。单列标题在 58px 字号下约 400px 高，首屏由它撑起，右侧信息块自然落在中上段。

## 顶栏

首页（根 `index.html`）与各作品页共用同一规格，改动时两处一起改：

```css
.bar-in{height:58px;align-items:center;padding-inline:clamp(18px,4vw,48px);gap:20px}
@media (max-width:760px){.bar-in{height:52px;gap:10px}}
.brand .logo{font-size:19px;letter-spacing:.18em}
.brand .sub{font-size:11px;letter-spacing:.16em}
```

- 高度、字号必须写成固定值，**不要用上下 `padding` 撑**：首页曾用 `padding:14px` + `align-items:baseline`，桌面量出 58.6px、移动端仍是 58.6px，而作品页是 58 / 52，切页时能看出跳动。
- 作品页的 `.bar` 额外 `position:sticky;top:0` 与毛玻璃底；首页不吸顶，这是唯一有意的差异。

## 垂直节奏

各页同构，间距统一用同一组值，改动时七页一起改，不要只调一页。

```css
.hero{padding-top:clamp(44px,7vw,92px)}                       /* 首屏内部，不动 */
.river{margin-top:clamp(14px,2.2vw,28px)}                     /* 首屏收尾曲线 */
.letter-section{padding:clamp(18px,2.8vw,34px) 0 clamp(48px,7vw,96px)}
.paper{padding:clamp(24px,3.6vw,52px) clamp(22px,5.4vw,78px) clamp(34px,5vw,64px)}
.addressee{margin:0 0 clamp(14px,2.2vw,22px)}                 /* 无 padding-bottom、无 border-bottom */
.audible{margin:0 0 clamp(14px,2.2vw,20px);padding:9px 0}     /* 上下各一条发丝线 */
.episode-break{margin:clamp(30px,4.4vw,50px) 0 clamp(12px,1.8vw,18px);padding-top:16px}
.scene{margin:0 0 clamp(14px,2.2vw,22px)}
.script-head{margin:0 0 clamp(10px,1.6vw,16px)}               /* 一続き型：说明+播放条那行 */
```

两条要点：

- **首屏到正文只留一层空白。** 曲线 → 34px → 纸边 → 52px → 第一行，桌面约 86px。曾经是 64＋74＝138px，看起来像断开了。
- **标题块和音频条不要各画一条线。** `.addressee` 去掉底线与 `padding-bottom`，只留 `.audible` 的上线收住标题区；否则两条发丝线夹一条空白，正是「空白行太大」的来源。`.episode-break`（对白页，只有上线）同理。

## 剧照位（可选）

**默认没有图，留白就是这套版面的常态。** 只有在拿到合适的画面、或用户给了截图时，才按下面的规矩加一张。

位置固定：开头块（`.addressee` 或 `.episode-head`）之后、`#p1` 之前。它是「这段话被说出来的那一刻」，不是封面——不进首屏，不做通栏大图，不做图集。

```html
<figure class="scene">
  <img src="../assets/stills/<slug>-<what>.webp" alt="黒板を前に教壇から話す桜木建二"
       width="960" height="640" loading="lazy" decoding="async">
  <figcaption>第11話 · 特進クラス最後の授業</figcaption>
</figure>
```

```css
.scene{margin:0 0 clamp(18px,2.6vw,28px)}
.scene img{display:block;width:100%;height:auto;filter:saturate(.88) contrast(1.02)}
/* 暗场素材在此基础上加 brightness(1.1–1.15)，见下面的调色两条 */
.scene figcaption{margin-top:10px;font-family:var(--mono);font-size:10.5px;
  letter-spacing:.08em;color:var(--ink-3)}
```

- **比例固定 3:2**，输出 **webp 960×640**、单张 15–30KB，放 `assets/stills/`，不塞进 `<slug>/`。
  960 是上限而非随便定：正文列最宽约 470 CSS px，2x 屏要 940；再大只是白发体积。
  统一用 `cwebp -q 85 -m 6 -preset photo`，比同宽的 JPEG 小 60–70%，画质看不出差。
  `width/height` 必须写，否则图没加载时正文会跳（校验脚本按这两个数核比例）。
- 图注 `第N話 · 场景` 用等宽小字，跟页脚出处同一套标注口径；`alt` 描述画面，不要写「剧照」。
- 移动端不加断点：`width:100%` 自然通栏。**不要**在窄屏另做一次裁切或换成 2:1，人物的头会被切掉。

选图：

- 优先空镜与实物——信纸、信封、器材、教室。有人的镜头只在该篇讲的就是这个人时用（龙樱那一篇讲的是樱木开口，才放人物）。
- 一页只放一张，位置不变。同一部作品的不同篇各用各的图，不重复。
- 色温差异是好事：暖纸、朱红、墨绿配暖黄、教室绿，几篇摆在一起反而分得开。

裁切与调色（都是实际踩过的）：

- **先裁字幕、台标、水印**。字幕压在最底部时宁可多裁 30–60px，不要留半行。
- **近距离特写不能拉成通栏**。3:2 的书写特写压到 3.6:1，字会被切掉一半（试过，只剩半截「さんへ」）；要通栏就换一个宽景镜头。
- 调色只做两件事：`saturate(.85–.92)` 收色、`brightness(1.02–1.14)` 提亮。暗场素材必须提，不提印出来就是一块黑。
- **有人物的照片不要 sepia、不要去饱和**，肤色会发青。靠信纸的边框和白边统一，不靠滤镜。

版权：截图与原文同一套声明（仅供学习研究）；在 `source.md` 记一行 `- 剧照：` 路径 + 截自哪一集、哪段影像。

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

## 文法条目与跳回高亮

文法层的每条是两行：第一行「句型名 + 原句片段」，第二行说明。片段用朱红 `<em>` 圈出被讲的词，带一圈极淡的马克笔底；不要给整行加底色块。

```css
.d-row > h4 .row-jump{
  display:block;margin-top:7px;font-size:9px;letter-spacing:.1em;
  color:var(--ink-3);text-decoration:none;border-bottom:1px dotted transparent;
}
.d-row > h4 .row-jump:hover{color:var(--shu);border-bottom-color:var(--shu-soft)}

.items{display:grid;gap:13px}
.items li{
  padding-left:14px;position:relative;display:grid;gap:3px;
  font-size:13.5px;line-height:1.78;color:var(--ink-2);
}
.items li::before{top:.64em}          /* 覆盖基础样式的朱线小横杠位置 */
.items .g-h{display:flex;flex-wrap:wrap;align-items:baseline;gap:.15em .65em}
.items .g-h b{margin-right:0;font-size:14px}
.items .g-src{
  font-family:var(--serif-jp);font-size:13px;line-height:1.55;
  color:#6b6358;text-decoration:none;padding-bottom:1.5px;
  border-bottom:1px dotted rgba(178,58,43,.22);
}
.items .g-src em{
  font-style:normal;font-weight:500;color:var(--shu);
  background:linear-gradient(180deg,transparent 58%,rgba(178,58,43,.13) 58%);
}
.items .g-src:hover{color:var(--ink);border-bottom-color:var(--shu)}
.items .g-t{display:block}
@media (max-width:560px){.items .g-h{gap:.1em .5em}}
```

`#6b6358` 是下限：再浅（`--ink-3`）在 1440 下几乎读不出来。窄屏时 `.g-h` 自动折成两行，不要改小字号硬塞。

跳回信纸时的定位与示位：

```css
.para{scroll-margin-top:92px}       /* 避开吸顶栏 */
.para:target .jp{animation:paraflash 2.2s ease-out both}
.para:target .num{color:var(--shu)}
@keyframes paraflash{
  0%{box-shadow:inset 3px 0 0 rgba(178,58,43,.9);background:rgba(178,58,43,.045)}
  45%{box-shadow:inset 3px 0 0 rgba(178,58,43,.4);background:rgba(178,58,43,.03)}
  100%{box-shadow:inset 3px 0 0 rgba(178,58,43,0);background:rgba(178,58,43,0)}
}
@media (prefers-reduced-motion:reduce){
  .para:target .jp{animation:none;background:rgba(178,58,43,.06)}
}
```

静态整块粉色背景看着像文字被选中，闪一下再收才像定位提示。

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
- 段号宽度收到 `1.3rem`；**只有 TTS 朗读键**才在窄屏隐藏。接了原声的段落 ▶ 在窄屏要保留（`display:grid; opacity:.72`，圆点稍放大），整篇音频播放条则占满一行。

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
