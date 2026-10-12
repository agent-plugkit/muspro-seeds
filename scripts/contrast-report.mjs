#!/usr/bin/env node
// WCAG 2.x contrast report over the text/background and mark/background pairs seeds declare.
//
//   node scripts/contrast-report.mjs                      print a summary
//   node scripts/contrast-report.mjs --out <file>         also write the full Markdown report
//   node scripts/contrast-report.mjs --enforce <id,...>   exit 1 if these seeds have a failing pair,
//                                                         a stale declaration or an unclassified color
//   node scripts/contrast-report.mjs --no-violations      exit 1 if any seed has a confirmed violation
//                                                         or a stale declaration
//
// Seed prose names color roles in free text, so the roles live in scripts/contrast-roles.json.
// Every declared pair quotes the seed sentence it relies on; a quote that no longer appears, a
// color that is not in the seed, or a "declared" foreground its quotes do not name, is reported
// as stale. Hex colors in a seed that no pair or
// ignore entry covers are listed. Seeds without declarations get pairs inferred from keywords in
// their "# Color" section, all marked uncertain. Pairs below threshold in other seeds change the
// exit code only under --no-violations, and only when they are confirmed violations. A pair below
// its threshold is a confirmed violation only when both roles are declared and the pair is not
// marked "applicability": "conditional" (its note names a use for which the criterion does not apply).
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, loadSeeds, packageVersion, readJson } from './lib.mjs';

export const THRESHOLDS = { text: 4.5, large: 3, ui: 3 };
const KIND_LABELS = { text: '正文文字', large: '大字', ui: '非文字 UI' };
const STATUS_LABELS = {
  pass: '达标',
  violation: '已确认违规',
  below: '低于门槛',
  na: '不适用（附条件）',
};
const CERTAINTY_LABELS = {
  declared: '原文声明',
  inferred: '推断配对',
  uncertain: '角色不确定',
  auto: '自动推断（角色不确定）',
};
const NAMED = { white: 'ffffff', black: '000000', grey: '808080', gray: '808080' };
const HEX = /(?<![&\w])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z])/g;

// ---------------------------------------------------------------------------
// Color math.

