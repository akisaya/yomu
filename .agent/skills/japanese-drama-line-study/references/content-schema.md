# 页面骨架与内容结构

单文件页面按下面的顺序排。类名与 id 直接沿用，方便复用样式与脚本。

## Markdown 源档

逐段原文与译文先写入 `<slug>/source.md`，再制作或更新同目录的 `index.html`。每篇文章独立成组，源档和页面放在同一个 `<slug>/` 文件夹中；即使同属一部作品，也不把多篇合进一个 Markdown。已有源档只原位修订，不覆盖无关内容。

```markdown
# 书信标题

> 说明：保存逐字原文与译文；振假名、精读和词表不属于源档。

- 精读页：[index.html](index.html)
- 场景：差出人写给宛名
- 出处：剧名、电视台、年份、集数 / SP、播出日期、脚本家
- 影像：带时间码的链接
- 剧照：`../assets/stills/<slug>-<what>.webp`（可选；写明截自哪一集、哪段影像、裁掉了什么）
- 全文：12 段

**题眼原文**

> 原文引句

**题眼译文**

> 中文译文

## 第 1 段

**原文**

> 逐段原文

**中文**

> 与上一段一一对应的中文
```

- 原文只保存正文汉字、假名和标点，不抄 HTML 的 `<ruby>` 读音标注。
- 段号、段序、段内换行、送假名和标点必须与页面一致；一段原文配一段译文。
- 一篇一个 `source.md`；同作品的其他文章另建目录与源档，不合并、不串联编号。
- Markdown 是校对底稿，HTML 是展示层。新增源档时保留现有页面；用户明确要求迁移时才改旧文档的位置或格式。

## 整体

```html
<html lang="zh-CN" data-furigana="on" data-cn="on">
  <head>
    <script>document.documentElement.classList.add('js')</script>
    <style>…</style>
  </head>
  <body>
    <header class="bar">      品牌（回首页） · ふりがな/中文 开关 · 阅读进度条
    <main>
      <section class="hero">  竖排标题 + 引文 + 按钮
      <section id="letter">   原文 + 译文
      <section id="close-reading">  精読（文法并在这里，不单列；整节默认收起）
      <section id="vocab">    単語帳（整节默认收起）
    </main>
    <footer>                  出处 · 版权 · 返回列表
  </body>
</html>
```

## 首屏

```html
<div class="hero-grid">
  <div class="hero-title">
    <p class="kicker">A LETTER FROM MEGURO RIVER</p>
    <p class="hero-meta" lang="ja">ドラマ『最高の離婚』／2014 特別篇</p>
    <h1 lang="ja">星野結夏<span class="sm">さまへ</span></h1>
    <span class="seal" aria-hidden="true">拝啓</span>
  </div>
  <div class="hero-body">
    <figure class="pull">
      <blockquote lang="ja"><p>恋がいつしか<ruby>日常<rt>にちじょう</rt></ruby>に変わること、…</p></blockquote>
      <figcaption lang="zh-CN">恋爱不知何时变成日常，日常又变成喜悦。</figcaption>
    </figure>
    <p class="meta">差出人 浜崎光生 ／ 宛名 星野結夏 ／ 全文 12 段</p>
    <div class="hero-actions">
      <a class="btn primary" href="#letter">手紙を読む</a>
      <a class="btn" href="#close-reading">学習ノート</a>
      <a class="btn ext" href="https://…?t=348" target="_blank" rel="noopener noreferrer">映像で見る</a>
    </div>
  </div>
</div>
```

引文块用 `<figure>` + `<blockquote>` + `<figcaption>`：译文在语义上是引文的注解，不是正文。

## 剧照（可选）

放在开头块与 `#p1` 之间，只放一张。没有合适的画面就整块省略，不留占位。

```html
<div class="episode-head">…</div>   <!-- 或 <p class="addressee"> -->

<figure class="scene">
  <img src="../assets/stills/<slug>-<what>.webp" alt="画面描述" width="960" height="640" loading="lazy" decoding="async">
  <figcaption>第N話 · 场景</figcaption>
</figure>

<div class="para" id="p1">…</div>
```

