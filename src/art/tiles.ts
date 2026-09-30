// ============================================================================
// Art: tiles (16×16). GSC-style procedural pixel art baked into canvases.
// Autotile mask bits: N=1, E=2, S=4, W=8 (bit set = neighbor is same family).
// Animated tiles get `frame` (increments every 250 ms).
// ============================================================================
import type { TileId, TileInfo } from '../core/types';
import { C, Painter, type Pal } from './palette';

const S = (solid: boolean, extra: Partial<TileInfo> = {}): TileInfo => ({ solid, ...extra });

export const TILE_INFO: Record<TileId, TileInfo> = {
  grass: S(false), grass2: S(false), flower: S(false, { animated: true }), tall_grass: S(false, { grass: true }),
  path: S(false, { autotile: true, family: 'path' }), sand: S(false), tree: S(true), tree_dark: S(true), bush: S(true),
  water: S(true, { water: true, animated: true, autotile: true, family: 'water' }), ledge: S(true, { ledge: 'down' }),
  fence: S(true), sign: S(true), mailbox: S(true), rock: S(true), bridge: S(false), stairs_out: S(false), cave: S(false),
  pond_lily: S(true, { water: true, animated: true }), black: S(true),
  cave_floor: S(false, { grass: true }), cave_wall: S(true),
  floor_wood: S(false), floor_tile: S(false), floor_lab: S(false), floor_gym: S(false), wall: S(true), wall_window: S(true),
  wall_poster: S(true), wall_clock: S(true), bookshelf: S(true), pc: S(true), tv: S(true), bed_top: S(true), bed_bottom: S(false),
  table: S(true), table_ball: S(true), chair: S(false), plant: S(true), stairs_up: S(false), stairs_down: S(false), mat: S(false),
  counter: S(true, { counter: true }), heal_machine: S(true, { animated: true }), lab_machine: S(true, { animated: true }), fridge: S(true), sink: S(true), mirror: S(true),
  gym_statue: S(true), gym_rock: S(true), blackboard: S(true), desk: S(true), carpet: S(false),
};

export const TILE_IDS = Object.keys(TILE_INFO) as TileId[];

/** Number of animation frames per animated tile (drawTile uses frame % n). */
export const TILE_FRAMES: Partial<Record<TileId, number>> = { water: 4, pond_lily: 4, flower: 4, heal_machine: 4, lab_machine: 4 };

// ------------------------------------------------------------ palettes ----
const GRASS_PAL: Pal = { '.': C.grass, g: C.grassD, G: C.grassX, l: C.grassL };
const OUT: Pal = { k: C.ink };

// ----------------------------------------------------------- builders -----
type Builder = (p: Painter, frame: number, mask: number) => void;

function grassBase(p: Painter): void {
  p.fill(C.grass);
  // small "v" tufts like GSC
  const tufts: [number, number][] = [[2, 2], [10, 5], [5, 10], [12, 12]];
  for (const [x, y] of tufts) { p.px(x, y + 1, C.grassD); p.px(x + 2, y + 1, C.grassD); p.px(x + 1, y, C.grassD); }
}

