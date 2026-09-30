import type { MapDef } from '../core/types';

const tiles = Array.from({ length: 22 }, (_, y) =>
  y === 12 ? ':'.repeat(24) : `o${':'.repeat(22)}o`);
tiles[0] = tiles[21] = 'o'.repeat(24);
tiles[4] = `o${':'.repeat(5)}${'o'.repeat(4)}${':'.repeat(13)}o`;
tiles[7] = `o${':'.repeat(16)}${'o'.repeat(3)}${':'.repeat(3)}o`;
tiles[10] = `o${':'.repeat(5)}${'o'.repeat(5)}${':'.repeat(12)}o`;
tiles[14] = `o${':'.repeat(12)}${'o'.repeat(5)}${':'.repeat(5)}o`;
tiles[16] = `o${':'.repeat(9)}${'o'.repeat(4)}${':'.repeat(9)}o`;

export const MAP: MapDef = {
  id: 'mt_moon_front', name: '달맞이산 앞쪽', width: 24, height: 22,
  border: 'cave_wall', music: 'forest', indoor: false, area: 'mt_moon', tiles,
  legend: { ':': 'cave_floor', o: 'cave_wall' },
  warps: [],
  exits: [
    { dir: 'left', to: 'route3', from: 12, toRange: 1, offset: 0 },
    { dir: 'right', to: 'mt_moon_deep', from: 12, toRange: 1, offset: 0 },
  ],
  npcs: [
    { id: 'moon_researcher', x: 4, y: 10, sprite: 'scientist', script: 'moon_researcher' },
  ],
  signs: [
    { x: 11, y: 10, text: ['← 3번도로     안쪽 동굴 →', '길이 헷갈리면 연구원에게 물어보세요.'] },
  ],
  items: [{ id: 'front_potion', x: 18, y: 6, item: 'potion', count: 1 }],
  onEnter: 'moon_front_arrive',
};
