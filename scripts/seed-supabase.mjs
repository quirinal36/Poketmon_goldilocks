#!/usr/bin/env node
// scripts/seed-supabase.mjs — public/data/{curriculum.json, questions/*.json} → Supabase
//
//   npm run db:seed              upsert units, lessons, questions; deactivate questions not in the bundle
//   npm run db:seed -- --dry-run read everything, print what would change, write nothing
//
// Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment or .env.local
// (the service role key bypasses RLS — never ship it to the browser; see docs/DEPLOY.md).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const BATCH = 500;

// ---------------------------------------------------------------- .env.local ----
/** Minimal KEY=VALUE parser (comments, blank lines, optional quotes). Existing env vars win. */
function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim().replace(/^export\s+/, '');
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnvFile(resolve(root, '.env.local'));

const url = process.env.SUPABASE_PROJECT_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/** Tell the teacher early when the wrong key was pasted. */
function describeKey(k) {
  if (!k) return 'missing';
  if (k.startsWith('sb_secret_')) return 'service (sb_secret_…)';
  if (k.startsWith('sb_publishable_')) return 'PUBLISHABLE — wrong key';
  const parts = k.split('.');
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
      return payload.role === 'service_role' ? 'service_role (JWT)' : `${payload.role || 'unknown'} — wrong key`;
    } catch { /* fallthrough */ }
  }
  return 'unrecognized format';
}

// ---------------------------------------------------------------- bundle ----
function readJson(path) { return JSON.parse(readFileSync(path, 'utf8')); }

const dataDir = resolve(root, 'public/data');
const curriculumPath = resolve(dataDir, 'curriculum.json');
if (!existsSync(curriculumPath)) {
  console.error(`✗ ${curriculumPath} 이(가) 없습니다. 먼저 \`npm run data:questions\` 를 실행하세요.`);
  process.exit(1);
}
const curriculum = readJson(curriculumPath);
const units = Array.isArray(curriculum.units) ? curriculum.units : [];
const lessons = Array.isArray(curriculum.lessons) ? curriculum.lessons : [];

const questionsDir = resolve(dataDir, 'questions');
const questionFiles = existsSync(questionsDir) ? readdirSync(questionsDir).filter((f) => f.endsWith('.json')).sort() : [];
const questions = [];
for (const f of questionFiles) {
  const arr = readJson(resolve(questionsDir, f));
  if (!Array.isArray(arr)) { console.warn(`[skip] ${f}: not an array`); continue; }
  questions.push(...arr);
}

// sanity: ids unique, FK chain intact — the generator validates too, but the DB will reject silently-wrong rows in bulk
const unitIds = new Set(units.map((u) => u.id));
const lessonIds = new Set(lessons.map((l) => l.id));
const seenQ = new Set();
const problems = [];
for (const l of lessons) if (!unitIds.has(l.unitId)) problems.push(`lesson ${l.id}: unknown unitId ${l.unitId}`);
for (const q of questions) {
  if (!lessonIds.has(q.lessonId)) problems.push(`question ${q.id}: unknown lessonId ${q.lessonId}`);
  if (seenQ.has(q.id)) problems.push(`question ${q.id}: duplicate id`);
  seenQ.add(q.id);
}
if (problems.length) {
  for (const p of problems.slice(0, 40)) console.error('ERR ', p);
  console.error(`✗ ${problems.length} problems in the bundle — fix them (npm run data:questions) before seeding.`);
  process.exit(1);
}

const unitRows = units.map((u) => ({
  id: u.id, subject: u.subject, grade: u.grade, semester: u.semester, unit_no: u.unitNo,
  title: u.title, description: u.description ?? null, order: u.order,
}));
const lessonRows = lessons.map((l) => ({
  id: l.id, unit_id: l.unitId, subject: l.subject, grade: l.grade, semester: l.semester, lesson_no: l.lessonNo,
  title: l.title, goal: l.goal ?? '', order: l.order, required_correct: l.requiredCorrect ?? 8, is_review: !!l.isReview,
}));
const questionRows = questions.map((q) => ({
  id: q.id, lesson_id: q.lessonId, subject: q.subject, type: q.type ?? '', difficulty: q.difficulty ?? 1,
  data: q, is_active: true,
}));