const builders: Record<TileId, Builder> = {
  black: (p) => p.fill('#000000'),

  grass: (p) => grassBase(p),

  grass2: (p) => {
    p.fill(C.grass);
    const rows = [
      '................',
      '....l...........',
      '...gg......g....',
      '..........ggg...',
      '................',
      '.g..............',
      'ggg.......l.....',
      '................',
      '.........g......',
      '....l...ggg.....',
      '...gg...........',
      '..gggg..........',
      '..............g.',
      '.............ggg',
      '......g.........',
      '.....ggg........',
    ];
    p.map(0, 0, rows, GRASS_PAL, 'grass2');
  },

  flower: (p, frame) => {
    grassBase(p);
    const sway = [0, 0, 1, 1][frame & 3];
    // two flowers: red (top-left) and yellow (bottom-right), petals flip with frame
    const fl = (x: number, y: number, petal: string, center: string) => {
      p.px(x, y + 3, C.leafD); p.px(x + 1, y + 2, C.leafD); // stem
      p.px(x + 1 + sway, y, petal); p.px(x + sway, y + 1, petal); p.px(x + 2 + sway, y + 1, petal); p.px(x + 1 + sway, y + 2, petal);
      p.px(x + 1 + sway, y + 1, center);
    };
    fl(2, 2, C.red, C.yellow);
    fl(9, 8, C.yellow, C.red);
    // leaves
    p.px(4, 5, C.leaf); p.px(12, 11, C.leaf);
  },

  tall_grass: (p) => {
    p.fill(C.grass);
    const rows = [
      '..M....M....M...',
      '.MMM..MMM..MMM..',
      'MMDMMMMDMMMMDMMM',
      'MDDDMMDDDMMDDDMM',
      'DDDDDDDDDDDDDDDD',
      'DMDDDMDDDMDDDMDD',
      '.D.M.D.M.D.M.D.M',
      '..MMM..MMM..MMM.',
      '..MDM..MDM..MDM.',
      'MMMDMMMMDMMMMDMM',
      'MDDDMMDDDMMDDDMM',
      'DDDDDDDDDDDDDDDD',
      'DMDDDMDDDMDDDMDD',
      '.D...D...D...D..',
      '.L...L...L...L..',
      '................',
    ];
    p.map(0, 0, rows, { M: C.leaf, D: C.leafD, L: C.grassD }, 'tall_grass');
  },

  path: (p, _f, mask) => {
    p.fill(C.path);
    // gentle texture
    const dots: [number, number][] = [[3, 4], [11, 2], [7, 9], [13, 12], [2, 13]];
    for (const [x, y] of dots) { p.px(x, y, C.pathD); p.px(x + 1, y, C.pathL); }
    // grass fringe where the neighbor is NOT path
    const n = mask & 1, e = mask & 2, s = mask & 4, w = mask & 8;
    const fringe = (x: number, y: number, dx: number, dy: number, len: number) => {
      // two-deep jagged grass border along the edge starting at (x,y) stepping (dx,dy)
      for (let i = 0; i < len; i++) {
        const px = x + dx * i, py = y + dy * i;
        p.px(px, py, C.grass);
        const inward = (i % 3 === 1);
        const ix = px + (dx === 0 ? (x === 0 ? 1 : -1) : 0);
        const iy = py + (dy === 0 ? (y === 0 ? 1 : -1) : 0);
        if (inward) p.px(ix, iy, C.grass); else p.px(ix, iy, C.pathD);
      }
    };
    if (!n) fringe(0, 0, 1, 0, 16);
    if (!s) fringe(0, 15, 1, 0, 16);
    if (!w) fringe(0, 0, 0, 1, 16);
    if (!e) fringe(15, 0, 0, 1, 16);
    // outer corners: when both adjacent edges are open, round the corner with grass
    if (!n && !w) { p.px(0, 0, C.grass); p.px(1, 0, C.grass); p.px(0, 1, C.grass); }
    if (!n && !e) { p.px(15, 0, C.grass); p.px(14, 0, C.grass); p.px(15, 1, C.grass); }
    if (!s && !w) { p.px(0, 15, C.grass); p.px(1, 15, C.grass); p.px(0, 14, C.grass); }
    if (!s && !e) { p.px(15, 15, C.grass); p.px(14, 15, C.grass); p.px(15, 14, C.grass); }
  },

  sand: (p) => {
    p.fill(C.sand);
    const dots: [number, number][] = [[2, 3], [9, 1], [13, 6], [5, 9], [11, 12], [1, 13]];
    for (const [x, y] of dots) { p.px(x, y, C.sandD); p.px(x + 1, y + 1, C.sandL); }
  },

  cave_floor: (p) => {
    p.fill('#807c88');
    for (const [x, y] of [[2, 3], [11, 2], [7, 9], [13, 12], [3, 14]]) {
      p.px(x, y, '#a39daa'); p.px(x + 1, y + 1, '#5d5967');
    }
  },
  cave_wall: (p) => {
    p.fill('#464351');
    p.hline(0, 0, 16, '#a39daa'); p.hline(0, 14, 16, '#27242f');
    p.hline(2, 5, 12, '#666170'); p.vline(8, 1, 4, '#666170');
    p.hline(0, 10, 9, '#666170'); p.vline(5, 6, 4, '#666170');
  },

  water: (p, frame, mask) => waterTile(p, frame, mask),

  pond_lily: (p, frame) => {
    waterTile(p, frame, 15);
    const rows = [
      '................',
      '................',
      '.....kkkkk......',
      '...kkLLLLLkk....',
      '..kLLLLpLLLLk...',
      '..kLLLpPpLLLLk..',
      '..kLLLLpLLLLLk..',
      '..kLLLLLLLLLLk..',
      '...kLLLLLLLLk...',
      '....kkLLLLkk....',
      '......kkkk......',
      '................',
      '................',
      '................',
      '................',
      '................',
    ];
    p.map(0, 0, rows, { k: C.leafX, L: C.leaf, p: C.pink, P: C.white }, 'pond_lily');
  },

  tree: (p) => {
    grassBase(p);
    const rows = [
      '.....kkkkkk.....',
      '...kkLLLLLLkk...',
      '..kLLLLLLLLLLk..',
      '.kLLLLMLLLLLLLk.',
      '.kLLMMMMMLLLLLk.',
      'kLLMMMMMMMMLLLLk',
      'kLMMMMMMMMMMMLLk',
      'kMMMMMMDDMMMMMMk',
      'kMMMMDDDDDDMMMMk',
      'kMMDDDDDDDDDDMMk',
      '.kDDDDDDDDDDDDk.',
      '.kkDDDDDDDDDDkk.',
      '..kkDDDkkDDDkk..',
      '....kkkTtkkk....',
      '......kTtk......',
      '.....kkkkkk.....',
    ];
    p.map(0, 0, rows, { k: C.leafX, L: C.leafL, M: C.leaf, D: C.leafD, T: C.woodD, t: C.wood }, 'tree');
  },

  tree_dark: (p) => {
    p.fill(C.leafD);
    const rows = [
      '.....kkkkkk.....',
      '...kkMMMMMMkk...',
      '..kMMMMMMMMMMk..',
      '.kMMMMLMMMMMMMk.',
      '.kMMLLLLLMMMMMk.',
      'kMMLLLLLLLLMMMMk',
      'kMLLLLLLLLLLLMMk',
      'kLLLLLLDDLLLLLLk',
      'kLLLLDDDDDDLLLLk',
      'kLLDDDDDDDDDDLLk',
      '.kDDDDDDDDDDDDk.',
      '.kkDDDDDDDDDDkk.',
      '..kkDDDkkDDDkk..',
      '....kkkTtkkk....',
      '......kTtk......',
      '.....kkkkkk.....',
    ];
    p.map(0, 0, rows, { k: '#0c2818', M: C.leafD, L: '#38a048', D: '#1c6830', T: '#3c2810', t: C.woodX }, 'tree_dark');
  },

  bush: (p) => {
    grassBase(p);
    const rows = [
      '................',
      '................',
      '......kkkk......',
      '....kkLLLLkk....',
      '...kLLLLMLLLk...',
      '..kLLLMMMMLLLk..',
      '..kLMMMMMMMMLk..',
      '.kLMMMMMMMMMMLk.',
      '.kMMMMDMMDMMMMk.',
      '.kMMMDDDDDDMMMk.',
      '.kMDDDDDDDDDDMk.',
      '..kDDDDDDDDDDk..',
      '..kkDDDDDDDDkk..',
      '....kkkkkkkk....',
      '................',
      '................',
    ];
    p.map(0, 0, rows, { k: C.leafX, L: C.leafL, M: C.leaf, D: C.leafD }, 'bush');
  },

  ledge: (p) => {
    grassBase(p);
    // stepped edge on the south side: light lip, dark drop, shadow on grass below
    p.hline(0, 10, 16, C.grassL);
    p.hline(0, 11, 16, C.grassD);
    p.hline(0, 12, 16, C.grassX);
    p.hline(0, 13, 16, C.dirt);
    p.hline(0, 14, 16, C.dirtD);
    p.hline(0, 15, 16, C.grassD);
    // notches for a stepped look
    for (let x = 1; x < 16; x += 4) { p.px(x, 11, C.grassL); p.px(x + 1, 13, C.dirtD); p.px(x + 2, 14, C.dirt); }
  },

  fence: (p) => {
    grassBase(p);
    const rows = [
      '................',
      '................',
      '.kk..........kk.',
      '.kWk........kWk.',
      '.kWkkkkkkkkkkWk.',
      '.kWWWWWWWWWWWWk.',
      '.kWwwwwwwwwwwwk.',
      '.kWkkkkkkkkkkWk.',
      '.kWk........kWk.',
      '.kWkkkkkkkkkkWk.',
      '.kWWWWWWWWWWWWk.',
      '.kWwwwwwwwwwwwk.',
      '.kWkkkkkkkkkkWk.',
      '.kWk........kWk.',
      '.kkk........kkk.',
      '................',
    ];
    p.map(0, 0, rows, { k: C.woodX, W: C.woodL, w: C.wood }, 'fence');
  },

  sign: (p) => {
    grassBase(p);
    const rows = [
      '................',
      '..kkkkkkkkkkkk..',
      '.kWWWWWWWWWWWWk.',
      '.kWwwwwwwwwwwWk.',
      '.kWwkkkwkkkkwWk.',
      '.kWwwwwwwwwwwWk.',
      '.kWwkkkkwkkkwWk.',
      '.kWwwwwwwwwwwWk.',
      '.kkkkkkkkkkkkkk.',
      '......kddk......',
      '......kddk......',
      '......kddk......',
      '......kddk......',
      '.....kkddkk.....',
      '................',
      '................',
    ];
    p.map(0, 0, rows, { k: C.woodX, W: C.woodL, w: C.wood, d: C.woodD }, 'sign');
  },

  mailbox: (p) => {
    grassBase(p);
    const rows = [
      '................',
      '.....kkkkkk.....',
      '....kBbbbbBk....',
      '...kBbbbbbbBk...',
      '...kbbbbbbbbk...',
      '...kbwwwwwwbk...',
      '...kbbbbbbbbk...',
      '...kBBBBBBBBk...',
      '...kkkkkkkkkk...',
      '......kddk......',
      '......kddk......',
      '......kddk......',
      '......kddk......',
      '.....kkddkk.....',
      '................',
      '................',
    ];
    p.map(0, 0, rows, { k: C.ink, B: C.blueD, b: C.blue, w: C.white, d: C.woodD }, 'mailbox');
  },

  rock: (p) => {
    grassBase(p);
    const rows = [
      '................',
      '................',
      '......kkkk......',
      '....kkLLLLkk....',
      '...kLLLLLLSSk...',
      '..kLLLLSSSSSSk..',
      '..kLLSSSSSSSSk..',
      '.kLLSSSSSSSSDDk.',
      '.kLSSSSSSSDDDDk.',
      '.kSSSSSSDDDDDDk.',
      '.kSSSSDDDDDDDDk.',
      '..kSDDDDDDDDDk..',
      '..kkDDDDDDDDkk..',
      '....kkkkkkkk....',
      '................',
      '................',
    ];
    p.map(0, 0, rows, { k: C.stoneX, L: C.stoneL, S: C.stone, D: C.stoneD }, 'rock');
  },

  bridge: (p) => {
    p.fill(C.water);
    // planks (horizontal walkway) with rails left/right
    p.rect(2, 0, 12, 16, C.wood);
    for (let y = 0; y < 16; y += 4) { p.hline(2, y, 12, C.woodD); p.hline(2, y + 1, 12, C.woodL); }
    p.vline(1, 0, 16, C.woodX); p.vline(14, 0, 16, C.woodX);
    p.vline(0, 0, 16, C.woodD); p.vline(15, 0, 16, C.woodD);
    p.vline(2, 0, 16, C.woodL); p.vline(13, 0, 16, C.woodD);
  },

  stairs_out: (p) => {
    p.fill(C.stone);
    for (let y = 0; y < 16; y += 4) { p.hline(0, y, 16, C.stoneL); p.hline(0, y + 3, 16, C.stoneX); p.hline(0, y + 2, 16, C.stoneD); }
    p.vline(0, 0, 16, C.stoneX); p.vline(15, 0, 16, C.stoneX);
  },

  cave: (p) => {
    p.fill(C.stoneD);
    const rows = [
      'SSSSSSSSSSSSSSSS',
      'SLSSSSLSSSSSLSSS',
      'SSSSkkkkkkkkSSSS',
      'SSSkkkkkkkkkkSSS',
      'SSkkkkkkkkkkkkSS',
      'SSkkkkkkkkkkkkSS',
      'SkkkkkkkkkkkkkkS',
      'SkkkkkkkkkkkkkkS',
      'SkkkkkkkkkkkkkkS',
      'SkkkkkkkkkkkkkkS',
      'SkkkkkkkkkkkkkkS',
      'SkkkkkkkkkkkkkkS',
      'SkkkkkkkkkkkkkkS',
      'SkkkkkkkkkkkkkkS',
      'DDDDDDDDDDDDDDDD',
      'DDDDDDDDDDDDDDDD',
    ];
    p.map(0, 0, rows, { S: C.stone, L: C.stoneL, k: '#101018', D: C.stoneX }, 'cave');
  },

  // ------------------------------------------------------------ indoor ----
  floor_wood: (p) => {
    p.fill(C.floorWood);
    for (let y = 0; y < 16; y += 8) {
      p.hline(0, y, 16, C.floorWoodD);
      p.hline(0, y + 1, 16, C.floorWoodL);
    }
    p.vline(5, 0, 8, C.floorWoodD); p.vline(12, 8, 8, C.floorWoodD);
    p.px(9, 4, C.floorWoodD); p.px(2, 12, C.floorWoodD);
  },
  floor_tile: (p) => {
    p.fill(C.tile);
    p.hline(0, 0, 16, C.tileD); p.vline(0, 0, 16, C.tileD);
    p.hline(1, 1, 15, C.tileL); p.vline(1, 1, 15, C.tileL);
    p.hline(0, 8, 16, C.tileD); p.vline(8, 0, 16, C.tileD);
    p.hline(1, 9, 15, C.tileL); p.vline(9, 1, 15, C.tileL);
  },
  floor_lab: (p) => {
    p.fill(C.lab);
    p.hline(0, 0, 16, C.labD); p.vline(0, 0, 16, C.labD);
    p.hline(1, 1, 15, C.labL); p.vline(1, 1, 15, C.labL);
    p.px(8, 8, C.labD); p.px(7, 8, C.labD); p.px(8, 7, C.labD);
  },
  floor_gym: (p) => {
    p.fill(C.gym);
    p.hline(0, 0, 16, C.gymD); p.vline(0, 0, 8, C.gymD); p.hline(0, 8, 16, C.gymD); p.vline(8, 8, 8, C.gymD);
    p.hline(1, 1, 15, C.gymL); p.hline(1, 9, 15, C.gymL);
    p.px(5, 5, C.gymD); p.px(12, 12, C.gymD);
  },

  wall: (p) => wallBase(p),
  wall_window: (p) => {
    wallBase(p);
    const rows = [
      '................',
      '..kkkkkkkkkkkk..',
      '..kwwwwwwwwwwk..',
      '..kwSSSSwSSSSwk.',
      '..kwSSLSwSSLSwk.',
      '..kwSSSSwSSSSwk.',
      '..kwwwwwwwwwwk..',
      '..kwSSSSwSSSSwk.',
      '..kwSSSSwSSSSwk.',
      '..kwSSSSwSSSSwk.',
      '..kwwwwwwwwwwk..',
      '..kkkkkkkkkkkk..',
      '................',
      '................',
      '................',
      '................',
    ];
    p.map(0, 0, rows, { k: C.trimD, w: C.white, S: C.sky, L: C.white }, 'wall_window');
  },
  wall_poster: (p) => {
    wallBase(p);
    const rows = [
      '................',
      '...kkkkkkkkkk...',
      '...kwwwwwwwwk...',
      '...kwwwrrwwwk...',
      '...kwwrrrrwwk...',
      '...kwwrkkrwwk...',
      '...kwwwkkwwwk...',
      '...kwwwwwwwwk...',
      '...kwbbbbbbwk...',
      '...kwwwwwwwwk...',
      '...kwbbbbwwwk...',
      '...kwwwwwwwwk...',
      '...kkkkkkkkkk...',
      '................',
      '................',
      '................',
    ];
    p.map(0, 0, rows, { k: C.trimD, w: C.white, r: C.red, b: C.blue }, 'wall_poster');
  },
  wall_clock: (p) => {
    wallBase(p);
    const rows = [
      '................',
      '.....kkkkkk.....',
      '....kwwwwwwk....',
      '...kwwwkkwwwk...',
      '...kwwwwkwwwk...',
      '...kwwwwkwwwk...',
      '...kwkkkkkkwk...',
      '...kwwwwkwwwk...',
      '...kwwwwwwwwk...',
      '....kwwwwwwk....',
      '.....kkkkkk.....',
      '................',
      '................',
      '................',
      '................',
      '................',
    ];
    p.map(0, 0, rows, { k: C.ink2, w: C.white }, 'wall_clock');
  },

  bookshelf: (p) => {
    const rows = [
      'kkkkkkkkkkkkkkkk',
      'kWWWWWWWWWWWWWWk',
      'kwkkkkkkkkkkkkwk',
      'kwrrbbggyyrrbbwk',
      'kwrrbbggyyrrbbwk',
      'kwrRbBgGyYrRbBwk',
      'kwkkkkkkkkkkkkwk',
      'kwwwwwwwwwwwwwwk',
      'kwkkkkkkkkkkkkwk',
      'kwggyyrrbbggyywk',
      'kwggyyrrbbggyywk',
      'kwgGyYrRbBgGyYwk',
      'kwkkkkkkkkkkkkwk',
      'kwwwwwwwwwwwwwwk',
      'kddddddddddddddk',
      'kkkkkkkkkkkkkkkk',
    ];
    p.map(0, 0, rows, { k: C.woodX, W: C.woodL, w: C.wood, d: C.woodD, r: C.red, R: C.redD, b: C.blue, B: C.blueD, g: C.green, G: C.greenD, y: C.yellow, Y: C.yellowD }, 'bookshelf');
  },

  pc: (p) => {
    p.fill(C.floorWood);
    const rows = [
      '....kkkkkkkk....',
      '...kGGGGGGGGk...',
      '...kGkkkkkkGk...',
      '...kGkssssskGk..',
      '...kGkslsssskGk.',
      '...kGkssssskGk..',
      '...kGkkkkkkGk...',
      '...kGGGGGGGGk...',
      '....kkkGGkkk....',
      '.....kGGGGk.....',
      'kkkkkkkkkkkkkkkk',
      'kWWWWWWWWWWWWWWk',
      'kwwkkkkkkkkkkwwk',
      'kwwkggggggggkwwk',
      'kwwkkkkkkkkkkwwk',
      'kkkkkkkkkkkkkkkk',
    ];
    p.map(0, 0, rows, { k: C.ink, G: C.gray2, s: '#60c0e0', l: C.white, W: C.woodL, w: C.wood, g: C.gray1 }, 'pc');
  },

  tv: (p) => {
    p.fill(C.floorWood);
    const rows = [
      '.....k....k.....',
      '......k..k......',
      '.kkkkkkkkkkkkkk.',
      '.kGGGGGGGGGGGGk.',
      '.kGkkkkkkkkkkGk.',
      '.kGksssslssskGk.',
      '.kGkssssssssKGk.',
      '.kGkSSSSSSSSKGk.',
      '.kGkkkkkkkkkkGk.',
      '.kGGGGGGrGGGGGk.',
      '.kkkkkkkkkkkkkk.',
      'kkkkkkkkkkkkkkkk',
      'kWWWWWWWWWWWWWWk',
      'kwwwwwwwwwwwwwwk',
      'kddddddddddddddk',
      'kkkkkkkkkkkkkkkk',
    ];
    p.map(0, 0, rows, { k: C.ink, G: C.gray3, s: '#78c8e8', S: '#4890c0', K: '#3070a0', l: C.white, r: C.red, W: C.woodL, w: C.wood, d: C.woodD }, 'tv');
  },

  bed_top: (p) => {
    p.fill(C.floorWood);
    const rows = [
      '.kkkkkkkkkkkkkk.',
      '.kWWWWWWWWWWWWk.',
      '.kwwwwwwwwwwwwk.',
      '.kwwwwwwwwwwwwk.',
      '.kkkkkkkkkkkkkk.',
      '.kLLLLLLLLLLLLk.',
      '.kLkkkkkkkkkkLk.',
      '.kLkPPPPPPPPkLk.',
      '.kLkPPPPPPPPkLk.',
      '.kLkPpppppppkLk.',
      '.kLkkkkkkkkkkLk.',
      '.kLLLLLLLLLLLLk.',
      '.kLLLLLLLLLLLLk.',
      '.kkkkkkkkkkkkkk.',
      '.krrrrrrrrrrrrk.',
      '.krrrrrrrrrrrrk.',
    ];
    p.map(0, 0, rows, { k: C.ink2, W: C.woodL, w: C.wood, L: C.white, P: C.white, p: C.gray1, r: C.red }, 'bed_top');
  },
  bed_bottom: (p) => {
    p.fill(C.floorWood);
    const rows = [
      '.krrrrrrrrrrrrk.',
      '.krRrrrrRrrrrRk.',
      '.krrrrrrrrrrrrk.',
      '.krrrRrrrrRrrrk.',
      '.krrrrrrrrrrrrk.',
      '.krRrrrrRrrrrRk.',
      '.krrrrrrrrrrrrk.',
      '.krrrRrrrrRrrrk.',
      '.krrrrrrrrrrrrk.',
      '.kRRRRRRRRRRRRk.',
      '.kkkkkkkkkkkkkk.',
      '.kWWWWWWWWWWWWk.',
      '.kwwwwwwwwwwwwk.',
      '.kkkkkkkkkkkkkk.',
      '.kd..........dk.',
      '.kk..........kk.',
    ];
    p.map(0, 0, rows, { k: C.ink2, r: C.red, R: C.redD, W: C.woodL, w: C.wood, d: C.woodD }, 'bed_bottom');
  },

  table: (p) => {
    p.fill(C.floorWood);
    const rows = [
      '................',
      '.kkkkkkkkkkkkkk.',
      'kWWWWWWWWWWWWWWk',
      'kWwwwwwwwwwwwwWk',
      'kWwwwwwwwwwwwwWk',
      'kWwwwwwwwwwwwwWk',
      'kWwwwwwwwwwwwwWk',
      'kWwwwwwwwwwwwwWk',
      'kWwwwwwwwwwwwwWk',
      'kWWWWWWWWWWWWWWk',
      'kddddddddddddddk',
      'kkkkkkkkkkkkkkkk',
      '.kdk........kdk.',
      '.kdk........kdk.',
      '.kkk........kkk.',
      '................',
    ];
    p.map(0, 0, rows, { k: C.woodX, W: C.woodL, w: C.wood, d: C.woodD }, 'table');
  },
  table_ball: (p) => {
    builders.table(p, 0, 0);
    const rows = [
      '.....kkkkkk.....',
      '....kRRRRRRk....',
      '...kRRRrRRRRk...',
      '...kRRRRRRRRk...',
      '...kkkkkkkkkk...',
      '...kwwkkkkwwwk..',
      '...kwwkwwkwwwk..',
      '...kwwwkkwwwwk..',
      '....kwwwwwwk....',
      '.....kkkkkk.....',
    ];
    p.map(0, 1, rows, { k: C.ink, R: C.red, r: '#ff9090', w: C.white }, 'table_ball');
  },

  chair: (p) => {
    p.fill(C.floorWood);
    const rows = [
      '................',
      '...kkkkkkkkkk...',
      '...kWWWWWWWWk...',
      '...kwkkkkkkwk...',
      '...kwkkkkkkwk...',
      '...kWWWWWWWWk...',
      '...kkkkkkkkkk...',
      '..kWWWWWWWWWWk..',
      '..kwwwwwwwwwwk..',
      '..kwwwwwwwwwwk..',
      '..kkkkkkkkkkkk..',
      '..kdk......kdk..',
      '..kdk......kdk..',
      '..kkk......kkk..',
      '................',
      '................',
    ];
    p.map(0, 0, rows, { k: C.woodX, W: C.woodL, w: C.wood, d: C.woodD }, 'chair');
  },

  plant: (p) => {
    p.fill(C.floorWood);
    const rows = [
      '......kk........',
      '....kkLLk.kk....',
      '...kLLLLLkLLk...',
      '..kLLMMLLLLLLk..',
      '..kLMMMMkLMMLk..',
      '.kLMMMMMkMMMMk..',
      '.kMMMMDMkMDMMMk.',
      '..kMDDDDkDDDMk..',
      '...kkDDDkDDkk...',
      '.....kkkkkk.....',
      '....kOOOOOOk....',
      '....kOooooOk....',
      '.....kOoooOk....',
      '.....kOoooOk....',
      '.....kkkkkk.....',
      '................',
    ];
    p.map(0, 0, rows, { k: C.leafX, L: C.leafL, M: C.leaf, D: C.leafD, O: '#e08050', o: '#c06030' }, 'plant');
  },

  stairs_up: (p) => {
    p.fill(C.floorWood);
    const rows = [
      'kkkkkkkkkkkkkkkk',
      'kWWWWWWWWWWWWWWk',
      'kddddddddddddddk',
      'kkkkkkkkkkkkkkkk',
      'kWWWWWWWWWWWWWWk',
      'kwwwwwwwwwwwwwwk',
      'kddddddddddddddk',
      'kkkkkkkkkkkkkkkk',
      'kWWWWWWWWWWWWWWk',
      'kwwwwwwwwwwwwwwk',
      'kwwwwwwwwwwwwwwk',
      'kddddddddddddddk',
      'kkkkkkkkkkkkkkkk',
      'kWWWWWWWWWWWWWWk',
      'kwwwwwwwwwwwwwwk',
      'kwwwwwwwwwwwwwwk',
    ];
    p.map(0, 0, rows, { k: C.woodX, W: C.woodL, w: C.wood, d: C.woodD }, 'stairs_up');
  },
  stairs_down: (p) => {
    p.fill(C.floorWood);
    const rows = [
      'kwwwwwwwwwwwwwwk',
      'kwwwwwwwwwwwwwwk',
      'kddddddddddddddk',
      'kkkkkkkkkkkkkkkk',
      'kwwwwwwwwwwwwwwk',
      'kddddddddddddddk',
      'kkkkkkkkkkkkkkkk',
      'kddddddddddddddk',
      'kDDDDDDDDDDDDDDk',
      'kkkkkkkkkkkkkkkk',
      'kDDDDDDDDDDDDDDk',
      'kXXXXXXXXXXXXXXk',
      'kkkkkkkkkkkkkkkk',
      'kXXXXXXXXXXXXXXk',
      'kkkkkkkkkkkkkkkk',
      'kkkkkkkkkkkkkkkk',
    ];
    p.map(0, 0, rows, { k: C.woodX, w: C.wood, d: C.woodD, D: '#503820', X: '#302010' }, 'stairs_down');
  },

  mat: (p) => {
    p.fill(C.floorWood);
    p.rect(1, 2, 14, 12, '#7890a8');
    p.frame(1, 2, 14, 12, '#506880');
    p.frame(3, 4, 10, 8, '#a0b8c8');
    p.rect(5, 6, 6, 4, '#8aa0b4');
  },

  counter: (p) => {
    const rows = [
      'kkkkkkkkkkkkkkkk',
      'kWWWWWWWWWWWWWWk',
      'kWwwwwwwwwwwwwWk',
      'kWwwwwwwwwwwwwWk',
      'kWWWWWWWWWWWWWWk',
      'kkkkkkkkkkkkkkkk',
      'kddddddddddddddk',
      'kdDDdDDdDDdDDdDk',
      'kdDDdDDdDDdDDdDk',
      'kddddddddddddddk',
      'kdDDdDDdDDdDDdDk',
      'kdDDdDDdDDdDDdDk',
      'kddddddddddddddk',
      'kdDDdDDdDDdDDdDk',
      'kXXXXXXXXXXXXXXk',
      'kkkkkkkkkkkkkkkk',
    ];
    p.map(0, 0, rows, { k: C.woodX, W: C.woodL, w: '#f0e0c0', d: C.wood, D: C.woodD, X: '#503820' }, 'counter');
  },

  heal_machine: (p, frame) => {
    p.fill(C.tile);
    const blink = (frame & 1) === 0;
    const rows = [
      '.kkkkkkkkkkkkkk.',
      'kGGGGGGGGGGGGGGk',
      'kGkkkkkkkkkkkkGk',
      'kGkrwkrwkrwkkkGk',
      'kGkwwkwwkwwkkkGk',
      'kGkkkkkkkkkkkkGk',
      'kGkrwkrwkrwkkkGk',
      'kGkwwkwwkwwkkkGk',
      'kGkkkkkkkkkkkkGk',
      'kGGGGGGGGGGgGGGk',
      'kGGGGGGGGGGGGGGk',
      'kkkkkkkkkkkkkkkk',
      'kDDDDDDDDDDDDDDk',
      'kDDDDDDDDDDDDDDk',
      'kDDDDDDDDDDDDDDk',
      'kkkkkkkkkkkkkkkk',
    ];
    p.map(0, 0, rows, { k: C.ink, G: C.gray1, r: C.red, w: C.white, g: blink ? '#40e060' : '#207030', D: C.gray2 }, 'heal_machine');
    // light bar
    p.hline(3, 9, 8, blink ? '#60e8ff' : '#3090b0');
  },

  lab_machine: (p, frame) => {
    p.fill(C.lab);
    const a = (frame & 1) === 0;
    const rows = [
      '.kkkkkkkkkkkkkk.',
      'kGGGGGGGGGGGGGGk',
      'kGkkkkkkkkGGGGGk',
      'kGkssssssskGaGGk',
      'kGkssllsssskGGGk',
      'kGksssssssskGbGk',
      'kGkkkkkkkkkGGGGk',
      'kGGGGGGGGGGGGGGk',
      'kGkkkkkkkkkkkkGk',
      'kGkcGcGcGcGcGkGk',
      'kGkkkkkkkkkkkkGk',
      'kGGGGGGGGGGGGGGk',
      'kkkkkkkkkkkkkkkk',
      'kDDDDDDDDDDDDDDk',
      'kDDDDDDDDDDDDDDk',
      'kkkkkkkkkkkkkkkk',
    ];
    p.map(0, 0, rows, { k: C.ink, G: C.gray2, s: '#60d090', l: C.white, a: a ? '#ff6060' : '#803030', b: a ? '#306030' : '#60ff60', c: a ? C.yellow : C.yellowD, D: C.gray3 }, 'lab_machine');
  },

  fridge: (p) => {
    p.fill(C.floorWood);
    const rows = [
      '..kkkkkkkkkkkk..',
      '..kWWWWWWWWWWk..',
      '..kWwwwwwwwwWk..',
      '..kWwwwwwwwkWk..',
      '..kWwwwwwwwkWk..',
      '..kWwwwwwwwwWk..',
      '..kkkkkkkkkkkk..',
      '..kWwwwwwwwwWk..',
      '..kWwwwwwwwkWk..',
      '..kWwwwwwwwkWk..',
      '..kWwwwwwwwkWk..',
      '..kWwwwwwwwwWk..',
      '..kWwwwwwwwwWk..',
      '..kGGGGGGGGGGk..',
      '..kkkkkkkkkkkk..',
      '................',
    ];
    p.map(0, 0, rows, { k: C.ink2, W: C.gray1, w: C.white, G: C.gray2 }, 'fridge');
  },

  sink: (p) => {
    p.fill(C.floorWood);
    const rows = [
      '................',
      '.......kk.......',
      '.......kGk......',
      '.......kGGk.....',
      '.kkkkkkkGkkkkkk.',
      'kWWWWWWWWWWWWWWk',
      'kWwkkkkkkkkkkwWk',
      'kWwkssssssssskWk',
      'kWwkssssssssskWk',
      'kWwkkkkkkkkkkwWk',
      'kWWWWWWWWWWWWWWk',
      'kkkkkkkkkkkkkkkk',
      'kGGGGGGGGGGGGGGk',
      'kGGGGGGkkGGGGGGk',
      'kGGGGGGGGGGGGGGk',
      'kkkkkkkkkkkkkkkk',
    ];
    p.map(0, 0, rows, { k: C.ink2, W: C.gray1, w: C.white, G: C.gray2, s: C.sky }, 'sink');
  },

  mirror: (p) => {
    p.fill(C.floorWood);
    const rows = [
      '....kkkkkkkk....',
      '...kWWWWWWWWk...',
      '..kWkkkkkkkkWk..',
      '..kWkssslssskWk.',
      '..kWksslsssskWk.',
      '..kWkssssssskWk.',
      '..kWkssssssskWk.',
      '..kWkssssssskWk.',
      '..kWkssssssskWk.',
      '..kWkSSSSSSSkWk.',
      '..kWkkkkkkkkWk..',
      '...kWWWWWWWWk...',
      '....kkkkkkkk....',
      '......kddk......',
      '....kkkddkkk....',
      '....kkkkkkkk....',
    ];
    p.map(0, 0, rows, { k: C.woodX, W: C.woodL, s: '#c0e8f8', S: '#98c8e0', l: C.white, d: C.woodD }, 'mirror');
  },

  gym_statue: (p) => {
    p.fill(C.gym);
    const rows = [
      '......kkkk......',
      '....kkLLLLkk....',
      '...kLLLLLLLLk...',
      '...kLLLkkLLLk...',
      '...kkkkkkkkkk...',
      '...kSSSkkSSSk...',
      '...kSSSSSSSSk...',
      '....kSSSSSSk....',
      '.....kkkkkk.....',
      '......kDDk......',
      '.....kDDDDk.....',
      '....kkkkkkkk....',
      '...kSSSSSSSSk...',
      '...kSSSSSSSSk...',
      '..kDDDDDDDDDDk..',
      '..kkkkkkkkkkkk..',
    ];
    p.map(0, 0, rows, { k: C.stoneX, L: C.stoneL, S: C.stone, D: C.stoneD }, 'gym_statue');
  },

  gym_rock: (p) => {
    p.fill(C.gym);
    const rows = [
      '................',
      '.....kkkkk......',
      '...kkLLLLLkk....',
      '..kLLLLLLLLLk...',
      '.kLLLLLSSSSSSk..',
      '.kLLLSSSSSSSSSk.',
      'kLLSSSSSSSSSSDk.',
      'kLSSSSSSSSSDDDk.',
      'kSSSSSSSSDDDDDDk',
      'kSSSSSSDDDDDDDDk',
      'kSSSSDDDDDDDDDDk',
      '.kSDDDDDDDDDDDk.',
      '.kkDDDDDDDDDDkk.',
      '..kkkkkkkkkkkk..',
      '................',
      '................',
    ];
    p.map(0, 0, rows, { k: '#3c2c20', L: '#c8b090', S: '#a08868', D: '#786048' }, 'gym_rock');
  },

  blackboard: (p) => {
    wallBase(p);
    const rows = [
      'kkkkkkkkkkkkkkkk',
      'kWWWWWWWWWWWWWWk',
      'kWggggggggggggWk',
      'kWgwwgwgggwwggWk',
      'kWggggggggggggWk',
      'kWgwgwwwgwgwggWk',
      'kWggggggggggggWk',
      'kWggwwgggwwwggWk',
      'kWggggggggggggWk',
      'kWgwwwgwggwgggWk',
      'kWggggggggggggWk',
      'kWWWWWWWWWWWWWWk',
      'kkkkkkkkkkkkkkkk',
      '................',
      '................',
      '................',
    ];
    p.map(0, 0, rows, { k: C.woodX, W: C.woodL, g: '#2c5838', w: '#e8f0e0' }, 'blackboard');
  },

  desk: (p) => {
    p.fill(C.floorWood);
    const rows = [
      '................',
      '.kkkkkkkkkkkkkk.',
      'kWWWWWWWWWWWWWWk',
      'kWwwwwwwwwwwwwWk',
      'kWwwbbbbwwwwwwWk',
      'kWwwbbbbwwwwwwWk',
      'kWwwwwwwwwwwwwWk',
      'kWWWWWWWWWWWWWWk',
      'kkkkkkkkkkkkkkkk',
      '.kGk........kGk.',
      '.kGk........kGk.',
      '.kGk........kGk.',
      '.kGk........kGk.',
      '.kkk........kkk.',
      '................',
      '................',
    ];
    p.map(0, 0, rows, { k: C.woodX, W: C.floorWoodL, w: '#f0d8a8', b: C.blue, G: C.gray2 }, 'desk');
  },

  carpet: (p) => {
    p.fill(C.carpet);
    p.frame(0, 0, 16, 16, C.carpetD);
    p.frame(2, 2, 12, 12, C.carpetL);
    p.px(7, 7, C.carpetL); p.px(8, 8, C.carpetL); p.px(7, 8, C.carpetD); p.px(8, 7, C.carpetD);
  },
};

