// Wild encounters (DESIGN §7.5). encounterPool/rollLevel are pure; rollEncounter reads G.
import type { AreaId, Habitat, Species } from '../core/types';
import { G } from '../game';
import { weightedPick } from '../core/util';

/** Tier n+1 unlocks when study stage >= TIER_STAGES[n]. Tier 9 (legendary) is event-only. */
export const TIER_STAGES = [0, 3, 8, 15, 25, 40, 60, 90] as const;

export function unlockedTier(stage: number): number {
  let t = 1;
  for (let i = 0; i < TIER_STAGES.length; i++) if (stage >= TIER_STAGES[i]) t = i + 1;
  return Math.min(8, t);
}

export const AREA_HABITATS: Record<AreaId, { land: Habitat[]; water: Habitat[] }> = {
  route1: { land: ['grassland', 'urban'], water: ['waters-edge'] },
  route2: { land: ['grassland', 'forest'], water: ['waters-edge'] },
  forest: { land: ['forest'], water: ['waters-edge'] },
  route22: { land: ['grassland'], water: ['waters-edge', 'sea'] },
  route3: { land: ['mountain', 'rough-terrain', 'cave'], water: ['waters-edge'] },
};

export const AREA_LEVELS: Record<AreaId, [number, number]> = {
  route1: [2, 4], route2: [3, 5], forest: [3, 6], route22: [4, 7], route3: [8, 12],
};

export interface PoolEntry { species: Species; weight: number }

/** Species pool for an area with weights (pure). fishing → water-type species of the area's water habitats. */
export function encounterPool(
  area: AreaId, stage: number, caughtIds: number[], species: Species[], opts: { fishing?: boolean } = {},
): PoolEntry[] {
  const unlocked = unlockedTier(stage);
  const hab = AREA_HABITATS[area] ?? AREA_HABITATS.route1;
  const habitats = opts.fishing ? hab.water : hab.land;
  const caught = new Set(caughtIds);
  const out: PoolEntry[] = [];
  for (const s of species) {
    if (!s || s.obtainable !== 'wild') continue;
    if (s.tier > unlocked || s.tier >= 9) continue;
    if (!s.habitats.some((h) => habitats.includes(h))) continue;
    if (opts.fishing && !s.types.includes('물')) continue;
    let w = (10 - s.tier) ** 2;
    if (caught.has(s.id)) w *= 0.5;
    if (s.tier === unlocked) w *= 1.5;
    out.push({ species: s, weight: w });
  }
  return out;
}

/** Level: area base range + floor(stage/10), capped at +20 (pure). */
export function rollLevel(area: AreaId, stage: number, rand: () => number = Math.random): number {
  const [lo, hi] = AREA_LEVELS[area] ?? AREA_LEVELS.route1;
  const bonus = Math.min(20, Math.floor(Math.max(0, stage) / 10));
  return lo + Math.floor(rand() * (hi - lo + 1)) + bonus;
}

export interface Encounter { speciesId: number; level: number; special: boolean }

/**
 * Roll a wild encounter for an area using live game state (G.data.species, G.learn.stage(),
 * save.dex.caught). Consumes the 'daily_special' flag (grass only): guarantees a species with
 * tier <= unlocked+1 (preferring uncaught, any habitat) and returns special: true.
 */
export function rollEncounter(area: AreaId, opts: { fishing?: boolean; rand?: () => number } = {}): Encounter | null {
  const rand = opts.rand ?? Math.random;
  const species = G.data?.species ?? [];
  let stage = 0;
  try { stage = G.learn?.stage?.() ?? 0; } catch { stage = 0; }
  const save = G.save?.data;
  const caught = save?.dex?.caught ?? [];
  const level = rollLevel(area, stage, rand);

  if (!opts.fishing && save && G.save.flag('daily_special')) {
    const unlocked = unlockedTier(stage);
    const caughtSet = new Set(caught);
    const cands = species.filter((s) => s.obtainable === 'wild' && s.tier <= unlocked + 1 && s.tier < 9);
    if (cands.length) {
      const pickFrom = cands.filter((s) => s.tier === Math.min(8, unlocked + 1) && !caughtSet.has(s.id));
      const pool = pickFrom.length ? pickFrom : cands.filter((s) => !caughtSet.has(s.id)).length ? cands.filter((s) => !caughtSet.has(s.id)) : cands;
      const s = weightedPick(pool, (x) => (10 - x.tier) ** 2, rand);
      G.save.setFlag('daily_special', false);
      return { speciesId: s.id, level: level + 1, special: true };
    }
  }

  let pool = encounterPool(area, stage, caught, species, { fishing: opts.fishing });
  if (!pool.length && opts.fishing) {
    // fallback: any water type reachable at this tier
    pool = species.filter((s) => s.obtainable === 'wild' && s.types.includes('물') && s.tier <= unlockedTier(stage))
      .map((s) => ({ species: s, weight: (10 - s.tier) ** 2 }));
  }
  if (!pool.length) {
    pool = species.filter((s) => s.obtainable === 'wild' && s.tier <= unlockedTier(stage)).map((s) => ({ species: s, weight: (10 - s.tier) ** 2 }));
  }
  if (!pool.length) return null;
  const e = weightedPick(pool, (p) => p.weight, rand);
  return { speciesId: e.species.id, level, special: false };
}
