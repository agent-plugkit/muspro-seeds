import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { ROOT, loadSeeds } from '../scripts/lib.mjs';
import {
  analyzeSeed, buildReport, contrastRatio, formatRatio, inferPairs, renderMarkdown, suggestFixes,
} from '../scripts/contrast-report.mjs';

const roles = join(ROOT, 'scripts/contrast-roles.json');
const print = 'seeds/graphic/editorial-print-system-mc1nkp2t.md';

test('contrast ratios follow WCAG 2.x', () => {
  assert.equal(contrastRatio('#000', '#fff'), 21);
  assert.equal(contrastRatio('white', 'black'), 21);
  assert.equal(formatRatio(contrastRatio('#777777', '#ffffff')), '4.47');
  assert.equal(formatRatio(contrastRatio('#C65F38', '#FAFAF7')), '3.94');
  // 75% white over near-black composites before measuring.
  assert.ok(contrastRatio('white', '#0a0a1a', 0.75) < contrastRatio('white', '#0a0a1a'));
  assert.equal(formatRatio(4.4999), '4.49');
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
  assert.match(renderMarkdown(report), /## 不达标组合/);
});

test('mC1nkP2t declares every color and every pair passes', () => {
  const seed = buildReport(ROOT, roles).seeds.find(({ id }) => id === 'mC1nkP2t');
  assert.deepEqual(seed.failures, []);
  assert.deepEqual(seed.unclassified, []);
  const terracottaText = seed.results.filter(({ fg, kind }) => fg === '#AE4921' && kind === 'text');
  assert.equal(terracottaText.length, 3);
  assert.ok(terracottaText.every(({ ratio }) => ratio >= 4.5));
});

test('restoring the old Terracotta text value is caught', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'muspro-seeds-contrast-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const name of ['seeds', 'registry', 'package.json']) cpSync(join(ROOT, name), join(root, name), { recursive: true });
  const path = join(root, print);
  writeFileSync(path, readFileSync(path, 'utf8').replace(/#ae4921/gi, '#C65F38'));
  const seed = buildReport(root, roles).seeds.find(({ id }) => id === 'mC1nkP2t');
  assert.ok(seed.stale.some((item) => item.includes('#AE4921')));
});

test('seeds without declarations fall back to keyword inference', () => {
  const seed = loadSeeds(ROOT).find(({ data }) => data.id === 'C4aZtWoH');
  assert.deepEqual(inferPairs(seed.body).map(({ fg, bg, kind }) => `${fg} ${bg} ${kind}`), ['#000000 #FFFFFF text']);
  const result = analyzeSeed(seed, undefined, ROOT);
  assert.equal(result.results[0].certainty, 'auto');
  assert.ok(result.results[0].pass);
});
