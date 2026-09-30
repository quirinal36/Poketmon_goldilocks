import type { MapDef } from '../core/types';
export const MAP: MapDef = {
  "id": "route1",
  "name": "1번도로",
  "width": 24,
  "height": 22,
  "border": "tree",
  "music": "route",
  "indoor": false,
  "tiles": [
    "TTTTTTTTTTT=TTTTTTTTTTTT",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..\"\"\"\"\"\"\"\"\"\"\"\"\".......T",
    "T..\"\"\"\"\"\"\"\"\"\"\"\"\".......T",
    "T..\"\"\"\"\"\"\"\"\"\"\"\"\".......T",
    "T..\"\"\"\"\"\"\"\"\"\"\"\"\".......T",
    "T..\"\"\"\"\"\"\"\"\"\"\"\"\".......T",
    "T.**.......=...........T",
    "T..........=...........T",
    "T======================T",
    "T..........=...........T",
    "T..vvvvvv..=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=......**...T",
    "T..........=...........T",
    "T..........=...........T",
    "T..........=...........T",
    "TTTTTTTTTTT=TTTTTTTTTTTT"
  ],
  "warps": [],
  "npcs": [],
  "area": "route1",
  "triggers": [
    {
      "x": 3,
      "y": 5,
      "script": "route1_tip",
      "w": 13,
      "h": 5,
      "once": "route1_tutorial"
    }
  ],
  "items": [
    {
      "id": "potion",
      "x": 18,
      "y": 8,
      "item": "potion",
      "count": 1
    }
  ],
  "exits": [
    {
      "dir": "down",
      "to": "pallet",
      "offset": 0,
      "from": 11,
      "toRange": 1
    },
    {
      "dir": "up",
      "to": "viridian",
      "offset": 0,
      "from": 11,
      "toRange": 1
    }
  ]
};
