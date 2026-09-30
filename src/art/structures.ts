// ============================================================================
// Art: multi-tile buildings (GSC look), baked once into canvases.
// Sizes & door offsets are the contract in docs/DESIGN.md §7.3.
// ============================================================================
import type { StructureInfo, StructureKind } from '../core/types';
import { C, Painter, drawText3, textWidth3 } from './palette';

export const STRUCTURES: Record<StructureKind, StructureInfo> = {
  house: { w: 4, h: 3, door: { x: 1, y: 2 } }, house_blue: { w: 4, h: 3, door: { x: 1, y: 2 } },
  lab: { w: 6, h: 4, door: { x: 2, y: 3 } }, center: { w: 5, h: 4, door: { x: 2, y: 3 } },
  mart: { w: 4, h: 3, door: { x: 1, y: 2 } }, gym: { w: 6, h: 5, door: { x: 2, y: 4 } },
  school: { w: 5, h: 4, door: { x: 2, y: 3 } }, museum: { w: 6, h: 4, door: null }, gate: { w: 4, h: 2, door: { x: 1, y: 1 } },
};
export const STRUCTURE_KINDS = Object.keys(STRUCTURES) as StructureKind[];

const INK = C.ink;

// ------------------------------------------------------------ helpers -----
/** Shingled roof (GSC style): horizontal bands with staggered ticks, ink outline. */
function shingleRoof(p: Painter, x: number, y: number, w: number, h: number, L: string, M: string, D: string): void {
  p.rect(x, y, w, h, M);
  for (let yy = 0; yy < h; yy++) {
    const band = yy % 4;
    if (band === 0) p.hline(x, y + yy, w, L);
    if (band === 3) p.hline(x, y + yy, w, D);
    if (band === 1 || band === 2) {
      const stagger = (Math.floor(yy / 4) % 2) * 4;
      for (let xx = stagger; xx < w; xx += 8) p.px(x + xx, y + yy, D);
    }
  }
  p.frame(x, y, w, h, INK);
  p.hline(x + 1, y + 1, w - 2, L);
}

/** Flat wall block with ink outline and dark base line. */
function wallBlock(p: Painter, x: number, y: number, w: number, h: number, M: string, D: string): void {
  p.rect(x, y, w, h, M);
  p.hline(x, y + h - 2, w, D);
  p.frame(x, y, w, h, INK);
  // eave shadow under the roof
  p.hline(x + 1, y + 1, w - 2, D);
}

/** Window (10×9 default): ink frame, white sash, sky glass. */
function windowAt(p: Painter, x: number, y: number, w = 10, h = 9): void {
  p.rect(x, y, w, h, C.white);
  p.frame(x, y, w, h, INK);
  p.rect(x + 2, y + 2, w - 4, h - 4, C.sky);
  const mx = x + Math.floor(w / 2), my = y + Math.floor(h / 2);
  p.vline(mx, y + 1, h - 2, C.white); p.hline(x + 1, my, w - 2, C.white);
  p.px(x + 2, y + 2, C.white); p.px(x + 3, y + 2, C.white);
}

/** Wooden door filling most of a 16×16 tile cell whose top-left is (x,y). */
function woodDoor(p: Painter, x: number, y: number): void {
  p.rect(x + 2, y + 2, 12, 14, C.woodD);
  p.frame(x + 2, y + 2, 12, 14, INK);
  p.rect(x + 4, y + 4, 8, 11, C.wood);
  p.hline(x + 4, y + 4, 8, C.woodL); p.vline(x + 4, y + 4, 11, C.woodL);
  p.hline(x + 4, y + 9, 8, C.woodD);
  p.px(x + 10, y + 10, C.yellow); p.px(x + 10, y + 11, C.yellowD);
  // top arch
  p.hline(x + 3, y + 1, 10, INK);
}

/** Glass sliding door (Center / Mart). */
function glassDoor(p: Painter, x: number, y: number): void {
  p.rect(x + 1, y + 1, 14, 15, C.gray2);
  p.frame(x + 1, y + 1, 14, 15, INK);
  p.rect(x + 3, y + 3, 4, 12, C.sky); p.rect(x + 9, y + 3, 4, 12, C.sky);
  p.frame(x + 3, y + 3, 4, 12, C.white); p.frame(x + 9, y + 3, 4, 12, C.white);
  p.vline(x + 7, y + 3, 12, C.gray3); p.vline(x + 8, y + 3, 12, C.gray3);
  p.px(x + 4, y + 4, C.white); p.px(x + 10, y + 4, C.white);
}

