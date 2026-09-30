import type { MapDef } from '../core/types';
export const MAP: MapDef = {
  "id": "pewter_gym",
  "name": "회색체육관",
  "width": 12,
  "height": 10,
  "border": "wall",
  "music": "gym",
  "indoor": true,
  "tiles": [
    "WWWWWWWWWWWW",
    "W__________W",
    "W__________W",
    "W__________W",
    "W__________W",
    "W__________W",
    "W_Q______Q_W",
    "W__________W",
    "W__________W",
    "WWWWWmWWWWWW"
  ],
  "warps": [
    {
      "x": 5,
      "y": 9,
      "to": "pewter",
      "tx": 5,
      "ty": 19
    }
  ],
  "npcs": [
    {
      "id": "guide",
      "x": 3,
      "y": 7,
      "sprite": "gymguide",
      "script": "pewter_guide"
    },
    {
      "id": "camper",
      "x": 8,
      "y": 5,
      "sprite": "camper",
      "trainer": "camper_gym",
      "facing": "left",
      "sight": 2
    },
    {
      "id": "woong",
      "x": 5,
      "y": 2,
      "sprite": "leader_rock",
      "script": "pewter_leader"
    }
  ]
};
