# 检索 P1 补标签实施报告

日期：2026-10-23。分支：`feat/search-p1-tags`。修改前 HEAD：`64bc2fd1516dfbed235c7a4fe20aa94bba90ce06`。

已按 `seeds.plan.md` 为 32 条 seed 追加 47 个标签，逐条核对原正文依据。版本按 README 的修正规则从 `1.3.0` 升为 `1.3.1`（patch），schemaVersion 保持 `1.0.0`。正文、原有标签、ID、文件绑定、分类、索引顺序和 gist 均未改变；无新增 `cocktail` 标签。

输入及交付限制：`/workspace/fix-20261023/out/seeds.planrev.md` 只有三条 allowedTools 警告及 `Error: Input must be provided either through stdin or as a prompt argument when using --print`，没有有效审查结论或“必须修改项”。因此不能声称已落实外部方案审查；本次独立核对了正文依据、变更范围、产物完整性和 CLI 回归。原 `/workspace/fix-20261023/report-repos.md` 在沙箱可写范围之外，未改写，实施结果保存在本文件；提交受下述只读限制阻断。

## 修改文件及行数预算

- `seeds/ui/*.md` 15 个、`seeds/graphic/*.md` 11 个、`seeds/information/*.md` 6 个：仅在 tags 组末尾追加，共 +47/-0 行。完整文件及证据见下表。
- `package.json`：版本 +1/-1 行。
- `CHANGELOG.md`：1.3.1 记录 +12/-0 行。
- `seeds/index.json`：构建生成 +80/-33 行（追加标签及数组逗号、版本变化）。
- `seeds/scenarios.json`：构建生成 +1/-1 行（仅版本）。
- `reports/search-p1-tags.md`：本实施报告，新增 250 行。
- 以上共 37 个 Git 文件，+391/-35 行；不计报告为 36 个文件、+141/-35 行。
- 本地重新生成 `dist/manifest.json`、`dist/muspro-seeds-1.3.1.tar.gz`，并保留 `dist/p1-before/` 的旧包及 `dist/p1-verification/` 解包库与检索输出；`dist/` 按仓库约定忽略，不纳入提交。

新增程序源码 **0 行**，新增测试代码 **0 行**；预算按 `0 ≤ 1.5 × 0` 满足，0/0 比值不定义。若以 seed 数据新增行计，测试/数据为 0/47 = 0%。复用仓库测试并执行一次性验收命令，没有新增测试文件或检索实现。

## 标签及正文依据

证据行号指向本次补标签后的文件，正文原句未改；链接文字同时列出源文件名。

