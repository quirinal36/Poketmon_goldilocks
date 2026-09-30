import type { MapDef } from '../core/types';

export const MAP: MapDef = {
  id: 'cerulean_mart', name: '블루시티 프렌들리숍', width: 12, height: 10,
  border: 'wall', music: 'town', indoor: true,
  tiles: [
    'WWWWWWWWWWWW', 'W__________W', 'W__________W', 'W____K_____W',
    'W__________W', 'W__________W', 'W__________W', 'W__________W',
    'W__________W', 'WWWWWmWWWWWW',
  ],
  warps: [{ x: 5, y: 9, to: 'cerulean', tx: 17, ty: 6 }],
  npcs: [{ id: 'clerk', x: 5, y: 2, sprite: 'clerk', script: 'shop' }],
};
