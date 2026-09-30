// ============================================================================
// Art: shared palette + tiny pixel-drawing toolkit.
// Everything is authored as string pixel maps ('.' = transparent) or drawn
// with the Painter into ImageData, then baked once into offscreen canvases.
// Nothing in this module touches `document` at import time (node-safe).
// ============================================================================

/** Game Boy Color-ish master palette (bright, saturated, 4-ish per tile). */
export const C = {
  // outlines / neutrals
  ink: '#20201c', ink2: '#383830', white: '#f8f8f8', cream: '#f8f0d8', gray1: '#e0e0e0', gray2: '#b0b0b8', gray3: '#787880', gray4: '#484850',
  // grass / plants
  grassL: '#b8f080', grass: '#98e060', grassD: '#68b840', grassX: '#409030',
  leafL: '#88e068', leaf: '#48b048', leafD: '#288838', leafX: '#185828',
  // ground
  pathL: '#f8f0c8', path: '#e8d8a0', pathD: '#c8b078', pathX: '#a08850',
  sandL: '#f8f0c0', sand: '#f0e0a0', sandD: '#d8c080',
  dirt: '#b08048', dirtD: '#806038',
  // water
  waterL: '#a8e0ff', water: '#58a8f8', waterD: '#3880d8', waterX: '#2860b0', foam: '#e8f8ff',
  // wood
  woodL: '#e0b878', wood: '#c09058', woodD: '#906838', woodX: '#604020',
  // stone
  stoneL: '#d8d8d0', stone: '#b0b0a8', stoneD: '#808078', stoneX: '#505048',
  // roofs / buildings
  red: '#e04040', redD: '#a82828', blue: '#4878e8', blueD: '#2850b0', green: '#40b058', greenD: '#288838',
  yellow: '#f8d848', yellowD: '#d0a020', orange: '#f09030', purple: '#9060d0', pink: '#f088b8', pinkD: '#d05890',
  sky: '#88c8f8', skyD: '#4890d8',
  wallCream: '#f8ecc8', wallCreamD: '#d8c898', wallWhite: '#f8f8f8', wallWhiteD: '#c8c8d0',
  // indoor
  floorWoodL: '#f0d0a0', floorWood: '#e0b880', floorWoodD: '#c09860',
  tileL: '#f0f0f8', tile: '#e0e0ec', tileD: '#c0c0d0',
  labL: '#e8f0f8', lab: '#d0e0ec', labD: '#a8c0d0',
  gymL: '#d8c8a8', gym: '#c0b090', gymD: '#988868',
  wallpaper: '#f8e8c8', wallpaperD: '#e8d0a0', trim: '#a07850', trimD: '#705030',
  carpet: '#d04848', carpetD: '#a03030', carpetL: '#f0a060',
  skin: '#f8d0a8',
} as const;

// -------------------------------------------------------------- helpers ----
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
/** Multiply a color (f < 1 darker, > 1 lighter). */
export function shade(hex: string, f: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * f, g * f, b * f);
}
/** Mix toward white (t in 0..1). */
export function lighten(hex: string, t: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
}

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
export function ctx2d(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

/** Validate a string pixel map: every row same length. Returns [w,h]. */
export function checkRows(rows: string[], name = 'map'): [number, number] {
  const w = rows[0]?.length ?? 0;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].length !== w) throw new Error(`art: ${name} row ${i} has length ${rows[i].length}, expected ${w}: "${rows[i]}"`);
  }
  return [w, rows.length];
}

/** Mirror rows horizontally. */
export function mirror(rows: string[]): string[] {
  return rows.map((r) => r.split('').reverse().join(''));
}

/** Overlay layers: later non-'.' chars win. All layers must share the same size (or be shorter: missing rows = transparent). */
export function stack(w: number, h: number, ...layers: (string[] | null | undefined)[]): string[] {
  const out: string[][] = [];
  for (let y = 0; y < h; y++) out.push(new Array(w).fill('.'));
  for (const layer of layers) {
    if (!layer) continue;
    for (let y = 0; y < Math.min(h, layer.length); y++) {
      const row = layer[y];
      for (let x = 0; x < Math.min(w, row.length); x++) {
        const ch = row[x];
        if (ch !== '.' && ch !== ' ') out[y][x] = ch;
      }
    }
  }
  return out.map((r) => r.join(''));
}

/** Shift a layer by (dx, dy) inside the same box (pixels that leave the box are dropped). */
export function shift(rows: string[], dx: number, dy: number): string[] {
  const h = rows.length; const w = rows[0]?.length ?? 0;
  const out: string[] = [];
  for (let y = 0; y < h; y++) {
    const sy = y - dy;
    let line = '';
    for (let x = 0; x < w; x++) {
      const sx = x - dx;
      line += (sy >= 0 && sy < h && sx >= 0 && sx < w) ? rows[sy][sx] : '.';
    }
    out.push(line);
  }
  return out;
}

export type Pal = Record<string, string>;

/**
 * Painter: an RGBA pixel buffer with pixel-art primitives. Bake with toCanvas().
 */
