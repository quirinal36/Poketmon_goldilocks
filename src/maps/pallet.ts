import type { MapDef } from '../core/types';
export const MAP: MapDef = {
  "id": "pallet",
  "name": "태초마을",
  "width": 24,
  "height": 22,
  "border": "tree",
  "music": "town",
  "indoor": false,
  "tiles": [
    "TTTTTTTTTTT=TTTTTTTTTTTT",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T...=......=.....=.....T",
    "T...=......=.....=.....T",
    "T...=......=.....=.....T",
    "T...=......=.....=.....T",
    "T.**=......=.....=.....T",
    "T...=......=.....=.....T",
    "T======================T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=......**...T",
    "T..........=...........T",
    "T.~~~~~~~..=...........T",
    "T.~~~~~~~..=...........T",
    "TTTTTTTTTTTTTTTTTTTTTTTT"
  ],
  "warps": [
    {
      "x": 4,
      "y": 5,
      "to": "player_house_1f",
      "tx": 5,
      "ty": 8
    },
    {
      "x": 17,
      "y": 5,
      "to": "rival_house",
      "tx": 5,
      "ty": 8
    },
    {
      "x": 15,
      "y": 17,
      "to": "oak_lab",
      "tx": 5,
      "ty": 8
    }
  ],
  "npcs": [
    {
      "id": "neighbor",
      "x": 8,
      "y": 10,
      "sprite": "oldman",
      "text": [
        "오박사 연구소는 마을 오른쪽 아래에 있단다."
      ]
    }
  ],
  "structures": [
    {
      "kind": "house",
      "x": 3,
      "y": 3
    },
    {
      "kind": "house_blue",
      "x": 16,
      "y": 3
    },
    {
      "kind": "lab",
      "x": 13,
      "y": 14
    }
  ],
  "triggers": [
    {
      "x": 11,
      "y": 1,
      "script": "pallet_stop",
      "if": "!got_starter"
    }
  ],
  "exits": [
    {
      "dir": "up",
      "to": "route1",
      "offset": 0,
      "from": 11,
      "toRange": 1
    }
  ]
};
