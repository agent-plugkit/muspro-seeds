import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  ROOT, contentHash, createTarGz, loadRegistry, parseYamlSubset, payloadFiles, readTarGz,
} from '../scripts/lib.mjs';
import { validateRepository } from '../scripts/validate.mjs';

const ids = loadRegistry(ROOT).map(({ id }) => id);

function sandbox(t) {
  const root = mkdtempSync(join(tmpdir(), 'muspro-seeds-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const name of ['seeds', 'registry', 'schema', 'package.json', 'LICENSE', 'NOTICE']) {
    cpSync(join(ROOT, name), join(root, name), { recursive: true });
  }
  return root;
}

function errorsOf(root, options) {
  return validateRepository(root, options).errors.join('\n');
}

const print = 'seeds/graphic/editorial-print-system-mc1nkp2t.md';
const audio = 'seeds/ui/interactive-audio-experience-vej9f5om.md';

test('the published registry keeps every v1.0.0 seed', () => {
  assert.equal(ids.length, 29);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(validateRepository(ROOT).errors, []);
});

test('duplicate IDs are rejected', (t) => {
  const root = sandbox(t);
  const text = readFileSync(join(root, audio), 'utf8').replace('id: vEj9F5om', 'id: mC1nkP2t');
  writeFileSync(join(root, 'seeds/ui/interactive-audio-experience-mc1nkp2t.md'), text);
  rmSync(join(root, audio));
  assert.match(errorsOf(root), /id mC1nkP2t already used/);
});

test('a preserved ID cannot be deleted or rebound to another seed', (t) => {
  const root = sandbox(t);
  rmSync(join(root, print));
  assert.match(errorsOf(root), /published id mC1nkP2t .* was removed/);

  const moved = sandbox(t);
  renameSync(join(moved, print), join(moved, 'seeds/graphic/other-mc1nkp2t.md'));
  assert.match(errorsOf(moved), /must stay bound to graphic\/editorial-print-system-mc1nkp2t\.md/);
});

test('editing the registry itself is caught against the base registry', (t) => {
  const root = sandbox(t);
  const base = loadRegistry(ROOT);
  rmSync(join(root, print));
  const registryPath = join(root, 'registry/preserved-ids.json');
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  registry.seeds = registry.seeds.filter(({ id }) => id !== 'mC1nkP2t');
  writeFileSync(registryPath, JSON.stringify(registry));
  const labelsPath = join(root, 'registry/labels.zh-CN.json');
  const labels = JSON.parse(readFileSync(labelsPath, 'utf8'));
  delete labels.seeds.mC1nkP2t;
  writeFileSync(labelsPath, JSON.stringify(labels));
  assert.deepEqual(validateRepository(root).errors, []);
  assert.match(errorsOf(root, { baseRegistry: base }), /mC1nkP2t was deleted from the registry/);
});

test('new seeds must be registered and labelled; frontmatter follows the schema', (t) => {
  const root = sandbox(t);
  const text = readFileSync(join(root, audio), 'utf8')
    .replace('id: vEj9F5om', 'id: Zz9Zz9Zz')
    .replace('category: interactive audio experience\n', '');
  writeFileSync(join(root, 'seeds/ui/new-seed-zz9zz9zz.md'), text);
  const errors = errorsOf(root);
  assert.match(errors, /Zz9Zz9Zz is not in registry/);
  assert.match(errors, /labels\.zh-CN\.json/);
  assert.match(errors, /missing required "category"/);
});

test('the frontmatter parser rejects YAML it does not understand', () => {
  assert.deepEqual(parseYamlSubset('a: 1\nb:\n- x\nc:\n  d: true\ne: []'), { a: 1, b: ['x'], c: { d: true }, e: [] });
  assert.throws(() => parseYamlSubset('a: {x: 1}'), /unsupported YAML scalar/);
  assert.throws(() => parseYamlSubset('a: b: c'), /unsupported YAML scalar/);
  assert.throws(() => parseYamlSubset('a: 1\na: 2'), /duplicate key/);
});

test('release archives round-trip and are readable by Python tarfile', (t) => {
  const files = payloadFiles(ROOT);
  const archive = createTarGz(files, 'muspro-seeds-test');
  assert.ok(archive.equals(createTarGz(files, 'muspro-seeds-test')));
  const read = readTarGz(archive).map(({ path, bytes }) => ({ path: path.replace(/^muspro-seeds-test\//, ''), bytes }));
  assert.equal(contentHash(read), contentHash(files));
  assert.ok(files.some(({ path }) => path === 'NOTICE'));
  assert.ok(files.some(({ path }) => path === 'index.json'));

  const dir = mkdtempSync(join(tmpdir(), 'muspro-seeds-tar-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, 'seeds.tar.gz'), archive);
  const listing = spawnSync('python3', ['-I', '-c',
    'import sys, tarfile; print("\\n".join(sorted(tarfile.open(sys.argv[1]).getnames())))', join(dir, 'seeds.tar.gz')],
  { encoding: 'utf8' });
  assert.equal(listing.status, 0, listing.stderr);
  assert.deepEqual(listing.stdout.trim().split('\n'), files.map(({ path }) => `muspro-seeds-test/${path}`).sort());
});
