// STUB — owned by the ART agent (replace everything; keep the exported API).
import type { Dir, ItemId, NpcSpriteId, PlayerAppearance, StructureInfo, StructureKind, TileId, TileInfo } from '../core/types';

export const SKIN_TONES = ['#f8d0a8', '#e0a878', '#a86840'];
export const HAIR_COLORS = ['#302018', '#784020', '#e8b030', '#c03020', '#3050a0', '#70a040'];
export const OUTFIT_COLORS = ['#d83030', '#3068d8', '#30a048', '#e89020', '#9048c0', '#e860a0'];
export const HAIR_STYLE_NAMES: Record<'boy' | 'girl', string[]> = { boy: ['짧은 머리', '삐죽 머리', '곱슬 머리'], girl: ['양갈래', '단발', '긴 생머리'] };

const S = (solid: boolean, extra: Partial<TileInfo> = {}): TileInfo => ({ solid, ...extra });
export const TILE_INFO: Record<TileId, TileInfo> = {
  grass: S(false), grass2: S(false), flower: S(false, { animated: true }), tall_grass: S(false, { grass: true }),
  path: S(false, { autotile: true, family: 'path' }), sand: S(false), tree: S(true), tree_dark: S(true), bush: S(true),
  water: S(true, { water: true, animated: true, autotile: true, family: 'water' }), ledge: S(true, { ledge: 'down' }),
  fence: S(true), sign: S(true), mailbox: S(true), rock: S(true), bridge: S(false), stairs_out: S(false), cave: S(false),
  pond_lily: S(true, { water: true }), black: S(true),
  floor_wood: S(false), floor_tile: S(false), floor_lab: S(false), floor_gym: S(false), wall: S(true), wall_window: S(true),
  wall_poster: S(true), wall_clock: S(true), bookshelf: S(true), pc: S(true), tv: S(true), bed_top: S(true), bed_bottom: S(false),
  table: S(true), table_ball: S(true), chair: S(false), plant: S(true), stairs_up: S(false), stairs_down: S(false), mat: S(false),
  counter: S(true, { counter: true }), heal_machine: S(true), lab_machine: S(true), fridge: S(true), sink: S(true), mirror: S(true),
  gym_statue: S(true), gym_rock: S(true), blackboard: S(true), desk: S(true), carpet: S(false),
};

export const STRUCTURES: Record<StructureKind, StructureInfo> = {
  house: { w: 4, h: 3, door: { x: 1, y: 2 } }, house_blue: { w: 4, h: 3, door: { x: 1, y: 2 } },
  lab: { w: 6, h: 4, door: { x: 2, y: 3 } }, center: { w: 5, h: 4, door: { x: 2, y: 3 } },
  mart: { w: 4, h: 3, door: { x: 1, y: 2 } }, gym: { w: 6, h: 5, door: { x: 2, y: 4 } },
  school: { w: 5, h: 4, door: { x: 2, y: 3 } }, museum: { w: 6, h: 4, door: null }, gate: { w: 4, h: 2, door: { x: 1, y: 1 } },
};

export async function initArt(): Promise<void> {}

export function drawTile(ctx: CanvasRenderingContext2D, id: TileId, px: number, py: number, _frame: number, _mask: number): void {
  const info = TILE_INFO[id];
  ctx.fillStyle = info?.water ? '#58a0f0' : info?.grass ? '#38a048' : info?.solid ? '#406030' : '#98d070';
  ctx.fillRect(px, py, 16, 16);
}

export function drawStructure(ctx: CanvasRenderingContext2D, kind: StructureKind, px: number, py: number, _frame: number): void {
  const s = STRUCTURES[kind];
  ctx.fillStyle = '#c05040'; ctx.fillRect(px, py, s.w * 16, s.h * 16);
}

export function drawCharacter(ctx: CanvasRenderingContext2D, who: NpcSpriteId | PlayerAppearance, _dir: Dir, _frame: 0 | 1 | 2, px: number, py: number): void {
  ctx.fillStyle = typeof who === 'string' ? '#503090' : '#d03030';
  ctx.fillRect(px + 3, py - 2, 10, 16);
}

export function playerPortrait(_a: PlayerAppearance, _view: 'front' | 'back', size = 48): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = c.height = size; return c;
}

export function itemIcon(_item: ItemId, size = 16): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = c.height = size; return c;
}

export function drawEmote(ctx: CanvasRenderingContext2D, emote: string, px: number, py: number): void {
  ctx.fillStyle = '#fff'; ctx.fillRect(px, py - 16, 16, 14); ctx.fillStyle = '#000'; ctx.fillText(emote, px + 5, py - 5);
}
