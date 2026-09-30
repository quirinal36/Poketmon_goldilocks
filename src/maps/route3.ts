import type { MapDef } from '../core/types';
export const MAP: MapDef = {
  "id": "route3",
  "name": "3번도로",
  "width": 24,
  "height": 22,
  "border": "tree",
  "music": "route",
  "indoor": false,
  "tiles": [
    "TTTTTTTTTTTTTTTTTTTTTTTT",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T...\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"...T",
    "T...\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"...T",
    "T...\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"...T",
    "T...\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"...T",
    "T...\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"...T",
    "T...\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"...T",
    "T.**.......=...........T",
    "T..........=...........T",
    "=======================C",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=......**...T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "TTTTTTTTTTTTTTTTTTTTTTTT"
  ],
  "warps": [],
  "npcs": [
    {
      "id": "hiker",
      "x": 4,
      "y": 13,
      "sprite": "hiker",
      "script": "semester_gifts"
    },
    { "id": "route3_camper", "x": 17, "y": 10, "sprite": "camper", "script": "route3_camper" }
  ],
  "area": "route3",
  "triggers": [{ "x": 19, "y": 12, "script": "chapter2_oak_call", "once": "chapter2_oak_called" }],
  "signs": [{ "x": 21, "y": 10, "text": ["달맞이산 → 블루시티", "산길에서는 포켓몬을 쉬게 하며 가요."] }],
  "exits": [
    {
      "dir": "left",
      "to": "pewter",
      "offset": 0,
      "from": 12,
      "toRange": 1
    },
    { "dir": "right", "to": "mt_moon_front", "offset": 0, "from": 12, "toRange": 1 }
  ]
};
