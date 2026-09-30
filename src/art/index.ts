import type { ItemId, PlayerAppearance } from '../core/types';
import { initTiles } from './tiles';
import { initStructures } from './structures';
import { initCharacters, characterCanvas } from './characters';
export { TILE_INFO, drawTile } from './tiles';
export { STRUCTURES, drawStructure } from './structures';
export { SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS, HAIR_STYLE_NAMES, drawCharacter } from './characters';
export async function initArt(): Promise<void> { initTiles(); initStructures(); initCharacters(); }
export function playerPortrait(a: PlayerAppearance, view: 'front' | 'back', size = 48): HTMLCanvasElement {
  return characterCanvas(a, view === 'front' ? 'down' : 'up', 0, size / 16);
}
export function itemIcon(item: ItemId, size = 16): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.font = `${size - 2}px sans-serif`;
  ctx.fillText(({ pokeball: '🔴', greatball: '🔵', potion: '🧴', rod: '🎣', dex: '📕', stamp_card: '⭐' })[item], 0, size - 2);
  return c;
}
export function drawEmote(ctx: CanvasRenderingContext2D, emote: string, px: number, py: number): void {
  ctx.fillStyle = '#fff'; ctx.fillRect(px, py - 16, 16, 14); ctx.fillStyle = '#000'; ctx.fillText(emote, px + 5, py - 5);
}
