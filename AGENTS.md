# 仓库 Agent 指南

本文件适用于整个仓库。任何 Agent 在读取、新增或修改作品页、原文底稿、音频、首页和项目技能前，都应先遵守这里的规则。

产品定位与读者入口以 [README.md](./README.md) 为准；更细的页面结构、编辑口径和版式实现以 `.agent/skills/japanese-drama-line-study/` 为准。两者与现有页面冲突时，优先保留用户当前要求、本文件和 `source.md` 中的已核对内容。

## 先判断任务类型

| 任务 | 必做 |
| --- | --- |
| 阅读、评价或润色 README | 先读 README、根 `index.html` 与相关作品页；README 面向读者，不写 Agent 操作流程 |
| 新增一篇作品或一场台词 | 读取 `.agent/skills/japanese-drama-line-study/SKILL.md`，按“新增作品”流程执行 |
| 修改原文、译文或分段 | 先改 `<slug>/source.md`，再同步 `<slug>/index.html`；两处逐段一致 |
| 只改精读、振假名、词汇或版式 | 读取对应的页面、`source.md` 和技能参考资料，确保没有改变原文与译文 |
| 新增或替换音频、剧照 | 读取技能的 `references/content-schema.md`、`references/typography.md` 和 `references/verification.md` |
| 修复多篇页面或首页 | 先逐个检查受影响的页面和首页计数，再集中修改并验证全部相关页面 |

如果任务涉及新增作品，还必须读取：

- `.agent/skills/japanese-drama-line-study/references/content-schema.md`
- `.agent/skills/japanese-drama-line-study/references/editorial-rules.md`
- `.agent/skills/japanese-drama-line-study/references/typography.md`
- `.agent/skills/japanese-drama-line-study/references/verification.md`

## 仓库内容模型

每篇作品独立放在一个以罗马字命名的目录中：

```text
<slug>/
├── source.md       原文、译文、出处与素材记录
└── index.html      自包含阅读页，无构建步骤
```

- `source.md` 是文字底稿，`index.html` 是展示层。
- 同一部作品的不同片段各自建目录，不合并进一份 Markdown。
- 根目录 `index.html` 是作品集首页，`.entries` 中的条目顺序和计数必须与真实页面一致。
- 音频放在 `assets/audio/`，剧照放在 `assets/stills/`。
- 项目技能位于 `.agent/skills/japanese-drama-line-study/`；`.workbuddy/skills/japanese-drama-line-study` 只是兼容入口，不要在这里维护另一份规则。

## 不可违反的内容规则

1. **原文逐字保留。** 送假名、标点、字词、语序、重复句式和来源分段都按核对后的版本保存。修改只发生在译文、注释和展示层。
2. **先写源档，再改页面。** 原文、译文或分段变化时，先更新 `source.md`，再同步 `index.html`。
3. **原文至少交叉核对两个独立来源。** 无法确认的内容要标明来源与存疑处。字幕听写不能直接称作台本原文。
4. **译文独立完成并逐句回看原文。** 不补原文没有的信息；惯用句、名句位置、省略和中文取舍写进「訳注」。
5. **文法必须贴着原句讲。** 不另建独立文法章节；每条文法放在所属段的精读卡内，带本段原句片段，并能跳回正文。
6. **不要把内部制作细节写进产品文案。** README 和读者可见内容描述阅读体验、作品与使用方法；Agent 流程、校验命令和被否方案留在本文件、技能或开发文档中。
7. **保留用户已有内容。** 修改前先检查 `git status` 和相关 diff，不覆盖与当前任务无关的改动。已有页面、用户未提交的改动和来源备注默认保留。
8. **每页只保留一张可选剧照。** 图片使用 3:2、960×640 的 WebP，放在 `assets/stills/`；字幕、台标和水印必须先裁掉；没有合适图片时整块省略。

## 新增作品

1. 明确作品、集数或 SP、场景和收录范围。用户没有说明缩小范围时，保留完整片段。
2. 取得并交叉核对原文，确定目录 slug。记录剧名、年份、集数或 SP、脚本家、播出日期、影像时间码和版权说明。
3. 创建 `<slug>/source.md`，依次写入题眼、元信息、出处和逐段原文；再完成并校翻译，逐段写回源档。
4. 按原文自然段或场景组织页面。一段原文配一段译文；连续独白或一场完整戏可以不分段，改用行锚点。
5. 为每段建立精读卡，固定包含：
   - 骨格：句子如何搭起来；
   - 文法：句型名、本段原句片段和用法；
   - 語彙：读音、词性和释义；
   - 役割：这一段在整篇中的结构作用；
   - 訳注：中文翻译的取舍。
