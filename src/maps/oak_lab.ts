import type { MapDef } from '../core/types';
export const MAP: MapDef = {
  "id": "oak_lab",
  "name": "오박사 연구소",
  "width": 12,
  "height": 10,
  "border": "wall",
  "music": "lab",
  "indoor": true,
  "tiles": [
    "WWWWWWWWWWWW",
    "W__________W",
    "W__________W",
    "W___NNN____W",
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
      "tx": 15,
      "ty": 18
    }
  ],
  "npcs": [
    {
      "id": "oak",
      "x": 5,
      "y": 2,
      "sprite": "oak",
      "script": "pallet_starter"
    },
    {
      "id": "rival",
      "x": 8,
      "y": 5,
      "sprite": "rival",
      "text": [
        "너는 어떤 포켓몬을 고를 거야?"
      ]
    },
    {
      "id": "aide",
      "x": 2,
      "y": 5,
      "sprite": "aide",
      "text": [
        "틀려도 괜찮아. 다시 해 보자!"
      ]
    }
  ],
  "objects": [
    {
      "x": 4,
      "y": 3,
      "script": "pallet_starter"
    },
    {
      "x": 5,
      "y": 3,
      "script": "pallet_starter"
    },
    {
      "x": 6,
      "y": 3,
      "script": "pallet_starter"
    }
  ]
};
