# Changelog

Muspro Seeds follows [Semantic Versioning](https://semver.org/). Adding seeds or editing seed text is a
minor or patch release. Changing frontmatter fields, scenario names or the `index.json` layout is a major
release and raises `schemaVersion`. Published IDs are never removed or reused; retire a seed with
`deprecated: true` and keep it for at least one major version.

## 1.0.0

- First standalone release, split from Musekit's Musepool skill. The 29 seeds (ui 14, graphic 10,
  information 5) are carried over unchanged with their original IDs.
- `seeds/index.json` and `seeds/scenarios.json` are generated from frontmatter by
  `scripts/build-index.mjs`; `index.json` now wraps the entries as `{ schemaVersion, version, seeds }`.
  Every gist is the opening paragraph of `# Narrative` cut to 300 characters, so the `mC1nkP2t` gist
  is longer than the hand-trimmed text it had in Musekit.
- Added `schema/seed.schema.json`, the append-only ID registry, validation, reproducible release packing
  (`muspro-seeds-<version>.tar.gz` + `manifest.json`), LICENSE (MIT) and NOTICE.
