# Changelog

Muspro Seeds follows [Semantic Versioning](https://semver.org/). Adding seeds or editing seed text is a
minor or patch release. Changing frontmatter fields, scenario names or the `index.json` layout is a major
release and raises `schemaVersion`. Published IDs are never removed or reused; retire a seed with
`deprecated: true` and keep it for at least one major version.

## 1.2.0

Seed content release in four parts. Every seed keeps its ID, file name and design information (layout,
type character, color values, craft); frontmatter fields, scenario names and the `index.json` layout are
unchanged, so `schemaVersion` stays 1.0.0.

- Content generalized (17 seeds: `rvYJrbZh`, `o0W3sQmk`, `B3LYgTWe`, `t2Q6D5JR`, `LjwyQI6U`, `lC4BpOAk`,
  `H9aLYT6s`, `upXsOXv8`, `Nv0J2QBT`, `swwKiFDe`, `1JlUSoIP`, `rVQmfOqR`, `GzPJkoac`, `FpA0MHDV`,
  `haYCh1wI`, `Yoiov5EL`, `JiAIwOJv`): source-site code, SVG exports and class names, hashed file names,
  quoted copy and slogans, named brands, clients, logos, people and works, and proprietary font names are
  replaced by descriptions of the technique and type character. Open and system fonts are kept. Two
  internal contradictions were resolved (`rvYJrbZh` scale range is 0.65–1.0; `o0W3sQmk` `#f54e00` is
  orange). `LjwyQI6U` drops its browser theme-color `#ddfa6d`, the only color value removed.
- Contrast fixes (7 seeds: `H9aLYT6s`, `1JlUSoIP`, `rVQmfOqR`, `GzPJkoac`, `vEj9F5om`, `FpA0MHDV`,
  `tVghVsn2`): the 11 confirmed WCAG failures now pass. As in `mC1nkP2t`, original values stay and are
  limited to uses they pass (fills, marks, decoration, disabled states); a same-hue text or UI value is
  added, e.g. `1JlUSoIP` links `#0181eb` → `#0272D1`, `FpA0MHDV` missed-call text `#ff3232` → `#EA0C1D`.
  `scripts/contrast-report.mjs` gains `--no-violations`, and `npm run check` now fails on any confirmed
  failure or stale declaration in any seed.
- Verification of inferred pairs (9 seeds: `pibXRzsG`, `Vy3KTWAC`, `AT5oq8hX`, `H9aLYT6s`, `Yoiov5EL`,
  `haYCh1wI`, `1JlUSoIP`, `swwKiFDe`, `vEj9F5om`): 15 of the 16 pairs whose role was inferred are now
  declared from the seed text and pass; 14 of them changed seed values (e.g. `pibXRzsG` text on pink and
  orange is black, focus ring Focus Red `#BF0000`; `H9aLYT6s` focus ring `#AEC2FE`). `t2Q6D5JR`
  `#C0C0C0` stays unconfirmed.
- Minor fixes: added the missing `# Coherence` section to `JiAIwOJv`, `LjwyQI6U` and `haYCh1wI`;
  `AT5oq8hX` and `G26LBSOO` tag `framer` instead of `webflow`, matching their Tech Stack; removed
  pointers to reference files that do not exist from `rVQmfOqR`, `H9aLYT6s`, `AT5oq8hX`, `FpA0MHDV`,
  `Vy3KTWAC`, `C4aZtWoH`, `Nv0J2QBT` and `JiAIwOJv`; the `mC1nkP2t` Chinese summary again says printing
  methods are chosen per task.
- `mC1nkP2t` seed text is unchanged since 1.1.0 and is still recorded as modified from its MIT-licensed
  source in NOTICE.
- Minor rather than patch: changed color values and usage rules change what consumers produce.

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
