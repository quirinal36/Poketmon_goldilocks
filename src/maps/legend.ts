import type { TileId } from '../core/types';

/** Default ASCII legend for MapDef.tiles. Maps may extend/override via MapDef.legend. */
export const DEFAULT_LEGEND: Record<string, TileId> = {
  // outdoor
  '.': 'grass', ',': 'grass2', '"': 'tall_grass', '*': 'flower', '=': 'path', ':': 'sand',
  'T': 'tree', 'D': 'tree_dark', 'b': 'bush', '~': 'water', 'v': 'ledge', '#': 'fence',
  'S': 'sign', 'M': 'mailbox', 'o': 'rock', 'H': 'bridge', 'x': 'black', 'L': 'pond_lily',
  'C': 'cave', '^': 'stairs_out',
  // indoor
  '_': 'floor_wood', '-': 'floor_tile', 'l': 'floor_lab', 'g': 'floor_gym', 'W': 'wall',
  'w': 'wall_window', 'P': 'wall_poster', 'k': 'wall_clock', 'B': 'bookshelf', 'c': 'pc', 't': 'tv',
  'd': 'bed_top', 'e': 'bed_bottom', 'n': 'table', 'N': 'table_ball', 'h': 'chair', 'p': 'plant',
  'U': 'stairs_up', 'u': 'stairs_down', 'm': 'mat', 'K': 'counter', 'R': 'heal_machine',
  'A': 'lab_machine', 'F': 'fridge', 'Z': 'sink', 'I': 'mirror', 'Q': 'gym_statue', 'G': 'gym_rock',
  'Y': 'blackboard', 'y': 'desk', 'r': 'carpet',
};
