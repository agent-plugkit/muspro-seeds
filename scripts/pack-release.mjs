#!/usr/bin/env node
// Pack a reproducible release: dist/muspro-seeds-<version>.tar.gz + dist/manifest.json.
//
//   node scripts/pack-release.mjs [--out <dir>]
//   node scripts/pack-release.mjs --check-reproducible   pack twice and compare bytes
//
// The archive holds one top-level directory muspro-seeds-<version>/ laid out like seeds/
// (index.json, scenarios.json, <scenario>/*.md) plus LICENSE and NOTICE. Entries are
// sorted and carry a fixed mtime, owner and mode, so the same tree and Node.js zlib
// produce the same bytes. contentHash identifies the payload independently of gzip.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  PACKAGE_NAME, REPOSITORY, ROOT, SCHEMA_VERSION, buildArtifacts, contentHash, createTarGz, packageVersion,
  payloadFiles, readJson, sha256, toJson,
} from './lib.mjs';

export function pack(outDir) {
  for (const [name, content] of Object.entries(buildArtifacts(ROOT))) {
    if (readFileSync(join(ROOT, 'seeds', name), 'utf8') !== content) {
      throw new Error(`seeds/${name} is stale; run npm run build first`);
    }
  }
  const version = packageVersion(ROOT);
  const files = payloadFiles(ROOT);
  const tarball = `${PACKAGE_NAME}-${version}.tar.gz`;
  const archive = createTarGz(files, `${PACKAGE_NAME}-${version}`);
  const manifest = {
    name: PACKAGE_NAME,
    version,
    schemaVersion: SCHEMA_VERSION,
    tarball,
    sha256: sha256(archive),
    contentHash: contentHash(files),
    files: files.length,
    repository: REPOSITORY,
  };
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, tarball), archive);
  writeFileSync(join(outDir, 'manifest.json'), toJson(manifest));
  return manifest;
}

if (process.argv.includes('--check-reproducible')) {
  const work = mkdtempSync(join(tmpdir(), 'muspro-seeds-pack-'));
  try {
    const first = pack(join(work, 'a'));
    const second = pack(join(work, 'b'));
    const same = ['manifest.json', first.tarball].every((name) => (
      readFileSync(join(work, 'a', name)).equals(readFileSync(join(work, 'b', name)))
    ));
    if (!same) {
      console.error('Release packing is not reproducible.');
      process.exit(1);
    }
    console.log(`Release packing is reproducible (${first.tarball}, ${first.files} files, sha256 ${first.sha256}).`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
} else {
  const flag = process.argv.indexOf('--out');
  const outDir = resolve(flag >= 0 ? process.argv[flag + 1] : join(ROOT, 'dist'));
  const manifest = pack(outDir);
  console.log(`Packed ${join(outDir, manifest.tarball)}\n${toJson(manifest).trim()}`);
}