/** Sign board with 3×5 text. */
function signBoard(p: Painter, cx: number, y: number, text: string, bg: string, fg: string, border = INK): void {
  const tw = textWidth3(text);
  const w = tw + 6, h = 9;
  const x = Math.round(cx - w / 2);
  p.rect(x, y, w, h, bg);
  p.frame(x, y, w, h, border);
  drawText3(p, x + 3, y + 2, text, fg);
}

/** Small Pokéball emblem, 9×9. */
function ballEmblem(p: Painter, x: number, y: number): void {
  const rows = [
    '..kkkkk..',
    '.kRRRRRk.',
    'kRRrRRRRk',
    'kRRRRRRRk',
    'kkkkwkkkk',
    'kwwkkkwwk',
    'kwwwwwwwk',
    '.kwwwwwk.',
    '..kkkkk..',
  ];
  p.map(x, y, rows, { k: INK, R: C.red, r: '#ff9090', w: C.white }, 'ball');
}

/** 8×8 Hangul glyphs for the 연구소 sign. */
const HANGUL: Record<string, string[]> = {
  연: ['.oo..o.o', 'o..o.ooo', 'o..o.o.o', '.oo..o.o', '........', '.o......', '.o......', '.oooooo.'],
  구: ['.ooooo..', '.....o..', '.....o..', '........', 'oooooooo', '....o...', '....o...', '....o...'],
  소: ['...oo...', '..o..o..', '.o....o.', '........', '...o....', '...o....', 'oooooooo', '........'],
};
function hangulSign(p: Painter, cx: number, y: number, text: string, bg: string, fg: string): void {
  const w = text.length * 9 + 5, h = 12;
  const x = Math.round(cx - w / 2);
  p.rect(x, y, w, h, bg); p.frame(x, y, w, h, INK);
  let gx = x + 3;
  for (const ch of text) { p.map(gx, y + 2, HANGUL[ch], { o: fg }, 'hangul'); gx += 9; }
}

// --------------------------------------------------------------- kinds ----
type Builder = (p: Painter) => void;

function simpleHouse(p: Painter, roof: [string, string, string]): void {
  // 64×48: roof rows 0..21, walls 22..47
  shingleRoof(p, 0, 0, 64, 22, roof[0], roof[1], roof[2]);
  // chimney
  p.rect(50, -0 + 1, 6, 6, C.stoneD); p.frame(50, 1, 6, 6, INK); p.hline(51, 2, 4, C.stoneL);
  wallBlock(p, 1, 22, 62, 26, C.wallCream, C.wallCreamD);
  windowAt(p, 42, 28); windowAt(p, 6, 28);
  woodDoor(p, 16, 32);
  // little step under the door
  p.hline(18, 47, 12, C.stoneD);
}

