# 页面骨架与内容结构

单文件页面按下面的顺序排。类名与 id 直接沿用，方便复用样式与脚本。

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
      <section id="close-reading">  精読
      <section id="vocab">    単語帳
      <section id="grammar">  文法メモ
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

## 正文段落

```html
<div class="para" id="p1">
  <span class="num">01</span>
  <p class="jp" lang="ja">暦<ruby>暦<rt>こよみ</rt></ruby>の上に春は立ちながら、…</p>
  <p class="cn" lang="zh-CN">日历上已经立春，可严寒还在继续……</p>
</div>
```

- `id="pN"` 是锚点，词表与段号都指向它。
- 段号只做视觉引导与跳转，不进 tab 顺序。
- 译文与原文一一对应；不要一段原文配两段译文。

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
    <div class="d-row"><h4>文法</h4><div><ul class="items">
      <li><b>～ながら（逆接）</b>動詞ます形＋ながら。…</li>
    </ul></div></div>
    <div class="d-row"><h4>語彙</h4><div class="chips">
      <span class="chip"><b>暦</b><span>こよみ</span>日历；历法</span>
    </div></div>
    <div class="d-row"><h4>役割</h4><p class="role">全信的第一句，用季节问候把读者放进「冬天将尽」的时间里。</p></div>
    <div class="d-row"><h4>訳注</h4><p class="note">「暦の上では」是套语，不译成「日历上」会丢掉「名义上」的语气。</p></div>
  </div>
</details>
```

`summary` 里只放编号、标题、一句预览；不要把正文塞进去。第一张卡默认 `open`，其余关闭。

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

## 语法卡

```html
<div class="g-card">
  <span class="g-tag">N4 · 接续：動詞ます形</span>
  <h3>～ながら（逆接）</h3>
  <p class="mean">虽然……却……。前后两项相反或矛盾。</p>
  <p class="ex"><em>暦の上に春は立ちながら</em>、厳しい寒さが続いております</p>
</div>
```

例句**必须取自原文**，用 `<em>` 标出匹配片段；不要另造例句。

## 内容配额

| 项目 | 数量 | 说明 |
|---|---|---|
| 段落 | 10–14 | 按原文自然段，不强行切 |
| 精读卡 | 与段落同数 | 一段一卡 |
| 文法 | 12–16 | 跨段去重，同句型只讲一次 |
| 词汇 | 45–60 | 按出现顺序 |
| 振假名 | 60–70 处 | N3 密度 |
| 语法条目/段 | 6–8 | 少于 5 会显得单薄 |

数字写完用脚本核对，别让首屏写 54 词、表里却有 55 行。

```bash
grep -c '<tr data-pos=' index.html
grep -c '<details class="drill"' index.html
grep -c 'class="g-card"' index.html
grep -o '<ruby>' index.html | wc -l
```
