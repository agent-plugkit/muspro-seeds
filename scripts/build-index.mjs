#!/usr/bin/env node
// Generate seeds/index.json and seeds/scenarios.json from seed frontmatter.
//
//   node scripts/build-index.mjs           write the generated files
//   node scripts/build-index.mjs --check   fail if they are missing or stale
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, buildArtifacts } from './lib.mjs';

const checking = process.argv.includes('--check');
const artifacts = buildArtifacts(ROOT);
const stale = [];
for (const [name, content] of Object.entries(artifacts)) {
  const path = join(ROOT, 'seeds', name);
  if (checking) {
    if (!existsSync(path) || readFileSync(path, 'utf8') !== content) stale.push(`seeds/${name}`);
  } else {
    writeFileSync(path, content);
  }
}
if (stale.length) {
  console.error(`Generated files are stale: ${stale.join(', ')}. Run npm run build.`);
  process.exit(1);
}
const { seeds } = JSON.parse(artifacts['index.json']);
console.log(`${checking ? 'Index is up to date' : 'Wrote seeds/index.json and seeds/scenarios.json'} (${seeds.length} seeds).`);
