import type { MapDef } from '../core/types';

const tiles = Array.from({ length: 22 }, (_, y) =>
  y === 12 ? ':'.repeat(24) : `o${':'.repeat(22)}o`);
tiles[0] = tiles[21] = 'o'.repeat(24);
tiles[5] = `o${':'.repeat(6)}${'o'.repeat(3)}${':'.repeat(13)}o`;
tiles[10] = `o${':'.repeat(4)}${'o'.repeat(6)}${':'.repeat(12)}o`;
tiles[14] = `o${':'.repeat(12)}${'o'.repeat(4)}${':'.repeat(6)}o`;
tiles[16] = `o${':'.repeat(13)}${'o'.repeat(4)}${':'.repeat(5)}o`;

export const MAP: MapDef = {
  id: 'mt_moon_deep', name: '달맞이산 안쪽', width: 24, height: 22,
  border: 'cave_wall', music: 'forest', indoor: false, area: 'mt_moon', tiles,
  legend: { ':': 'cave_floor', o: 'cave_wall' },
  warps: [],
  exits: [
    { dir: 'left', to: 'mt_moon_front', from: 12, toRange: 1, offset: 0 },
    { dir: 'right', to: 'route4', from: 12, toRange: 1, offset: 0 },
  ],
  npcs: [
    { id: 'moon_clefairy', x: 7, y: 9, sprite: 'clefairy', script: 'moon_clefairy', visibleIf: '!notebook_returned' },
    { id: 'moon_rocket', x: 17, y: 12, sprite: 'rocket', script: 'moon_rocket', visibleIf: '!rocket_won' },
    { id: 'moon_gate', x: 23, y: 12, sprite: 'scientist', script: 'moon_exit_gate', visibleIf: '!notebook_returned' },
  ],
  signs: [{ x: 10, y: 10, text: ['← 입구     4번도로 →', '소란은 안쪽에서 들려요.'] }],
  items: [{ id: 'deep_ball', x: 5, y: 17, item: 'pokeball', count: 2 }],
  onEnter: 'moon_deep_arrive',
};
