import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { ROOT, loadSeeds } from '../scripts/lib.mjs';
import {
  analyzeSeed, buildReport, checkProblems, contrastRatio, formatRatio, inferPairs, renderMarkdown, suggestFixes,
} from '../scripts/contrast-report.mjs';

const roles = join(ROOT, 'scripts/contrast-roles.json');
const print = 'seeds/graphic/editorial-print-system-mc1nkp2t.md';
const phone = 'seeds/ui/music-artist-portfolio-fpa0mhdv.md';

test('contrast ratios follow WCAG 2.x', () => {
  assert.equal(contrastRatio('#000', '#fff'), 21);
  assert.equal(contrastRatio('white', 'black'), 21);
  assert.equal(formatRatio(contrastRatio('#777777', '#ffffff')), '4.47');
  assert.equal(formatRatio(contrastRatio('#C65F38', '#FAFAF7')), '3.94');
  // 75% white over near-black composites before measuring.
  assert.ok(contrastRatio('white', '#0a0a1a', 0.75) < contrastRatio('white', '#0a0a1a'));
  assert.equal(formatRatio(4.4999), '4.49');
  // Compositing keeps fractional channels: rounding 53.5% black on white gives 4.47:1.
  assert.ok(contrastRatio('#000', '#fff', 0.535) >= 4.5);
  assert.equal(formatRatio(contrastRatio('#00000089', '#fff')), formatRatio(contrastRatio('#000', '#fff', 0x89 / 255)));
});

test('translucent backgrounds are rejected', () => {
  assert.throws(() => contrastRatio('#000', '#FFFFFF00'), /translucent/);
  assert.throws(() => suggestFixes('#777', '#fff8', 4.5), /translucent/);
  assert.deepEqual(inferPairs('# Color\n\nBackground #FFFFFF80, text #222222.\n'), []);
  assert.equal(inferPairs('# Color\n\nBackground #FFFFFF, text #222222.\n').length, 1);
});

test('suggested colors reach the threshold', () => {
  const terracotta = suggestFixes('#C65F38', '#E9E9E5', 4.5);
  assert.ok(contrastRatio(terracotta.foreground.hex, '#E9E9E5') >= 4.5);
  // Lightening Cool Gray cannot reach 4.5:1, and a background is never flipped to dark.
  assert.equal(terracotta.background, null);
  const onOrange = suggestFixes('#fff', '#ff6502', 4.5);
  assert.ok(contrastRatio('#fff', onOrange.background.hex) >= 4.5);
});