console.log(`bundle: version ${curriculum.version ?? '?'} — ${unitRows.length} units, ${lessonRows.length} lessons, ${questionRows.length} questions (${questionFiles.join(', ') || 'no question files'})`);

// ---------------------------------------------------------------- client ----
if (!url || !key) {
  console.error(`✗ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 없습니다 (.env.local 또는 환경변수). key: ${describeKey(key)}`);
  if (dryRun) { console.log('dry-run: nothing written.'); process.exit(0); }
  process.exit(1);
}
const keyKind = describeKey(key);
if (/wrong key|unrecognized/.test(keyKind)) {
  console.error(`✗ SUPABASE_SERVICE_ROLE_KEY 가 서비스 키가 아닙니다 (${keyKind}). 대시보드 Settings → API 의 service_role / secret 키를 쓰세요.`);
  process.exit(1);
}
console.log(`target: ${url} (key: ${keyKind})${dryRun ? '  [DRY RUN]' : ''}`);

const sb = createClient(url, key, { db: { schema: 'pokedu' }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });

async function upsertAll(table, rows) {
  let n = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    if (!dryRun) {
      const { error } = await sb.from(table).upsert(chunk, { onConflict: 'id' });
      if (error) throw new Error(`${table} upsert failed at row ${i}: ${error.message}`);
    }
    n += chunk.length;
    process.stdout.write(`\r  ${table}: ${n}/${rows.length}`);
  }
  process.stdout.write(rows.length ? '\n' : `  ${table}: 0\n`);
  return n;
}

/** All ids of currently-active questions (paged; PostgREST caps a response at 1000 rows). */
async function fetchActiveIds() {
  const ids = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb.from('questions').select('id').eq('is_active', true).range(from, from + PAGE - 1);
    if (error) throw new Error(`questions select failed: ${error.message}`);
    for (const r of data ?? []) ids.push(r.id);
    if (!data || data.length < PAGE) break;
  }
  return ids;
}

async function deactivate(ids) {
  let n = 0;
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200);
    if (!dryRun) {
      const { error } = await sb.from('questions').update({ is_active: false }).in('id', chunk);
      if (error) throw new Error(`questions deactivate failed: ${error.message}`);
    }
    n += chunk.length;
  }
  return n;
}

try {
  // FK order: units → lessons → questions
  const nu = await upsertAll('units', unitRows);
  const nl = await upsertAll('lessons', lessonRows);
  const nq = await upsertAll('questions', questionRows);

  const active = await fetchActiveIds();
  const bundleIds = new Set(questionRows.map((r) => r.id));
  const stale = active.filter((id) => !bundleIds.has(id));
  const nd = await deactivate(stale);

  console.log(`${dryRun ? 'would write' : 'done'}: units ${nu}, lessons ${nl}, questions ${nq} upserted; ${nd} question(s) deactivated (not in bundle)${dryRun ? ' — nothing written' : ''}.`);
} catch (e) {
  console.error(`✗ ${e instanceof Error ? e.message : String(e)}`);
  if (/fetch failed|ENOTFOUND|ECONNREFUSED/.test(String(e?.message ?? e))) console.error('  → SUPABASE_URL 이 맞는지, 인터넷이 되는지 확인하세요.');
  if (/row-level security|permission denied|42501/.test(String(e?.message ?? e))) console.error('  → 서비스 키(service_role)가 아니라 anon 키를 넣은 것 같습니다.');
  if (/relation .* does not exist|42P01/.test(String(e?.message ?? e))) console.error('  → 스키마가 없습니다. 먼저 `supabase db push` 를 실행하세요.');
  process.exit(1);
}