function wallBase(p: Painter): void {
  p.fill(C.wallpaper);
  for (let x = 3; x < 16; x += 6) p.vline(x, 0, 12, C.wallpaperD);
  p.hline(0, 0, 16, C.wallpaperD);
  p.rect(0, 12, 16, 2, C.trim);
  p.hline(0, 14, 16, C.trimD);
  p.hline(0, 15, 16, C.trimD);
}

function waterTile(p: Painter, frame: number, mask: number): void {
  p.fill(C.water);
  const f = frame & 3;
  const off = [0, 1, 2, 1][f];
  // ripple highlights (two short strokes, drifting)
  const strokes: [number, number, number][] = [[2, 3, 4], [9, 7, 5], [4, 12, 4], [12, 1, 3]];
  for (const [x, y, len] of strokes) {
    const yy = (y + off) & 15;
    p.hline((x + f) & 15, yy, len, C.waterL);
    p.hline((x + f + 1) & 15, (yy + 1) & 15, len - 2, C.waterD);
  }
  // shoreline foam where neighbor is not water
  const n = mask & 1, e = mask & 2, s = mask & 4, w = mask & 8;
  const foamH = (y: number, y2: number) => {
    for (let x = 0; x < 16; x++) {
      p.px(x, y, C.foam);
      if (((x + f) % 4) < 2) p.px(x, y2, C.waterL);
    }
  };
  const foamV = (x: number, x2: number) => {
    for (let y = 0; y < 16; y++) {
      p.px(x, y, C.foam);
      if (((y + f) % 4) < 2) p.px(x2, y, C.waterL);
    }
  };
  if (!n) foamH(0, 1);
  if (!s) foamH(15, 14);
  if (!w) foamV(0, 1);
  if (!e) foamV(15, 14);
  // dark edge on the far side gives depth (only when fully surrounded)
  if (n && e && s && w) { /* nothing */ }
}

