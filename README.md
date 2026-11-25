# 台詞精読 · yomu

**把一段日剧台词，拆成看得懂的句子。**

日剧台词 / 书信 / 独白的精读页 —— 原文与译文对照、振假名开关、逐段五层拆解、可搜索词表、语法笔记

[在线浏览](https://akisaya.github.io/yomu/) · [收录](https://akisaya.github.io/yomu/#works) · [加一篇](#加一篇) · [内容口径](.agent/skills/japanese-drama-line-study/references/editorial-rules.md) · [常见问题](#常见问题)


## 一篇里有什么

| 板块 | 内容 | 交互 | 学习重点 |
|---|---|---|---|
| 首屏 | 竖排日文标题、朱印、题眼引文（原文 + 译文）、差出人 / 宛名 / 全文段数 | 读原文、学习笔记、影像三个入口 | 先弄清这是谁写给谁的 |
| 段落 | 按来源分段的全文，段号兼锚点，逐段中文译文 | 段落索引随滚动高亮；逐段朗读（`speechSynthesis`） | 对着原文把语气读出来 |
| 精読 | 每段一张卡，五层折叠：骨格 / 文法 / 語彙 / 役割 / 訳注 | `<details>` 展开 | 长句怎么搭起来，这一段在整篇里干什么 |
| 単語帳 | 45–60 个词，读音 / 词性 / 释义 / 段号 | 搜索（假名或中文）+ 词性筛选，窄屏转卡片 | 按出现顺序把词过一遍 |
| 文法メモ | 12–16 个句型，例句全部取自原文，匹配处标色 | — | 把散落的语法点串成线 |
| 页脚 | 出处、影像链接（带时间码）、版权声明、返回作品一覧 | — | 知道这段话从哪里来 |

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
# 首屏 → 段落（#pN）→ 精读卡（#dN）→ 词表 → 语法卡 → 页脚
# 段数不必与样张一致，锚点 #pN / #dN 成对增删

python3 $SKILL/scripts/check_page.py $SLUG/index.html
node $SKILL/scripts/shot.mjs "file://$PWD/$SLUG/index.html" .shot/top.png --width 1440 --height 900
node $SKILL/scripts/shot.mjs "file://$PWD/$SLUG/index.html" .shot/m.png --width 390 --height 844 --selector "#p1"
```

产物是 `$SLUG/index.html`，截图在 `.shot/`（已 gitignore，看完可删）。没有构建步骤：改完直接提交，推 `main` 即更新线上。

## 一页里写什么

四个正文小节——段落 / 精読 / 単語帳 / 文法メモ——缺一段都会显得单薄。精读卡固定五层，顺序即阅读顺序：

| 层 | 回答什么 | 写法 |
|---|---|---|
| 骨格 | 这句怎么搭起来的 | 挑全段最难的一句，用 `／` 切块，逐块标成分与修饰关系；不是翻译 |
| 文法 | 哪个句型在挡路 | 每段 6–8 条，给接续、语感、原句；不收词典释义 |
| 語彙 | 哪些词值得记 | 全篇 45–60 词，按出现顺序，含读音 / 词性 / 释义 / 段号 |
| 役割 | 这段在整篇里干什么 | 讲结构功能（呼应、反转、复现），不复述内容 |
| 訳注 | 哪处翻译有取舍 | 只写真正需要交代的一两处 |

配额：

| 项目 | 数量 | 说明 |
|---|---|---|
| 段落 | 10–14 | 按原文自然段，不强行切 |
| 精读卡 | 与段落同数 | 一段一卡 |
| 文法 | 12–16 | 跨段去重，同句型只讲一次 |
| 词汇 | 45–60 | 按出现顺序 |
| 振假名 | 60–70 处 | N3 密度 |
| 语法条目 / 段 | 6–8 | 日期、落款这类短段可以更少 |

**数字必须自洽**：首页条目、首屏 `meta`、小节标题、页脚里的段数 / 词数 / 句型数要和真实数量一致。用 `check_page.py` 数，不要凭印象写。

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
    <p class="e-meta">12 段落 · 55 詞 · 16 句型 · 脚本 坂元裕二</p>
  </div>
  <span class="e-arrow" aria-hidden="true">→</span>
</a>
```

- `href` 写 `<slug>/index.html`，**不要写 `<slug>/`**：`file://` 下 Chrome 会渲染目录列表而不是 index.html。
- `e-quote` 放原文里最像题眼的一句，不写解说；`e-meta` 的段 / 词 / 句型数要与单页一致。
- 顶栏的 `収録 N 本` 与页脚的收录数也要一起改。

## 工程结构

```
.
├── README.md                          本文件
├── index.html                         首页：收录列表 + 读法
├── <slug>/index.html                  单篇精读页（自包含，无构建）
└── .agent/skills/japanese-drama-line-study/
    ├── SKILL.md                       六步工作流、文案公式、设计红线
    ├── references/
    │   ├── content-schema.md          页面骨架、各类块的 HTML 结构、内容配额
    │   ├── editorial-rules.md         首屏文案与版式取舍（含被否版本）
    │   ├── typography.md              设计 token、竖排标题、ruby、折叠卡、动效
    │   └── verification.md            截图、结构校验、交互冒烟
    └── scripts/
        ├── check_page.py              单文件 HTML 结构自检
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

## 验收

`check_page.py` 自动检查：标签闭合与嵌套、重复 id、指向不存在锚点的站内链接、小节 / 精读卡 / 词表行 / 语法卡 / 振假名数量、`<html lang>`、外链 `rel=noopener`、图片 `alt`。有问题非零退出，可以直接接在流程后面。

`shot.mjs` 走 CDP：`chrome --window-size=390` 会被钳到 500px 再裁切，看到的不是手机宽度；`Emulation.setDeviceMetricsOverride` 才是真的 390。

```bash
python3 .agent/skills/japanese-drama-line-study/scripts/check_page.py saikou-no-rikon/index.html
node .agent/skills/japanese-drama-line-study/scripts/shot.mjs "file://$PWD/saikou-no-rikon/index.html" .shot/top.png --width 1440 --height 900
node .agent/skills/japanese-drama-line-study/scripts/shot.mjs "file://$PWD/saikou-no-rikon/index.html" .shot/m.png --width 390 --height 844 --selector "#p1"
```

交互冒烟四项：ふりがな / 中文 两个开关、词表搜索与词性筛选、折叠卡展开、朗读按钮（没有 `speechSynthesis` 时按钮应被移除）。人工只需要看两点：`.shot/` 截图里的**注音有没有串行**、**长句有没有在小屏被拆断**。

## 常见问题

**`check_page.py` 报「重复 id」或「锚点不存在」** 段号 `#pN` 与精读卡 `#dN` 必须一一对应；加段、删段时两边一起改。

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
