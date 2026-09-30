import type { MapDef } from '../core/types';
export const MAP: MapDef = {
  "id": "player_house_1f",
  "name": "우리 집 1층",
  "width": 12,
  "height": 10,
  "border": "wall",
  "music": "town",
  "indoor": true,
  "tiles": [
    "WWWWWWWWWWWW",
    "W_t________W",
    "W________U_W",
    "W_____n____W",
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
      "tx": 4,
      "ty": 6
    },
    {
      "x": 9,
      "y": 2,
      "to": "player_house_2f",
      "tx": 8,
      "ty": 2
    }
  ],
  "npcs": [
    {
      "id": "mom",
      "x": 3,
      "y": 3,
      "sprite": "mom",
      "script": "pallet_mom"
    }
  ],
  "objects": [
    {
      "x": 2,
      "y": 1,
      "script": "home_tv"
    },
    {
      "x": 6,
      "y": 3,
      "script": "daily_board"
    }
  ]
};
