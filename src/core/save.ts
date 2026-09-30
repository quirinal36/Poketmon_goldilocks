// SaveService (DESIGN §4). localStorage key 'pokestudy.save.v1'; write() also pushes to the cloud
// via G.net.pushSave (debounced there). repairSave() fills missing fields of older/partial saves.
import type { Dir, ItemId, LearnState, MapId, PokemonInstance, SaveData, SaveService } from './types';
import { G } from '../game';
import { todayStr, uid } from './util';

export const SAVE_KEY = 'pokestudy.save.v1';

export const MAP_IDS: MapId[] = [
  'pallet', 'player_house_1f', 'player_house_2f', 'rival_house', 'oak_lab',
  'route1', 'viridian', 'viridian_center', 'viridian_mart', 'viridian_school',
  'route22', 'route2', 'forest', 'pewter', 'pewter_center', 'pewter_mart', 'pewter_gym', 'route3',
];
const DIRS: Dir[] = ['up', 'down', 'left', 'right'];

/**
 * Default LearnState. NOTE: the LEARN agent may export an identical `defaultLearnState` from
 * src/learn/progress.ts; this local copy keeps the save module self-contained (see report).
 */
export function defaultLearnState(): LearnState {
  const today = todayStr();
  return {
    parent: { pace: 1, subjects: { math: true, english: true }, ttsQuestions: true, ttsDialog: false },
    subjects: {
      math: { current: null, completed: {}, lessonStats: {} },
      english: { current: null, completed: {}, lessonStats: {} },
    },
    daily: {
      date: today,
      startedLessons: { math: [], english: [] },
      correct: { math: 0, english: 0 },
      answered: { math: 0, english: 0 },
      rewardClaimed: false,
    },
    qstats: {},
    recent: [],
    mistakes: [],
    pendingLogs: [],
    streak: { days: 0, lastDate: '' },
  };
}

export function defaultSave(): SaveData {
  const now = new Date().toISOString();
  return {
    version: 1,
    id: uid('s_'),
    createdAt: now,
    updatedAt: now,
    playTimeSec: 0,
    player: {
      name: '골드',
      rivalName: '그린',
      appearance: { gender: 'boy', skin: 0, hairColor: 0, hairStyle: 0, outfit: 0, hat: true },
      money: 500,
      badges: [],
    },
    party: [],
    box: [],
    dex: { seen: [], caught: [] },
    bag: { pokeball: 0, potion: 1 },
    pos: { map: 'player_house_2f', x: 4, y: 4, facing: 'down' },
    lastHeal: { map: 'player_house_1f', x: 3, y: 3 },
    flags: {},
    defeatedTrainers: [],
    learn: defaultLearnState(),
    settings: { music: 0.6, sfx: 0.8, textSpeed: 'normal', ttsRate: 0.9 },
    stats: { correct: 0, wrong: 0, battlesWon: 0, caught: 0, stampsTotal: 0 },
  };
}

const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Recursively fill missing/mistyped fields from defaults (arrays & dictionaries are taken as-is). */
function fill<T>(def: T, raw: unknown, dictKeys = false): T {
  if (Array.isArray(def)) return (Array.isArray(raw) ? raw : def) as T;
  if (isObj(def)) {
    if (!isObj(raw)) return structuredCloneSafe(def);
    if (dictKeys) return { ...(raw as any) } as T;
    const out: any = {};
    for (const k of Object.keys(def as any)) {
      const dv = (def as any)[k];
      const rv = (raw as any)[k];
      const dict = k === 'completed' || k === 'lessonStats' || k === 'qstats' || k === 'flags' || k === 'bag' || k === 'images';
      out[k] = fill(dv, rv, dict);
    }
    // keep unknown extra keys (forward compat)
    for (const k of Object.keys(raw as any)) if (!(k in out)) out[k] = (raw as any)[k];
    return out as T;
  }
  if (raw === undefined || raw === null) return def;
  if (typeof def !== typeof raw) return def;
  return raw as T;
}

function structuredCloneSafe<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function repairPokemon(p: any): PokemonInstance | null {
  if (!isObj(p) || typeof p.speciesId !== 'number') return null;
  const level = typeof p.level === 'number' && p.level >= 1 ? Math.floor(p.level) : 5;
  const maxHp = typeof p.maxHp === 'number' && p.maxHp > 0 ? p.maxHp : 18 + 3 * level;
  return {
    uid: typeof p.uid === 'string' && p.uid ? p.uid : uid('p_'),
    speciesId: p.speciesId,
    nickname: typeof p.nickname === 'string' && p.nickname ? p.nickname : undefined,
    level,
    exp: typeof p.exp === 'number' ? p.exp : 0,
    hp: typeof p.hp === 'number' ? Math.max(0, Math.min(maxHp, p.hp)) : maxHp,
    maxHp,
    caughtAt: typeof p.caughtAt === 'string' ? p.caughtAt : new Date().toISOString(),
    caughtArea: p.caughtArea,
    friendship: typeof p.friendship === 'number' ? p.friendship : 70,
  };
}

