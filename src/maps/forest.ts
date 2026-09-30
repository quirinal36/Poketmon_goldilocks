import type { MapDef } from '../core/types';
export const MAP: MapDef = {
  "id": "forest",
  "name": "상록숲",
  "width": 24,
  "height": 22,
  "border": "tree",
  "music": "forest",
  "indoor": false,
  "tiles": [
    "TTTTTTTTTTT=TTTTTTTTTTTT",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "TDDD...DDDDDDDDDDDDDDDDT",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "TDDDDDDDDDDDDDDD...DDDDT",
    "T..........=...........T",
    "T======================T",
    "T..........=...........T",
    "T.....\"\"\"\"\"\"\"\"\"\".......T",
    "T.....\"\"\"\"\"\"\"\"\"\".......T",
    "TDDDDDDDDD\"\"\"DDDDDDDDDDT",
    "T.....\"\"\"\"\"\"\"\"\"\"..**...T",
    "T.....\"\"\"\"\"\"\"\"\"\".......T",
    "T..........=...........T",
    "T..........=...........T",
    "TTTTTTTTTTT=TTTTTTTTTTTT"
  ],
  "warps": [],
  "npcs": [
    {
      "id": "bug1",
      "x": 7,
      "y": 7,
      "sprite": "bugcatcher",
      "trainer": "bug_1",
      "facing": "right",
      "sight": 3
    },
    {
      "id": "bug2",
      "x": 17,
      "y": 13,
      "sprite": "bugcatcher",
      "trainer": "bug_2",
      "facing": "left",
      "sight": 3
    }
  ],
  "area": "forest",
  "items": [
    {
      "id": "balls",
      "x": 3,
      "y": 8,
      "item": "pokeball",
      "count": 3
    }
  ],
  "exits": [
    {
      "dir": "down",
      "to": "route2",
      "offset": 0,
      "from": 11,
      "toRange": 1
    },
    {
      "dir": "up",
      "to": "pewter",
      "offset": 0,
      "from": 11,
      "toRange": 1
    }
  ]
};
