// Runtime map: resolves the ASCII tiles through the legend, structure footprints, autotile masks
// and quick lookups for warps/signs/objects.
import type { MapDef, SignDef, StructureKind, TileId, TileInfo, WarpDef } from '../core/types';
import { STRUCTURES, TILE_INFO } from '../art';
import { DEFAULT_LEGEND } from '../maps/legend';

export interface ObjectDef { x: number; y: number; script?: string; text?: string[] }
export interface StructureAt { kind: StructureKind; x: number; y: number; w: number; h: number; door: { x: number; y: number } | null }

export interface RuntimeMap {
  def: MapDef;
  w: number;
  h: number;
  tiles: TileId[];
  /** 4-bit autotile neighbor mask per tile (N=1,E=2,S=4,W=8) */
  masks: Uint8Array;
  /** 0 = none, 1 = solid part of a structure, 2 = door tile of a structure */
  foot: Uint8Array;
  structures: StructureAt[];
  warps: Map<number, WarpDef>;
  signs: Map<number, SignDef>;
  objects: Map<number, ObjectDef>;
}

export const key = (x: number, y: number): number => (y + 1) * 4096 + (x + 1);

const FALLBACK_INFO: TileInfo = { solid: false };
const warned = new Set<string>();

export function tileInfo(id: TileId): TileInfo {
  return TILE_INFO[id] ?? FALLBACK_INFO;
}

export function buildMap(def: MapDef): RuntimeMap {
  const legend: Record<string, TileId> = { ...DEFAULT_LEGEND, ...(def.legend ?? {}) };
  const w = Math.max(1, def.width | 0), h = Math.max(1, def.height | 0);
  const tiles: TileId[] = new Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = def.tiles[y] ?? '';
    for (let x = 0; x < w; x++) {
      const ch = row[x] ?? '.';
      let id = legend[ch];
      if (!id || !TILE_INFO[id]) {
        const k = `${def.id}:${ch}`;
        if (!warned.has(k)) { warned.add(k); console.warn(`[map ${def.id}] unknown tile char '${ch}' — using grass`); }
        id = def.indoor ? 'floor_wood' : 'grass';
      }
      tiles[y * w + x] = id;
    }
  }
  const rm: RuntimeMap = {
    def, w, h, tiles, masks: new Uint8Array(w * h), foot: new Uint8Array(w * h), structures: [],
    warps: new Map(), signs: new Map(), objects: new Map(),
  };
  // structures
  for (const s of def.structures ?? []) {
    const info = STRUCTURES[s.kind];
    if (!info) continue;
    rm.structures.push({ kind: s.kind, x: s.x, y: s.y, w: info.w, h: info.h, door: info.door });
    for (let dy = 0; dy < info.h; dy++) for (let dx = 0; dx < info.w; dx++) {
      const x = s.x + dx, y = s.y + dy;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const isDoor = info.door && info.door.x === dx && info.door.y === dy;
      rm.foot[y * w + x] = isDoor ? 2 : 1;
    }
  }
  // autotile masks (out of bounds counts as same family)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const info = tileInfo(tiles[y * w + x]);
    if (!info.autotile) continue;
    const fam = info.family ?? tiles[y * w + x];
    const same = (nx: number, ny: number): boolean => {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) return true;
      const ni = tileInfo(tiles[ny * w + nx]);
      return (ni.family ?? tiles[ny * w + nx]) === fam;
    };
    let m = 0;
    if (same(x, y - 1)) m |= 1;
    if (same(x + 1, y)) m |= 2;
    if (same(x, y + 1)) m |= 4;
    if (same(x - 1, y)) m |= 8;
    rm.masks[y * w + x] = m;
  }
  for (const wp of def.warps ?? []) rm.warps.set(key(wp.x, wp.y), wp);
  for (const s of def.signs ?? []) rm.signs.set(key(s.x, s.y), s);
  for (const o of def.objects ?? []) rm.objects.set(key(o.x, o.y), o);
  return rm;
}

export function inBounds(rm: RuntimeMap, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < rm.w && y < rm.h;
}

export function tileAt(rm: RuntimeMap, x: number, y: number): TileId {
  if (!inBounds(rm, x, y)) return rm.def.border;
  return rm.tiles[y * rm.w + x];
}

export function infoAt(rm: RuntimeMap, x: number, y: number): TileInfo {
  return tileInfo(tileAt(rm, x, y));
}

export function maskAt(rm: RuntimeMap, x: number, y: number): number {
  if (!inBounds(rm, x, y)) return 15;
  return rm.masks[y * rm.w + x];
}

export function footAt(rm: RuntimeMap, x: number, y: number): number {
  if (!inBounds(rm, x, y)) return 0;
  return rm.foot[y * rm.w + x];
}

/** Terrain-only blocking (tile solid or structure footprint except door). Out of bounds = blocked. */
export function terrainBlocked(rm: RuntimeMap, x: number, y: number): boolean {
  if (!inBounds(rm, x, y)) return true;
  const f = rm.foot[y * rm.w + x];
  if (f === 1) return true;
  if (f === 2) return false;
  return infoAt(rm, x, y).solid;
}
