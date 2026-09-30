import type { MapDef } from '../core/types';

export const MAP: MapDef = {
  id: 'cerulean_gym', name: '블루체육관', width: 12, height: 10,
  border: 'wall', music: 'gym', indoor: true,
  tiles: [
    'WWWWWWWWWWWW', 'WggggggggggW', 'W~~~~gg~~~~W', 'W~~~gggg~~~W',
    'W~~~gggg~~~W', 'W~~~gggg~~~W', 'W~~~gggg~~~W', 'WggggggggggW',
    'WggggggggggW', 'WWWWWmWWWWWW',
  ],
  warps: [{ x: 5, y: 9, to: 'cerulean', tx: 5, ty: 19 }],
  npcs: [
    { id: 'guide', x: 3, y: 7, sprite: 'gymguide', script: 'cerulean_guide' },
    { id: 'swimmer', x: 7, y: 5, sprite: 'boy', script: 'cerulean_swimmer' },
    { id: 'misty', x: 5, y: 2, sprite: 'leader_water', script: 'cerulean_leader' },
  ],
};
