// Data loading (boot). Every fetch is relative (asset()) and tolerant: a missing or broken file
// falls back to placeholders so the game still boots (offline / partial builds).
import type { AtlasInfo, GameData, Habitat, PokeType, Species } from '../core/types';
import { asset } from '../core/util';
import { TRAINERS } from '../story/index';

export const SPECIES_COUNT = 251;

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(asset(path), { cache: 'default' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Placeholder species used when pokemon.json is missing or lacks an id. */
export function placeholderSpecies(id: number): Species {
  return {
    id,
    name: `No.${String(id).padStart(3, '0')}`,
    nameEn: `No.${String(id).padStart(3, '0')}`,
    types: ['노말'],
    genus: '수수께끼포켓몬',
    flavor: '아직 알려지지 않은 포켓몬이에요.',
    height: 0.5,
    weight: 5,
    captureRate: 190,
    tier: 1,
    habitats: ['grassland'],
    obtainable: 'wild',
    evolvesTo: [],
    isLegendary: false,
    isBaby: false,
    color: 'gray',
  };
}

/** Fill any missing fields of a species record with safe defaults. */
export function repairSpecies(raw: Partial<Species> & { id: number }): Species {
  const base = placeholderSpecies(raw.id);
  const types = Array.isArray(raw.types) && raw.types.length ? (raw.types as PokeType[]) : base.types;
  const habitats = Array.isArray(raw.habitats) ? (raw.habitats as Habitat[]) : base.habitats;
  const tier = typeof raw.tier === 'number' && raw.tier >= 1 && raw.tier <= 9 ? raw.tier : base.tier;
  const evolvesTo = Array.isArray(raw.evolvesTo)
    ? raw.evolvesTo.filter((e) => e && typeof e.id === 'number').map((e) => ({ id: e.id, level: typeof e.level === 'number' ? e.level : 30 }))
    : [];
  return {
    ...base,
    ...raw,
    types, habitats, tier, evolvesTo,
    moves: Array.isArray(raw.moves) ? raw.moves.filter(m => m && Number.isInteger(m.id) && m.id > 0 &&
      typeof m.name === 'string' && m.name.length > 0 && typeof m.type === 'string' &&
      Number.isInteger(m.level) && m.level >= 0 && m.level <= 100 && (m.kind === 'physical' || m.kind === 'special')) : [],
    obtainable: raw.obtainable === 'evolve' || raw.obtainable === 'event' ? raw.obtainable : 'wild',
    isLegendary: !!raw.isLegendary,
    isBaby: !!raw.isBaby,
    name: typeof raw.name === 'string' && raw.name ? raw.name : base.name,
    nameEn: typeof raw.nameEn === 'string' && raw.nameEn ? raw.nameEn : base.nameEn,
  };
}

async function loadSpecies(): Promise<Species[]> {
  const raw = await fetchJson<unknown>('data/pokemon.json');
  const list: Species[] = [];
  const arr = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' && Array.isArray((raw as any).species)) ? (raw as any).species : null;
  const byId = new Map<number, Species>();
  if (arr) {
    for (const s of arr as any[]) {
      if (!s || typeof s.id !== 'number' || s.id < 1) continue;
      byId.set(s.id, repairSpecies(s));
    }
  } else {
    console.warn('[data] pokemon.json missing — using placeholder species');
  }
  const count = Math.max(SPECIES_COUNT, ...Array.from(byId.keys()));
  for (let id = 1; id <= count; id++) list.push(byId.get(id) ?? placeholderSpecies(id));
  return list;
}

function resolveAtlasUrl(url: unknown, fallbackFile: string): string {
  if (typeof url === 'string' && url) {
    if (/^(https?:|data:|blob:)/.test(url)) return url;
    if (url.includes('/')) return asset(url);
    return asset('assets/pokemon/' + url);
  }
  return asset('assets/pokemon/' + fallbackFile);
}

async function loadAtlas(): Promise<AtlasInfo> {
  const raw = await fetchJson<any>('assets/pokemon/atlas.json');
  const part = (k: 'front' | 'back' | 'icons', cell: number): AtlasInfo['front'] => {
    const p = raw?.[k] ?? {};
    return {
      url: resolveAtlasUrl(p.url ?? p.file, `${k}.png`),
      cell: typeof p.cell === 'number' && p.cell > 0 ? p.cell : cell,
      cols: typeof p.cols === 'number' && p.cols > 0 ? p.cols : 16,
    };
  };
  return {
    front: part('front', 56),
    back: part('back', 56),
    icons: part('icons', 32),
    count: typeof raw?.count === 'number' ? raw.count : SPECIES_COUNT,
  };
}

function resolveImgUrl(file: string): string {
  if (/^(https?:|data:|blob:)/.test(file)) return file;
  if (file.includes('/')) return asset(file);
  return asset('assets/img/' + file);
}

/** manifest.json may be an array of {key,file,...} or an object {key: file | {file|url|src}}. */
async function loadImages(): Promise<Record<string, string>> {
  const raw = await fetchJson<any>('assets/img/manifest.json');
  const out: Record<string, string> = {};
  if (!raw) return out;
  const entries: any[] = Array.isArray(raw) ? raw : Array.isArray(raw.images) ? raw.images : Array.isArray(raw.files) ? raw.files : null as any;
  if (entries) {
    for (const e of entries) {
      if (!e) continue;
      if (typeof e === 'string') { out[e.replace(/\.[a-z0-9]+$/i, '')] = resolveImgUrl(e); continue; }
      const file = e.file ?? e.url ?? e.src ?? e.path;
      const key = e.key ?? e.id ?? e.name ?? (typeof file === 'string' ? file.replace(/^.*\//, '').replace(/\.[a-z0-9]+$/i, '') : null);
      if (typeof key === 'string' && typeof file === 'string') out[key] = resolveImgUrl(file);
    }
  } else if (typeof raw === 'object') {
    const src = raw.images && typeof raw.images === 'object' && !Array.isArray(raw.images) ? raw.images : raw;
    for (const [key, v] of Object.entries<any>(src)) {
      if (typeof v === 'string') out[key] = resolveImgUrl(v);
      else if (v && typeof v === 'object') {
        const file = v.file ?? v.url ?? v.src ?? v.path;
        if (typeof file === 'string') out[key] = resolveImgUrl(file);
      }
    }
  }
  return out;
}

export async function loadData(): Promise<GameData> {
  const [species, atlas, images] = await Promise.all([loadSpecies(), loadAtlas(), loadImages()]);
  const byId = new Map<number, Species>();
  for (const s of species) byId.set(s.id, s);
  return {
    species,
    speciesById: (id: number) => byId.get(id) ?? placeholderSpecies(id),
    atlas,
    images,
    trainers: TRAINERS,
  };
}