| seed | 文件与正文位置 | 标签组 | 新增标签 | 依据 |
| --- | --- | --- | --- | --- |
| `E3ISF3qW` | [ui/restaurant-cafe-website-e3isf3qw.md:72](../seeds/ui/restaurant-cafe-website-e3isf3qw.md#L72) | domain | `bar`, `bakery` | 明确适用于 restaurant、cafe、**bakery or bar**。 |
| `Nv0J2QBT` | [ui/generative-music-visualization-nv0j2qbt.md:68](../seeds/ui/generative-music-visualization-nv0j2qbt.md#L68) | tech | `paper.js`, `canvas` | 明确使用 Paper.js 做 canvas 矢量渲染。 |
| `lC4BpOAk` | [ui/personal-portfolio-lc4bpoak.md:68](../seeds/ui/personal-portfolio-lc4bpoak.md#L68) | tech | `swiper` | 明确使用 Swiper.js 实现横向作品轮播。 |
| `vEj9F5om` | [ui/interactive-audio-experience-vej9f5om.md:68](../seeds/ui/interactive-audio-experience-vej9f5om.md#L68) | tech | `web-audio` | 自定义 Web Audio API 音频引擎。 |
| `rvYJrbZh` | [ui/artist-portfolio-rvyjrbzh.md:106](../seeds/ui/artist-portfolio-rvyjrbzh.md#L106) | typography | `fluid-type` | flowtype.js 随视口调整字号。 |
| `weZM545X` | [ui/editorial-publication-wezm545x.md:78](../seeds/ui/editorial-publication-wezm545x.md#L78) | typography | `fluid-type` | 明确描述 fluid responsive text 和动态字号计算。 |
| `x1BNQPTi` | [ui/community-archive-x1bnqpti.md:63](../seeds/ui/community-archive-x1bnqpti.md#L63) | domain | `archive` | 社区档案、历史物件征集与集体记忆保存。 |
| `swwKiFDe` | [ui/education-product-swwkifde.md:77](../seeds/ui/education-product-swwkifde.md#L77) | typography | `fluid-type` | 使用 `clamp()` 的流式字体尺度。 |
| `pu9ToBED` | [ui/supply-chain-intelligence-dashboard-pu9tobed.md:73](../seeds/ui/supply-chain-intelligence-dashboard-pu9tobed.md#L73) | domain | `supply-chain`, `procurement` | 面向采购人员的供应链情报仪表盘。 |
| `rVQmfOqR` | [ui/agency-landing-rvqmfoqr.md:78](../seeds/ui/agency-landing-rvqmfoqr.md#L78) | layout | `asymmetric-grid`, `horizontal-scroll` | 非对称流程卡片网格与横向滚动服务菜单。 |
| `FpA0MHDV` | [ui/music-artist-portfolio-fpa0mhdv.md:72](../seeds/ui/music-artist-portfolio-fpa0mhdv.md#L72) | layout | `mobile-first` | 明确为 full-viewport mobile-first 布局。 |
| `upXsOXv8` | [ui/health-ecommerce-upxsoxv8.md:87](../seeds/ui/health-ecommerce-upxsoxv8.md#L87) | color | `green-dominant` | 明确 deep forest green dominant、monochrome-green。 |
| `o0W3sQmk` | [ui/saas-developer-tools-o0w3sqmk.md:63](../seeds/ui/saas-developer-tools-o0w3sqmk.md#L63) | domain | `developer-tools` | 面向工程师和 AI agents 的开发者工具平台。 |
| `tVghVsn2` | [ui/whiteboard-tool-tvghvsn2.md:68](../seeds/ui/whiteboard-tool-tvghvsn2.md#L68) | domain | `whiteboard`, `onboarding` | 开源白板工具兼交互式上手教程。 |
| `GzPJkoac` | [ui/design-collective-gzpjkoac.md:91](../seeds/ui/design-collective-gzpjkoac.md#L91) | imagery | `video-bg` | 明确部分章节使用视频背景。 |
| `JiAIwOJv` | [graphic/design-studio-portfolio-jiaiwojv.md:65](../seeds/graphic/design-studio-portfolio-jiaiwojv.md#L65) | domain | `print` | 以印刷与编辑设计作品为展示主体。 |
| `LjwyQI6U` | [graphic/sustainability-manifesto-ljwyqi6u.md:70](../seeds/graphic/sustainability-manifesto-ljwyqi6u.md#L70) | domain | `sustainability`, `circular-design` | 可持续宣言，讨论循环设计、材料、可回收性和减废。 |
| `Vy3KTWAC` | [graphic/art-book-fair-event-vy3ktwac.md:68](../seeds/graphic/art-book-fair-event-vy3ktwac.md#L68) | domain | `book-fair` | 明确艺术书展活动站点。 |
| `AT5oq8hX` | [graphic/designer-portfolio-at5oq8hx.md:80](../seeds/graphic/designer-portfolio-at5oq8hx.md#L80) | typography | `sans-serif`, `monospace` | 正文 Inter，元信息 Azeret Mono。 |
| `B3LYgTWe` | [graphic/arts-center-b3lygtwe.md:93](../seeds/graphic/arts-center-b3lygtwe.md#L93) | imagery | `collage` | 照片遮罩形成 torn-paper、collage-like 美学。 |
| `mC1nkP2t` | [graphic/editorial-print-system-mc1nkp2t.md:85](../seeds/graphic/editorial-print-system-mc1nkp2t.md#L85)、[graphic/editorial-print-system-mc1nkp2t.md:95](../seeds/graphic/editorial-print-system-mc1nkp2t.md#L95) | domain | `cover` | 明确适用于 covers；另一正文段 还给出封面比例。 |
| `C4aZtWoH` | [graphic/art-school-exhibition-c4aztwoh.md:71](../seeds/graphic/art-school-exhibition-c4aztwoh.md#L71) | domain | `exhibition`, `photography` | 摄影 MFA 毕业展及毕业摄影师导航。 |
| `pibXRzsG` | [graphic/agency-portfolio-pibxrzsg.md:68](../seeds/graphic/agency-portfolio-pibxrzsg.md#L68) | domain | `community` | 定位为连接数字与现实社区建设的合作伙伴。 |
| `tTceao0M` | [graphic/brand-studio-portfolio-ttceao0m.md:100](../seeds/graphic/brand-studio-portfolio-ttceao0m.md#L100) | motion | `smooth-scroll` | 明确锚点链接使用 smooth scroll。 |
| `t2Q6D5JR` | [graphic/font-specimen-type-foundry-t2q6d5jr.md:66](../seeds/graphic/font-specimen-type-foundry-t2q6d5jr.md#L66) | domain | `gaming` | 交互式 8-bit 打砖块游戏展示字体在游戏 UI 中的应用。 |
| `mDGmR1dE` | [graphic/product-launch-social-card-mdgmr1de.md:72](../seeds/graphic/product-launch-social-card-mdgmr1de.md#L72)、[graphic/product-launch-social-card-mdgmr1de.md:86](../seeds/graphic/product-launch-social-card-mdgmr1de.md#L86) | domain | `og-image`, `link-preview`, `banner` | link preview / og image；另一正文段：wide banner。 |
| `G26LBSOO` | [information/health-research-report-g26lbsoo.md:70](../seeds/information/health-research-report-g26lbsoo.md#L70) | domain | `research`, `report` | 女性健康数据研究报告与编号研究章节。 |
| `haYCh1wI` | [information/fashion-archive-haych1wi.md:74](../seeds/information/fashion-archive-haych1wi.md#L74) | tech | `kirby`, `swup`, `flickity` | 逐项明确 Kirby CMS、Swup、Flickity。 |
| `H9aLYT6s` | [information/agency-year-in-review-h9alyt6s.md:76](../seeds/information/agency-year-in-review-h9alyt6s.md#L76) | layout | `masonry` | 项目画廊使用 asymmetric masonry-style grid。 |
| `1JlUSoIP` | [information/interactive-educational-article-1jlusoip.md:64](../seeds/information/interactive-educational-article-1jlusoip.md#L64) | domain | `physics`, `aerodynamics` | 翼型、飞行物理和空气动力学交互解释。 |
| `Yoiov5EL` | [information/documentary-companion-yoiov5el.md:97](../seeds/information/documentary-companion-yoiov5el.md#L97)、[information/documentary-companion-yoiov5el.md:109](../seeds/information/documentary-companion-yoiov5el.md#L109) | imagery | `data-viz`, `network-graph` | 交互式 SVG 网络可视化；另一正文段：力导向图布局。 |
| `YqkjvOqz` | [information/pricing-plan-comparison-table-yqkjvoqz.md:76](../seeds/information/pricing-plan-comparison-table-yqkjvoqz.md#L76) | layout | `comparison-table` | 以方案为列、功能为行的比较表及固定表头。 |

## 改动最大的三条 seed：后续真实出图候选

按新增标签数量排序，第三位 +2 有并列，优先选本次漏检涉及的餐饮 seed。

| seed | 新增量 | 后续实测方向 |
| --- | ---: | --- |
| `mDGmR1dE` 产品发布社媒卡片 | 3 | OG 图片、链接预览图、宽幅 banner，检查不同尺寸下的信息层级 |
| `haYCh1wI` 时尚档案 | 3 | 档案页面与轮播、页面过渡，观察技术标签对参考选取的影响 |
| `E3ISF3qW` 餐厅／咖啡馆官网 | 2（并列） | 分别用 bakery、bar 场景检索并制作页面，验证正文方法的适用性 |

本次只验证标签、构建和检索，尚未进行真实出图，不能据此声称出图质量已验证。

## 如何让指定 CLI 检索本地 dist

已读指定 `muse_local.py` 与 `plugkit-marketplace/scripts/sync-seeds.mjs`。`muse_local.py` 的 `MUSEPOOL_SEEDS_DIR` 接受含 `index.json` 的解包库；它不能直接指向只有 manifest 与 tar.gz 的 dist。`sync-seeds.mjs --source` 支持发布包目录，但会校验锁定版本并同步插件快照、场景指南；使用 `--lock` 还会更新锁文件。本次采用解包库加环境变量，不运行同步、不修改插件库或用户缓存。

先在修改前打包，修改后依次构建与校验：

```bash
# 修改前（1.3.0）
npm run pack:release -- --out dist/p1-before
# 修改后（1.3.1）
npm run build
npm run validate
npm run check
npm run pack:release
git diff --check
```

两份 tar.gz 校验 manifest.sha256 后解包到以下位置，并对解包内容重算 contentHash（按路径排序的 `<文件 sha256>  <相对路径>\n` 清单再取 SHA-256）：

```text
/workspace/fix-20261023/muspro-seeds/dist/p1-verification/before/muspro-seeds-1.3.0
/workspace/fix-20261023/muspro-seeds/dist/p1-verification/after/muspro-seeds-1.3.1
```

用同一脚本、相同参数运行两次，P1_LIBRARY 分别取上述两个绝对路径；以 `-n 32` 再核对全部返回项：

```bash
for query in bakery bar paper.js cocktail; do
  MUSEPOOL_SEEDS_DIR="$P1_LIBRARY" MUSEPOOL_NO_UPDATE_CHECK=1 \
    python3 -B /workspace/fix-20261023/plugkit-marketplace/plugins/musekit/skills/musepool/scripts/muse_local.py \
    search "$query" -n 5
done
```

`MUSEPOOL_NO_UPDATE_CHECK=1` 关闭联网更新检查及其缓存写入，`-B` 避免生成 pycache。全部 16 次检索均退出 0、stderr 为空。环境为 Node.js v20.19.2、Python 3.13.5。

检索脚本 SHA-256：`c4e197dbfeb9a6bc994ce25cd6c1be48bc09f248ecb36b59d2d2d8fb6d670839`。

| 版本 | 归档 SHA-256 | contentHash | 文件数 |
| --- | --- | --- | ---: |
| 1.3.0 | `32486c989466d4a879e35090aa124a6febfb75a96e6f9a09965b571e7e958b98` | `sha256:b7f7b6f9a8f7dd00efc22eb6c56e79697e8a9f7a02a386497b79ec2cd314a42f` | 36 |
| 1.3.1 | `f4dee5c558665a5d54ae6ea466850925c72e4f69695890635e7ea771d13a011c` | `sha256:be2f77d9010b2af1e0f43975dbde938012d5d7b07395be39343b0a02c453c89d` | 36 |

两份包的 sha256、contentHash、36 个文件、包内 index 版本均核对通过。每包含 32 条 seed、两个 JSON、LICENSE、NOTICE。

## 前后实测对比

★ 为 CLI 的可靠匹配标记；排名包括未标 ★ 的返回项。

| 查询 | 1.3.0 | 1.3.1 |
| --- | --- | --- |
| bakery | 无可靠结果，1 条仅正文命中被过滤 | 第 1 条 `★ E3ISF3qW`，唯一结果 |
| bar | `★ B3LYgTWe` 第 1；`E3ISF3qW` 第 10、无 ★，不在前 5 | `★ B3LYgTWe` 仍第 1；`★ E3ISF3qW` 第 2，进入前 5 |
| paper.js | 无可靠结果，1 条仅正文命中被过滤 | 第 1 条 `★ Nv0J2QBT`，唯一结果 |
| cocktail | 无结果，没有 seed 提到查询词 | 仍无结果，未增加该标签 |

`bar` 的艺术中心结果反映原有 thematic tag 与多义词排序，本次标签补全没有消除该现象，也没有修改检索算法。

### -n 5 完整输出（仅清除行尾空白）

#### bakery · before

```text
来源:MUSEPOOL_SEEDS_DIR · muspro-seeds 1.3.0(/workspace/fix-20261023/muspro-seeds/dist/p1-verification/before/muspro-seeds-1.3.0)
没有找到可靠参考:1 个 seed 只在正文里零星提到查询词,不列为结果。
换成带场景的具体英文短语再试(如 "cocktail bar website" 而不是 "bar"),可多试几组说法;没命中的词可换上位词再搜(如 hospitality、restaurant)。部分命中只有分类或摘要确实贴题时才作为相邻参考,并向用户说明;仍然没有就如实说明没有可靠参考。
```

#### bakery · after

```text
来源:MUSEPOOL_SEEDS_DIR · muspro-seeds 1.3.1(/workspace/fix-20261023/muspro-seeds/dist/p1-verification/after/muspro-seeds-1.3.1)
★ [ui] E3ISF3qW  restaurant / cafe website  (novelty 0.55)
    A generalized method for a local restaurant or cafe website, distilled from usability research on restaurant and table reservation sites and from awar
    file: /workspace/fix-20261023/muspro-seeds/dist/p1-verification/after/muspro-seeds-1.3.1/ui/restaurant-cafe-website-e3isf3qw.md
```

#### bar · before

```text
来源:MUSEPOOL_SEEDS_DIR · muspro-seeds 1.3.0(/workspace/fix-20261023/muspro-seeds/dist/p1-verification/before/muspro-seeds-1.3.0)
★ [graphic] B3LYgTWe  arts center  (novelty 0.8)
    An arts center homepage presenting upcoming events and artist programs. The narrative flows from a distinctive organic-shaped hero carousel through a
    file: /workspace/fix-20261023/muspro-seeds/dist/p1-verification/before/muspro-seeds-1.3.0/graphic/arts-center-b3lygtwe.md
以下未标 ★ 的只命中部分查询词或只出现在正文里,不是可靠参考:
  [ui] swwKiFDe  education product  (novelty 0.8)
    A CSS layout education product homepage. The narrative flows from hero (book cover + value proposition) → access recovery → social proof (company logo
    file: /workspace/fix-20261023/muspro-seeds/dist/p1-verification/before/muspro-seeds-1.3.0/ui/education-product-swwkifde.md
  [information] haYCh1wI  fashion archive  (novelty 0.8)
    An independent European menswear label's archive site presenting collections, campaigns, press coverage, research, and products. The narrative structu
    file: /workspace/fix-20261023/muspro-seeds/dist/p1-verification/before/muspro-seeds-1.3.0/information/fashion-archive-haych1wi.md
  [information] Yoiov5EL  documentary companion  (novelty 0.8)
    Interactive companion website for a documentary film about surveillance, vision, and technology. The site presents an annotated archive of articles, q
    file: /workspace/fix-20261023/muspro-seeds/dist/p1-verification/before/muspro-seeds-1.3.0/information/documentary-companion-yoiov5el.md
  [ui] o0W3sQmk  saas developer tools  (novelty 0.8)
    A developer tools platform landing page framed as a desktop OS environment. The entire experience mimics a classic desktop operating system: textured
    file: /workspace/fix-20261023/muspro-seeds/dist/p1-verification/before/muspro-seeds-1.3.0/ui/saas-developer-tools-o0w3sqmk.md
```

#### bar · after

```text
来源:MUSEPOOL_SEEDS_DIR · muspro-seeds 1.3.1(/workspace/fix-20261023/muspro-seeds/dist/p1-verification/after/muspro-seeds-1.3.1)
★ [graphic] B3LYgTWe  arts center  (novelty 0.8)
    An arts center homepage presenting upcoming events and artist programs. The narrative flows from a distinctive organic-shaped hero carousel through a
    file: /workspace/fix-20261023/muspro-seeds/dist/p1-verification/after/muspro-seeds-1.3.1/graphic/arts-center-b3lygtwe.md
★ [ui] E3ISF3qW  restaurant / cafe website  (novelty 0.55)
    A generalized method for a local restaurant or cafe website, distilled from usability research on restaurant and table reservation sites and from awar
    file: /workspace/fix-20261023/muspro-seeds/dist/p1-verification/after/muspro-seeds-1.3.1/ui/restaurant-cafe-website-e3isf3qw.md
以下未标 ★ 的只命中部分查询词或只出现在正文里,不是可靠参考:
  [ui] swwKiFDe  education product  (novelty 0.8)
    A CSS layout education product homepage. The narrative flows from hero (book cover + value proposition) → access recovery → social proof (company logo
    file: /workspace/fix-20261023/muspro-seeds/dist/p1-verification/after/muspro-seeds-1.3.1/ui/education-product-swwkifde.md
  [information] haYCh1wI  fashion archive  (novelty 0.8)
    An independent European menswear label's archive site presenting collections, campaigns, press coverage, research, and products. The narrative structu
    file: /workspace/fix-20261023/muspro-seeds/dist/p1-verification/after/muspro-seeds-1.3.1/information/fashion-archive-haych1wi.md
  [information] Yoiov5EL  documentary companion  (novelty 0.8)
    Interactive companion website for a documentary film about surveillance, vision, and technology. The site presents an annotated archive of articles, q
    file: /workspace/fix-20261023/muspro-seeds/dist/p1-verification/after/muspro-seeds-1.3.1/information/documentary-companion-yoiov5el.md
```

#### paper.js · before

```text
来源:MUSEPOOL_SEEDS_DIR · muspro-seeds 1.3.0(/workspace/fix-20261023/muspro-seeds/dist/p1-verification/before/muspro-seeds-1.3.0)
没有找到可靠参考:1 个 seed 只在正文里零星提到查询词,不列为结果。
换成带场景的具体英文短语再试(如 "cocktail bar website" 而不是 "bar"),可多试几组说法;没命中的词可换上位词再搜(如 hospitality、restaurant)。部分命中只有分类或摘要确实贴题时才作为相邻参考,并向用户说明;仍然没有就如实说明没有可靠参考。
```

#### paper.js · after

```text
来源:MUSEPOOL_SEEDS_DIR · muspro-seeds 1.3.1(/workspace/fix-20261023/muspro-seeds/dist/p1-verification/after/muspro-seeds-1.3.1)
★ [ui] Nv0J2QBT  generative music visualization  (novelty 0.9)
    A programmatic design studio landing page presenting a single endless generative composition in C, titled in the manner of a classical opus number. Th
    file: /workspace/fix-20261023/muspro-seeds/dist/p1-verification/after/muspro-seeds-1.3.1/ui/generative-music-visualization-nv0j2qbt.md
```

#### cocktail · before

```text
来源:MUSEPOOL_SEEDS_DIR · muspro-seeds 1.3.0(/workspace/fix-20261023/muspro-seeds/dist/p1-verification/before/muspro-seeds-1.3.0)
没有找到可靠参考:没有 seed 提到这些查询词。
换成带场景的具体英文短语再试(如 "cocktail bar website" 而不是 "bar"),可多试几组说法;没命中的词可换上位词再搜(如 hospitality、restaurant)。部分命中只有分类或摘要确实贴题时才作为相邻参考,并向用户说明;仍然没有就如实说明没有可靠参考。
```

#### cocktail · after

```text
来源:MUSEPOOL_SEEDS_DIR · muspro-seeds 1.3.1(/workspace/fix-20261023/muspro-seeds/dist/p1-verification/after/muspro-seeds-1.3.1)
没有找到可靠参考:没有 seed 提到这些查询词。
换成带场景的具体英文短语再试(如 "cocktail bar website" 而不是 "bar"),可多试几组说法;没命中的词可换上位词再搜(如 hospitality、restaurant)。部分命中只有分类或摘要确实贴题时才作为相邻参考,并向用户说明;仍然没有就如实说明没有可靠参考。
```

### -n 32 全部返回项

以下按实际顺序列出，保留 ★；完整 stdout 另保存在本地 `dist/p1-verification/{before,after}/results.json`。

| 查询 | before | after |
| --- | --- | --- |
| bakery | 无结果 | ★E3ISF3qW |
| bar | ★B3LYgTWe → swwKiFDe → haYCh1wI → Yoiov5EL → o0W3sQmk → pu9ToBED → G26LBSOO → x1BNQPTi → pibXRzsG → E3ISF3qW → lC4BpOAk | ★B3LYgTWe → ★E3ISF3qW → swwKiFDe → haYCh1wI → Yoiov5EL → o0W3sQmk → pu9ToBED → G26LBSOO → x1BNQPTi → pibXRzsG → lC4BpOAk |
| paper.js | 无结果 | ★Nv0J2QBT |
| cocktail | 无结果 | 无结果 |

## 验证结果

- `npm run build`：通过，重新生成 32 条 seed 的索引和场景清单。
- `npm run validate`：通过，frontmatter、ID、文件命名、登记表一致。
- `npm run check`：通过，覆盖生成物一致性、对比度、`npm test` 与打包可复现检查。
- `npm test`（由 check 执行）：TAP 报告 2 个测试文件通过（`test/contrast.test.mjs`、`test/seeds.test.mjs`），0 失败、0 跳过。
- 对比度：0 已确认违规、0 角色未确认、0 声明失配及未归类色值；既有 8 个 conditional 低于阈值组合保持不变，强制检查的 `mC1nkP2t` 通过。
- `npm run pack:release`：通过，1.3.1 包共 36 文件；重复打包字节一致。
- 额外对照旧包检查：32 条 seed 正文逐字一致、非 tags 元数据一致、原有标签顺序一致，仅追加 47 项，无重复新增；索引除 tags/version 外一致；scenarios 仅版本变化。
- 额外检查首次尝试用 Node `execFileSync` 读 Git 基线时遇到环境 `spawnSync git EPERM`；随后直接读取修改前已校验的独立包完成同等检查并通过。仓库构建与测试本身没有失败。
- `git diff --check`：通过。

未读取凭据文件，未访问或写入用户禁止的两个目录；未打 tag、发 Release、push 或创建 PR。尝试在当前分支提交时，`git add` 因 `.git` 只读失败：`Unable to create .../.git/index.lock: Read-only file system`。因此未暂存、未创建 commit，修改保留在工作区；另保存可应用补丁 `dist/search-p1-tags.patch`，dist 为本地构建产物。
