import type { MapDef } from '../core/types';
export const MAP: MapDef = {
  "id": "viridian",
  "name": "상록시티",
  "width": 24,
  "height": 22,
  "border": "tree",
  "music": "city",
  "indoor": false,
  "tiles": [
    "TTTTTTTTTTT=TTTTTTTTTTTT",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=.....=.....T",
    "T....=.....=.....=.....T",
    "T....=.....=.....=.....T",
    "T....=.....=.....=.....T",
    "T.**.=.....=.....=.....T",
    "T....=.....=.....=.....T",
    "=======================T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=......**...T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "TTTTTTTTTTT=TTTTTTTTTTTT"
  ],
  "warps": [
    {
      "x": 5,
      "y": 6,
      "to": "viridian_center",
      "tx": 5,
      "ty": 8
    },
    {
      "x": 17,
      "y": 5,
      "to": "viridian_mart",
      "tx": 5,
      "ty": 8
    },
    {
      "x": 5,
      "y": 18,
      "to": "viridian_school",
      "tx": 5,
      "ty": 8
    }
  ],
  "npcs": [],
  "structures": [
    {
      "kind": "center",
      "x": 3,
      "y": 3
    },
    {
      "kind": "mart",
      "x": 16,
      "y": 3
    },
    {
      "kind": "school",
      "x": 3,
      "y": 15
    },
    {
      "kind": "gym",
      "x": 16,
      "y": 14
    }
  ],
  "objects": [
    {
      "x": 18,
      "y": 18,
      "script": "viridian_closed"
    }
  ],
  "onEnter": "viridian_arrive",
  "exits": [
    {
      "dir": "down",
      "to": "route1",
      "offset": 0,
      "from": 11,
      "toRange": 1
    },
    {
      "dir": "up",
      "to": "route2",
      "offset": 0,
      "from": 11,
      "toRange": 1
    },
    {
      "dir": "left",
      "to": "route22",
      "offset": 0,
      "from": 12,
      "toRange": 1
    }
  ]
};
