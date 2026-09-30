import type { MapDef } from '../core/types';
export const MAP: MapDef = {
  "id": "player_house_2f",
  "name": "우리 집 2층",
  "width": 12,
  "height": 10,
  "border": "wall",
  "music": "town",
  "indoor": true,
  "tiles": [
    "WWWWWWWWWWWW",
    "W_____I____W",
    "W_c______u_W",
    "W__________W",
    "W__________W",
    "W_d________W",
    "W_e________W",
    "W__________W",
    "W__________W",
    "WWWWWWWWWWWW"
  ],
  "warps": [
    {
      "x": 9,
      "y": 2,
      "to": "player_house_1f",
      "tx": 8,
      "ty": 2
    }
  ],
  "npcs": [],
  "objects": [
    {
      "x": 2,
      "y": 2,
      "script": "pc"
    },
    {
      "x": 6,
      "y": 1,
      "script": "mirror"
    }
  ]
};
