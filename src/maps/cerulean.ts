import type { MapDef } from '../core/types';

const tiles = Array.from({ length: 22 }, (_, y) =>
  y === 12 ? `${'='.repeat(23)}T` : `T${'.'.repeat(10)}=${'.'.repeat(11)}T`);
tiles[0] = tiles[21] = 'T'.repeat(24);
tiles[0] = tiles[21] = `${'T'.repeat(11)}=${'T'.repeat(12)}`;
for (let y = 15; y <= 18; y++) tiles[y] = `T${'.'.repeat(10)}=${'.'.repeat(3)}${'~'.repeat(5)}${'.'.repeat(3)}T`;

export const MAP: MapDef = {
  id: 'cerulean', name: '블루시티', width: 24, height: 22,
  border: 'tree', music: 'city', indoor: false, area: 'cerulean', tiles,
  structures: [
    { kind: 'center', x: 3, y: 3 },
    { kind: 'mart', x: 16, y: 3 },
    { kind: 'gym', x: 3, y: 14 },
  ],
  warps: [
    { x: 5, y: 6, to: 'cerulean_center', tx: 5, ty: 8 },
    { x: 17, y: 5, to: 'cerulean_mart', tx: 5, ty: 8 },
    { x: 5, y: 18, to: 'cerulean_gym', tx: 5, ty: 8 },
  ],
  exits: [
    { dir: 'left', to: 'route4', from: 12, toRange: 1, offset: 0 },
    { dir: 'up', to: 'route24', from: 11, toRange: 1, offset: 0 },
    { dir: 'down', to: 'route5', from: 11, toRange: 1, offset: 0 },
  ],
  npcs: [
    { id: 'cerulean_rival', x: 3, y: 10, sprite: 'rival', script: 'cerulean_rival' },
    { id: 'north_guard', x: 11, y: 1, sprite: 'aide', script: 'chapter3_badge_guard', visibleIf: '!badge_cascade' },
    { id: 'south_guard', x: 11, y: 20, sprite: 'aide', script: 'chapter3_badge_guard', visibleIf: '!badge_cascade' },
  ],
  signs: [{ x: 21, y: 12, text: ['금빛다리와 이수재의 집은 북쪽!', '갈색시티는 남쪽 지하통로 너머예요.'] }],
  onEnter: 'cerulean_arrive',
};
