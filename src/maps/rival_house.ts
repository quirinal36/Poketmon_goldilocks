import type { MapDef } from '../core/types';
export const MAP: MapDef = {
  "id": "rival_house",
  "name": "라이벌의 집",
  "width": 12,
  "height": 10,
  "border": "wall",
  "music": "town",
  "indoor": true,
  "tiles": [
    "WWWWWWWWWWWW",
    "W__________W",
    "W__________W",
    "W__________W",
    "W__________W",
    "W__________W",
    "W__________W",
    "W__________W",
    "W__________W",
    "WWWWWmWWWWWW"
  ],
  "warps": [
    {
      "x": 5,
      "y": 9,
      "to": "pallet",
      "tx": 17,
      "ty": 6
    }
  ],
  "npcs": [
    {
      "id": "sister",
      "x": 3,
      "y": 3,
      "sprite": "sister",
      "script": "home_heal"
    }
  ]
};
