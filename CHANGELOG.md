# Changelog

Muspro Seeds follows [Semantic Versioning](https://semver.org/). Adding seeds or editing seed text is a
minor or patch release. Changing frontmatter fields, scenario names or the `index.json` layout is a major
release and raises `schemaVersion`. Published IDs are never removed or reused; retire a seed with
`deprecated: true` and keep it for at least one major version.

## 1.1.0

- `mC1nkP2t` (editorial print system): colors adjusted to meet WCAG 2.x contrast. Each ink now has a
  plate value (the original hex, for color fields, screens, marks and large type where it reaches 3:1)
  and a text value that reaches at least 4.5:1 on Neutral White, Cool Gray and Pale Beige. Nine inks
  got a darker text value, e.g. Terracotta `#C65F38` → Terracotta Text `#AE4921`, Botanical Green
  `#008A4B` → `#037841`, Mint Green `#5EB783` → `#127747`. The Color section lists every value with
  its role and ratios; the CSS scaffold adds `--ink-accent-text`. The change is recorded as a
  modification of the MIT-licensed source in NOTICE.
- Added `scripts/contrast-report.mjs` and `scripts/contrast-roles.json`: a dependency-free WCAG contrast
  report over the color roles each seed declares. `npm run check` prints the report and fails only when
  an enforced seed (`mC1nkP2t`) has a failing pair or a stale declaration; other seeds are reported.
- Minor rather than patch: the seed's guidance changes (new color values and usage rules that change
  what consumers produce), while frontmatter, IDs and the index layout are unchanged.

## 1.0.0

- First standalone release, split from Musekit's Musepool skill. The 29 seeds (ui 14, graphic 10,
  information 5) are carried over unchanged with their original IDs.
- `seeds/index.json` and `seeds/scenarios.json` are generated from frontmatter by
  `scripts/build-index.mjs`; `index.json` now wraps the entries as `{ schemaVersion, version, seeds }`.
  Every gist is the opening paragraph of `# Narrative` cut to 300 characters, so the `mC1nkP2t` gist
  is longer than the hand-trimmed text it had in Musekit.
- Added `schema/seed.schema.json`, the append-only ID registry, validation, reproducible release packing
  (`muspro-seeds-<version>.tar.gz` + `manifest.json`), LICENSE (MIT) and NOTICE.
