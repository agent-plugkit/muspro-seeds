// Shared, dependency-free helpers for the Muspro Seeds build scripts.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync, gzipSync } from 'node:zlib';

export const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const SCHEMA_VERSION = '1.0.0';
export const PACKAGE_NAME = 'muspro-seeds';
export const REPOSITORY = 'https://github.com/agent-plugkit/muspro-seeds';
export const SCENARIOS = ['ui', 'graphic', 'information'];
export const GENERATED = ['index.json', 'scenarios.json'];
export const GIST_LENGTH = 300;

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function toJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function packageVersion(root = ROOT) {
  return readJson(join(root, 'package.json')).version;
}

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

// ---------------------------------------------------------------------------
// Frontmatter: the YAML subset used by seed files (block mappings, block
// sequences of scalars, `[]`, plain/quoted scalars). Anything else is an error.

export function splitFrontmatter(text, label = 'seed') {
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(text);
  if (!match) throw new Error(`${label}: missing YAML frontmatter`);
  return { data: parseYamlSubset(match[1], label), body: text.slice(match[0].length) };
}

export function parseYamlSubset(source, label = 'yaml') {
  const lines = source.split('\n').map((raw, index) => ({ raw, number: index + 2 }))
    .filter(({ raw }) => raw.trim() !== '' && !/^\s*#/.test(raw));
  for (const line of lines) {
    if (/\t/.test(line.raw)) throw new Error(`${label}:${line.number}: tabs are not allowed`);
    line.indent = line.raw.length - line.raw.trimStart().length;
    line.text = line.raw.trim();
  }
  const [value, next] = parseBlock(lines, 0, 0, label);
  if (next !== lines.length) throw new Error(`${label}:${lines[next].number}: unexpected indentation`);
  return value;
}

function parseBlock(lines, start, indent, label) {
  if (start >= lines.length) return [null, start];
  return lines[start].text.startsWith('- ') || lines[start].text === '-'
    ? parseSequence(lines, start, indent, label)
    : parseMapping(lines, start, indent, label);
}

function parseSequence(lines, start, indent, label) {
  const items = [];
  let i = start;
  while (i < lines.length && lines[i].indent === indent && lines[i].text.startsWith('- ')) {
    const rest = lines[i].text.slice(2).trim();
    if (/^[^'"[{][^:]*:( |$)/.test(rest)) throw new Error(`${label}:${lines[i].number}: mappings inside sequences are not supported`);
    items.push(parseScalar(rest, label, lines[i].number));
    i += 1;
  }
  return [items, i];
}

function parseMapping(lines, start, indent, label) {
  const map = {};
  let i = start;
  while (i < lines.length && lines[i].indent === indent) {
    const line = lines[i];
    const match = /^([A-Za-z_][A-Za-z0-9_-]*):(?: (.*))?$/.exec(line.text);
    if (!match) throw new Error(`${label}:${line.number}: expected "key: value"`);
    const [, key, rest = ''] = match;
    if (Object.hasOwn(map, key)) throw new Error(`${label}:${line.number}: duplicate key "${key}"`);
    i += 1;
    if (rest.trim() !== '') {
      map[key] = parseScalar(rest.trim(), label, line.number);
      continue;
    }
    const next = lines[i];
    if (next && next.indent === indent && next.text.startsWith('- ')) {
      [map[key], i] = parseSequence(lines, i, indent, label);
    } else if (next && next.indent > indent) {
      [map[key], i] = parseBlock(lines, i, next.indent, label);
    } else {
      map[key] = null;
    }
  }
  if (i < lines.length && lines[i].indent > indent) {
    throw new Error(`${label}:${lines[i].number}: unexpected indentation`);
  }
  return [map, i];
}

function parseScalar(text, label, number) {
  if (text === '[]') return [];
  if (text === '{}') return {};
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text === 'null' || text === '~') return null;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  if (text.startsWith('"')) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`${label}:${number}: invalid double-quoted string`);
    }
  }
  if (text.startsWith("'")) {
    if (!/^'(?:[^']|'')*'$/.test(text)) throw new Error(`${label}:${number}: invalid single-quoted string`);
    return text.slice(1, -1).replaceAll("''", "'");
  }
  if (/^[[{&*!|>%@`]/.test(text) || / #/.test(text) || /: /.test(text)) {
    throw new Error(`${label}:${number}: unsupported YAML scalar "${text}"; quote it`);
  }
  return text;
}

// ---------------------------------------------------------------------------
// JSON Schema: the keyword subset used by schema/seed.schema.json.

const ANNOTATIONS = new Set(['$schema', '$id', 'title', 'description', '$defs']);

export function validateSchema(schema, value, root = schema, path = '') {
  const errors = [];
  const at = path || '(root)';
  if (schema.$ref) {
    const target = schema.$ref.replace(/^#\//, '').split('/').reduce((node, key) => node?.[key], root);
    if (!target) throw new Error(`Unresolvable $ref ${schema.$ref}`);
    return validateSchema(target, value, root, path);
  }
  for (const [keyword, rule] of Object.entries(schema)) {
    if (ANNOTATIONS.has(keyword)) continue;
    switch (keyword) {
      case 'type': {
        const actual = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
        const ok = rule === 'integer' ? Number.isInteger(value) : actual === rule;
        if (!ok) return [`${at}: expected ${rule}, got ${actual}`];
        break;
      }
      case 'enum':
        if (!rule.some((item) => item === value)) errors.push(`${at}: must be one of ${rule.join(', ')}`);
        break;
      case 'const':
        if (value !== rule) errors.push(`${at}: must equal ${rule}`);
        break;
      case 'pattern':
        if (typeof value === 'string' && !new RegExp(rule, 'u').test(value)) errors.push(`${at}: must match ${rule}`);
        break;
      case 'minLength':
        if (typeof value === 'string' && [...value].length < rule) errors.push(`${at}: must not be empty`);
        break;
      case 'minimum':
        if (typeof value === 'number' && value < rule) errors.push(`${at}: must be >= ${rule}`);
        break;
      case 'maximum':
        if (typeof value === 'number' && value > rule) errors.push(`${at}: must be <= ${rule}`);
        break;
      case 'required':
        if (isObject(value)) {
          for (const key of rule) if (!Object.hasOwn(value, key)) errors.push(`${at}: missing required "${key}"`);
        }
        break;
      case 'minProperties':
        if (isObject(value) && Object.keys(value).length < rule) errors.push(`${at}: needs at least ${rule} properties`);
        break;
      case 'properties':
        if (isObject(value)) {
          for (const [key, child] of Object.entries(rule)) {
            if (Object.hasOwn(value, key)) errors.push(...validateSchema(child, value[key], root, `${path}/${key}`));
          }
        }
        break;
      case 'additionalProperties':
        if (isObject(value)) {
          const known = new Set(Object.keys(schema.properties ?? {}));
          for (const [key, child] of Object.entries(value)) {
            if (known.has(key)) continue;
            if (rule === false) errors.push(`${at}: unknown property "${key}"`);
            else if (isObject(rule)) errors.push(...validateSchema(rule, child, root, `${path}/${key}`));
          }
        }
        break;
      case 'items':
        if (Array.isArray(value)) {
          value.forEach((item, index) => errors.push(...validateSchema(rule, item, root, `${path}/${index}`)));
        }
        break;
      case 'minItems':
        if (Array.isArray(value) && value.length < rule) errors.push(`${at}: needs at least ${rule} items`);
        break;
      case 'uniqueItems':
        if (rule && Array.isArray(value) && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) {
          errors.push(`${at}: items must be unique`);
        }
        break;
      default:
        throw new Error(`Unsupported JSON Schema keyword "${keyword}"`);
    }
  }
  return errors;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// ---------------------------------------------------------------------------
// Seeds on disk.

export function seedFiles(root = ROOT) {
  const seedsDir = join(root, 'seeds');
  const files = [];
  const stray = [];
  for (const entry of readdirSync(seedsDir, { withFileTypes: true })) {
    if (entry.isDirectory() && SCENARIOS.includes(entry.name)) {
      for (const child of readdirSync(join(seedsDir, entry.name), { withFileTypes: true })) {
        if (child.isFile() && child.name.endsWith('.md')) files.push(`${entry.name}/${child.name}`);
        else stray.push(`${entry.name}/${child.name}`);
      }
    } else if (!(entry.isFile() && GENERATED.includes(entry.name))) {
      stray.push(entry.name);
    }
  }
  return { files: files.sort(), stray: stray.sort() };
}

export function loadSeeds(root = ROOT) {
  const { files } = seedFiles(root);
  return files.map((file) => {
    const text = readFileSync(join(root, 'seeds', file), 'utf8');
    const { data, body } = splitFrontmatter(text, `seeds/${file}`);
    return { file, data, body };
  });
}

// First paragraph of the "# Narrative" section, cut to GIST_LENGTH code points.
export function narrativeGist(body) {
  const lines = body.split('\n');
  const start = lines.findIndex((line) => line.trim() === '# Narrative');
  if (start < 0) return null;
  const paragraph = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('#')) break;
    if (line.trim() === '') {
      if (paragraph.length) break;
      continue;
    }
    paragraph.push(line.trim());
  }
  return paragraph.length ? [...paragraph.join(' ')].slice(0, GIST_LENGTH).join('') : null;
}

export function loadRegistry(root = ROOT) {
  return readJson(join(root, 'registry/preserved-ids.json')).seeds;
}

export function loadLabels(root = ROOT) {
  return readJson(join(root, 'registry/labels.zh-CN.json')).seeds;
}

export function buildArtifacts(root = ROOT) {
  const version = packageVersion(root);
  const byId = new Map(loadSeeds(root).map((seed) => [seed.data.id, seed]));
  const labels = loadLabels(root);
  const ordered = loadRegistry(root).map(({ id }) => byId.get(id)).filter(Boolean);
  for (const seed of byId.values()) if (!ordered.includes(seed)) ordered.push(seed);

  const seeds = ordered.map(({ file, data, body }) => {
    const entry = {
      id: data.id,
      file,
      scenario: data.scenario,
      category: data.category,
      gist: narrativeGist(body) ?? '',
      core_dimensions: data.core_dimensions,
      scores: data.scores,
      tags: data.tags,
    };
    if (data.deprecated) entry.deprecated = true;
    return entry;
  });
  const index = { schemaVersion: SCHEMA_VERSION, version, seeds };
  const scenarios = {
    schemaVersion: SCHEMA_VERSION,
    version,
    scenarios: SCENARIOS.map((scenario) => {
      const members = ordered.filter(({ data }) => data.scenario === scenario);
      return {
        id: scenario,
        name: members[0]?.data.scenario_name ?? scenario,
        seeds: members.map(({ file, data }) => ({
          id: data.id,
          file,
          title: labels[data.id]?.title ?? data.category,
          summary: labels[data.id]?.summary ?? '',
          ...(data.deprecated ? { deprecated: true } : {}),
        })),
      };
    }),
  };
  return { 'index.json': toJson(index), 'scenarios.json': toJson(scenarios) };
}

// ---------------------------------------------------------------------------
// Release payload: everything a consumer needs, rooted like seeds/.

export function payloadFiles(root = ROOT) {
  const seedsDir = join(root, 'seeds');
  const files = walk(seedsDir).map((path) => ({
    path: relative(seedsDir, path).split(sep).join('/'),
    bytes: readFileSync(path),
  }));
  for (const name of ['LICENSE', 'NOTICE']) files.push({ path: name, bytes: readFileSync(join(root, name)) });
  return files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

// Content identity independent of archive bytes: sha256 over "<sha256>  <path>\n" lines.
export function contentHash(files) {
  const lines = [...files]
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    .map(({ path, bytes }) => `${sha256(bytes)}  ${path}\n`)
    .join('');
  return `sha256:${sha256(Buffer.from(lines, 'utf8'))}`;
}

export function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).sort().flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

// ---------------------------------------------------------------------------
// Deterministic ustar + gzip (fixed mtime/owner/mode, sorted entries).

export function createTarGz(files, prefix) {
  const blocks = [];
  for (const { path, bytes } of files) {
    blocks.push(tarHeader(`${prefix}/${path}`, bytes.length));
    blocks.push(bytes);
    const pad = (512 - (bytes.length % 512)) % 512;
    if (pad) blocks.push(Buffer.alloc(pad));
  }
  blocks.push(Buffer.alloc(1024));
  const gz = gzipSync(Buffer.concat(blocks), { level: 9 });
  gz.writeUInt32LE(0, 4); // mtime
  gz[9] = 3; // OS = Unix, regardless of the build host
  return gz;
}

function tarHeader(name, size) {
  const header = Buffer.alloc(512);
  let path = name;
  let prefix = '';
  if (Buffer.byteLength(path) > 100) {
    const cut = path.lastIndexOf('/', 155);
    prefix = path.slice(0, cut);
    path = path.slice(cut + 1);
    if (cut < 0 || Buffer.byteLength(path) > 100 || Buffer.byteLength(prefix) > 155) {
      throw new Error(`Path too long for ustar: ${name}`);
    }
  }
  const field = (offset, length, value) => header.write(value, offset, length, 'utf8');
  field(0, 100, path);
  field(100, 8, '0000644\0');
  field(108, 8, '0000000\0');
  field(116, 8, '0000000\0');
  field(124, 12, `${size.toString(8).padStart(11, '0')}\0`);
  field(136, 12, '00000000000\0');
  field(148, 8, '        ');
  field(156, 1, '0');
  field(257, 6, 'ustar\0');
  field(263, 2, '00');
  field(345, 155, prefix);
  let sum = 0;
  for (const byte of header) sum += byte;
  field(148, 8, `${sum.toString(8).padStart(6, '0')}\0 `);
  return header;
}

export function readTarGz(buffer) {
  const tar = gunzipSync(buffer);
  const files = [];
  let offset = 0;
  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const text = (start, length) => header.subarray(start, start + length).toString('utf8').replace(/\0.*$/s, '');
    const name = text(0, 100);
    const prefix = text(345, 155);
    const size = Number.parseInt(text(124, 12).trim() || '0', 8);
    const type = text(156, 1) || '0';
    const path = prefix ? `${prefix}/${name}` : name;
    offset += 512;
    if (type === '0') files.push({ path, bytes: Buffer.from(tar.subarray(offset, offset + size)) });
    else if (type !== '5') throw new Error(`Unsupported tar entry type "${type}" for ${path}`);
    offset += Math.ceil(size / 512) * 512;
  }
  return files;
}