const builders: Record<StructureKind, Builder> = {
  house: (p) => simpleHouse(p, ['#ff8080', C.red, C.redD]),
  house_blue: (p) => simpleHouse(p, ['#90b0ff', C.blue, C.blueD]),

  lab: (p) => {
    // 96×64: big gray roof 0..25, white walls 26..63
    shingleRoof(p, 0, 0, 96, 26, C.stoneL, C.stone, C.stoneD);
    // antenna / dish on the roof
    p.rect(74, 3, 10, 6, C.gray1); p.frame(74, 3, 10, 6, INK); p.vline(79, 1, 3, INK); p.px(79, 0, C.red);
    wallBlock(p, 1, 26, 94, 38, C.wallWhite, C.wallWhiteD);
    windowAt(p, 6, 32); windowAt(p, 18, 32); windowAt(p, 68, 32); windowAt(p, 80, 32);
    windowAt(p, 6, 46, 10, 9); windowAt(p, 80, 46, 10, 9);
    hangulSign(p, 48, 30, '연구소', C.white, C.ink2);
    woodDoor(p, 32, 48);
    p.hline(34, 63, 12, C.stoneD);
  },

  center: (p) => {
    // 80×64: red roof 0..23, cream walls 24..63
    shingleRoof(p, 0, 0, 80, 24, '#ff8080', C.red, C.redD);
    wallBlock(p, 1, 24, 78, 40, C.wallCream, C.wallCreamD);
    windowAt(p, 6, 30); windowAt(p, 64, 30);
    windowAt(p, 6, 44); windowAt(p, 64, 44);
    // sign: P.C in red on white + ball emblem
    signBoard(p, 40, 28, 'P.C', C.white, C.red);
    ballEmblem(p, 22, 40); ballEmblem(p, 49, 40);
    glassDoor(p, 32, 48);
    p.hline(33, 63, 14, C.stoneD);
  },

  mart: (p) => {
    // 64×48: blue roof 0..19, walls 20..47
    shingleRoof(p, 0, 0, 64, 20, '#90b0ff', C.blue, C.blueD);
    wallBlock(p, 1, 20, 62, 28, C.wallCream, C.wallCreamD);
    signBoard(p, 32, 23, 'SHOP', C.blue, C.white);
    windowAt(p, 40, 34, 16, 9);
    windowAt(p, 4, 34, 8, 9);
    glassDoor(p, 16, 32);
    p.hline(17, 47, 14, C.stoneD);
  },

  gym: (p) => {
    // 96×80: stone building, flat roof with crenellation 0..19, stone walls 20..79
    p.rect(0, 0, 96, 20, '#8c7c6c');
    for (let x = 0; x < 96; x += 8) p.rect(x, 0, 4, 4, '#6c5c4c');
    p.hline(0, 4, 96, C.stoneL);
    p.rect(0, 5, 96, 15, C.stoneD);
    p.frame(0, 4, 96, 16, INK);
    // stone brick wall
    p.rect(1, 20, 94, 60, C.stone);
    for (let y = 20; y < 78; y += 6) {
      p.hline(1, y, 94, C.stoneD);
      const off = ((y - 20) / 6) % 2 === 0 ? 0 : 6;
      for (let x = 1 + off; x < 95; x += 12) p.vline(x, y, 6, C.stoneD);
      p.hline(1, y + 1, 94, C.stoneL);
    }
    p.frame(0, 20, 96, 60, INK);
    p.hline(0, 78, 96, C.stoneX);
    // sign GYM + octagon badge emblem
    signBoard(p, 48, 24, 'GYM', '#403830', C.yellow);
    const oct = [
      '...kkkkk...',
      '..kSSSSSk..',
      '.kSLLLLLSk.',
      'kSLLLLLLLSk',
      'kSLLLDLLLSk',
      'kSLLDDDLLSk',
      'kSLLLDLLLSk',
      'kSLLLLLLLSk',
      '.kSSSSSSSk.',
      '..kSSSSSk..',
      '...kkkkk...',
    ];
    p.map(43, 36, oct, { k: INK, S: C.gray2, L: C.stoneL, D: C.stoneD }, 'badge');
    windowAt(p, 8, 40, 12, 10); windowAt(p, 76, 40, 12, 10);
    windowAt(p, 8, 58, 12, 10); windowAt(p, 76, 58, 12, 10);
    // big double door at tile (2,4) → x 32..47, y 64..79
    p.rect(30, 62, 20, 18, C.woodX); p.frame(30, 62, 20, 18, INK);
    p.rect(32, 64, 7, 15, C.woodD); p.rect(41, 64, 7, 15, C.woodD);
    p.hline(32, 64, 7, C.wood); p.hline(41, 64, 7, C.wood);
    p.vline(39, 64, 15, INK); p.vline(40, 64, 15, INK);
    p.px(38, 72, C.yellow); p.px(41, 72, C.yellow);
    // torches by the door
    p.rect(26, 60, 2, 8, C.woodD); p.px(26, 58, C.orange); p.px(27, 58, C.yellow); p.px(26, 59, C.red); p.px(27, 59, C.orange);
    p.rect(52, 60, 2, 8, C.woodD); p.px(52, 58, C.orange); p.px(53, 58, C.yellow); p.px(52, 59, C.red); p.px(53, 59, C.orange);
  },

  school: (p) => {
    // 80×64: green roof 0..21, cream walls 22..63
    shingleRoof(p, 0, 0, 80, 22, '#88e898', C.green, C.greenD);
    // small clock tower peak
    p.rect(34, 0, 12, 8, C.wallCream); p.frame(34, 0, 12, 8, INK);
    p.rect(37, 2, 6, 5, C.white); p.frame(37, 2, 6, 5, INK); p.px(39, 4, INK); p.px(40, 4, INK); p.px(40, 3, INK);
    wallBlock(p, 1, 22, 78, 42, C.wallCream, C.wallCreamD);
    signBoard(p, 40, 26, 'SCHOOL', C.white, C.greenD);
    windowAt(p, 6, 30); windowAt(p, 18, 30); windowAt(p, 52, 30); windowAt(p, 64, 30);
    windowAt(p, 6, 46); windowAt(p, 64, 46);
    // flag pole
    p.vline(75, 38, 24, C.gray3); p.rect(72, 38, 3, 3, C.red);
    woodDoor(p, 32, 48);
    p.hline(34, 63, 12, C.stoneD);
  },

  museum: (p) => {
    // 96×64: white stone with a pediment and columns; decor only.
    // pediment (triangle) rows 0..17
    p.rect(0, 12, 96, 6, C.gray1);
    for (let y = 0; y < 12; y++) {
      const half = 44 - Math.floor(y * 44 / 12);
      p.hline(4 + half - 0, 11 - y, 88 - 2 * half, C.gray1);
      p.px(4 + half, 11 - y, INK); p.px(91 - half, 11 - y, INK);
    }
    p.hline(0, 12, 96, INK); p.hline(0, 17, 96, INK);
    p.hline(1, 13, 94, C.white); p.hline(1, 16, 94, C.gray2);
    // circular emblem in the pediment
    p.rect(44, 4, 8, 7, C.yellow); p.frame(44, 4, 8, 7, INK);
    // walls
    p.rect(0, 18, 96, 46, C.gray1);
    p.frame(0, 18, 96, 46, INK);
    p.hline(1, 62, 94, C.gray2);
    // columns
    for (const cx of [6, 24, 66, 84]) {
      p.rect(cx, 20, 6, 42, C.white);
      p.frame(cx, 20, 6, 42, C.gray3);
      p.rect(cx - 1, 20, 8, 2, C.gray2); p.frame(cx - 1, 20, 8, 2, INK);
      p.rect(cx - 1, 60, 8, 2, C.gray2); p.frame(cx - 1, 60, 8, 2, INK);
      p.vline(cx + 2, 22, 38, C.gray1);
    }
    // recessed central entrance with a closed door (decor)
    p.rect(36, 26, 24, 36, C.gray2); p.frame(36, 26, 24, 36, INK);
    p.rect(40, 30, 16, 30, C.woodX); p.frame(40, 30, 16, 30, INK);
    p.rect(42, 32, 5, 26, C.woodD); p.rect(49, 32, 5, 26, C.woodD);
    p.px(46, 46, C.yellow); p.px(49, 46, C.yellow);
    signBoard(p, 48, 20, 'MUSEUM', C.white, C.ink2);
    windowAt(p, 12, 34, 10, 12); windowAt(p, 74, 34, 10, 12);
  },

  gate: (p) => {
    // 64×32: small forest gate hut. roof rows 0..12, walls 13..31, door tile (1,1) → x 16..31, y 16..31
    shingleRoof(p, 0, 0, 64, 13, '#88e898', C.green, C.greenD);
    wallBlock(p, 1, 13, 62, 19, C.woodL, C.woodD);
    // plank texture
    for (let x = 9; x < 62; x += 8) p.vline(x, 15, 15, C.wood);
    windowAt(p, 40, 17, 12, 8);
    woodDoor(p, 16, 16);
  },
};

// ------------------------------------------------------------- cache ------
const cache = new Map<StructureKind, HTMLCanvasElement>();

export function structureCanvas(kind: StructureKind): HTMLCanvasElement {
  let c = cache.get(kind);
  if (!c) {
    const info = STRUCTURES[kind];
    const p = new Painter(info.w * 16, info.h * 16);
    builders[kind](p);
    c = p.toCanvas();
    cache.set(kind, c);
  }
  return c;
}

export function initStructures(): void { for (const k of STRUCTURE_KINDS) structureCanvas(k); }

export function drawStructure(ctx: CanvasRenderingContext2D, kind: StructureKind, px: number, py: number, _frame = 0): void {
  ctx.drawImage(structureCanvas(kind), px, py);
}