export function parseColor(value) {
  const text = String(value).trim().toLowerCase();
  let hex = NAMED[text] ?? (text.startsWith('#') ? text.slice(1) : null);
  if (!hex || !/^([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(hex)) throw new Error(`Unsupported color "${value}"`);
  if (hex.length <= 4) hex = [...hex].map((digit) => digit + digit).join('');
  const channels = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  const alpha = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
  return { rgb: channels, alpha, hex: `#${hex.slice(0, 6).toUpperCase()}` };
}

// Channels stay fractional: rounding here can move a pair across the threshold.
function composite(fg, alpha, bg) {
  return fg.map((channel, index) => channel * alpha + bg[index] * (1 - alpha));
}

// A translucent background shows whatever lies beneath it, so its contrast is undefined until the
// caller composites it onto that backdrop and passes the opaque result.
function opaqueBackground(value) {
  const bg = parseColor(value);
  if (bg.alpha < 1) throw new Error(`Background "${value}" is translucent; composite it onto the color beneath it first`);
  return bg;
}

export function luminance([r, g, b]) {
  const linear = (channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function contrastRatio(foreground, background, alpha = 1) {
  const bg = opaqueBackground(background);
  const fg = parseColor(foreground);
  const a = alpha * fg.alpha;
  const rgb = a < 1 ? composite(fg.rgb, a, bg.rgb) : fg.rgb;
  const [light, dark] = [luminance(rgb), luminance(bg.rgb)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// Truncate rather than round so that 4.499 never prints as 4.50.
export const formatRatio = (ratio) => (Math.floor(ratio * 100) / 100).toFixed(2);

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function toOklab(rgb) {
  const [r, g, b] = rgb.map((channel) => toLinear(channel / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

// Nearest color of the same OKLCH hue as `moving` that reaches the threshold against `fixed` with a
// small margin. Lightness moves away from `fixed`; with `flip` it may also cross over to the other
// side (light text becomes dark text). Chroma shrinks only when the color leaves the sRGB gamut.
function shift(movingRgb, fixedHex, threshold, { flip = false } = {}) {
  const [L, a, b] = toOklab(movingRgb);
  const chroma = Math.hypot(a, b);
  const hue = Math.atan2(b, a);
  const away = luminance(movingRgb) >= luminance(parseColor(fixedHex).rgb) ? 0.002 : -0.002;
  for (const step of flip ? [away, -away] : [away]) {
    for (let lightness = L; lightness >= 0 && lightness <= 1; lightness += step) {
      for (let c = chroma; c >= 0; c -= 0.002) {
        const linear = fromOklab([lightness, c * Math.cos(hue), c * Math.sin(hue)]);
        if (!linear.every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4)) continue;
        const rgb = linear.map((channel) => Math.round(Math.min(1, Math.max(0, fromLinear(channel))) * 255));
        const hex = `#${rgb.map((channel) => channel.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
        const ratio = contrastRatio(hex, fixedHex);
        if (ratio >= threshold + 0.05) return { hex, ratio };
        break;
      }
    }
  }
  return null;
}

export function suggestFixes(foreground, background, threshold, alpha = 1) {
  const fg = parseColor(foreground);
  const bg = opaqueBackground(background);
  const opacity = alpha * fg.alpha;
  const visible = opacity < 1 ? composite(fg.rgb, opacity, bg.rgb) : fg.rgb;
  return {
    foreground: shift(visible, bg.hex, threshold, { flip: true }),
    // A background only gets darker under light text or lighter under dark text; with a translucent
    // foreground the visible color depends on the background, so only the foreground is suggested.
    background: opacity < 1 ? null : shift(bg.rgb, fg.hex, threshold),
  };
}

// ---------------------------------------------------------------------------
// Seed text.

const collapse = (text) => text.replace(/\s+/g, ' ').trim();

function sections(body) {
  const result = [];
  let current = { title: '(preamble)', start: 1, lines: [] };
  body.split('\n').forEach((line, index) => {
    if (/^# /.test(line)) {
      result.push(current);
      current = { title: line.slice(2).trim(), start: index + 1, lines: [] };
    }
    current.lines.push(line);
  });
  result.push(current);
  return result;
}

export function extractColors(body, offset = 0) {
  const found = [];
  body.split('\n').forEach((line, index) => {
    for (const match of line.matchAll(HEX)) {
      found.push({ raw: match[0], color: parseColor(match[0]), line: index + 1 + offset });
    }
  });
  return found;
}

function lineOf(text, needle, offset = 0) {
  const target = collapse(needle);
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    // A quote may wrap; accept it when it starts on this line and the joined text contains it.
    const window = collapse(lines.slice(i, i + 6).join(' '));
    if (window.includes(target) && !collapse(lines.slice(i + 1, i + 6).join(' ')).includes(target)) return i + 1 + offset;
  }
  return null;
}

const ROLE_WORDS = {
  bg: /\b(background|backgrounds|bg|canvas|paper|substrate|surface|panels?)\b/i,
  text: /\b(text|type|headings?|body|copy|notation|labels?|links?)\b/i,
  ui: /\b(borders?|icons?|stroke|outline|lines?|chrome|dots?|markers?|arrows?)\b/i,
};

function classify(after, before) {
  for (const context of [after, before]) {
    for (const role of ['text', 'bg', 'ui']) if (ROLE_WORDS[role].test(context)) return role;
  }
  return null;
}

// Fallback for seeds without declarations: role keywords next to each hex in "# Color".
export function inferPairs(body) {
  const color = sections(body).find(({ title }) => title === 'Color');
  if (!color) return [];
  const text = color.lines.join('\n');
  const roles = { text: new Set(), bg: new Set(), ui: new Set() };
  for (const clause of text.split(/(?<=[.;])\s+|,\s+|\n/)) {
    for (const match of clause.matchAll(HEX)) {
      const after = clause.slice(match.index + match[0].length).replace(/^[`*)\s]+/, '').slice(0, 28);
      const before = clause.slice(Math.max(0, match.index - 28), match.index);
      const role = classify(after, before);
      const parsed = parseColor(match[0]);
      // Translucent colors have no fixed contrast as a background; leave them unclassified.
      if (role && !(role === 'bg' && parsed.alpha < 1)) roles[role].add(parsed.hex);
    }
  }
  const pairs = [];
  for (const bg of roles.bg) {
    for (const fg of roles.text) if (fg !== bg) pairs.push({ fg, bg, kind: 'text', certainty: 'auto', quote: null });
    for (const fg of roles.ui) if (fg !== bg) pairs.push({ fg, bg, kind: 'ui', certainty: 'auto', quote: null });
  }
  return pairs;
}

// ---------------------------------------------------------------------------
// Report.

const asList = (value) => (Array.isArray(value) ? value : [value]);
const APPLICABILITY = new Set(['always', 'conditional']);

function status({ pass, certainty, applicability }) {
  if (pass) return 'pass';
  if (applicability === 'conditional') return 'na';
  return certainty === 'declared' ? 'violation' : 'below';
}

export function analyzeSeed(seed, declaration, root = ROOT) {
  const { body, data, file } = seed;
  // Report file line numbers: count the frontmatter lines that precede the body.
  const text = readFileSync(join(root, 'seeds', file), 'utf8');
  const offset = text.slice(0, text.length - body.length).split('\n').length - 1;
  const colors = extractColors(body, offset);
  const presentHex = new Set(colors.map(({ color }) => color.hex));
  const stale = [];
  const results = [];
  const used = new Set();
  const declared = declaration?.pairs ?? inferPairs(body);

  for (const pair of declared) {
    const quotes = pair.quote === null ? [] : asList(pair.quote);
    const applicability = pair.applicability ?? 'always';
    if (!APPLICABILITY.has(applicability)) throw new Error(`${data.id}: unknown applicability "${applicability}"`);
    const lines = quotes.map((quote) => {
      const line = lineOf(body, quote, offset);
      if (line === null) stale.push(`quote not found: "${quote}"`);
      return line;
    });
    // A declared role must name its color: a quote that only names the ink would stay valid after
    // the color it assigns is reverted, as long as the new value survives elsewhere in the seed.
    const quoted = new Set(extractColors(quotes.join('\n')).map(({ color }) => color.hex));
    if (pair.certainty === 'declared') {
      for (const fg of asList(pair.fg)) {
        if (!NAMED[String(fg).toLowerCase()] && !quoted.has(parseColor(fg).hex)) stale.push(`declared color ${fg} is not named in its quote`);
      }
    }
    for (const fg of asList(pair.fg)) {
      for (const bg of asList(pair.bg)) {
        for (const value of [fg, bg]) {
          const parsed = parseColor(value);
          used.add(parsed.hex);
          const named = NAMED[String(value).toLowerCase()];
          if (named) {
            if (!quotes.some((quote) => new RegExp(`\\b${value}\\b`, 'i').test(quote)) && !presentHex.has(parsed.hex)) {
              stale.push(`named color "${value}" is not in the quoted text`);
            }
          } else if (!presentHex.has(parsed.hex)) {
            stale.push(`color ${value} does not appear in the seed`);
          }
        }
        const ratio = contrastRatio(fg, bg, pair.alpha ?? 1);
        const threshold = THRESHOLDS[pair.kind];
        if (!threshold) throw new Error(`${data.id}: unknown kind "${pair.kind}"`);
        const pass = ratio >= threshold;
        const result = {
          fg: parseColor(fg).hex,
          fgLabel: String(fg),
          bg: parseColor(bg).hex,
          bgLabel: String(bg),
          alpha: pair.alpha ?? 1,
          kind: pair.kind,
          certainty: pair.certainty,
          ratio,
          threshold,
          pass,
          lines: [...new Set(lines.filter((line) => line !== null))],
          quote: quotes.join(' … '),
          applicability,
          note: pair.note ?? '',
          suggestion: pass ? null : suggestFixes(fg, bg, threshold, pair.alpha ?? 1),
        };
        results.push({ ...result, status: status(result) });
      }
    }
  }
  const ignored = new Map(Object.entries(declaration?.ignore ?? {}).map(([value, reason]) => [parseColor(value).hex, { value, reason }]));
  for (const hex of ignored.keys()) if (!presentHex.has(hex)) stale.push(`ignored color ${hex} does not appear in the seed`);
  const unclassified = [];
  const seen = new Set();
  for (const { raw, color, line } of colors) {
    if (used.has(color.hex) || ignored.has(color.hex) || seen.has(color.hex)) continue;
    seen.add(color.hex);
    unclassified.push({ raw, hex: color.hex, line });
  }
  return {
    id: data.id,
    file,
    declared: Boolean(declaration),
    results,
    failures: results.filter(({ pass }) => !pass),
    stale: [...new Set(stale)],
    ignored: [...ignored.values()],
    unclassified,
    notes: declaration?.notes ?? [],
  };
}

export function buildReport(root = ROOT, rolesPath = join(root, 'scripts/contrast-roles.json')) {
  const roles = readJson(rolesPath).seeds;
  const seeds = loadSeeds(root);
  const known = new Set(seeds.map(({ data }) => data.id));
  const orphans = Object.keys(roles).filter((id) => !known.has(id));
  return {
    version: packageVersion(root),
    orphans,
    seeds: seeds.map((seed) => analyzeSeed(seed, roles[seed.data.id], root)),
  };
}

const swatch = (hex, label, alpha = 1) => {
  const shown = label.startsWith('#') ? `\`${label}\`` : `${label} \`${hex}\``;
  return alpha < 1 ? `${shown} @ ${Math.round(alpha * 100)}%` : shown;
};
const cell = (text) => String(text).replaceAll('|', '\\|').replaceAll('\n', ' ');

function pairRow(seed, result, withSuggestion) {
  const where = result.lines.length ? `L${result.lines.join(', L')}` : '—';
  const quote = result.quote ? `${where}：${cell(result.quote)}` : '自动从 # Color 推断';
  const columns = [
    swatch(result.fg, result.fgLabel, result.alpha),
    swatch(result.bg, result.bgLabel),
    KIND_LABELS[result.kind],
    `**${formatRatio(result.ratio)}**:1`,
    `${result.threshold}:1`,
    CERTAINTY_LABELS[result.certainty],
    quote,
  ];
  if (withSuggestion) {
    const { foreground, background } = result.suggestion;
    const fixes = [
      foreground && `前景改为 \`${foreground.hex}\`（${formatRatio(foreground.ratio)}:1）`,
      background && `或背景改为 \`${background.hex}\`（${formatRatio(background.ratio)}:1）`,
    ].filter(Boolean);
    columns.splice(5, 0, `**${STATUS_LABELS[result.status]}**`);
    columns.push([fixes.join(' ') || '换用其他颜色组合', cell(result.note)].filter(Boolean).join('；'));
  } else {
    const label = STATUS_LABELS[result.status];
    columns.push(result.status === 'na' ? `${label}：${cell(result.note)}` : label);
  }
  return `| ${columns.join(' | ')} |`;
}

export function renderMarkdown(report) {
  const out = [];
  const totalFailures = report.seeds.reduce((sum, seed) => sum + seed.failures.length, 0);
  const failingSeeds = report.seeds.filter((seed) => seed.failures.length).length;
  const count = (seed, wanted) => seed.failures.filter((result) => result.status === wanted).length;
  const total = (wanted) => report.seeds.reduce((sum, seed) => sum + count(seed, wanted), 0);
  out.push(
    `# WCAG 对比度报告（Muspro Seeds ${report.version}）`,
    '',
    '由 `node scripts/contrast-report.mjs --out <file>` 生成。',
    '',
    '- 公式：WCAG 2.x 相对亮度与对比度 (L1 + 0.05) / (L2 + 0.05)；比值截断到两位小数显示，判定用精确值。',
    '- 门槛：正文文字 4.5:1；大字（≥ 24px 常规或 ≥ 18.7px 粗体）3:1；非文字 UI（边框、图标、焦点框、数据标记）3:1。',
    '- 角色来源：**原文声明** = seed 同时写明前景与背景的角色；**推断配对** = 角色分别写明、二者同时出现是推断；**角色不确定** = 原文没有说明该色是否用于文字或用于哪块背景；**自动推断** = seed 无人工声明，按关键词推断。',
    '- 配对与原文引用见 `scripts/contrast-roles.json`。引用不再出现在 seed 中、或色值不在 seed 中时列为“声明失配”。',
    '- 判定：对比度低于门槛的组合分三类。**已确认违规** = 角色来源为原文声明，且没有适用条件；**低于门槛** = 角色或配对是推断或不确定的，只说明所选组合的数值低于门槛，不代表已确认的无障碍缺陷；**不适用（附条件）** = 备注写明了该条款不适用的用途（如纯装饰分隔、不靠颜色区分状态），实际用途未核实前不计为违规。',
    '- 建议色：保持 OKLCH 色相，只调整亮度（超出 sRGB 时才降低彩度），优先朝远离对方的方向，取第一个超过门槛 0.05 的颜色；前景与背景各给一个，二选一即可。',
    '',
    `共 ${report.seeds.length} 条 seed，${failingSeeds} 条有低于门槛的组合，合计 ${totalFailures} 组：已确认违规 ${total('violation')} 组，低于门槛（角色未确认）${total('below')} 组，不适用（附条件）${total('na')} 组。这些是所选组合的门槛计算结果，只有“已确认违规”一类对应 seed 原文声明的用法。`,
    '',
    '## 汇总',
    '',
    '| Seed | 文件 | 组合数 | 低于门槛 | 已确认违规 | 角色未确认 | 不适用（附条件） | 声明失配 | 未归类色值 |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  );
  for (const seed of report.seeds) {
    const counts = ['violation', 'below', 'na'].map((wanted) => count(seed, wanted)).join(' | ');
    out.push(`| \`${seed.id}\` | ${seed.file} | ${seed.results.length} | ${seed.failures.length} | ${counts} | ${seed.stale.length} | ${seed.unclassified.length} |`);
  }
  out.push('', '## 低于门槛的组合', '');
  for (const seed of report.seeds.filter(({ failures }) => failures.length)) {
    out.push(
      `### \`${seed.id}\` ${seed.file}`,
      '',
      '| 前景 | 背景 | 类型 | 对比度 | 门槛 | 判定 | 角色来源 | 原文 | 建议 |',
      '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
      ...seed.failures.map((result) => pairRow(seed, result, true)),
      '',
    );
  }
  if (!totalFailures) out.push('无。', '');
  const stale = report.seeds.filter(({ stale: items }) => items.length);
  out.push('## 声明失配', '');
  if (!stale.length && !report.orphans.length) out.push('无。', '');
  for (const seed of stale) out.push(`- \`${seed.id}\`：${seed.stale.join('；')}`);
  for (const id of report.orphans) out.push(`- \`${id}\`：contrast-roles.json 中的 ID 不在 seeds/ 里`);
  if (stale.length || report.orphans.length) out.push('');
  out.push('## 未计算的色值', '', '未归类 = 出现在 seed 中、但没有任何声明配对或忽略说明的色值；忽略 = 已说明不计算的原因。', '');
  for (const seed of report.seeds) {
    const items = [
      ...seed.unclassified.map(({ hex, line }) => `\`${hex}\`（L${line}，未归类）`),
      ...seed.ignored.map(({ value, reason }) => `\`${value}\`（${reason}）`),
      ...seed.notes,
    ];
    if (items.length) out.push(`- \`${seed.id}\`：${items.join('；')}`);
  }
  out.push('', '## 附录：全部组合', '');
  for (const seed of report.seeds) {
    out.push(
      `### \`${seed.id}\` ${seed.file}${seed.declared ? '' : '（无人工声明，自动推断）'}`,
      '',
      '| 前景 | 背景 | 类型 | 对比度 | 门槛 | 角色来源 | 原文 | 结果 |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
      ...seed.results.map((result) => pairRow(seed, result, false)),
      '',
    );
  }
  return `${out.join('\n').trimEnd()}\n`;
}

// Problems that fail the check: everything wrong with an enforced seed, and with noViolations every
// confirmed violation or stale declaration in any seed. A stale quote is included because a pair
// whose text has changed no longer shows whether the seed's declared use passes.
export function checkProblems(report, { enforce = [], noViolations = false } = {}) {
  const problems = [];
  const describe = (id, result) => `${id}: ${result.fg} on ${result.bg} is ${formatRatio(result.ratio)}:1, needs ${result.threshold}:1`;
  for (const id of enforce) {
    const seed = report.seeds.find((item) => item.id === id);
    if (!seed) problems.push(`${id}: no such seed`);
    else if (!seed.declared) problems.push(`${id}: no role declarations in scripts/contrast-roles.json`);
    else {
      for (const result of seed.failures) problems.push(describe(id, result));
      for (const item of seed.stale) problems.push(`${id}: ${item}`);
      for (const { hex, line } of seed.unclassified) problems.push(`${id}: ${hex} (line ${line}) has no declared role`);
    }
  }
  if (noViolations) {
    for (const seed of report.seeds.filter(({ id }) => !enforce.includes(id))) {
      for (const result of seed.failures.filter(({ status: value }) => value === 'violation')) {
        problems.push(`${describe(seed.id, result)} (confirmed violation)`);
      }
      for (const item of seed.stale) problems.push(`${seed.id}: ${item}`);
    }
  }
  for (const id of report.orphans) problems.push(`scripts/contrast-roles.json: unknown seed ${id}`);
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const option = (name) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const report = buildReport(ROOT);
  const outPath = option('--out');
  if (outPath) writeFileSync(resolve(outPath), renderMarkdown(report));
  const failing = report.seeds.filter(({ failures }) => failures.length);
  const total = failing.reduce((sum, seed) => sum + seed.failures.length, 0);
  const tally = (results, wanted) => results.filter((result) => result.status === wanted).length;
  const all = failing.flatMap((seed) => seed.failures);
  console.log(`Contrast report: ${report.seeds.length} seeds, ${total} pairs below threshold in ${failing.length} seeds `
    + `(${tally(all, 'violation')} confirmed, ${tally(all, 'below')} roles unconfirmed, ${tally(all, 'na')} conditional)${outPath ? ` (written to ${outPath})` : ''}.`);
  for (const seed of failing) {
    console.log(`  ${seed.id.padEnd(8)} ${seed.failures.length} below threshold, ${tally(seed.failures, 'violation')} confirmed`);
  }
  const enforced = (option('--enforce') ?? '').split(',').filter(Boolean);
  const noViolations = args.includes('--no-violations');
  const problems = checkProblems(report, { enforce: enforced, noViolations });
  if (problems.length) {
    console.error(`Contrast check failed:\n${problems.map((item) => `- ${item}`).join('\n')}`);
    process.exit(1);
  }
  if (enforced.length) console.log(`Enforced seeds pass: ${enforced.join(', ')}.`);
  if (noViolations) console.log('No confirmed violations and no stale declarations.');
}
