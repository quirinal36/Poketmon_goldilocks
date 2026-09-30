import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNet, readConfig, type NetOptions, type QueryBuilder, type SupabaseLike, type SupabaseModuleLike } from '../../src/net/index';
import { TimeoutError, guarded, withTimeout } from '../../src/net/timeout';
import type { AnswerLog, SaveData } from '../../src/core/types';

// ------------------------------------------------------------- fixtures ----
const CFG = { url: 'https://example.supabase.co', key: 'sb_publishable_test' };

function fakeSave(id = 'save-1'): SaveData {
  return {
    version: 1, id, createdAt: '2026-09-30T00:00:00.000Z', updatedAt: '2026-09-30T01:00:00.000Z', playTimeSec: 0,
    player: { name: '지우', rivalName: '그린', appearance: { gender: 'boy', skin: 0, hairColor: 0, hairStyle: 0, outfit: 0, hat: false }, money: 0, badges: [] },
    party: [], box: [], dex: { seen: [], caught: [] }, bag: {},
    pos: { map: 'pallet', x: 0, y: 0, facing: 'down' }, lastHeal: { map: 'pallet', x: 0, y: 0 },
    flags: {}, defeatedTrainers: [],
    learn: {
      parent: { pace: 1, subjects: { math: true, english: true }, ttsQuestions: true, ttsDialog: false },
      subjects: { math: { current: null, completed: {}, lessonStats: {} }, english: { current: null, completed: {}, lessonStats: {} } },
      daily: { date: '2026-09-30', startedLessons: { math: [], english: [] }, correct: { math: 0, english: 0 }, answered: { math: 0, english: 0 }, rewardClaimed: false },
      qstats: {}, recent: [], mistakes: [], pendingLogs: [], streak: { days: 0, lastDate: '' },
    },
    settings: { music: 1, sfx: 1, textSpeed: 'normal', ttsRate: 1 },
    stats: { correct: 0, wrong: 0, battlesWon: 0, caught: 0, stampsTotal: 0 },
  } as SaveData;
}

type Op = [string, unknown[]];
interface FakeBehaviour {
  session?: { user: { id: string } } | null;
  signIn?: () => Promise<{ data: { user: { id: string } | null }; error: { message: string } | null }>;
  rows?: (table: string, ops: Op[]) => Record<string, unknown>[];
  single?: (table: string, ops: Op[]) => Record<string, unknown> | null;
  rpc?: (fn: string, args?: Record<string, unknown>) => unknown;
  writeError?: string | null;
}
interface FakeClient extends SupabaseLike {
  calls: { kind: 'upsert' | 'insert'; table: string; rows: unknown; opts?: unknown }[];
  rpcCalls: { fn: string; args?: Record<string, unknown> }[];
}

/** A tiny PostgREST-shaped fake: chainable builder that is a thenable, like the real one. */
function fakeClient(b: FakeBehaviour = {}): FakeClient {
  const calls: FakeClient['calls'] = [];
  const rpcCalls: FakeClient['rpcCalls'] = [];
  const from = (table: string): QueryBuilder => {
    const ops: Op[] = [];
    const q = {} as QueryBuilder & Record<string, unknown>;
    for (const op of ['select', 'in', 'eq', 'order', 'range'] as const) {
      q[op] = (...args: unknown[]) => { ops.push([op, args]); return q; };
    }
    q.maybeSingle = async () => ({ data: b.single ? b.single(table, ops) : null, error: null });
    q.upsert = async (rows: unknown, opts?: unknown) => { calls.push({ kind: 'upsert', table, rows, opts }); return { data: null, error: b.writeError ? { message: b.writeError } : null }; };
    q.insert = async (rows: unknown) => { calls.push({ kind: 'insert', table, rows }); return { data: null, error: b.writeError ? { message: b.writeError } : null }; };
    q.then = <R1, R2>(res?: ((v: { data: Record<string, unknown>[]; error: null }) => R1 | PromiseLike<R1>) | null, rej?: ((e: unknown) => R2 | PromiseLike<R2>) | null) =>
      Promise.resolve({ data: b.rows ? b.rows(table, ops) : [], error: null }).then(res, rej);
    return q;
  };
  return {
    calls, rpcCalls,
    auth: {
      getSession: async () => ({ data: { session: b.session === undefined ? null : b.session }, error: null }),
      signInAnonymously: b.signIn ?? (async () => ({ data: { user: { id: 'user-anon-1' } }, error: null })),
    },
    from,
    rpc: async (fn: string, args?: Record<string, unknown>) => { rpcCalls.push({ fn, args }); return { data: b.rpc ? b.rpc(fn, args) : null, error: null }; },
  };
}

