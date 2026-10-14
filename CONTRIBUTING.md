# 贡献指南

本文说明新增或修改 seed 时要遵守的规则，以及 `npm run check` 会因为什么失败。目录结构和常用命令见 [README](README.md)。

## 基本规则

- 已发布的 ID 不删除、不改绑到其他文件，也不重新使用；文件名 `<slug>-<id小写>.md` 不改。要停用一条 seed，在 frontmatter 加 `deprecated: true`，至少保留一个 major 版本。
- seed 内容只能来自它所参考的设计先例。修改已有 seed 时，新写的内容只能基于该 seed 已有的信息，不添加原文没有的事实或来源。
- 来源有作者、URL 或许可时写入 `source_url`、`source_revision`、`source_license`，需要随附的声明写进 `NOTICE`。
- 从多个先例提炼的泛化 seed 没有单一来源，frontmatter 不写上述来源字段，许可不猜填；CHANGELOG 注明“基于公开 UX 研究与获奖案例的共性提炼”，不列来源名称，来源清单按 seed ID 记在仓库外的调研记录中。这类 seed 的结构、顺序和规则必须是来源的共性；色值、字号、断点、时长等具体参数可以由作者选定，但 Narrative 要写明它们是选定的默认值，不是来源实测。
- `seeds/index.json` 和 `seeds/scenarios.json` 是生成物，不要手改，用 `npm run build` 重新生成。

## 色值必须写明用途

**seed 正文里的每个色值，都必须在 `scripts/contrast-roles.json` 中写用途声明（附 seed 原文引用），或写明忽略理由。否则 `npm run check` 失败。**

这里的“色值”指正文（frontmatter 之后的全部内容，包括代码块和表格）中所有 `#rgb`、`#rgba`、`#rrggbb`、`#rrggbbaa` 形式的写法，按 RGB 值去重：`#fff` 与 `#FFFFFF` 是同一个，带透明度的 `#00000014` 与 `#000000` 也算同一个。`white`、`black` 这类颜色名不会被识别为色值，但可以在配对中使用。

### 用途声明：`pairs`

一个配对写明前景色在哪些背景上、按哪种门槛使用：

| 字段 | 含义 |
| --- | --- |
| `fg`、`bg` | 前景、背景色值，可以是单个值或数组；数组会展开成所有组合。背景必须不透明。 |
| `kind` | `text` 正文文字（4.5:1）、`large` 大字（≥ 24px 常规或 ≥ 18.7px 粗体，3:1）、`ui` 非文字 UI，如边框、图标、焦点框、数据标记（3:1）。 |
| `certainty` | `declared`：seed 原文同时写明前景和背景的角色；`inferred`：两个角色分别写明，二者同时出现是推断；`uncertain`：原文没有说清该色是否用于文字、用于哪块背景。 |
| `quote` | seed 原文的引用，单句或数组，必填。要逐字照抄正文；可以跨行，比较时空白会合并。`declared` 配对的引用必须包含前景色值本身。 |
| `note` | 中文说明这组配对的用途，建议填写。 |
| `applicability` | 默认 `always`。只有在条款对该用途不适用时（如纯装饰的分隔线）才写 `conditional`，此时 `note` 必填，写明这个用途。seed 正文也要写清这一限定：例如分隔线不只要“不承载文字”，还要写明不单独承担结构或组件的辨识，否则不能算纯装饰。强制检查的 seed 不接受 `conditional`，见下文。 |
| `alpha` | 前景的不透明度（0–1），会先合成到背景上再计算。 |

### 忽略理由：`ignore`

不需要计算对比度的色值（阴影、渐变中间色、只作背景且上面没有文字的色块等）写在 `ignore` 里，键是色值，值是中文理由，不能为空。

### check 失败的情况

`npm run check` 中的对比度检查（`node scripts/contrast-report.mjs --enforce mC1nkP2t --no-violations`）在下列任一情况下失败：

1. **seed 没有条目**：`contrast-roles.json` 里没有这条 seed 的 ID。
2. **未归类色值**：正文中的色值既不在任何配对里，也不在 `ignore` 里。
3. **声明失配**：引用在正文中找不到；配对或 `ignore` 里的色值不在正文中；`declared` 配对的引用没有写出前景色值；配对没有引用；`conditional` 配对没有 `note`；`ignore` 的理由为空。
4. **已确认违规**：`declared` 且非 `conditional` 的配对低于门槛。
5. `contrast-roles.json` 里有不存在的 seed ID，或 `kind`、`certainty`、`applicability` 取值不认识。
6. **强制检查的 seed 有低于门槛的配对**：`--enforce` 列出的 seed（目前只有 `mC1nkP2t`）中，任何低于门槛的配对都会失败，不分 `certainty`，`conditional` 也不例外。上面 4 中的 `conditional` 豁免只适用于其他 seed。

