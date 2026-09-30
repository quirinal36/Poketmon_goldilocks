import type { MapDef } from '../core/types';
export const MAP: MapDef = {
  "id": "pewter_center",
  "name": "회색시티 포켓몬센터",
  "width": 12,
  "height": 10,
  "border": "wall",
  "music": "center",
  "indoor": true,
  "tiles": [
    "WWWWWWWWWWWW",
    "W__________W",
    "W_P______c_W",
    "W____K_____W",
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
      "to": "pewter",
      "tx": 5,
      "ty": 7
    }
  ],
  "npcs": [
    {
      "id": "nurse",
      "x": 5,
      "y": 2,
      "sprite": "nurse",
      "script": "nurse"
    }
  ],
  "objects": [
    {
      "x": 9,
      "y": 2,
      "script": "pc"
    },
    {
      "x": 2,
      "y": 2,
      "script": "daily_board"
    }
  ],
  "healSpot": {
    "x": 5,
    "y": 5
  }
};