- 比例固定 3:2，输出 webp 960×640（15–30KB），放 `assets/stills/`，不进 `<slug>/`。
- 图注写集数与场景，跟页脚出处同一套；`alt` 描述画面内容。
- 选图、裁切、调色的判断见 `typography.md` 的「剧照位」。一页一张，位置不动；同一作品的不同篇不重复用图。

## 正文段落

```html
<div class="para" id="p1">
  <span class="num">01</span>
  <p class="jp" lang="ja">暦<ruby>暦<rt>こよみ</rt></ruby>の上に春は立ちながら、…</p>
  <p class="cn" lang="zh-CN">日历上已经立春，可严寒还在继续……</p>
</div>
```

- `id="pN"` 是锚点：词表、段号、文法条目的原句片段都指向它。段号反过来指向该段卡片 `#dN`。
- 段号只做视觉引导与跳转，不进 tab 顺序。
- 译文与原文一一对应；不要一段原文配两段译文。
- 给 `.para` 设 `scroll-margin-top`，否则从卡片跳回来会被吸顶栏盖住。

## 正文段落（变体：一続きの台詞）

一场戏从头到尾一口气——独白、两人交替的心声、没有场景切换的对话——**不要切成十段**。
编号一加上，语气就被切碎，读者看到的是被标了序号的台词，不是一段完整的话。
这种原文整篇作一続き，只给**行**编号：

```html
<div class="script-head">
  <p class="script-key"><b>M</b>＝心の声　／　<b>〔　〕</b>＝場面の指示</p>
  <button class="listen" type="button">…全文を聞く</button>
</div>

<div class="script" id="script" lang="ja">
  <span class="ln jp stg" id="L1">〔…〕</span>
  <span class="ln cn stg" lang="zh-CN">〔…〕</span>
  <span class="ln jp" id="L2"><b class="sp">みくりM：</b>（…）</span>
  <span class="ln cn" lang="zh-CN">（…）</span>
</div>
```

- `.script` 是两列 grid：日文一列、译文一列，逐行对齐。**日文栏永远不切断**；窄屏（≤820px）才把译文落到日文行下面。
- `id="LN"` 是行锚点。`g-src`、`row-jump`、词表都指向具体的那一行，卡片 `#dN` 仍叫「註」，不叫「第 N 段」。
- 行位置写在卡片编号下：`<span class="d-num">01<small>1–3 行</small></span>`，这是读者在无段号本文里找到它的唯一线索。
- 译文栏省略称谓（`美栗M：`），因为每行都和日文对齐；`source.md` 里仍保留称谓，按行线性排列。
- `check_page.py` 认这种结构：有 `.ln jp` 而无 `.para` 时切到按行校验，每条 `g-src` 必须逐字出自**它指向的那一行**（比按段校验更严）。
- **有片源就用原声，不要用 `speechSynthesis` 读台词**：机器音没有语气，独白页尤其毁。做法：`yt-dlp` 取音轨（B 站番剧对未登录只放前 6 分钟，需 `--cookies`），按场景区间切一段，`-c:a aac -b:a 96k -movflags +faststart`，两端各 0.3–1 秒淡化，放 `assets/audio/<slug>-<scene>.m4a`。
- 播放器自绘，只有一个 `<audio preload="metadata">` + 播放键 + 发丝进度条（可点、可拖、方向键 ±5 秒）+ `0:00 / 3:10` 时间；时长从 `loadedmetadata` 取，秒数用 `Math.round` 显示，否则 189.99 秒会显示成 3:09。
- 页面上的区间（如 38:50–42:00）要与文件时长一致，并写进页脚与 `source.md`；这就是版权说明的一部分。