另外，`npm test` 还要求：没有 `inferred` 或 `uncertain` 配对低于门槛（这类组合在报告里列为“低于门槛”，修正或确认角色后再提交）；`test/contrast.test.mjs` 的 `FIXED_PAIRS` 中列出的已修正配对仍然声明且达标。

### 修改色值

对比度不够时，不要直接删除原色值：

- 原色值保留，限定到它能达标的用途（色块、标记、装饰、大字、禁用态等）；为不达标的用途新增一个同色相、只调整明度的值。`npm run contrast -- --out <file>` 的报告会给出建议色。
- 在 seed 正文写清每个值的用途和对比度（比值截断到两位小数，例如 4.599 写作 4.59），同步更新 `contrast-roles.json`，引用写改动后的原文。
- 修正后的配对加入 `test/contrast.test.mjs` 的 `FIXED_PAIRS`，这样以后删除声明也会被测试发现。

## 操作步骤

1. 新增 seed：在对应分类下新建 `seeds/<scenario>/<slug>-<id小写>.md`，把 `{ "id", "file" }` 追加到 `registry/preserved-ids.json` 末尾，在 `registry/labels.zh-CN.json` 写中文标题与说明。frontmatter 字段见 `schema/seed.schema.json`，正文须有 `# Narrative` 章节。
2. 运行 `npm run contrast -- --out /tmp/contrast.md`，在报告的“未计算的色值”和“声明失配”中找出需要处理的色值。
3. 在 `scripts/contrast-roles.json` 的 `seeds` 下为这条 seed 写 `pairs` 和 `ignore`，每个配对附原文引用。
4. 运行 `npm run build && npm run check`，全部通过后提交 seed、登记表、`contrast-roles.json` 和生成物。

## 示例

seed 正文（`seeds/graphic/font-specimen-type-foundry-t2q6d5jr.md` 的 Color 章节，节选，已折行）：

```markdown
Palette: **#222222** (primary text/borders), **#757575** (secondary/muted text, 4.60:1 on white),
**#C0C0C0** (decorative divider lines only), **#6C6C58** (diagram lines), **#FFFFFF** (background).
The light gray #C0C0C0 reaches only 1.81:1 on white, so it is kept for purely decorative divider
lines: it never carries text, and no structure or component depends on it alone to be seen. Lines
that mark a needed boundary use the primary #222222 (15.90:1 on white). …
```

对应的声明（节选）：

```json
"t2Q6D5JR": {
  "pairs": [
    {
      "fg": "#757575",
      "bg": "#FFFFFF",
      "kind": "text",
      "certainty": "declared",
      "quote": [
        "**#757575** (secondary/muted text, 4.60:1 on white)",
        "**#FFFFFF** (background)"
      ],
      "note": "次要/弱化文字在白底上的文字值"
    },
    {
      "fg": "#C0C0C0",
      "bg": "#FFFFFF",
      "kind": "ui",
      "certainty": "declared",
      "quote": [
        "**#C0C0C0** (decorative divider lines only)",
        "it is kept for purely decorative divider lines: it never carries text, and no structure or component depends on it alone to be seen"
      ],
      "applicability": "conditional",
      "note": "只用于纯装饰分隔线：不承载文字，也不单独承担结构或组件的辨识（需要辨识的边界用 #222222），纯装饰内容不适用 1.4.11"
    }
  ]
}
```

忽略理由的写法（`tVghVsn2`）：

```json
"ignore": {
  "#00000014": "阴影",
  "#eeeeee": "浮层装饰边框"
}
```

如果删掉 `#757575` 的配对，或引用不再与正文一致，check 会这样失败：

```text
Contrast check failed:
- t2Q6D5JR: quote not found: "**#222222** (primary text)"
- t2Q6D5JR: #757575 (line 81) has no declared role or ignore reason
```

## 版本

`package.json` 的 `version` 遵循 semver，发布时同步更新 `CHANGELOG.md`：

- **patch**：不改变 seed 设计方向的修正，例如对比度修正（保留原色值并新增同色相的值）、补齐缺失的必需章节、措辞和文档修正。
- **minor**：新增 seed，或成批改写、改变 seed 的设计指导。
- **major**：改 frontmatter 字段、分类名或索引结构，同时提升 `scripts/lib.mjs` 中的 `schemaVersion`。
