# Muspro Seeds

Muspro Seeds 是一个公开的设计参考库。每条 seed 记录一个真实设计先例中值得借鉴的细节：布局、字体、颜色、图像、交互与工艺，部分附代码级参考。[Musekit](https://github.com/agent-plugkit/plugkit-marketplace) 的 `musepool` Skill 用它检索灵感并写出 seed 简报；其他 Agent 或工具也可以直接读取。

本仓库只放数据和校验工具，不含检索逻辑或制作 Skill。

## 目录

| 路径 | 内容 |
| --- | --- |
| `seeds/{ui,graphic,information}/<slug>-<id>.md` | seed 正文：YAML frontmatter + 固定章节（Narrative、Layout、Typography、Color 等） |
| `seeds/index.json` | 检索索引，**生成物** |
| `seeds/scenarios.json` | 按分类排列的参考清单（中文标题与说明），供 Musekit 生成场景指南，**生成物** |
| `schema/seed.schema.json` | frontmatter 的 JSON Schema |
| `registry/preserved-ids.json` | 已发布 ID 的登记表，只追加；决定索引顺序 |
| `registry/labels.zh-CN.json` | 每条 seed 的中文标题与一句话说明 |
| `scripts/` | 生成、校验、打包脚本，只依赖 Node.js 20+ |
| `scripts/contrast-roles.json` | 各 seed 声明的文字色/背景色角色（附原文引用），供对比度报告使用 |

`seeds/` 目录与发布包的根目录结构相同，可以直接当作 seed 库使用。

## 常用命令

```bash
npm run build          # 从 frontmatter 生成 seeds/index.json 与 seeds/scenarios.json
npm run validate       # 校验 frontmatter、ID 唯一、文件命名与 ID 登记表
npm run check          # 校验 + 生成物一致 + 对比度（强制 mC1nkP2t；全部 seed 已确认违规为 0）+ 测试 + 打包可复现
npm run contrast -- --out contrast.md   # WCAG 对比度报告：全部 seed 的不达标组合与建议色
npm run pack:release   # 生成 dist/muspro-seeds-<version>.tar.gz 与 dist/manifest.json
```

不需要 `npm install`：脚本没有第三方依赖。

## 新增或修改 seed

1. 在对应分类下新建 `seeds/<scenario>/<slug>-<id小写>.md`。`id` 为 8 位字母数字，不能与任何已发布 ID 相同（大小写不敏感）。
2. frontmatter 字段见 `schema/seed.schema.json`；正文须有 `# Narrative` 章节，首段会截取为索引中的 `gist`。来源有作者、URL 或许可时写入 `source_url`、`source_revision`、`source_license`，并在 `NOTICE` 中补充需要随附的声明。
3. 把 `{ "id", "file" }` 追加到 `registry/preserved-ids.json` 末尾，在 `registry/labels.zh-CN.json` 写中文标题与说明。
4. 在 `scripts/contrast-roles.json` 中写入 Color 等章节声明的文字色/背景色组合，每组附 seed 原文引用；没有声明的 seed 按关键词自动推断并标为“角色不确定”。
5. 运行 `npm run build && npm run check`，提交 seed 与生成物。

已发布的 ID 不删除、不改绑到其他文件。要停用一条 seed，在 frontmatter 加 `deprecated: true`，至少保留一个 major 版本。

## 版本与发布

- `version`（`package.json`）遵循 semver：新增或修改 seed 正文为 minor/patch；改 frontmatter 字段、分类名或索引结构为 major，同时提升 `schemaVersion`（`scripts/lib.mjs`）。
- 发布资产为 `muspro-seeds-<version>.tar.gz` 与 `manifest.json`（`name`、`version`、`schemaVersion`、`tarball`、`sha256`、`contentHash`、`files`）。Release tag 为 `v<version>`；Musekit 的 `muse_local.py update` 从 `releases/latest/download/manifest.json` 读取最新版本，只接受同一 schema major。
- 归档内条目排序固定、mtime/属主/权限固定，同一内容与同一 Node.js zlib 生成的字节相同。`contentHash` 是逐文件 sha256 清单的哈希，不受压缩实现影响；下游应以 `sha256` 校验下载、以 `contentHash` 校验快照内容。

## 已知事项

- Musekit 的 seed 简报格式 `references/seed-brief.md` 位于 Musekit 插件根，属于 Skill 间交接协议，不在本仓库。单独导入 `musepool` Skill 目录时这份文件不会被带走，链接会断；该问题在 Musekit 侧另案处理。

## 许可

MIT，见 [LICENSE](LICENSE)。来源说明与第三方许可见 [NOTICE](NOTICE)：除 `mC1nkP2t` 外的 seed 根据公开网络资料撰写，无需额外声明；`mC1nkP2t` 改编自 MIT 许可的 [yanliudesign/mono-color-skill](https://github.com/yanliudesign/mono-color-skill)，分发时须随附 NOTICE 中的版权与许可声明。
