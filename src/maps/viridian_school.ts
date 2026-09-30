import type { MapDef } from '../core/types';
export const MAP: MapDef = {
  "id": "viridian_school",
  "name": "트레이너 스쿨",
  "width": 12,
  "height": 10,
  "border": "wall",
  "music": "town",
  "indoor": true,
  "tiles": [
    "WWWWWWWWWWWW",
    "W___Y______W",
    "W__________W",
    "W__________W",
    "W__________W",
    "W__y____y__W",
    "W__________W",
    "W__________W",
    "W__________W",
    "WWWWWmWWWWWW"
  ],
  "warps": [
    {
      "x": 5,
      "y": 9,
      "to": "viridian",
      "tx": 5,
      "ty": 19
    }
  ],
  "npcs": [
    {
      "id": "teacher",
      "x": 5,
      "y": 3,
      "sprite": "teacher",
      "script": "practice"
    }
  ],
  "objects": [
    {
      "x": 4,
      "y": 1,
      "script": "practice"
    }
  ]
};