6. 从现有页面复制结构时，保留单文件 HTML、顶栏、首屏、正文、精读、词汇和页脚。按篇调整锚点、标题、来源、音频区间、剧照和计数。
7. 在根 `index.html` 的 `.entries` 中加入 `<slug>/index.html` 链接、题眼和元信息；同步更新首页与页脚的收录数量。
8. 生成分享卡 `assets/og/<slug>.jpg`（800×800、JPG），并在该页 `<head>` 写入 `canonical` 与 `og:*`／`twitter:*`，图片用绝对地址。做法见技能 `SKILL.md` 的「7. 分享预览（OG 卡）」。
9. 按“交付前验收”检查新页和首页，不要只检查 HTML 能否打开。

新增页面的最小结构参考是 `saikou-no-rikon/index.html` 与 `saikou-no-rikon/source.md`。连续独白可参考 `nigehaji/index.html` 的行锚点变体。

## 内容与交互约定

- 振假名和中文译文默认开启，两个开关都记住用户在当前浏览器中的选择。修改默认值时同步升级 `localStorage` key。
- 振假名只标读音容易拿不准、放进上下文又值得提示的汉字；不要把 `月 / 大 / 手 / 君 / 結婚` 这类常见读音全部标出。
- 正文段号 `#pN` 对应精读卡 `#dN`；连续独白使用 `#L...` 行锚点。正文、卡片和文法原句之间的跳转必须闭环。
- 词汇按正文出现顺序整理，支持搜索日文、假名读音和中文释义，并能按词性筛选。每行标明所在段号或行号。
- 有片源时使用原声。每篇只保存一个音频文件，段落按钮通过 `data-start` / `data-end` 控制区间；音频加载失败时回退 `speechSynthesis`。
- 页脚必须写清作品、集数或 SP、脚本家、可定位的影像时间码和版权声明。不要添加测验、评分或打卡功能。
- 页面保持自包含，CSS、脚本和正文直接放在单篇 HTML 中。不要引入构建步骤，也不要让本地 `file://` 阅读依赖服务端路由。

## 排版与可访问性

- 设计基调为纸色 `#f7f4ec`、墨色 `#211e1a`、朱红 `#b23a2b`、发丝线 `#e2dacc`，日文用明朝体、中文用宋体、标签用等宽字体。
- 竖排标题使用 `writing-mode: vertical-rl`，通过 `inline-size` 控制换行；不要用 `block-size` 限制竖排宽度。
- 折叠卡使用原生 `<details>`。正文目标段设置 `scroll-margin-top`，回跳时避开吸顶栏。
- 精読与単語帳两节整节收起：`section.sec` 里套 `<details class="fold">`，标题行做 `summary`；精读卡本身也不再带 `open`。首屏按钮、页脚分区和段号 `#dN` 跳到折叠内部时要先展开再定位。
- 窄屏下必须保留正文、译文、原声按钮和词汇检索；不要隐藏关键内容或造成横向溢出。
- 图片必须有 `alt`、宽高和正确的剧照比例；外链打开新窗口时使用 `rel="noopener noreferrer"`。
- 390px 布局必须通过 CDP 模拟查看。Chrome 的 `--window-size=390` 会被钳到至少 500px，不能作为手机验收依据。

## 交付前验收

先检查本次改动范围，再执行以下命令；只改一篇时检查该篇，改到首页或多篇时扩展到所有受影响页面：

```bash
git status --short
git diff --check
python3 .agent/skills/japanese-drama-line-study/scripts/check_page.py <slug>/index.html
node .agent/skills/japanese-drama-line-study/scripts/shot.mjs "file://$PWD/<slug>/index.html" .shot/top.png --width 1440 --height 900
node .agent/skills/japanese-drama-line-study/scripts/shot.mjs "file://$PWD/<slug>/index.html" .shot/m.png --width 390 --height 844 --selector '#p1'
```

同时确认：

- `source.md` 与 `index.html` 的段数、段序、日文和中文一致。
- 每条文法原句逐字出自所属段，并跳回正确锚点。
- 首页条目、首屏元信息、页脚和小节标题中的段数、词数与收录数一致。
- 振假名与中文开关、词汇搜索与筛选、精读卡开合、音频播放与区间停止都可用。
- 每页 `<head>` 的 `og:image` 是绝对地址，指向存在的 `assets/og/<slug>.jpg`（800×800、JPG）；分享卡文案与该页标题、剧集一致。
- 桌面和 390px 截图中没有振假名串行、长句异常断裂、锚点遮挡或横向溢出。
- 本地 README 链接没有指向不存在的文件；修改文案时没有把 Agent 操作流程重新写回 README。

`check_page.py` 不覆盖首屏和页脚组件是否完整。新增或拆分页面时，还要人工对照任一既有页面，确认顶栏、三个首屏入口、正文、精读、词汇、出处、版权和返回作品集的链接都存在。
