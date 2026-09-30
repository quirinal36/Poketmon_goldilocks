import type { MapDef } from '../core/types';

const tiles = Array.from({ length: 22 }, (_, y) =>
  y === 12 ? '='.repeat(24) : `T${'.'.repeat(10)}=${'.'.repeat(11)}T`);
tiles[0] = tiles[21] = 'T'.repeat(24);
for (let y = 5; y <= 8; y++) tiles[y] = `T${'.'.repeat(3)}${'~'.repeat(5)}..=${'.'.repeat(5)}${'"'.repeat(6)}T`;

export const MAP: MapDef = {
  id: 'route4', name: '4번도로', width: 24, height: 22,
  border: 'tree', music: 'route', indoor: false, area: 'route4', tiles,
  warps: [], npcs: [],
  exits: [
    { dir: 'left', to: 'mt_moon_deep', from: 12, toRange: 1, offset: 0 },
    { dir: 'right', to: 'cerulean', from: 12, toRange: 1, offset: 0 },
  ],
  signs: [{ x: 11, y: 10, text: ['← 달맞이산     블루시티 →'] }],
};