**变体：按段切分（信、散文等 `.para` 页）**——不要真的切出十几个小文件，仍是**一个** `.m4a` + 每段 `.play` 按钮上的 `data-start` / `data-end`（相对该文件的秒数）。点按把 `audio.currentTime` 设到 `start`，`timeupdate` 越过 `end` 就暂停并清掉高亮；再放一条全篇播放条。区间求法：`yt-dlp -F` 取 B 站 DASH 音频流（`30280` / `30232`，普通 `BV` 不必登录），`ffmpeg -ss/-t` 重编码；用 `mlx-whisper` 的 `whisper-large-v3-turbo` 取词级时间戳，把转写字符与 `source.md` 原文字符做 `SequenceMatcher` 单调对齐，据此得到每段首尾，段间切点取朗读停顿的中点。`timeupdate` 的停段判断要加 `currentTime < segEnd + 2` 的护栏，否则 seek 前残留的旧位置会立刻把播放掐掉。音频不支持 / 加载失败时整条回退 `speechSynthesis`；带原声的页面窄屏不要隐藏段落 ▶。

**对白页的额外处理**：源档每行若有「平助：」「理沙：」说话人标签，对齐前必须先剥掉（音频里没有这些字，否则整段错位）；旁人插进来的台词（起哄、维持秩序、敲门喊人）不划给任何段落，但保留在全篇音频里并写进 `source.md`。多分 P 的整剧片源（`?p=N`）先下该分 P 音轨、按已知时间码裁探查窗转写，别对整轨跑 ASR。没有 `.addressee` 的拆分页，播放条插在 `.episode-break` 与 `.scene` 剧照之间；全篇按钮的 aria-label 用通用的「音声を再生」，别写「手紙全体を再生」。

**怎么选**：段落是作者写出来的（信、散文、分场剧本）→ 用 `.para`；一场戏一口气说完、或全是心声交替 → 用 `.script`。
判据是「切开会破坏什么」，不是篇幅长短。

## 精读卡

```html
<details class="drill" id="d1" open>
  <summary>
    <span class="d-num">01</span>
    <span class="d-title">書き出しの挨拶</span>
    <span class="d-preview">暦の上に春は立ちながら…</span>
  </summary>
  <div class="d-body">
    <div class="d-row"><h4>骨格</h4>
      <div class="skel">
        <p class="s-jp" lang="ja">暦の上に春は立ちながら<span class="sep">／</span>厳しい寒さが…</p>
        <ul class="s-list">
          <li><b>暦の上に春は立ちながら</b><span>逆接の従属節。「春にはなったのに」。</span></li>
        </ul>
      </div>
    </div>
    <div class="d-row"><h4>文法<a class="row-jump" href="#p1">原文 ↑</a></h4><div><ul class="items">
      <li><span class="g-h"><b>～ながら（逆接）</b><a class="g-src" href="#p1" lang="ja">暦の上に春は立ち<em>ながら</em>厳しい寒さが続いております</a></span>
          <span class="g-t">動詞ます形＋ながら。「～のに」の書き言葉版で…</span></li>
    </ul></div></div>
    <div class="d-row"><h4>語彙</h4><div class="chips">
      <span class="chip"><b>暦</b><span>こよみ</span>日历；历法</span>
    </div></div>
    <div class="d-row"><h4>役割</h4><p class="role">全信的第一句，用季节问候把读者放进「冬天将尽」的时间里。</p></div>
    <div class="d-row"><h4>訳注</h4><p class="note">「暦の上では」是套语，不译成「日历上」会丢掉「名义上」的语气。</p></div>
  </div>
</details>
```

`summary` 里只放编号、标题、一句预览；不要把正文塞进去。**卡片不带 `open`**：整节收起时，编号 + 标题 + 预览就是这一节的目录，读者自己挑一张打开。

## 小节折叠（精読 / 単語帳）

两节整节默认收起，点标题行才展开。`section.sec` 照留，标题行做 `summary`，正文包进 `details.fold`：

