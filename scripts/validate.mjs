#!/usr/bin/env node
// Validate seed frontmatter, file layout, ID uniqueness and the append-only ID registry.
//
//   node scripts/validate.mjs [--base <git-ref>]
//
// --base compares registry/preserved-ids.json with the version at <git-ref> so that a
// pull request cannot drop or rebind a published ID by editing the registry itself.
// Without --base the committed HEAD version is used when available.
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  ROOT, SCENARIOS, loadLabels, loadRegistry, loadSeeds, narrativeGist, readJson, seedFiles, validateSchema,
} from './lib.mjs';

const SCENARIO_NAMES = { ui: '界面', graphic: '平面', information: '信息表达' };

export function validateRepository(root = ROOT, { baseRegistry } = {}) {
  const errors = [];
  const schema = readJson(join(root, 'schema/seed.schema.json'));
  const { stray } = seedFiles(root);
  for (const path of stray) errors.push(`seeds/${path}: unexpected file (seeds live in seeds/{${SCENARIOS.join(',')}}/*.md)`);

  let seeds = [];
  try {
    seeds = loadSeeds(root);
  } catch (error) {
    errors.push(error.message);
  }
  const seenIds = new Map();
  for (const { file, data, body } of seeds) {
    const label = `seeds/${file}`;
    for (const message of validateSchema(schema, data)) errors.push(`${label}: ${message}`);
    if (typeof data.id !== 'string') continue;
    const folded = data.id.toLowerCase();
    if (seenIds.has(folded)) errors.push(`${label}: id ${data.id} already used by seeds/${seenIds.get(folded)}`);
    seenIds.set(folded, file);
    const [directory, name] = file.split('/');
    if (directory !== data.scenario) errors.push(`${label}: scenario "${data.scenario}" must match directory "${directory}"`);
    if (SCENARIO_NAMES[data.scenario] && data.scenario_name !== SCENARIO_NAMES[data.scenario]) {
      errors.push(`${label}: scenario_name must be "${SCENARIO_NAMES[data.scenario]}"`);
    }
    if (!new RegExp(`^[a-z0-9]+(?:-[a-z0-9]+)*-${folded}\\.md$`).test(name)) {
      errors.push(`${label}: file name must be <slug>-${folded}.md`);
    }
    if (!narrativeGist(body)) errors.push(`${label}: needs a "# Narrative" section with an opening paragraph`);
  }

  const registry = loadRegistry(root);
  const registered = new Map();
  for (const { id, file } of registry) {
    if (registered.has(id)) errors.push(`registry: duplicate id ${id}`);
    registered.set(id, file);
    const seed = seeds.find(({ data }) => data.id === id);
    if (!seed) errors.push(`registry: published id ${id} (${file}) was removed; mark it deprecated instead`);
    else if (seed.file !== file) errors.push(`registry: published id ${id} must stay bound to ${file}, found ${seed.file}`);
  }
  for (const { file, data } of seeds) {
    if (typeof data.id === 'string' && !registered.has(data.id)) {
      errors.push(`seeds/${file}: id ${data.id} is not in registry/preserved-ids.json; append it`);
    }
  }
  if (baseRegistry) {
    const current = new Map(registry.map(({ id, file }) => [id, file]));
    for (const { id, file } of baseRegistry) {
      if (!current.has(id)) errors.push(`registry: published id ${id} was deleted from the registry`);
      else if (current.get(id) !== file) errors.push(`registry: published id ${id} was rebound from ${file} to ${current.get(id)}`);
    }
    const order = registry.map(({ id }) => id).slice(0, baseRegistry.length);
    if (order.join() !== baseRegistry.map(({ id }) => id).join()) {
      errors.push('registry: entries are append-only; keep existing order and add new IDs at the end');
    }
  }

  const labels = loadLabels(root);
  for (const { file, data } of seeds) {
    const label = labels[data.id];
    if (!label?.title?.trim() || !label?.summary?.trim()) {
      errors.push(`seeds/${file}: add a title and summary to registry/labels.zh-CN.json`);
    }
  }
  for (const id of Object.keys(labels)) {
    if (!seeds.some(({ data }) => data.id === id)) errors.push(`registry/labels.zh-CN.json: unknown id ${id}`);
  }
  return { errors, count: seeds.length };
}

function gitRegistry(ref) {
  try {
    const text = execFileSync('git', ['show', `${ref}:registry/preserved-ids.json`], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    });
    return JSON.parse(text).seeds;
  } catch {
    return null;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const flag = process.argv.indexOf('--base');
  const ref = flag >= 0 ? process.argv[flag + 1] : 'HEAD';
  const baseRegistry = gitRegistry(ref);
  if (flag >= 0 && !baseRegistry) {
    console.error(`validate: cannot read registry/preserved-ids.json at ${ref}`);
    process.exit(1);
  }
  const { errors, count } = validateRepository(ROOT, { baseRegistry });
  if (errors.length) {
    console.error(`Seed validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
    process.exit(1);
  }
  console.log(`Seed validation passed (${count} seeds${baseRegistry ? `, registry checked against ${ref}` : ''}).`);
}
