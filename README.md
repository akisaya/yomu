<div align="center">

# 台詞精読 · yomu

**把一段日剧台词，拆成看得懂的句子。**

日剧台词 / 书信 / 独白的精读页 —— 原文与译文对照、振假名开关、逐段五层拆解、可搜索词表

[![在线浏览](https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E6%B5%8F%E8%A7%88-akisaya.github.io%2Fyomu-B23A2B?style=flat-square)](https://akisaya.github.io/yomu/)
![离线可用](https://img.shields.io/badge/%E7%A6%BB%E7%BA%BF%E5%8F%AF%E7%94%A8-%E5%8D%95%E6%96%87%E4%BB%B6%20HTML-828893?style=flat-square)

<sub>[在线浏览](https://akisaya.github.io/yomu/) · [收录](https://akisaya.github.io/yomu/#works) · [加一篇](#加一篇) · [内容口径](./.agent/skills/japanese-drama-line-study/references/editorial-rules.md) · [常见问题](#常见问题)</sub>

</div>

![收录页预览](./docs/preview-catalog.jpg)

## 这是什么

查单词不难，难的是读懂一句话为什么偏要这么说。

这个仓库把一段日剧台词、书信或独白做成一整页可以顺着读的学习材料：从竖排题眼和人物关系进入场景，按原有段落读原文与译文，再在五层精读卡里看句子的骨架、文法、词汇、段落角色与翻译取舍。

每篇都是一个自包含 HTML，CSS、脚本与正文都放在页面里。没有构建步骤，也不依赖服务器；双击就能读，手机上也能看。

## 一篇里有什么

| 板块 | 内容 | 交互 | 学习重点 |
|---|---|---|---|
| 首屏 | 竖排日文标题、朱印、题眼引文（原文 + 译文）、差出人 / 宛名 / 全文段数 | 读原文、学习笔记、影像三个入口 | 先弄清这是谁写给谁的 |
| 段落 | 按来源分段的全文，段号兼锚点，逐段中文译文 | 段落索引随滚动高亮；逐段朗读（`speechSynthesis`） | 对着原文把语气读出来 |
| 精読 | 每段一张卡，五层折叠：骨格 / 文法 / 語彙 / 役割 / 訳注；每条文法带该段原句片段 | `<details>` 展开；点原句跳回 `#pN`，段号再跳回卡片 | 长句怎么搭起来，这一段在整篇里干什么 |
| 単語帳 | 45–60 个词，读音 / 词性 / 释义 / 段号 | 搜索（假名或中文）+ 词性筛选，窄屏转卡片 | 按出现顺序把词过一遍 |
| 页脚 | 出处、影像链接（带时间码）、版权声明、返回作品一覧 | — | 知道这段话从哪里来 |

![单篇精读页预览](./docs/preview-letter.jpg)

**文法不单列成节**，全部放在所属段落的卡片里。独立「文法メモ」被否过两轮：先是只收 N4/N3 的干净句型、像练习册；改成按信号分组后，读者看卡片时还得往上翻信纸找原句。现在是句型名 + 原句片段（朱红标出被讲的词）+ 用法说明三件套，片段本身就是回跳链接。

振假名与中文译文是两个开关，默认都开着；关掉后存进 `localStorage`，下次还是关着的。

## 加一篇

### 方式一：让 Agent 做（推荐）

用支持技能的客户端（WorkBuddy 等）把本仓库作为工作目录打开，说一句：

> 做一段《最高の離婚》的台词学习页

技能会自己走完：取原文并交叉核对 → 分段 → 自译并校 → 五层拆解 → 搭页 → 排版 → 结构校验与截图 → 在首页 `.entries` 里加一行。默认全文逐字保留；需要收缩范围时，明确说「只要其中几段」。

### 方式二：手动

```
SKILL=.agent/skills/japanese-drama-line-study
SLUG=kaze-tachinu                      # 目录名用罗马字，同时是首页链接

cp -r saikou-no-rikon $SLUG            # 复制整页当骨架，逐块替换
# 首屏 → 段落（#pN）→ 精读卡（#dN，文法层在卡内）→ 词表 → 页脚
# 段数不必与样张一致，锚点 #pN / #dN 成对增删

python3 $SKILL/scripts/check_page.py $SLUG/index.html
node $SKILL/scripts/shot.mjs "file://$PWD/$SLUG/index.html" .shot/top.png --width 1440 --height 900
node $SKILL/scripts/shot.mjs "file://$PWD/$SLUG/index.html" .shot/m.png --width 390 --height 844 --selector "#p1"
```

产物是 `$SLUG/index.html`，截图在 `.shot/`（已 gitignore，看完可删）。没有构建步骤：改完直接提交，推 `main` 即更新线上。

## 一页里写什么

三个正文小节——段落 / 精読 / 単語帳——缺一段都会显得单薄。精读卡固定五层，顺序即阅读顺序：

| 层 | 回答什么 | 写法 |
|---|---|---|
| 骨格 | 这句怎么搭起来的 | 挑全段最难的一句，用 `／` 切块，逐块标成分与修饰关系；不是翻译 |
| 文法 | 读这句时被什么绊住 | 每段 6–8 条；句型名 + 该段原句片段（`<em>` 标出匹配处，链接回 `#pN`）+ 用法说明。按「信号」挑（言いさし、呼応、指示詞、連体修飾、取り立て），不按 JLPT 级别 |
| 語彙 | 哪些词值得记 | 全篇 45–60 词，按出现顺序，含读音 / 词性 / 释义 / 段号 |
| 役割 | 这段在整篇里干什么 | 讲结构功能（呼应、反转、复现），不复述内容 |
| 訳注 | 哪处翻译有取舍 | 只写中文取舍，不复述文法层讲过的语法点 |

骨格讲结构、文法讲用法、訳注讲中文取舍，三层不要复述同一句。信纸段号 `01` 点进卡片 `#d1`，卡片里的原句片段与「原文 ↑」点回 `#pN`，方向闭环。

配额：

| 项目 | 数量 | 说明 |
|---|---|---|
| 段落 | 10–14 | 按原文自然段，不强行切 |
| 精读卡 | 与段落同数 | 一段一卡 |
| 文法条目 / 段 | 6–8 | 日期、落款这类短段可以更少；全部在卡内 |
| 原句片段命中率 | 100% | 每条去掉标签与振假名后，必须是该段原文的子串 |
| 词汇 | 45–60 | 按出现顺序 |
| 振假名 | 60–70 处 | N3 密度 |

**数字必须自洽**：首页条目、首屏 `meta`、小节标题、页脚里的段数 / 词数要和真实数量一致。用 `check_page.py` 数，不要凭印象写；删掉文法节后不要再写「16 句型」。

想查什么，看哪里：

- 页面骨架、各类块的 HTML 结构、内容配额 → `references/content-schema.md`
- 首屏文案公式、版式取舍（含被否版本） → `references/editorial-rules.md`
- 设计 token、竖排标题、ruby、折叠卡、动效 → `references/typography.md`
- 截图、结构校验、交互冒烟的具体命令 → `references/verification.md`

两条最容易踩的规则：

- **原文逐字不动**。送假名、标点（「，」「。」）、段落切分、重复的句式都保留，改动只发生在译文与注释里。搬网上译本也要逐句对原文——名句被挪位、惯用句直译、补原文没有的词，是三个固定坑。
- **振假名只标读音拿不准的**。`月 / 大 / 手 / 君 / 結婚` 这类不要标；每两三行一处，留出裸读空间。

## 挂进首页

新篇做完了，在根 `index.html` 的 `.entries` 里照抄一条：

```html
<a class="entry" href="<slug>/index.html">
  <div>
    <p class="e-kicker" lang="ja">ドラマ『…』／2014 特別篇</p>
    <h3 class="e-jp" lang="ja">星野結夏さまへ</h3>
    <p class="e-quote" lang="ja">「恋がいつしか日常に変わること、日常が喜びに変わること。」</p>
    <p class="e-meta">12 段落 · 55 詞 · 脚本 坂元裕二</p>
  </div>
  <span class="e-arrow" aria-hidden="true">→</span>
</a>
```

- `href` 写 `<slug>/index.html`，**不要写 `<slug>/`**：`file://` 下 Chrome 会渲染目录列表而不是 index.html。
- `e-quote` 放原文里最像题眼的一句，不写解说；`e-meta` 的段 / 词数要与单页一致。
- 顶栏的 `収録 N 本` 与页脚的收录数也要一起改。

## 工程结构

```
.
├── README.md                          本文件
├── index.html                         首页：收录列表 + 读法
├── docs/
│   ├── preview-catalog.jpg           收录页预览（README）
│   └── preview-letter.jpg            单篇精读页预览（README）
├── favicon.svg                        标签页图标（朱地白文「読」，可缩放）
├── favicon.ico                        16/32/48 兜底（Safari、抓取预览）
├── apple-touch-icon.png               180 触摸图标（满幅，交给 iOS 切角）
├── <slug>/index.html                  单篇精读页（自包含，无构建）
└── .agent/skills/japanese-drama-line-study/
    ├── SKILL.md                       六步工作流、文法不单列的规则、文案公式、设计红线
    ├── references/
    │   ├── content-schema.md          页面骨架、各类块的 HTML 结构、内容配额、文法条目三件套
    │   ├── editorial-rules.md         首屏文案与版式取舍（含被否版本）
    │   ├── typography.md              设计 token、竖排标题、ruby、折叠卡、文法原句与跳回高亮、动效
    │   └── verification.md            截图、结构校验、交互冒烟
    └── scripts/
        ├── check_page.py              单文件 HTML 结构自检（含文法原句子串比对）
        └── shot.mjs                   通过 CDP 截图（真 390px / 整页 / 定位选择器）
```

`.workbuddy/skills/japanese-drama-line-study` 是指向该目录的相对软链——WorkBuddy 只扫 `.workbuddy/skills/`，靠它装载技能。软链本身进仓库，`.workbuddy/` 其余内容不进。

## 排版与首屏

设计语言：纸色 `#f7f4ec`、墨色 `#211e1a`、朱红 `#b23a2b`、发丝线 `#e2dacc`；日文明朝体、中文宋体、标签等宽。大量留白与细线，几乎没有色块。

- **竖排标题用 `writing-mode: vertical-rl` + `inline-size` 控制换行**。竖排的换行受 inline 轴约束，写成 `block-size` 会变成一条不换行的长列，还会把 flex 交叉轴撑开。
- **一条左对齐线，编号只允许一层**。小节编号与标题同行，条目和四栏不再编号；悬挂栏位在只有一级编号时只会留下空槽。
- **折叠卡用 `<details>` + `::details-content` + `interpolate-size`**，标题不放进 `<summary>`，动画才不会被默认样式打断。
- **不要用 `word-break: auto-phrase`**。390px 下行长会缩到三分之二，看起来像断句失败。
- **默认开着振假名和中文**。改默认值必须同时升 `localStorage` 的 key（现在是 `yomu.letter.ui.v2`），否则老访客看到的还是旧状态。
- **文法原句片段要能读、能点**。13px / `#6b6358` 是下限，再浅在 1440 下几乎看不见；片段本身是回跳链接，跳转时用 `scroll-margin-top` 避开吸顶栏，用 2s 淡出的左侧朱线示位，别铺静态色块（像文字被选中）。
- **标签页图标是「白文印」**：朱红铺地、纸色「読」反白，和正文里的朱线细框印章互补。16px 下小字必然糊，能认出来的是那块朱色方块，所以不做细线框版本（试过，16px 只剩一圈灰边）。字取 Hiragino Mincho ProN W6 转成轮廓，`favicon.svg` 不依赖字体环境。

## 验收

`check_page.py` 自动检查：标签闭合与嵌套、重复 id、指向不存在锚点的站内链接、小节 / 精读卡 / 词表行 / 文法原句 / 振假名数量、`<html lang>`、外链 `rel=noopener`、图片 `alt`；并逐条比对每条文法原句片段是否逐字出自所属段落、回跳是否指对 `#pN`、是否还残留独立 `#grammar` 节。手写片段时漏一个逗号或送假名，页面照样渲染，只有这条检查能抓到。有问题非零退出，可以直接接在流程后面。

`shot.mjs` 走 CDP：`chrome --window-size=390` 会被钳到 500px 再裁切，看到的不是手机宽度；`Emulation.setDeviceMetricsOverride` 才是真的 390。

```bash
python3 .agent/skills/japanese-drama-line-study/scripts/check_page.py saikou-no-rikon/index.html
node .agent/skills/japanese-drama-line-study/scripts/shot.mjs "file://$PWD/saikou-no-rikon/index.html" .shot/top.png --width 1440 --height 900
node .agent/skills/japanese-drama-line-study/scripts/shot.mjs "file://$PWD/saikou-no-rikon/index.html" .shot/m.png --width 390 --height 844 --selector "#p1"
```

交互冒烟五项：ふりがな / 中文 两个开关、词表搜索与词性筛选、折叠卡展开、朗读按钮（没有 `speechSynthesis` 时按钮应被移除）、点文法原句后落到 `#pN` 且该段命中 `:target`。人工只需要看三点：`.shot/` 截图里的**注音有没有串行**、**长句有没有在小屏被拆断**、**句型名与原句片段在窄屏折行后是否还读得成一组**。

## 常见问题

**`check_page.py` 报「重复 id」或「锚点不存在」** 段号 `#pN` 与精读卡 `#dN` 必须一一对应；加段、删段时两边一起改。

**报「原句片段不是该段原文子串」** 片段里的逗号、送假名、振假名被改动了，或抄到了相邻段落。片段必须逐字出自 `#pN`，去掉 `<em>` 与 `<rt>` 后做子串比对；不要另造例句，也不要为了通顺补字。

**`file://` 打开点作品链接，看到的是文件列表** 链接写成了 `xxx/`。改成 `xxx/index.html`。

**首页或页脚的数字不对** 顶栏 `収録 N 本`、首页页脚、单页首屏 `meta`、小节标题、`e-meta` 都是手写的，加一篇要一起改。

**WorkBuddy 里看不到这个技能** 软链断了。`ls -l .workbuddy/skills/` 若显示红字，重建：

```
ln -s ../../.agent/skills/japanese-drama-line-study .workbuddy/skills/japanese-drama-line-study
```

**手机 / 平板上点朗读没声音** 用的是浏览器 `speechSynthesis`，需要系统装有日语语音包（iOS 要在「设置 → 辅助功能 → 朗读内容」里先下载日语）。

**改过默认显示，老访客却没变化** `localStorage` 里还存着旧值。升 `STORE` 的版本号（`yomu.letter.ui.v2` → `v3`）。

## 版权

页面是个人日语学习用途的台词解析作品。每篇页脚要写全出处：剧名、年份、集数或 SP、脚本家，能定位到视频就带上时间码（`?t=秒`）；并注明「原文与译文仅供学习研究使用，版权归原作者及电视台所有」。
