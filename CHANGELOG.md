# Changelog

Muspro Seeds follows [Semantic Versioning](https://semver.org/). Adding seeds or editing seed text is a
minor or patch release. Changing frontmatter fields, scenario names or the `index.json` layout is a major
release and raises `schemaVersion`. Published IDs are never removed or reused; retire a seed with
`deprecated: true` and keep it for at least one major version.

## 1.3.0

Minor release: three new seeds. Existing seeds, IDs, file names, frontmatter fields, scenario names and
the `index.json` layout are unchanged, so `schemaVersion` stays 1.0.0.

- New seeds, one per scenario. Each is a generalized method distilled from the shared traits of public
  UX research and award-recognized examples (基于公开 UX 研究与获奖案例的共性提炼), not a record of one
  site: no source names, logos, copy or code, and no `source_url` because there is no single source.
  Each Narrative states that its structure and rules are what the sources share, while the specific
  values (palette, type sizes, breakpoints, margins, durations) are defaults chosen for the seed.
  - `E3ISF3qW` `ui/restaurant-cafe-website-e3isf3qw.md` (餐厅／咖啡馆官网): restaurant or cafe site
    ordered by the visitor's jobs (menu, reservation/booking, visit info); text menu with sticky
    category anchors, booking panel showing available times, open/closed status from the hours table.
  - `mDGmR1dE` `graphic/product-launch-social-card-mdgmr1de.md` (产品发布社媒卡片): product launch,
    release announcement and changelog social card / og image template; one focal interface crop,
    headline of at most eight words, mono metadata strip, word-labelled change tags, re-laid per size.
  - `YqkjvOqz` `information/pricing-plan-comparison-table-yqkjvoqz.md` (套餐方案对比表): pricing plan
    comparison for subscription tiers; audience cards above a comparison table with sticky headers,
    a tinted and argued recommended tier, and distinct included / not included / not applicable cells.
- Each new seed states every color value with its use and WCAG 2.x ratio (truncated to two decimals);
  all text pairs reach 4.5:1 and all large-text and non-text UI pairs 3:1. Colors left to downstream
  work (photography, brand colors) come with the rule to balance appearance and contrast. Every value
  is declared in `scripts/contrast-roles.json`.
- Review fixes before release: on the restaurant seed's dark Visit band, today's hours row and the
  open/closed status are Night Text (Ink there would be 1.00:1), the dark-band Reserve button has a
  declared hover state, and booking is the one primary action with several entries; the launch card
  separates bleed from the text safe area (long-side inset 120px on 1200×630, also in the CSS), sets
  `box-sizing: border-box` on the artboard and raises tag labels to 20–22px.
- README: a seed records either one real design precedent or a method distilled from several.
- CONTRIBUTING: how distilled multi-source seeds record sources and mark chosen parameters.

## 1.2.1

Patch release: corrections that keep each seed's design direction, plus contributor documentation.
IDs, file names, frontmatter fields, scenario names and the `index.json` layout are unchanged, so
`schemaVersion` stays 1.0.0.

- Contrast (3 seeds). Original values stay, limited to the uses they pass; each new value is a same-hue
  or same-scale value for the use that failed, and the seed text states its use and ratios.
  - `t2Q6D5JR`: secondary and muted text is `#757575` (4.60:1 on white); `#C0C0C0` (1.81:1) is kept for
    purely decorative divider lines that carry no text and are never the only cue for structure or a
    component; needed boundaries use the primary `#222222` (15.90:1). This settles the pair that 1.2.0
    left unconfirmed.
  - `GzPJkoac`: focus outlines and focused input borders use Focus Red `#D82B0C`, a deeper value at the
    primary red's hue (3.36:1 on the blush pink, 3.58:1 on the warm yellow, 4.91 white, 3.99 lavender,
    3.37 navy). Its 3:1 is stated for these five surfaces only; on the periwinkle and violet-blue it
    is 2.03 / 1.54:1. The primary red `#f34020` (2.58 / 2.74:1 on blush pink and yellow) stays for
    borders, active states and accents.
  - `tVghVsn2`: the reference documents no text colors for the dark and starry themes; text there uses
    Light Text `#f5f5f5`, the light end of the seed's own gray scale (16.89:1 on `#141414`, 14.40:1 on
    `#0d2537`).
- Added the missing `# Coherence` section to 7 seeds (`x1BNQPTi`, `lC4BpOAk`, `GzPJkoac`, `rVQmfOqR`,
  `swwKiFDe`, `rvYJrbZh`, `Nv0J2QBT`); each summarizes only what the seed already says. Every seed now
  has a Coherence section.
- `o0W3sQmk` Imagery again says the recurring mascot is a small animal, without naming a species or
  scenes.
- The contrast check (`--no-violations`) now also fails on a seed with no entry in
  `scripts/contrast-roles.json`, a pair without a quote, a conditional pair without a note and an
  ignore entry without a reason; an unknown `certainty` is an error. All current seeds already met
  these rules. A seed passed to `--enforce` (`mC1nkP2t`) fails on any pair below threshold, conditional
  ones included; CONTRIBUTING and the README say so.
