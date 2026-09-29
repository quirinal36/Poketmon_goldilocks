// Merge subject generators → public/data/curriculum.json + public/data/questions/<key>.json
// Usage: node scripts/generate-questions.mjs [--only math|english] [--strict]
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validate } from './validate-questions.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const strict = args.includes('--strict');

const parts = [];
for (const [subject, file, fn] of [['math', 'questions/math.mjs', 'buildMath'], ['english', 'questions/english.mjs', 'buildEnglish']]) {
  if (only && only !== subject) continue;
  const p = resolve(root, 'scripts', file);
  if (!existsSync(p)) { console.warn(`[skip] ${file} not found`); continue; }
  const mod = await import(pathToFileURL(p).href);
  const out = await mod[fn]();
  console.log(`${subject}: ${out.units.length} units, ${out.lessons.length} lessons, ${out.questions.length} questions`);
  parts.push(out);
}
const units = parts.flatMap((p) => p.units);
const lessons = parts.flatMap((p) => p.lessons);
const questions = parts.flatMap((p) => p.questions);

const { errors, warnings } = validate({ units, lessons, questions });
for (const w of warnings.slice(0, 40)) console.warn('WARN', w);
if (warnings.length > 40) console.warn(`… ${warnings.length - 40} more warnings`);
if (errors.length) {
  for (const e of errors.slice(0, 80)) console.error('ERR ', e);
  console.error(`${errors.length} errors`);
  process.exit(1);
}
if (strict && warnings.length) { console.error('strict: warnings present'); process.exit(1); }

const outDir = resolve(root, 'public/data');
mkdirSync(resolve(outDir, 'questions'), { recursive: true });
if (!only) {
  const version = new Date().toISOString().slice(0, 10) + '-' + questions.length;
  writeFileSync(resolve(outDir, 'curriculum.json'), JSON.stringify({ version, units, lessons }));
}
const byKey = new Map();
for (const q of questions) {
  const key = q.lessonId.slice(0, 3); // m11, e22 …
  if (!byKey.has(key)) byKey.set(key, []);
  byKey.get(key).push(q);
}
for (const [key, qs] of byKey) writeFileSync(resolve(outDir, 'questions', `${key}.json`), JSON.stringify(qs));
console.log(`OK → public/data (${[...byKey.keys()].join(', ')})${only ? ' [partial: curriculum.json not written]' : ''}`);