test('every declared pair still matches its seed text', () => {
  const report = buildReport(ROOT, roles);
  assert.equal(report.seeds.length, loadSeeds(ROOT).length);
  assert.deepEqual(report.orphans, []);
  for (const seed of report.seeds) {
    assert.ok(seed.declared, `${seed.id} has no declarations`);
    assert.deepEqual(seed.stale, [], seed.id);
  }
  assert.match(renderMarkdown(report), /## 低于门槛的组合/);
});

test('mC1nkP2t declares every color and every pair passes', () => {
  const seed = buildReport(ROOT, roles).seeds.find(({ id }) => id === 'mC1nkP2t');
  assert.deepEqual(seed.failures, []);
  assert.deepEqual(seed.unclassified, []);
  const terracottaText = seed.results.filter(({ fg, kind }) => fg === '#AE4921' && kind === 'text');
  assert.equal(terracottaText.length, 3);
  assert.ok(terracottaText.every(({ ratio }) => ratio >= 4.5));
});

function copyRoot(t) {
  const root = mkdtempSync(join(tmpdir(), 'muspro-seeds-contrast-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const name of ['seeds', 'registry', 'package.json']) cpSync(join(ROOT, name), join(root, name), { recursive: true });
  return root;
}

function staleAfter(t, edit) {
  const root = copyRoot(t);
  const path = join(root, print);
  const before = readFileSync(path, 'utf8');
  const after = edit(before);
  assert.notEqual(after, before);
  writeFileSync(path, after);
  return buildReport(root, roles).seeds.find(({ id }) => id === 'mC1nkP2t').stale;
}

test('restoring the old Terracotta text value is caught', (t) => {
  const stale = staleAfter(t, (text) => text.replace(/#ae4921/gi, '#C65F38'));
  assert.ok(stale.some((item) => item.includes('#AE4921')));
});

test('a local Terracotta text revert is caught where the other values survive', (t) => {
  // Only the table row: #AE4921 still appears in the prose, CSS and JSON.
  const table = staleAfter(t, (text) => text.replace('Terracotta Text `#AE4921` | 5.32', 'Terracotta Text `#C65F38` | 5.32'));
  assert.ok(table.some((item) => item.startsWith('quote not found: "| Terracotta Orange |')));
  const css = staleAfter(t, (text) => text.replace('--ink-accent-text: #ae4921;', '--ink-accent-text: #c65f38;'));
  assert.ok(css.some((item) => item.includes('--ink-accent-text')));
  const prose = staleAfter(t, (text) => text.replace('use Terracotta Text `#AE4921`', 'use Terracotta `#C65F38`'));
  assert.ok(prose.some((item) => item.includes('accent role use Terracotta Text')));
});

test('a declared pair must name its foreground in the quote', (t) => {
  const root = copyRoot(t);
  const data = JSON.parse(readFileSync(roles, 'utf8'));
  const pair = data.seeds.mC1nkP2t.pairs.find(({ fg, kind }) => fg === '#AE4921' && kind === 'text');
  pair.quote = 'Terracotta Orange | `#C65F38`';
  const path = join(root, 'roles.json');
  writeFileSync(path, JSON.stringify(data));
  const seed = buildReport(root, path).seeds.find(({ id }) => id === 'mC1nkP2t');
  assert.deepEqual(seed.stale, ['declared color #AE4921 is not named in its quote']);
});

test('pairs below threshold separate confirmed violations from unconfirmed and conditional ones', () => {
  const report = buildReport(ROOT, roles);
  const statuses = (id) => report.seeds.find((seed) => seed.id === id).failures.map(({ status }) => status);
  // Panel borders: declared, but decorative separators are exempt from 1.4.11.
  assert.deepEqual(statuses('pu9ToBED'), ['na', 'na']);
  assert.deepEqual(statuses('FpA0MHDV'), []);
  assert.deepEqual(statuses('tVghVsn2'), ['na']);
  assert.deepEqual(statuses('t2Q6D5JR'), ['below']);
  const markdown = renderMarkdown(report);
  assert.match(markdown, /\| 不适用（附条件）：面板边框若只是装饰性分隔则不适用 1\.4\.11 \|/);
  assert.doesNotMatch(markdown, /不达标/);
});

test('no seed has a confirmed violation', () => {
  const report = buildReport(ROOT, roles);
  const confirmed = report.seeds.flatMap(({ id, failures }) => failures.filter(({ status }) => status === 'violation').map(() => id));
  assert.deepEqual(confirmed, []);
  assert.deepEqual(checkProblems(report, { enforce: ['mC1nkP2t'], noViolations: true }), []);
});

test('only the pair left for the user stays unconfirmed below threshold', () => {
  const report = buildReport(ROOT, roles);
  const below = report.seeds.flatMap(({ id, failures }) => failures.filter(({ status }) => status === 'below').map(({ fg }) => `${id} ${fg}`));
  assert.deepEqual(below, ['t2Q6D5JR #C0C0C0']);
});

test('--no-violations catches a confirmed violation or a reverted fix in any seed', (t) => {
  // A declared text pair that falls below 4.5:1 is a confirmed violation.
  const root = copyRoot(t);
  const data = JSON.parse(readFileSync(roles, 'utf8'));
  const pair = data.seeds.FpA0MHDV.pairs.find(({ fg }) => fg === '#ff3232');
  pair.kind = 'text';
  const path = join(root, 'roles.json');
  writeFileSync(path, JSON.stringify(data));
  const failing = checkProblems(buildReport(root, path), { noViolations: true });
  assert.deepEqual(failing, ['FpA0MHDV: #FF3232 on #FFFFFF is 3.64:1, needs 4.5:1 (confirmed violation)']);
  assert.deepEqual(checkProblems(buildReport(root, path)), []);
  // Restoring the old missed-call text color leaves the declaration stale.
  const seedPath = join(root, phone);
  writeFileSync(seedPath, readFileSync(seedPath, 'utf8').replace('Missed calls in Missed Red `#EA0C1D` (4.59:1 on white)', 'Missed calls in `#ff3232`'));
  const stale = checkProblems(buildReport(root, roles), { noViolations: true });
  assert.ok(stale.some((item) => item.startsWith('FpA0MHDV: quote not found: "Missed calls in Missed Red')));
});

test('seeds without declarations fall back to keyword inference', () => {
  const seed = loadSeeds(ROOT).find(({ data }) => data.id === 'C4aZtWoH');
  assert.deepEqual(inferPairs(seed.body).map(({ fg, bg, kind }) => `${fg} ${bg} ${kind}`), ['#000000 #FFFFFF text']);
  const result = analyzeSeed(seed, undefined, ROOT);
  assert.equal(result.results[0].certainty, 'auto');
  assert.ok(result.results[0].pass);
});

// Pairs fixed or verified in 1.2.0. They are listed here rather than read from contrast-roles.json,
// so deleting a declaration cannot also delete its check.
const FIXED_PAIRS = {
  H9aLYT6s: ['#91C8FE #1458E4 ui', '#AEC2FE #1458E4 ui'],
  '1JlUSoIP': ['#0272D1 #F8F8F8 text', '#0181EB #F8F8F8 ui', '#A58401 #F8F8F8 ui'],
  rVQmfOqR: ['#945DE3 #2F282F ui', '#FFFFFF #874FD4 text'],
  GzPJkoac: [
    '#FFFFFF #E22C05 text', '#8888DD #FFFFFF ui', '#8888DD #021A50 ui',
    '#6967B9 #E6E6FA ui', '#6967B9 #F6CCC7 ui', '#6967B9 #F9DA73 ui',
  ],
  vEj9F5om: ['#6E6E6E #121212 ui', '#6E6E6E #FFFFFF ui', '#FFFFFF #3A3A3A text', '#000000 #D4D4D4 text'],
  FpA0MHDV: ['#76757B #FFFFFF text', '#EA0C1D #FFFFFF text', '#8A898F #FFFFFF ui', '#FF3232 #FFFFFF ui'],
  tVghVsn2: [
    '#757575 #FFFFFF text', '#6E6E6E #F5F5F5 text', '#6E6E6E #F9F8ED text',
    '#888888 #FFFFFF ui', '#888888 #F5F5F5 ui', '#888888 #F9F8ED ui', '#AAAAAA #141414 ui', '#AAAAAA #0D2537 ui',
  ],
  pibXRzsG: ['#000000 #FE99D9 text', '#000000 #FF6502 text', '#000000 #1F9540 text', '#FFFFFF #1F9540 large', '#BF0000 #FE99D9 ui'],
  Vy3KTWAC: ['#535E1D #FFC0CB text'],
  AT5oq8hX: ['#0099FF #000000 text', '#006FBB #EFEFEF text', '#0088FF #000000 text', '#006BCB #EFEFEF text'],
  Yoiov5EL: [
    '#9A7438 #E5E5E5 ui', '#71814F #E5E5E5 ui', '#4E70C8 #E5E5E5 ui',
    '#9A7438 #E2DED8 ui', '#71814F #DFE1DC ui', '#4E70C8 #D7DBE4 ui',
  ],
  haYCh1wI: ['#FFFFFF #1100FF text'],
  swwKiFDe: ['#808080 #FAFAFA ui'],
};

function missingFixedPairs(report) {
  return Object.entries(FIXED_PAIRS).flatMap(([id, pairs]) => {
    const seed = report.seeds.find((item) => item.id === id);
    const passing = new Set(seed.results
      .filter(({ certainty, pass }) => certainty === 'declared' && pass)
      .map(({ fg, bg, kind }) => `${fg} ${bg} ${kind}`));
    return pairs.filter((pair) => !passing.has(pair)).map((pair) => `${id} ${pair}`);
  });
}

function reportWithRoles(t, edit) {
  const root = copyRoot(t);
  const data = JSON.parse(readFileSync(roles, 'utf8'));
  edit(data.seeds);
  const path = join(root, 'roles.json');
  writeFileSync(path, JSON.stringify(data));
  return buildReport(root, path);
}

test('every pair fixed in 1.2.0 is still declared and passes', () => {
  assert.deepEqual(missingFixedPairs(buildReport(ROOT, roles)), []);
});

test('deleting a fixed pair fails the check', (t) => {
  // The only pair for #91C8FE: the color is left unclassified, which --no-violations reports.
  const border = reportWithRoles(t, (seeds) => {
    seeds.H9aLYT6s.pairs = seeds.H9aLYT6s.pairs.filter(({ fg }) => fg !== '#91C8FE');
  });
  const problems = checkProblems(border, { noViolations: true });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /^H9aLYT6s: #91C8FE \(line \d+\) has no declared role or ignore reason$/);
  assert.deepEqual(missingFixedPairs(border), ['H9aLYT6s #91C8FE #1458E4 ui']);
  // Both colors stay in other pairs, so only the fixed-pair list notices.
  const arrows = reportWithRoles(t, (seeds) => {
    seeds.tVghVsn2.pairs.find(({ fg }) => fg === '#888').bg = ['#fff', '#f9f8ed'];
  });
  assert.deepEqual(checkProblems(arrows, { noViolations: true }), []);
  assert.deepEqual(missingFixedPairs(arrows), ['tVghVsn2 #888888 #F5F5F5 ui']);
});
