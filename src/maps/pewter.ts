import type { MapDef } from '../core/types';
export const MAP: MapDef = {
  "id": "pewter",
  "name": "회색시티",
  "width": 24,
  "height": 22,
  "border": "tree",
  "music": "city",
  "indoor": false,
  "tiles": [
    "TTTTTTTTTTTTTTTTTTTTTTTT",
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
    "T=======================",
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
      "to": "pewter_center",
      "tx": 5,
      "ty": 8
    },
    {
      "x": 17,
      "y": 5,
      "to": "pewter_mart",
      "tx": 5,
      "ty": 8
    },
    {
      "x": 5,
      "y": 18,
      "to": "pewter_gym",
      "tx": 5,
      "ty": 8
    }
  ],
  "npcs": [
    {
      "id": "gate",
      "x": 23,
      "y": 12,
      "sprite": "man",
      "visibleIf": "!route3_open",
      "text": [
        "회색배지를 받으면 3번도로로 갈 수 있어!"
      ]
    }
  ],
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
      "kind": "gym",
      "x": 3,
      "y": 14
    },
    {
      "kind": "museum",
      "x": 16,
      "y": 15
    }
  ],
  "onEnter": "pewter_arrive",
  "exits": [
    {
      "dir": "down",
      "to": "forest",
      "offset": 0,
      "from": 11,
      "toRange": 1
    },
    {
      "dir": "right",
      "to": "route3",
      "offset": 0,
      "from": 12,
      "toRange": 1
    }
  ]
};
