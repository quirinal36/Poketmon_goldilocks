// ============================================================================
// src/net — Supabase client, anonymous auth, cloud save, answer-log upload,
// question/curriculum overrides, transfer codes. Implements NetService.
//
// Offline-first: with no config (public/config.js empty and no VITE_SUPABASE_*)
// nothing is imported and every call resolves immediately with null/false.
// With config, `@supabase/supabase-js` is loaded lazily on init(); any failure
// there — no network, sandbox CSP (`connect-src 'self'` → fetch throws a
// TypeError), 4 s timeout, auth error — puts the service in offline mode.
// Nothing in here ever throws into the game.
// ============================================================================
import type { AnswerLog, CurriculumData, Lesson, NetService, Question, SaveData, Unit } from '../core/types';
import { DEFAULT_TIMEOUT_MS, guarded, withTimeout } from './timeout';

// ------------------------------------------------------------ constants ----
export const AUTH_STORAGE_KEY = 'pokestudy.auth';
export const PUSH_DEBOUNCE_MS = 20_000;
const PAGE = 1000;                 // PostgREST default max-rows per response
const KEEPALIVE_BODY_LIMIT = 60_000; // fetch keepalive bodies are capped at 64 KiB

// --------------------------------------------------------------- config ----
export interface NetConfig { url: string; key: string }