- Added `CONTRIBUTING.md`: every color value in a seed needs a role declaration quoting the seed text
  or an ignore reason, with steps and an example. The README links it and states the rule.
- Patch rather than minor: 1.1.0 and 1.2.0 were minor because they reworked a palette system and
  rewrote 17 seeds. Here no seed is added, no design direction changes, and the color changes fix
  failing or unconfirmed uses left over from 1.2.0 while keeping the original values.

## 1.2.0

Seed content release in five parts. Every seed keeps its ID, file name and design information (layout,
type character, color values, craft); frontmatter fields, scenario names and the `index.json` layout are
unchanged, so `schemaVersion` stays 1.0.0.

- Content generalized (17 seeds: `rvYJrbZh`, `o0W3sQmk`, `B3LYgTWe`, `t2Q6D5JR`, `LjwyQI6U`, `lC4BpOAk`,
  `H9aLYT6s`, `upXsOXv8`, `Nv0J2QBT`, `swwKiFDe`, `1JlUSoIP`, `rVQmfOqR`, `GzPJkoac`, `FpA0MHDV`,
  `haYCh1wI`, `Yoiov5EL`, `JiAIwOJv`): source-site code, SVG exports and class names, hashed file names,
  quoted copy and slogans, named brands, clients, logos, people and works, and proprietary font names are
  replaced by descriptions of the technique and type character. Open and system fonts are kept. Two
  internal contradictions were resolved (`rvYJrbZh` scale range is 0.65–1.0; `o0W3sQmk` `#f54e00` is
  orange). `LjwyQI6U` drops its browser theme-color `#ddfa6d`, the only color value removed. Custom
  theme tokens and class names that were left (`lC4BpOAk` page-color tokens and section fade class,
  `Yoiov5EL` hanging-punctuation classes, `o0W3sQmk` theme attributes) are described by what they do,
  and the `o0W3sQmk` mascot is summarized as one recurring character in a single line-art style
  instead of a list of scenes; generic Tailwind utilities are kept.
- Contrast fixes (7 seeds: `H9aLYT6s`, `1JlUSoIP`, `rVQmfOqR`, `GzPJkoac`, `vEj9F5om`, `FpA0MHDV`,
  `tVghVsn2`): the 11 confirmed WCAG failures now pass. As in `mC1nkP2t`, original values stay and are
  limited to uses they pass (fills, marks, decoration, disabled states); a same-hue text or UI value is
  added, e.g. `1JlUSoIP` links `#0181eb` → `#0272D1`, `FpA0MHDV` missed-call text `#ff3232` → `#EA0C1D`.
  `scripts/contrast-report.mjs` gains `--no-violations`, and `npm run check` now fails on any confirmed
  failure, stale declaration or unclassified color in any seed; a test pins every pair fixed or
  verified in this release, so deleting a declaration cannot silently drop its check.
- Verification of inferred pairs (9 seeds: `pibXRzsG`, `Vy3KTWAC`, `AT5oq8hX`, `H9aLYT6s`, `Yoiov5EL`,
  `haYCh1wI`, `1JlUSoIP`, `swwKiFDe`, `vEj9F5om`): 15 of the 16 pairs whose role was inferred are now
  declared from the seed text and pass; 14 of them changed seed values (e.g. `pibXRzsG` text on pink and
  orange is black, focus ring Focus Red `#BF0000`; `H9aLYT6s` focus ring `#AEC2FE`). `t2Q6D5JR`
  `#C0C0C0` stays unconfirmed.
- Usage boundaries (3 seeds) where a passing pair did not cover every background the text allows:
  `Yoiov5EL` cornflower (3.00:1 on the page, 2.72:1 on its card tint) gets Cornflower UI `#4E70C8`,
  and all three section UI values are declared on their 10% card tints as well; `tVghVsn2` secondary
  and tooltip text `#757575` stays on white surfaces and darkens to `#6E6E6E` on the soft and retro
  canvases; `GzPJkoac` input borders `#8888dd` are declared on white and navy, with Violet UI
  `#6967B9` on the pale lavender, pink and yellow surfaces.
- Minor fixes: added the missing `# Coherence` section to `JiAIwOJv`, `LjwyQI6U` and `haYCh1wI`;
  `AT5oq8hX` and `G26LBSOO` tag `framer` instead of `webflow`, matching their Tech Stack; removed
  pointers to reference files that do not exist from `rVQmfOqR`, `H9aLYT6s`, `AT5oq8hX`, `FpA0MHDV`,
  `Vy3KTWAC`, `C4aZtWoH`, `Nv0J2QBT`, `JiAIwOJv` and `weZM545X`; the `mC1nkP2t` Chinese summary again
  says printing methods are chosen per task.
- `mC1nkP2t` design content (colors, roles, rules) is unchanged since 1.1.0; its pointer to the
  third-party notice now names the `NOTICE` file shipped with the seeds instead of a path that only
  existed in Musekit. It is still recorded as modified from its MIT-licensed source in NOTICE.
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