// ------------------------------------------------------------- cache ------
const cache = new Map<TileId, (HTMLCanvasElement | undefined)[]>();

function variantIndex(id: TileId, frame: number, mask: number): number {
  const info = TILE_INFO[id];
  const nf = TILE_FRAMES[id] ?? 1;
  const f = info.animated ? ((frame % nf) + nf) % nf : 0;
  const m = info.autotile ? (mask & 15) : 0;
  return f * 16 + m;
}

export function tileCanvas(id: TileId, frame = 0, mask = 0): HTMLCanvasElement {
  let arr = cache.get(id);
  if (!arr) { arr = new Array(64); cache.set(id, arr); }
  const idx = variantIndex(id, frame, mask);
  let c = arr[idx];
  if (!c) {
    const p = new Painter(16, 16);
    const b = builders[id] ?? builders.black;
    const nf = TILE_FRAMES[id] ?? 1;
    b(p, TILE_INFO[id].animated ? ((frame % nf) + nf) % nf : 0, TILE_INFO[id].autotile ? (mask & 15) : 0);
    c = p.toCanvas();
    arr[idx] = c;
  }
  return c;
}

/** Pre-bake every tile variant (all frames × masks that matter). */
export function initTiles(): void {
  for (const id of TILE_IDS) {
    const info = TILE_INFO[id];
    const nf = info.animated ? (TILE_FRAMES[id] ?? 1) : 1;
    const nm = info.autotile ? 16 : 1;
    for (let f = 0; f < nf; f++) for (let m = 0; m < nm; m++) tileCanvas(id, f, m);
  }
}

export function drawTile(ctx: CanvasRenderingContext2D, id: TileId, px: number, py: number, frame = 0, mask = 0): void {
  ctx.drawImage(tileCanvas(id, frame, mask ?? 0), px, py);
}