/** window.__APP_CONFIG__ (public/config.js) first, then VITE_SUPABASE_* build env. */
export function readConfig(): NetConfig | null {
  const g = (typeof window !== 'undefined' ? window : globalThis) as unknown as { __APP_CONFIG__?: Record<string, unknown> };
  const rc = g.__APP_CONFIG__;
  let url = typeof rc?.supabaseUrl === 'string' ? rc.supabaseUrl.trim() : '';
  let key = typeof rc?.supabaseAnonKey === 'string' ? rc.supabaseAnonKey.trim() : '';
  if (!url || !key) {
    try {
      const eu = import.meta.env.VITE_SUPABASE_URL;
      const ek = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (typeof eu === 'string' && typeof ek === 'string') { url = eu.trim(); key = ek.trim(); }
    } catch { /* no import.meta.env in this runtime */ }
  }
  if (!url || !key || !/^https?:\/\//.test(url)) return null;
  return { url: url.replace(/\/+$/, ''), key };
}

// ------------------------------------------- minimal supabase-js surface ----
// Only the bits we use, typed structurally so tests can inject a fake and so
// the real client can be swapped without touching the rest of the game.
export interface QueryResult<T> { data: T | null; error: { message: string } | null }
export interface QueryBuilder extends PromiseLike<QueryResult<Record<string, unknown>[]>> {
  select(columns: string): QueryBuilder;
  in(column: string, values: string[]): QueryBuilder;
  eq(column: string, value: unknown): QueryBuilder;
  order(column: string, opts?: { ascending?: boolean }): QueryBuilder;
  range(from: number, to: number): QueryBuilder;
  maybeSingle(): PromiseLike<QueryResult<Record<string, unknown>>>;
  upsert(rows: unknown, opts?: { onConflict?: string; ignoreDuplicates?: boolean }): PromiseLike<QueryResult<unknown>>;
  insert(rows: unknown): PromiseLike<QueryResult<unknown>>;
}
export interface AuthUserLike { id: string }
export interface SupabaseLike {
  auth: {
    getSession(): PromiseLike<{ data: { session: { user: AuthUserLike } | null }; error: { message: string } | null }>;
    signInAnonymously(): PromiseLike<{ data: { user: AuthUserLike | null }; error: { message: string } | null }>;
  };
  from(table: string): QueryBuilder;
  rpc(fn: string, args?: Record<string, unknown>): PromiseLike<QueryResult<unknown>>;
}
export interface SupabaseModuleLike {
  createClient(url: string, key: string, options?: Record<string, unknown>): unknown;
}

export interface NetOptions {
  /** Override config resolution (tests). `null` = force offline. */
  config?: NetConfig | null;
  /** Override the lazy `import('@supabase/supabase-js')` (tests). */
  loadClient?: () => Promise<SupabaseModuleLike>;
  timeoutMs?: number;
  debounceMs?: number;
  /** Diagnostics sink; defaults to console.info (never console.error — see DESIGN §12). */
  log?: (msg: string, detail?: unknown) => void;
}

/** NetService plus a test/lifecycle hook to flush the debounced save now. */
export interface NetHandle extends NetService {
  flush(): Promise<void>;
}

// --------------------------------------------------------------- guards ----
function isRecord(x: unknown): x is Record<string, unknown> { return typeof x === 'object' && x !== null; }
function isSaveData(x: unknown): x is SaveData {
  return isRecord(x) && x.version === 1 && typeof x.id === 'string' && isRecord(x.player) && isRecord(x.learn);
}
function isQuestion(x: unknown): x is Question {
  return isRecord(x) && typeof x.id === 'string' && typeof x.lessonId === 'string' && typeof x.prompt === 'string' && typeof x.answer === 'string';
}
function rowToUnit(r: Record<string, unknown>): Unit {
  return {
    id: String(r.id), subject: r.subject as Unit['subject'], grade: Number(r.grade) as Unit['grade'],
    semester: Number(r.semester) as Unit['semester'], unitNo: Number(r.unit_no), title: String(r.title ?? ''),
    ...(typeof r.description === 'string' && r.description ? { description: r.description } : {}),
    order: Number(r.order),
  };
}
function rowToLesson(r: Record<string, unknown>): Lesson {
  return {
    id: String(r.id), unitId: String(r.unit_id), subject: r.subject as Lesson['subject'],
    grade: Number(r.grade) as Lesson['grade'], semester: Number(r.semester) as Lesson['semester'],
    lessonNo: Number(r.lesson_no), title: String(r.title ?? ''), goal: String(r.goal ?? ''), order: Number(r.order),
    requiredCorrect: Number(r.required_correct ?? 8),
    ...(r.is_review ? { isReview: true } : {}),
  };
}

// -------------------------------------------------------------- factory ----
export function createNet(opts: NetOptions = {}): NetHandle {
  const cfg = opts.config === undefined ? readConfig() : opts.config;
  const TIMEOUT = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const DEBOUNCE = opts.debounceMs ?? PUSH_DEBOUNCE_MS;
  const log = opts.log ?? ((msg: string, detail?: unknown) => {
    // eslint-disable-next-line no-console
    if (detail === undefined) console.info(`[net] ${msg}`); else console.info(`[net] ${msg}`, detail);
  });
  const loadClient = opts.loadClient ?? (() => import('@supabase/supabase-js') as Promise<SupabaseModuleLike>);

  let online = false;
  let client: SupabaseLike | null = null;
  let userId: string | null = null;
  let initPromise: Promise<void> | null = null;

  // debounced cloud save
  let pendingSave: SaveData | null = null;
  let pushTimer: ReturnType<typeof setTimeout> | null = null;
  let pushInFlight: Promise<void> | null = null;

  const errMsg = (e: unknown): string => (e instanceof Error ? `${e.name}: ${e.message}` : String(e));
  const fail = (what: string) => (e: unknown) => log(`${what} failed → ignoring`, errMsg(e));
  /** The client + user id when we are online and the browser thinks it has a network; null otherwise. */
  function ready(): { c: SupabaseLike; uid: string } | null {
    if (!online || !client || !userId) return null;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;
    return { c: client, uid: userId };
  }

  // While the page is hidden (tab switch / app backgrounded / closing) ask the
  // browser to keep the request alive past unload — but only for bodies under
  // the keepalive cap, otherwise fetch itself would throw.
  function makeFetch(): typeof fetch | undefined {
    if (typeof fetch !== 'function') return undefined;
    const base = fetch;
    return (input, init) => {
      const pageHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
      if (pageHidden && init && typeof init.body === 'string' && init.body.length < KEEPALIVE_BODY_LIMIT) {
        return base(input, { ...init, keepalive: true });
      }
      return base(input, init);
    };
  }

  // ------------------------------------------------------------ init ----
  async function doInit(): Promise<void> {
    if (!cfg) { online = false; return; }
    try {
      const mod = await withTimeout(loadClient(), TIMEOUT, 'load supabase-js');
      const f = makeFetch();
      const c = mod.createClient(cfg.url, cfg.key, {
        auth: { persistSession: true, storageKey: AUTH_STORAGE_KEY, autoRefreshToken: true, detectSessionInUrl: false },
        ...(f ? { global: { fetch: f } } : {}),
      }) as SupabaseLike;

      const sess = await withTimeout(c.auth.getSession(), TIMEOUT, 'getSession');
      let user: AuthUserLike | null = sess.data?.session?.user ?? null;
      if (!user) {
        const res = await withTimeout(c.auth.signInAnonymously(), TIMEOUT, 'signInAnonymously');
        if (res.error) throw new Error(res.error.message);
        user = res.data?.user ?? null;
      }
      if (!user || typeof user.id !== 'string') throw new Error('no user after sign-in');

      client = c;
      userId = user.id;
      online = true;
      log(`online as ${user.id.slice(0, 8)}…`);
    } catch (e) {
      // CSP (connect-src 'self') surfaces here as TypeError: Failed to fetch — expected in the Lounge sandbox.
      client = null; userId = null; online = false;
      log('offline (cloud features disabled)', errMsg(e));
    }
  }

  // ------------------------------------------------------ cloud save ----
  async function flushPush(): Promise<void> {
    if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
    if (pushInFlight) await pushInFlight;   // serialize: never let an older save overtake a newer one
    const save = pendingSave;
    pendingSave = null;
    const r = ready();
    if (!save || !r) return;
    const { c, uid } = r;
    const run = guarded(
      () => c.from('players').upsert(
        { id: uid, name: save.player?.name ?? null, save, save_updated_at: save.updatedAt ?? new Date().toISOString() },
        { onConflict: 'id' },
      ).then((res) => { if (res.error) throw new Error(res.error.message); }),
      undefined, TIMEOUT, 'pushSave', fail('pushSave'),
    );
    pushInFlight = run;
    await run;
    if (pushInFlight === run) pushInFlight = null;
  }

  function onHidden(): void { void flushPush(); }
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') onHidden(); });
    if (typeof window !== 'undefined') window.addEventListener('pagehide', onHidden);
  }

  // ------------------------------------------------------------ paging ----
  async function selectAll(c: SupabaseLike, build: (q: QueryBuilder) => QueryBuilder, table: string, label: string): Promise<Record<string, unknown>[]> {
    const out: Record<string, unknown>[] = [];
    for (let from = 0; ; from += PAGE) {
      const r = await withTimeout(build(c.from(table)).range(from, from + PAGE - 1), TIMEOUT, label);
      if (r.error) throw new Error(r.error.message);
      const rows = r.data ?? [];
      out.push(...rows);
      if (rows.length < PAGE) break;
    }
    return out;
  }

  // ------------------------------------------------------------ service ----
  const net: NetHandle = {
    get online() { return online; },

    init() {
      if (!initPromise) initPromise = doInit();
      return initPromise;
    },

    async pullSave() {
      const r0 = ready();
      if (!r0) return null;
      const { c, uid } = r0;
      return guarded(async () => {
        const r = await c.from('players').select('save').eq('id', uid).maybeSingle();
        if (r.error) throw new Error(r.error.message);
        const save = r.data?.save;
        return isSaveData(save) ? save : null;
      }, null, TIMEOUT, 'pullSave', fail('pullSave'));
    },

    pushSave(save) {
      if (!cfg) return;
      pendingSave = save;
      if (!pushTimer) pushTimer = setTimeout(() => { void flushPush(); }, DEBOUNCE);
    },

    async flushLogs(logs) {
      const r0 = ready();
      if (!r0) return false;
      if (!Array.isArray(logs) || logs.length === 0) return true;
      const { c, uid } = r0;
      const rows = logs.map((l: AnswerLog) => ({
        player_id: uid, question_id: l.questionId, lesson_id: l.lessonId, subject: l.subject,
        correct: !!l.correct, first_try: !!l.firstTry, elapsed_ms: Math.max(0, Math.round(l.elapsedMs || 0)),
        purpose: l.purpose, answered_at: l.at,
      }));
      // One request = one transaction; the unique key makes a retry after a timeout harmless.
      return guarded(async () => {
        const r = await c.from('answer_logs').upsert(rows, { onConflict: 'player_id,question_id,answered_at', ignoreDuplicates: true });
        if (r.error) throw new Error(r.error.message);
        return true;
      }, false, TIMEOUT + Math.ceil(rows.length / 100) * 250, 'flushLogs', fail('flushLogs'));
    },

    async fetchQuestions(lessonIds) {
      const r0 = ready();
      if (!r0) return null;
      const ids = [...new Set((lessonIds ?? []).filter((s) => typeof s === 'string' && s))];
      if (ids.length === 0) return [];
      return guarded(async () => {
        const rows = await selectAll(r0.c, (q) => q.select('data').in('lesson_id', ids).eq('is_active', true).order('id'), 'questions', 'fetchQuestions');
        return rows.map((r) => r.data).filter(isQuestion);
      }, null, TIMEOUT * 3, 'fetchQuestions', fail('fetchQuestions'));
    },

    async fetchCurriculum() {
      const r0 = ready();
      if (!r0) return null;
      return guarded(async () => {
        const [u, l] = await Promise.all([
          selectAll(r0.c, (q) => q.select('*').order('subject').order('order'), 'units', 'fetchCurriculum/units'),
          selectAll(r0.c, (q) => q.select('*').order('subject').order('order'), 'lessons', 'fetchCurriculum/lessons'),
        ]);
        if (u.length === 0 || l.length === 0) return null;
        let latest = '';
        for (const r of [...u, ...l]) if (typeof r.updated_at === 'string' && r.updated_at > latest) latest = r.updated_at;
        const data: CurriculumData = {
          version: `cloud-${latest ? latest.slice(0, 19) : 'unknown'}`,
          units: u.map(rowToUnit),
          lessons: l.map(rowToLesson),
        };
        return data;
      }, null, TIMEOUT * 2, 'fetchCurriculum', fail('fetchCurriculum'));
    },

    async createTransferCode() {
      await flushPush();
      const r0 = ready();
      if (!r0) return null;
      const { c } = r0;
      return guarded(async () => {
        const r = await c.rpc('create_transfer_code');
        if (r.error) throw new Error(r.error.message);
        return typeof r.data === 'string' && r.data ? r.data : null;
      }, null, TIMEOUT, 'createTransferCode', fail('createTransferCode'));
    },

    async claimTransferCode(code) {
      const r0 = ready();
      if (!r0) return null;
      const { c } = r0;
      const p_code = String(code ?? '').trim().toUpperCase();
      if (!/^[A-HJ-NP-Z2-9]{6}$/.test(p_code)) return null;
      return guarded(async () => {
        const r = await c.rpc('claim_transfer_code', { p_code });
        if (r.error) throw new Error(r.error.message);
        return isSaveData(r.data) ? r.data : null;
      }, null, TIMEOUT, 'claimTransferCode', fail('claimTransferCode'));
    },

    async flush() {
      await flushPush();
      if (pushInFlight) await pushInFlight;
    },
  };
  return net;
}