function loader(client: SupabaseLike, spy?: { createArgs?: unknown[] }): () => Promise<SupabaseModuleLike> {
  return async () => ({ createClient: (...args: unknown[]) => { if (spy) spy.createArgs = args; return client; } });
}

function onlineNet(b: FakeBehaviour = {}, extra: Partial<NetOptions> = {}) {
  const client = fakeClient(b);
  const spy: { createArgs?: unknown[] } = {};
  const net = createNet({ config: CFG, loadClient: loader(client, spy), log: () => {}, ...extra });
  return { net, client, spy };
}

// ------------------------------------------------------------- timeouts ----
describe('timeout helpers', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('withTimeout passes a resolved value through and clears its timer', async () => {
    await expect(withTimeout(Promise.resolve(42), 1000)).resolves.toBe(42);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('withTimeout rejects with TimeoutError when the promise never settles', async () => {
    const p = withTimeout(new Promise<never>(() => {}), 500, 'hang');
    const assertion = expect(p).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(501);
    await assertion;
  });

  it('withTimeout propagates the original rejection (e.g. CSP TypeError)', async () => {
    const p = withTimeout(Promise.reject(new TypeError('Failed to fetch')), 1000);
    await expect(p).rejects.toThrow('Failed to fetch');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('withTimeout accepts a thenable (PostgREST builders are not Promises)', async () => {
    const thenable = { then: (res: (v: string) => void) => { res('ok'); } } as unknown as PromiseLike<string>;
    await expect(withTimeout(thenable, 1000)).resolves.toBe('ok');
  });

  it('guarded never throws: returns the fallback on error, timeout, or sync throw', async () => {
    const seen: unknown[] = [];
    await expect(guarded(() => Promise.reject(new Error('x')), 'fb', 1000, 'a', (e) => seen.push(e))).resolves.toBe('fb');
    await expect(guarded(() => { throw new Error('sync'); }, 7, 1000)).resolves.toBe(7);
    const p = guarded(() => new Promise<never>(() => {}), null, 300);
    await vi.advanceTimersByTimeAsync(301);
    await expect(p).resolves.toBeNull();
    expect(seen).toHaveLength(1);
  });
});

// -------------------------------------------------------------- offline ----
describe('createNet — offline (no config)', () => {
  it('readConfig returns null with empty window config and no VITE env', () => {
    (globalThis as any).__APP_CONFIG__ = { supabaseUrl: '', supabaseAnonKey: '' };
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    expect(readConfig()).toBeNull();
    delete (globalThis as any).__APP_CONFIG__;
    vi.unstubAllEnvs();
  });

  it('readConfig picks up window.__APP_CONFIG__ and trims a trailing slash', () => {
    (globalThis as any).__APP_CONFIG__ = { supabaseUrl: 'https://abc.supabase.co/', supabaseAnonKey: ' key ' };
    expect(readConfig()).toEqual({ url: 'https://abc.supabase.co', key: 'key' });
    delete (globalThis as any).__APP_CONFIG__;
  });

  it('readConfig rejects a non-http url', () => {
    (globalThis as any).__APP_CONFIG__ = { supabaseUrl: 'abc.supabase.co', supabaseAnonKey: 'key' };
    expect(readConfig()).toBeNull();
    delete (globalThis as any).__APP_CONFIG__;
  });

  it('every call resolves quickly with null/false and never loads supabase-js', async () => {
    const loadClient = vi.fn(async () => { throw new Error('must not be called'); });
    const net = createNet({ config: null, loadClient, log: () => {} });
    const t0 = Date.now();
    await net.init();
    expect(net.online).toBe(false);
    expect(await net.pullSave()).toBeNull();
    expect(await net.flushLogs([{ questionId: 'q', lessonId: 'l', subject: 'math', correct: true, firstTry: true, elapsedMs: 1, purpose: 'wild', at: 'x' }])).toBe(false);
    expect(await net.fetchQuestions(['m11-u1-l1'])).toBeNull();
    expect(await net.fetchCurriculum()).toBeNull();
    expect(await net.createTransferCode()).toBeNull();
    expect(await net.claimTransferCode('ABC234')).toBeNull();
    expect(() => net.pushSave(fakeSave())).not.toThrow();
    await net.flush();
    expect(Date.now() - t0).toBeLessThan(200);
    expect(loadClient).not.toHaveBeenCalled();
  });

  it('createNet() with no injected config and no globals is offline', async () => {
    delete (globalThis as any).__APP_CONFIG__;
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    const net = createNet({ log: () => {} });
    await net.init();
    expect(net.online).toBe(false);
    vi.unstubAllEnvs();
  });
});

// --------------------------------------------------------- init failures ----
describe('createNet — init degrades to offline on any failure', () => {
  afterEach(() => vi.useRealTimers());

  it('CSP-style TypeError from signInAnonymously → offline, init resolves, no throw', async () => {
    const { net, client } = onlineNet({ signIn: async () => { throw new TypeError('Failed to fetch'); } });
    await expect(net.init()).resolves.toBeUndefined();
    expect(net.online).toBe(false);
    expect(await net.fetchQuestions(['m11-u1-l1'])).toBeNull();
    expect(client.calls).toHaveLength(0);
  });

  it('auth error payload (no throw) → offline', async () => {
    const { net } = onlineNet({ signIn: async () => ({ data: { user: null }, error: { message: 'Anonymous sign-ins are disabled' } }) });
    await net.init();
    expect(net.online).toBe(false);
  });

  it('dynamic import failure → offline', async () => {
    const net = createNet({ config: CFG, loadClient: async () => { throw new Error('chunk load failed'); }, log: () => {} });
    await net.init();
    expect(net.online).toBe(false);
  });

  it('sign-in that never resolves → offline after the 4 s timeout', async () => {
    vi.useFakeTimers();
    const { net } = onlineNet({ signIn: () => new Promise(() => {}) });
    const p = net.init();
    await vi.advanceTimersByTimeAsync(4100);
    await p;
    expect(net.online).toBe(false);
  });

  it('init is idempotent (one sign-in for concurrent callers)', async () => {
    const signIn = vi.fn(async () => ({ data: { user: { id: 'u1' } }, error: null }));
    const { net } = onlineNet({ signIn });
    await Promise.all([net.init(), net.init(), net.init()]);
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(net.online).toBe(true);
  });
});

// --------------------------------------------------------------- online ----
describe('createNet — online with a fake supabase client', () => {
  afterEach(() => vi.useRealTimers());

  it('reuses a stored session instead of signing in again, with persistSession + storageKey', async () => {
    const signIn = vi.fn();
    const { net, spy } = onlineNet({ session: { user: { id: 'stored-user' } }, signIn: signIn as any });
    await net.init();
    expect(net.online).toBe(true);
    expect(signIn).not.toHaveBeenCalled();
    const [url, key, options] = spy.createArgs as [string, string, { auth: Record<string, unknown> }];
    expect(url).toBe(CFG.url);
    expect(key).toBe(CFG.key);
    expect(options.auth).toMatchObject({ persistSession: true, storageKey: 'pokestudy.auth', autoRefreshToken: true });
  });

  it('fetchQuestions selects active rows for the lessons and unwraps data', async () => {
    const q1 = { id: 'm11-u1-l1-001', lessonId: 'm11-u1-l1', subject: 'math', type: 'count', prompt: '몇 개?', answerMode: 'numpad', answer: '3', difficulty: 1 };
    let captured: Op[] = [];
    const { net } = onlineNet({ rows: (table, ops) => { captured = ops; return table === 'questions' ? [{ data: q1 }, { data: { broken: true } }] : []; } });
    await net.init();
    const qs = await net.fetchQuestions(['m11-u1-l1', 'm11-u1-l1', 'm11-u1-l2']);
    expect(qs).toEqual([q1]);
    expect(captured).toContainEqual(['in', ['lesson_id', ['m11-u1-l1', 'm11-u1-l2']]]);
    expect(captured).toContainEqual(['eq', ['is_active', true]]);
    expect(await net.fetchQuestions([])).toEqual([]);
  });

  it('fetchQuestions pages through 1000-row responses', async () => {
    const page = (n: number, from: number) => Array.from({ length: n }, (_, i) => ({ data: { id: `q${from + i}`, lessonId: 'l', subject: 'math', prompt: 'p', answer: '1' } }));
    const { net } = onlineNet({
      rows: (_t, ops) => {
        const r = ops.find((o) => o[0] === 'range')![1] as [number, number];
        return r[0] === 0 ? page(1000, 0) : page(5, 1000);
      },
    });
    await net.init();
    const qs = await net.fetchQuestions(['l']);
    expect(qs).toHaveLength(1005);
  });

  it('fetchCurriculum maps snake_case rows to Unit/Lesson', async () => {
    const { net } = onlineNet({
      rows: (table) => table === 'units'
        ? [{ id: 'm11-u1', subject: 'math', grade: 1, semester: 1, unit_no: 1, title: '9까지의 수', description: null, order: 1, updated_at: '2026-09-30T05:00:00+00:00' }]
        : [{ id: 'm11-u1-l1', unit_id: 'm11-u1', subject: 'math', grade: 1, semester: 1, lesson_no: 1, title: '세기', goal: '1~5 세기', order: 1, required_correct: 8, is_review: false, updated_at: '2026-09-29T00:00:00+00:00' }],
    });
    await net.init();
    const cur = await net.fetchCurriculum();
    expect(cur).toEqual({
      version: 'cloud-2026-09-30T05:00:00',
      units: [{ id: 'm11-u1', subject: 'math', grade: 1, semester: 1, unitNo: 1, title: '9까지의 수', order: 1 }],
      lessons: [{ id: 'm11-u1-l1', unitId: 'm11-u1', subject: 'math', grade: 1, semester: 1, lessonNo: 1, title: '세기', goal: '1~5 세기', order: 1, requiredCorrect: 8 }],
    });
  });

  it('fetchCurriculum returns null when the cloud tables are empty', async () => {
    const { net } = onlineNet({ rows: () => [] });
    await net.init();
    expect(await net.fetchCurriculum()).toBeNull();
  });

  it('pullSave returns the own row save when it looks like SaveData, else null', async () => {
    const save = fakeSave('cloud');
    const { net } = onlineNet({ single: (table) => (table === 'players' ? { save } : null) });
    await net.init();
    expect(await net.pullSave()).toEqual(save);

    const { net: net2 } = onlineNet({ single: () => ({ save: { garbage: true } }) });
    await net2.init();
    expect(await net2.pullSave()).toBeNull();
  });

  it('pushSave debounces 20 s and upserts only the latest save', async () => {
    vi.useFakeTimers();
    const { net, client } = onlineNet();
    await net.init();
    net.pushSave(fakeSave('a'));
    net.pushSave(fakeSave('b'));
    await vi.advanceTimersByTimeAsync(19_000);
    expect(client.calls).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1_100);
    expect(client.calls).toHaveLength(1);
    const call = client.calls[0]!;
    expect(call.kind).toBe('upsert');
    expect(call.table).toBe('players');
    expect(call.opts).toEqual({ onConflict: 'id' });
    expect(call.rows).toMatchObject({ id: 'user-anon-1', name: '지우', save: { id: 'b' }, save_updated_at: '2026-09-30T01:00:00.000Z' });
  });

  it('flush() sends the pending save immediately (visibilitychange path)', async () => {
    const { net, client } = onlineNet();
    await net.init();
    net.pushSave(fakeSave('now'));
    await net.flush();
    expect(client.calls).toHaveLength(1);
    await net.flush();
    expect(client.calls).toHaveLength(1);
  });

  it('pushSave before init completes is delivered once online', async () => {
    const { net, client } = onlineNet();
    net.pushSave(fakeSave('early'));
    await net.init();
    await net.flush();
    expect(client.calls).toHaveLength(1);
  });

  it('flushLogs upserts idempotently and reports success / failure / empty', async () => {
    const { net, client } = onlineNet();
    await net.init();
    const logs: AnswerLog[] = [
      { questionId: 'q1', lessonId: 'l1', subject: 'math', correct: true, firstTry: true, elapsedMs: 1234.6, purpose: 'wild', at: '2026-09-30T01:02:03.000Z' },
      { questionId: 'q2', lessonId: 'l1', subject: 'english', correct: false, firstTry: false, elapsedMs: -5, purpose: 'gym', at: '2026-09-30T01:02:04.000Z' },
    ];
    expect(await net.flushLogs([])).toBe(true);
    expect(await net.flushLogs(logs)).toBe(true);
    expect(client.calls).toHaveLength(1);
    expect(client.calls[0]!.opts).toEqual({ onConflict: 'player_id,question_id,answered_at', ignoreDuplicates: true });
    expect(client.calls[0]!.rows).toEqual([
      { player_id: 'user-anon-1', question_id: 'q1', lesson_id: 'l1', subject: 'math', correct: true, first_try: true, elapsed_ms: 1235, purpose: 'wild', answered_at: '2026-09-30T01:02:03.000Z' },
      { player_id: 'user-anon-1', question_id: 'q2', lesson_id: 'l1', subject: 'english', correct: false, first_try: false, elapsed_ms: 0, purpose: 'gym', answered_at: '2026-09-30T01:02:04.000Z' },
    ]);

    const { net: failing } = onlineNet({ writeError: 'new row violates row-level security policy' });
    await failing.init();
    expect(await failing.flushLogs(logs)).toBe(false);
  });

  it('transfer codes go through the RPCs and validate input', async () => {
    const save = fakeSave('moved');
    const { net, client } = onlineNet({ rpc: (fn) => (fn === 'create_transfer_code' ? 'AB3XYZ' : save) });
    await net.init();
    expect(await net.createTransferCode()).toBe('AB3XYZ');
    expect(await net.claimTransferCode(' ab3xyz ')).toEqual(save);
    expect(client.rpcCalls).toEqual([{ fn: 'create_transfer_code', args: undefined }, { fn: 'claim_transfer_code', args: { p_code: 'AB3XYZ' } }]);
    expect(await net.claimTransferCode('0O1I')).toBeNull();   // look-alike chars are not in the alphabet
    expect(client.rpcCalls).toHaveLength(2);
  });

  it('a call that hangs resolves to its fallback after the timeout without flipping online', async () => {
    vi.useFakeTimers();
    const client = fakeClient();
    client.rpc = () => new Promise(() => {});
    const net = createNet({ config: CFG, loadClient: loader(client), log: () => {} });
    await net.init();
    const p = net.createTransferCode();
    await vi.advanceTimersByTimeAsync(4100);
    expect(await p).toBeNull();
    expect(net.online).toBe(true);
  });
});