/** Repair/migrate a raw save object. Returns null if it is not a save at all. */
export function repairSave(raw: unknown): SaveData | null {
  if (!isObj(raw)) return null;
  const d = fill(defaultSave(), raw) as SaveData;
  d.version = 1;
  if (typeof d.id !== 'string' || !d.id) d.id = uid('s_');
  d.party = (Array.isArray(d.party) ? d.party : []).map(repairPokemon).filter((p): p is PokemonInstance => !!p).slice(0, 6);
  d.box = (Array.isArray(d.box) ? d.box : []).map(repairPokemon).filter((p): p is PokemonInstance => !!p);
  d.dex.seen = uniqSorted(Array.isArray(d.dex.seen) ? d.dex.seen : []);
  d.dex.caught = uniqSorted(Array.isArray(d.dex.caught) ? d.dex.caught : []);
  d.player.badges = Array.isArray(d.player.badges) ? d.player.badges.filter((b) => typeof b === 'string') : [];
  d.defeatedTrainers = Array.isArray(d.defeatedTrainers) ? d.defeatedTrainers.filter((b) => typeof b === 'string') : [];
  if (typeof d.player.money !== 'number' || !Number.isFinite(d.player.money)) d.player.money = 500;
  d.player.money = Math.max(0, Math.floor(d.player.money));
  if (!MAP_IDS.includes(d.pos.map)) d.pos = { ...defaultSave().pos };
  if (!DIRS.includes(d.pos.facing)) d.pos.facing = 'down';
  if (!MAP_IDS.includes(d.lastHeal.map)) d.lastHeal = { ...defaultSave().lastHeal };
  for (const k of Object.keys(d.bag) as ItemId[]) {
    const v = (d.bag as any)[k];
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) delete d.bag[k];
    else d.bag[k] = Math.floor(v);
  }
  const s = d.settings;
  s.music = clamp01(s.music, 0.6); s.sfx = clamp01(s.sfx, 0.8);
  if (!['slow', 'normal', 'fast'].includes(s.textSpeed)) s.textSpeed = 'normal';
  if (typeof s.ttsRate !== 'number' || s.ttsRate < 0.5 || s.ttsRate > 1.5) s.ttsRate = 0.9;
  const pace = d.learn.parent.pace as number;
  if (![0, 1, 2, 3].includes(pace)) d.learn.parent.pace = 1;
  if (!Array.isArray(d.learn.recent)) d.learn.recent = [];
  if (!Array.isArray(d.learn.mistakes)) d.learn.mistakes = [];
  if (!Array.isArray(d.learn.pendingLogs)) d.learn.pendingLogs = [];
  for (const sub of ['math', 'english'] as const) {
    if (!Array.isArray(d.learn.daily.startedLessons[sub])) d.learn.daily.startedLessons[sub] = [];
    if (typeof d.learn.daily.correct[sub] !== 'number') d.learn.daily.correct[sub] = 0;
    if (typeof d.learn.daily.answered[sub] !== 'number') d.learn.daily.answered[sub] = 0;
  }
  return d;
}

function clamp01(v: unknown, def: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : def;
}

function uniqSorted(a: number[]): number[] {
  return Array.from(new Set(a.filter((n) => typeof n === 'number' && Number.isFinite(n)))).sort((x, y) => x - y);
}

function readRaw(): unknown | null {
  try {
    const s = localStorage.getItem(SAVE_KEY);
    if (!s) return null;
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export interface SaveServiceExt extends SaveService {
  /** Replace the stored save (e.g. cloud pull / transfer code) without loading it into `data`. */
  importData(d: SaveData): boolean;
  /** Read the stored save (repaired) without loading it into `data`. */
  peek(): SaveData | null;
}

export function createSave(): SaveServiceExt {
  const svc: SaveServiceExt = {
    data: defaultSave(),

    exists(): boolean {
      return repairSave(readRaw()) !== null;
    },

    peek(): SaveData | null {
      return repairSave(readRaw());
    },

    newGame(): SaveData {
      svc.data = defaultSave();
      svc.write('new');
      return svc.data;
    },

    load(): SaveData | null {
      const d = repairSave(readRaw());
      if (!d) return null;
      svc.data = d;
      return d;
    },

    write(reason = 'manual'): void {
      const d = svc.data;
      d.updatedAt = new Date().toISOString();
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(d));
      } catch (e) {
        console.warn('[save] localStorage write failed', e);
      }
      try {
        G.net?.pushSave?.(d);
      } catch (e) {
        console.warn('[save] pushSave failed', e);
      }
      if (G.debug) console.debug('[save] write:', reason);
    },

    reset(): void {
      try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
      svc.data = defaultSave();
    },

    importData(d: SaveData): boolean {
      const r = repairSave(d);
      if (!r) return false;
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(r)); return true; } catch { return false; }
    },

    flag(key: string): boolean {
      const v = svc.data.flags[key];
      if (v === undefined || v === null) return false;
      if (typeof v === 'string') return v !== '' && v !== '0' && v !== 'false';
      return !!v;
    },

    setFlag(key: string, value: boolean | number | string = true): void {
      if (value === false) delete svc.data.flags[key];
      else svc.data.flags[key] = value;
    },

    addItem(item: ItemId, n = 1): void {
      const cur = svc.data.bag[item] ?? 0;
      svc.data.bag[item] = Math.max(0, cur + n);
    },

    useItem(item: ItemId, n = 1): boolean {
      const cur = svc.data.bag[item] ?? 0;
      if (cur < n) return false;
      svc.data.bag[item] = cur - n;
      return true;
    },

    addMoney(n: number): void {
      svc.data.player.money = Math.max(0, Math.floor(svc.data.player.money + n));
    },

    addPokemon(p: PokemonInstance): 'party' | 'box' {
      if (svc.data.party.length < 6) { svc.data.party.push(p); return 'party'; }
      svc.data.box.push(p);
      return 'box';
    },

    markSeen(speciesId: number): void {
      const a = svc.data.dex.seen;
      if (!a.includes(speciesId)) { a.push(speciesId); a.sort((x, y) => x - y); }
    },

    markCaught(speciesId: number): void {
      svc.markSeen(speciesId);
      const a = svc.data.dex.caught;
      if (!a.includes(speciesId)) { a.push(speciesId); a.sort((x, y) => x - y); }
    },
  };
  return svc;
}