```html
<section class="sec" id="close-reading">
  <div class="wrap">
    <details class="fold">
      <summary class="sec-head reveal">
        <p class="sec-num">02</p>
        <div>
          <h2>精読 <span aria-hidden="true">·</span> 逐段拆解</h2>
          <p class="sub">…</p>
        </div>
        <span class="fold-key" aria-hidden="true"></span>
      </summary>

      <div class="drills">…</div>
    </details>
  </div>
</section>
```

- 为什么整节收：正文读完不该被迫滚过十几张卡和六十几行词表；要查再点开。
- `details.fold` 里的内容**不要加 `reveal`**：收起时 IntersectionObserver 观察不到它，展开后会停在半透明状态。
- `.fold-key` 只有空 `<span>`，「開く／閉じる」和箭头由 CSS 的 `::before` / `::after` 画；`summary` 的可读名仍来自 h2。
- 首屏「学習ノート」、页脚「精読／単語」、正文段号 `#dN` 都指向折叠内部。脚本里的 `landOn()` 先展开祖先 `details` 再 `scrollIntoView`，删掉就变成跳到一片空白。
- `beforeprint` 展开全部、`afterprint` 还原；否则打印稿只剩两行标题。

## 词表

```html
<table class="vocab" aria-label="単語帳">
  <thead><tr><th>単語</th><th>読み</th><th>品詞</th><th>意味</th><th>段落</th></tr></thead>
  <tbody id="vbody">
    <tr data-pos="名"><td class="w">暦</td><td class="r">こよみ</td><td class="p">名</td><td>日历；历法</td><td class="p"><a href="#p1">01</a></td></tr>
  </tbody>
</table>
```

- `data-pos` 按该篇实际出现的词性取值，筛选按钮与之同名；`all` 表示全部。样张只用到 `名 / 動 / 慣 / 副`。不要预设用不到的词性。
- 搜索同时匹配 `.w`、`.r`、含义三列。
- 读音列没有汉字时写 `—`，不要留空。

## 文法条目（在精读卡内，不单列成节）

每条是「句型名 + 原句片段 + 用法说明」三件套：

- `<b>` 放句型名或信号名。按「读的时候被什么绊住」命名（文末の言いさし、呼応、指示詞、連体修飾、取り立て），不要写 `N4 · 接续：…` 这种考试标签。
- `<a class="g-src" href="#pN" lang="ja">` 放**该段原文里的一小截**，用 `<em>` 圈出被讲的词。片段要短到一眼能看清，但必须逐字出自该段（去掉 `<em>` 与振假名后要是 `#pN` 的纯文本子串）。不要另造例句，不要把整段抄进来。
- `<span class="g-t">` 只讲用法、语感、易错点。骨格讲过的结构、訳注要讲的中文取舍，都不要在这里再说一遍。
- 卡片「文法」标签下的 `原文 ↑` 是整卡共用的回跳入口；每条原句片段各自也是一个回跳链接。
- 跳回目标段落时用 `:target` 做一次短闪（左侧朱线 + 极淡底色，2s 内淡出），不要留静态色块。

样式见 `references/typography.md` 的「文法条目与跳回高亮」。

## 内容配额

| 项目 | 数量 | 说明 |
|---|---|---|
| 段落 / 行 | 10–14 段，或一続き 20–40 行 | 按原文自然段，不强行切；独白型整篇不分段 |
| 精读卡 / 註 | 与段落同数，或 8–12 註 | 一卡一个单元；不分段时卡是「註」，靠行号定位 |
| 文法条目/段 | 6–8 | 全部在卡内，不单列成节；少于 4 会显得单薄 |
| 原句片段命中率 | 100% | 每条 `g-src` 去掉标签后必须是该段原文子串 |
| 词汇 | 45–60 | 按出现顺序 |
| 振假名 | 60–70 处 | N3 密度 |

数字写完用脚本核对，别让首屏写 54 词、表里却有 55 行。`check_page.py` 会逐条做原句子串校验，不必手写核对脚本。

```bash
grep -c '<tr data-pos=' index.html
grep -c '<details class="drill"' index.html
grep -c 'class="g-src"' index.html
grep -o '<ruby>' index.html | wc -l
```