export class Painter {
  readonly data: Uint8ClampedArray;
  constructor(public readonly w: number, public readonly h: number) {
    this.data = new Uint8ClampedArray(w * h * 4);
  }
  px(x: number, y: number, hex: string): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const [r, g, b] = hexToRgb(hex);
    const i = (y * this.w + x) * 4;
    this.data[i] = r; this.data[i + 1] = g; this.data[i + 2] = b; this.data[i + 3] = 255;
  }
  clear(x: number, y: number): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.data[(y * this.w + x) * 4 + 3] = 0;
  }
  fill(hex: string): void { this.rect(0, 0, this.w, this.h, hex); }
  rect(x: number, y: number, w: number, h: number, hex: string): void {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.px(xx, yy, hex);
  }
  /** 1px outline rectangle. */
  frame(x: number, y: number, w: number, h: number, hex: string): void {
    this.hline(x, y, w, hex); this.hline(x, y + h - 1, w, hex); this.vline(x, y, h, hex); this.vline(x + w - 1, y, h, hex);
  }
  hline(x: number, y: number, w: number, hex: string): void { for (let i = 0; i < w; i++) this.px(x + i, y, hex); }
  vline(x: number, y: number, h: number, hex: string): void { for (let i = 0; i < h; i++) this.px(x, y + i, hex); }
  /** Draw a string pixel map at (x,y). '.'/' ' = skip. */
  map(x: number, y: number, rows: string[], pal: Pal, name = 'map'): void {
    checkRows(rows, name);
    for (let yy = 0; yy < rows.length; yy++) {
      const row = rows[yy];
      for (let xx = 0; xx < row.length; xx++) {
        const ch = row[xx];
        if (ch === '.' || ch === ' ') continue;
        const col = pal[ch];
        if (col === undefined) throw new Error(`art: ${name} uses unknown palette key '${ch}' (row ${yy})`);
        this.px(x + xx, y + yy, col);
      }
    }
  }
  /** Dither-ish checker fill using two colors. */
  checker(x: number, y: number, w: number, h: number, a: string, b: string): void {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) this.px(x + xx, y + yy, ((xx + yy) & 1) ? b : a);
  }
  /** Copy pixels from another painter (alpha-aware). */
  blit(src: Painter, x: number, y: number): void {
    for (let yy = 0; yy < src.h; yy++) for (let xx = 0; xx < src.w; xx++) {
      const i = (yy * src.w + xx) * 4;
      if (src.data[i + 3] === 0) continue;
      const tx = x + xx, ty = y + yy;
      if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) continue;
      const j = (ty * this.w + tx) * 4;
      this.data[j] = src.data[i]; this.data[j + 1] = src.data[i + 1]; this.data[j + 2] = src.data[i + 2]; this.data[j + 3] = 255;
    }
  }
  toCanvas(): HTMLCanvasElement {
    const c = makeCanvas(this.w, this.h);
    const ctx = ctx2d(c);
    const img = ctx.createImageData(this.w, this.h);
    img.data.set(this.data);
    ctx.putImageData(img, 0, 0);
    return c;
  }
}

/** Bake a string pixel map into a canvas. */
export function bake(rows: string[], pal: Pal, name = 'sprite'): HTMLCanvasElement {
  const [w, h] = checkRows(rows, name);
  const p = new Painter(w, h);
  p.map(0, 0, rows, pal, name);
  return p.toCanvas();
}

/** Nearest-neighbor upscale of a canvas. */
export function scaleCanvas(src: HTMLCanvasElement, scale: number): HTMLCanvasElement {
  const c = makeCanvas(src.width * scale, src.height * scale);
  const ctx = ctx2d(c);
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

// ----------------------------------------------------------- tiny font -----
/** 3×5 uppercase pixel font for building signs. */
export const FONT3: Record<string, string[]> = {
  A: ['010', '101', '111', '101', '101'], B: ['110', '101', '110', '101', '110'], C: ['011', '100', '100', '100', '011'],
  D: ['110', '101', '101', '101', '110'], E: ['111', '100', '110', '100', '111'], F: ['111', '100', '110', '100', '100'],
  G: ['011', '100', '101', '101', '011'], H: ['101', '101', '111', '101', '101'], I: ['111', '010', '010', '010', '111'],
  K: ['101', '101', '110', '101', '101'], L: ['100', '100', '100', '100', '111'], M: ['101', '111', '111', '101', '101'],
  N: ['110', '101', '101', '101', '101'], O: ['111', '101', '101', '101', '111'], P: ['110', '101', '110', '100', '100'],
  R: ['110', '101', '110', '101', '101'], S: ['011', '100', '010', '001', '110'], T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '111'], Y: ['101', '101', '010', '010', '010'], '.': ['000', '000', '000', '000', '010'],
  ' ': ['000', '000', '000', '000', '000'],
};
export function textWidth3(text: string): number { return text.length * 4 - 1; }
export function drawText3(p: Painter, x: number, y: number, text: string, hex: string): void {
  let cx = x;
  for (const ch of text) {
    const g = FONT3[ch] ?? FONT3[' '];
    for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 3; xx++) if (g[yy][xx] === '1') p.px(cx + xx, y + yy, hex);
    cx += 4;
  }
}
