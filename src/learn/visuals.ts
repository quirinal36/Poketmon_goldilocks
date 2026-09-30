// Visual renderers for every `Visual` kind in core/types.ts.
// Pure DOM/SVG — no access to G, so this file is safe for questions.html and dev pages.
import type { Visual, ShapeKind, CompareSide } from '../core/types';
import { el } from '../core/util';

const NS = 'http://www.w3.org/2000/svg';
export const INK = '#3f3d56';
export const PASTEL = ['#ffb5c2', '#ffd670', '#a8e6cf', '#a9c9ff', '#d5b8ff', '#ffc9a3', '#b5ead7', '#fdf0a8'];
const WATER = '#8ecbff';
let uidCounter = 0;
const uidv = (p: string) => `${p}${++uidCounter}`;

// ----------------------------------------------------------------- helpers ----
function s<K extends keyof SVGElementTagNameMap>(
  tag: K, attrs: Record<string, string | number> = {}, ...children: (Node | string)[]
): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  for (const c of children) e.append(typeof c === 'string' ? document.createTextNode(c) : c);
  return e;
}
function svg(w: number, h: number, cls = ''): SVGSVGElement {
  const e = s('svg', { viewBox: `0 0 ${w} ${h}`, width: w, height: h, class: `vis-svg ${cls}`.trim() });
  e.setAttribute('role', 'img');
  return e;
}
interface TxtOpts { size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; weight?: string; cls?: string }
function txt(x: number, y: number, text: string, o: TxtOpts = {}): SVGTextElement {
  return s('text', {
    x, y, 'text-anchor': o.anchor ?? 'middle', 'font-size': o.size ?? 20, fill: o.fill ?? INK,
    'font-family': "'Jua', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif", 'font-weight': o.weight ?? 'normal',
    'dominant-baseline': 'middle', class: o.cls ?? '',
  }, text);
}
function seedFrom(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clampN = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(Number(n) || 0)));
function label(text?: string): HTMLElement | null { return text ? el('div', { class: 'vis-label' }, text) : null; }
function emojiSpan(emoji: string, extraCls = ''): HTMLElement { return el('span', { class: `vis-em ${extraCls}`.trim() }, emoji); }

// ------------------------------------------------------------------- main ----
export function renderVisual(v: Visual): HTMLElement {
  try { return render(v); } catch (err) {
    console.warn('[visuals] render failed', v, err);
    return el('div', { class: 'vis vis-error' }, '그림을 그릴 수 없어요');
  }
}

function render(v: Visual): HTMLElement {
  switch (v.kind) {
    case 'text': return renderText(v);
    case 'emoji': return renderEmoji(v);
    case 'count': return renderCount(v);
    case 'groups': return renderGroups(v);
    case 'compare': return renderCompare(v);
    case 'clock': return renderClock(v);
    case 'shapes': return renderShapes(v);
    case 'pattern': return renderPattern(v);
    case 'blocks': return renderBlocks(v);
    case 'numberline': return renderNumberline(v);
    case 'lengths': return renderLengths(v);
    case 'ruler': return renderRuler(v);
    case 'table': return renderTable(v);
    case 'bargraph': return renderBargraph(v);
    case 'balance': return renderBalance(v);
    case 'containers': return renderContainers(v);
    case 'areas': return renderAreas(v);
    case 'calendar': return renderCalendar(v);
    case 'grid': return renderGrid(v);
    case 'row': return renderRow(v);
    default: {
      const never: never = v;
      return el('div', { class: 'vis vis-error' }, JSON.stringify(never));
    }
  }
}

// ------------------------------------------------------------------- text ----
function renderText(v: Extract<Visual, { kind: 'text' }>): HTMLElement {
  const e = el('div', { class: `vis vis-text vis-size-${v.size ?? 'lg'}`, lang: v.lang === 'en-US' ? 'en' : 'ko' }, v.text);
  return e;
}

function renderEmoji(v: Extract<Visual, { kind: 'emoji' }>): HTMLElement {
  return el('div', { class: `vis vis-emoji vis-size-${v.size ?? 'lg'}` }, emojiSpan(v.emoji), label(v.caption));
}

// ------------------------------------------------------------------ count ----
function renderCount(v: Extract<Visual, { kind: 'count' }>): HTMLElement {
  const n = clampN(v.count, 0, 60);
  const layout = v.layout ?? (n <= 5 ? 'row' : 'grid');
  if (layout === 'tenframe') return renderTenframe(v.emoji, n);
  if (layout === 'scatter') return renderScatter(v.emoji, n);
  const size = n <= 5 ? 64 : n <= 10 ? 56 : n <= 20 ? 46 : 36;
  const box = el('div', { class: `vis vis-count vis-count-${layout}` });
  box.style.setProperty('--em', `${size}px`);
  if (layout === 'grid') box.style.setProperty('--cols', String(n > 20 ? 10 : 5));
  for (let i = 0; i < n; i++) box.append(emojiSpan(v.emoji));
  if (n === 0) box.append(el('div', { class: 'vis-empty' }, '(없음)'));
  return box;
}

function renderTenframe(emoji: string, n: number): HTMLElement {
  const frames = Math.max(1, Math.ceil(n / 10));
  const wrap = el('div', { class: 'vis vis-tenframes' });
  for (let f = 0; f < frames; f++) {
    const frame = el('div', { class: 'vis-tenframe' });
    for (let i = 0; i < 10; i++) {
      const idx = f * 10 + i;
      frame.append(el('div', { class: 'vis-tf-cell' }, idx < n ? emojiSpan(emoji) : null));
    }
    wrap.append(frame);
  }
  return wrap;
}

function renderScatter(emoji: string, n: number): HTMLElement {
  const W = 360, H = 220;
  const root = svg(W, H, 'vis-scatter-svg');
  root.append(s('rect', { x: 1, y: 1, width: W - 2, height: H - 2, rx: 16, fill: '#fffdf5', stroke: '#e9e4d6', 'stroke-width': 2 }));
  if (n > 0) {
    const rand = prng(seedFrom(emoji + ':' + n));
    const cols = Math.max(1, Math.ceil(Math.sqrt(n * (W / H))));
    const rows = Math.max(1, Math.ceil(n / cols));
    const cw = (W - 24) / cols, ch = (H - 24) / rows;
    const size = Math.min(cw, ch) * 0.66;
    const cells: number[] = [];
    for (let i = 0; i < cols * rows; i++) cells.push(i);
    for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
    for (let k = 0; k < n; k++) {
      const c = cells[k] % cols, r = Math.floor(cells[k] / cols);
      const jx = (rand() - 0.5) * cw * 0.35, jy = (rand() - 0.5) * ch * 0.35;
      const x = 12 + cw * c + cw / 2 + jx, y = 12 + ch * r + ch / 2 + jy;
      root.append(txt(x, y, emoji, { size }));
    }
  }
  return el('div', { class: 'vis vis-scatter' }, root);
}

// ----------------------------------------------------------------- groups ----
function renderGroups(v: Extract<Visual, { kind: 'groups' }>): HTMLElement {
  const wrap = el('div', { class: 'vis vis-groups' });
  v.groups.forEach((g, i) => {
    if (i > 0) wrap.append(v.op ? el('div', { class: 'vis-op' }, v.op) : el('div', { class: 'vis-gap' }));
    const count = clampN(g.count, 0, 30);
    const crossed = clampN(g.crossed ?? 0, 0, count);
    const cols = count <= 4 ? Math.max(1, count) : count <= 6 ? 3 : count <= 8 ? 4 : 5;
    const items = el('div', { class: 'vis-group-items' });
    items.style.setProperty('--cols', String(cols));
    items.style.setProperty('--em', count <= 6 ? '52px' : count <= 12 ? '44px' : '36px');
    for (let k = 0; k < count; k++) items.append(emojiSpan(g.emoji, k >= count - crossed ? 'is-crossed' : ''));
    if (count === 0) items.append(el('div', { class: 'vis-empty' }, '0'));
    wrap.append(el('div', { class: 'vis-group' }, items, label(g.label)));
  });
  return wrap;
}

// ---------------------------------------------------------------- compare ----
function renderCompare(v: Extract<Visual, { kind: 'compare' }>): HTMLElement {
  const side = (sd: CompareSide, cls: string) => {
    const body = el('div', { class: 'vis-compare-body' });
    if (sd.number !== undefined) body.append(el('div', { class: 'vis-bignum' }, String(sd.number)));
    else if (sd.emoji && sd.count !== undefined) {
      const n = clampN(sd.count, 0, 30);
      const g = el('div', { class: 'vis-count vis-count-grid' });
      g.style.setProperty('--em', n <= 6 ? '44px' : n <= 12 ? '36px' : '30px');
      g.style.setProperty('--cols', String(n <= 4 ? Math.max(1, n) : n <= 9 ? 3 : n <= 16 ? 4 : 5));
      for (let i = 0; i < n; i++) g.append(emojiSpan(sd.emoji));
      body.append(g);
    } else if (sd.emoji) body.append(emojiSpan(sd.emoji, 'vis-em-lg'));
    if (sd.text) body.append(el('div', { class: 'vis-compare-text' }, sd.text));
    return el('div', { class: `vis-compare-side ${cls}` }, body, label(sd.label));
  };
  const mid = el('div', { class: 'vis-compare-mid' }, v.prompt ?? '');
  return el('div', { class: 'vis vis-compare' }, side(v.left, 'is-left'), mid, side(v.right, 'is-right'));
}

// ------------------------------------------------------------------ clock ----
export function clockAngles(hour: number, minute: number): { hour: number; minute: number } {
  const h = ((hour % 12) + 12) % 12, m = ((minute % 60) + 60) % 60;
  return { hour: h * 30 + m * 0.5, minute: m * 6 };
}
function renderClock(v: Extract<Visual, { kind: 'clock' }>): HTMLElement {
  const H = v.showDigits ? 240 : 200;
  const root = svg(200, H, 'vis-clock-svg');
  const cx = 100, cy = 100;
  root.append(s('circle', { cx, cy, r: 94, fill: '#fffdf7', stroke: INK, 'stroke-width': 4 }));
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 * Math.PI) / 180;
    const big = i % 5 === 0;
    const r1 = big ? 78 : 84, r2 = 90;
    root.append(s('line', {
      x1: cx + r1 * Math.sin(a), y1: cy - r1 * Math.cos(a), x2: cx + r2 * Math.sin(a), y2: cy - r2 * Math.cos(a),
      stroke: INK, 'stroke-width': big ? 3.5 : 1.5, 'stroke-linecap': 'round',
    }));
  }
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    root.append(txt(cx + 64 * Math.sin(a), cy - 64 * Math.cos(a) + 1, String(i), { size: 21 }));
  }
  const ang = clockAngles(v.hour, v.minute);
  root.append(s('line', { x1: cx, y1: cy + 10, x2: cx, y2: cy - 46, stroke: INK, 'stroke-width': 8, 'stroke-linecap': 'round', transform: `rotate(${ang.hour} ${cx} ${cy})`, class: 'vis-hand-hour' }));
  root.append(s('line', { x1: cx, y1: cy + 12, x2: cx, y2: cy - 70, stroke: '#e5484d', 'stroke-width': 5, 'stroke-linecap': 'round', transform: `rotate(${ang.minute} ${cx} ${cy})`, class: 'vis-hand-minute' }));
  root.append(s('circle', { cx, cy, r: 6, fill: INK }));
  if (v.showDigits) {
    root.append(s('rect', { x: 55, y: 204, width: 90, height: 32, rx: 8, fill: '#eef2ff', stroke: '#c7d2fe', 'stroke-width': 2 }));
    root.append(txt(100, 221, `${v.hour}:${String(v.minute).padStart(2, '0')}`, { size: 22 }));
  }
  return el('div', { class: 'vis vis-clock' }, root);
}

// ----------------------------------------------------------------- shapes ----
const SHAPE_COLOR: Record<ShapeKind, string> = {
  circle: '#ffb5c2', triangle: '#ffd670', square: '#a9c9ff', rectangle: '#a8e6cf', pentagon: '#d5b8ff', hexagon: '#ffc9a3',
  semicircle: '#b5ead7', oval: '#fdf0a8', star: '#ffd670', heart: '#ffb5c2', diamond: '#a9c9ff',
  box: '#ffc9a3', can: '#a9c9ff', ball: '#ffb5c2', cube: '#a8e6cf', cone: '#d5b8ff',
};
function polygonPts(n: number, cx: number, cy: number, r: number, rot = -Math.PI / 2): string {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) { const a = rot + (i * 2 * Math.PI) / n; pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`); }
  return pts.join(' ');
}
function shade(hex: string, amt: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex); if (!m) return hex;
  const n = parseInt(m[1], 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt)));
  const r = ch(n >> 16), g = ch((n >> 8) & 255), b = ch(n & 255);
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}
export function shapeSvg(shape: ShapeKind, color?: string, size = 96): SVGSVGElement {
  const fill = color || SHAPE_COLOR[shape] || PASTEL[0];
  const root = svg(100, 100, `vis-shape-svg vis-shape-${shape}`);
  root.setAttribute('width', String(size)); root.setAttribute('height', String(size));
  const st = { stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' } as const;
  const add = (e: SVGElement) => root.append(e);
  switch (shape) {
    case 'circle': add(s('circle', { cx: 50, cy: 50, r: 40, fill, ...st })); break;
    case 'triangle': add(s('polygon', { points: '50,10 90,85 10,85', fill, ...st })); break;
    case 'square': add(s('rect', { x: 14, y: 14, width: 72, height: 72, rx: 2, fill, ...st })); break;
    case 'rectangle': add(s('rect', { x: 5, y: 26, width: 90, height: 48, rx: 2, fill, ...st })); break;
    case 'pentagon': add(s('polygon', { points: polygonPts(5, 50, 53, 42), fill, ...st })); break;
    case 'hexagon': add(s('polygon', { points: polygonPts(6, 50, 50, 42, 0), fill, ...st })); break;
    case 'semicircle': add(s('path', { d: 'M8,68 A42,42 0 0 1 92,68 Z', fill, ...st })); break;
    case 'oval': add(s('ellipse', { cx: 50, cy: 50, rx: 45, ry: 28, fill, ...st })); break;
    case 'star': {
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) { const r = i % 2 === 0 ? 44 : 19; const a = -Math.PI / 2 + (i * Math.PI) / 5; pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(54 + r * Math.sin(a)).toFixed(1)}`); }
      add(s('polygon', { points: pts.join(' '), fill, ...st })); break;
    }
    case 'heart': add(s('path', { d: 'M50,88 C22,66 8,50 8,34 A20,20 0 0 1 50,26 A20,20 0 0 1 92,34 C92,50 78,66 50,88 Z', fill, ...st })); break;
    case 'diamond': add(s('polygon', { points: '50,6 90,50 50,94 10,50', fill, ...st })); break;
    case 'box':
      add(s('polygon', { points: '8,44 30,22 92,22 70,44', fill: shade(fill, 28), ...st }));
      add(s('polygon', { points: '70,44 92,22 92,66 70,88', fill: shade(fill, -30), ...st }));
      add(s('rect', { x: 8, y: 44, width: 62, height: 44, fill, ...st }));
      break;
    case 'cube':
      add(s('polygon', { points: '14,36 36,14 90,14 68,36', fill: shade(fill, 28), ...st }));
      add(s('polygon', { points: '68,36 90,14 90,68 68,90', fill: shade(fill, -30), ...st }));
      add(s('rect', { x: 14, y: 36, width: 54, height: 54, fill, ...st }));
      break;
    case 'can':
      add(s('path', { d: 'M18,24 V76 A32,12 0 0 0 82,76 V24 Z', fill, ...st }));
      add(s('path', { d: 'M18,24 V76 A32,12 0 0 0 82,76', fill: 'none', stroke: 'none' }));
      add(s('ellipse', { cx: 50, cy: 24, rx: 32, ry: 12, fill: shade(fill, 28), ...st }));
      break;
    case 'ball': {
      const id = uidv('ballg');
      const defs = s('defs');
      const g = s('radialGradient', { id, cx: '35%', cy: '30%', r: '70%' });
      g.append(s('stop', { offset: '0%', 'stop-color': shade(fill, 60) }), s('stop', { offset: '60%', 'stop-color': fill }), s('stop', { offset: '100%', 'stop-color': shade(fill, -40) }));
      defs.append(g); add(defs);
      add(s('circle', { cx: 50, cy: 50, r: 40, fill: `url(#${id})`, ...st }));
      break;
    }
    case 'cone':
      add(s('path', { d: 'M16,76 L50,8 L84,76 Z', fill, ...st }));
      add(s('path', { d: 'M16,76 A34,12 0 0 0 84,76 A34,12 0 0 0 16,76 Z', fill: shade(fill, -30), ...st }));
      add(s('path', { d: 'M16,76 A34,12 0 0 1 84,76', fill: 'none', stroke: INK, 'stroke-width': 3 }));
      break;
  }
  return root;
}
function renderShapes(v: Extract<Visual, { kind: 'shapes' }>): HTMLElement {
  const wrap = el('div', { class: 'vis vis-shapes' });
  for (const it of v.items) {
    const size = clampN(it.size ?? (v.items.length <= 3 ? 110 : v.items.length <= 5 ? 92 : 76), 40, 200);
    wrap.append(el('div', { class: 'vis-shape' }, shapeSvg(it.shape, it.color, size), label(it.label)));
  }
  return wrap;
}

// ---------------------------------------------------------------- pattern ----
function renderPattern(v: Extract<Visual, { kind: 'pattern' }>): HTMLElement {
  const wrap = el('div', { class: 'vis vis-pattern' });
  for (const it of v.items) {
    if (it === null || it === undefined) wrap.append(el('div', { class: 'vis-tile is-blank' }, '?'));
    else wrap.append(el('div', { class: 'vis-tile' }, it));
  }
  return wrap;
}

// ----------------------------------------------------------------- blocks ----
function renderBlocks(v: Extract<Visual, { kind: 'blocks' }>): HTMLElement {
  const th = clampN(v.thousands ?? 0, 0, 9), hu = clampN(v.hundreds ?? 0, 0, 9), te = clampN(v.tens, 0, 19), on = clampN(v.ones, 0, 19);
  const U = 12, H = 160, ISO = 22, GAP = 26;
  const C = { th: '#d5b8ff', hu: '#a9c9ff', te: '#a8e6cf', on: '#ffc9a3' };
  const grid = (x: number, y: number, w: number, h: number, cellsX: number, cellsY: number, fill: string): SVGGElement => {
    const g = s('g');
    g.append(s('rect', { x, y, width: w, height: h, fill, stroke: INK, 'stroke-width': 2 }));
    for (let i = 1; i < cellsX; i++) g.append(s('line', { x1: x + (w / cellsX) * i, y1: y, x2: x + (w / cellsX) * i, y2: y + h, stroke: INK, 'stroke-width': 0.8, opacity: 0.55 }));
    for (let i = 1; i < cellsY; i++) g.append(s('line', { x1: x, y1: y + (h / cellsY) * i, x2: x + w, y2: y + (h / cellsY) * i, stroke: INK, 'stroke-width': 0.8, opacity: 0.55 }));
    return g;
  };
  const parts: { w: number; draw: (x: number) => SVGElement }[] = [];
  const baseY = H - 14 - U * 10;
  for (let i = 0; i < th; i++) parts.push({ w: U * 10 + ISO + 10, draw: (x) => {
    const g = s('g');
    const x0 = x, y0 = baseY + ISO;
    g.append(s('polygon', { points: `${x0},${y0} ${x0 + ISO},${y0 - ISO} ${x0 + ISO + U * 10},${y0 - ISO} ${x0 + U * 10},${y0}`, fill: shade(C.th, 24), stroke: INK, 'stroke-width': 2 }));
    for (let k = 1; k < 10; k++) g.append(s('line', { x1: x0 + (U * k), y1: y0, x2: x0 + ISO + U * k, y2: y0 - ISO, stroke: INK, 'stroke-width': 0.8, opacity: 0.5 }));
    g.append(s('polygon', { points: `${x0 + U * 10},${y0} ${x0 + U * 10 + ISO},${y0 - ISO} ${x0 + U * 10 + ISO},${y0 - ISO + U * 10} ${x0 + U * 10},${y0 + U * 10}`, fill: shade(C.th, -34), stroke: INK, 'stroke-width': 2 }));
    for (let k = 1; k < 10; k++) g.append(s('line', { x1: x0 + U * 10, y1: y0 + U * k, x2: x0 + U * 10 + ISO, y2: y0 - ISO + U * k, stroke: INK, 'stroke-width': 0.8, opacity: 0.5 }));
    g.append(grid(x0, y0, U * 10, U * 10, 10, 10, C.th));
    return g;
  } });
  for (let i = 0; i < hu; i++) parts.push({ w: U * 10 + 10, draw: (x) => grid(x, baseY + ISO, U * 10, U * 10, 10, 10, C.hu) });
  for (let i = 0; i < te; i++) parts.push({ w: U + 8, draw: (x) => grid(x, baseY + ISO, U, U * 10, 1, 10, C.te) });
  if (on > 0) {
    const cols = Math.ceil(on / 5);
    parts.push({ w: cols * (U + 6) + 4, draw: (x) => {
      const g = s('g');
      for (let k = 0; k < on; k++) {
        const c = Math.floor(k / 5), r = k % 5;
        g.append(s('rect', { x: x + c * (U + 6), y: baseY + ISO + U * 10 - (r + 1) * U - r * 4, width: U, height: U, fill: C.on, stroke: INK, 'stroke-width': 2 }));
      }
      return g;
    } });
  }
  let x = 12;
  const groups: SVGElement[] = [];
  let lastKind = '';
  const kinds = [...Array(th).fill('th'), ...Array(hu).fill('hu'), ...Array(te).fill('te'), ...(on > 0 ? ['on'] : [])];
  parts.forEach((p, i) => {
    if (i > 0 && kinds[i] !== lastKind) x += GAP;
    lastKind = kinds[i];
    groups.push(p.draw(x));
    x += p.w;
  });
  const W = Math.max(120, x + 12);
  const root = svg(W, H, 'vis-blocks-svg');
  for (const g of groups) root.append(g);
  if (!groups.length) root.append(txt(W / 2, H / 2, '0', { size: 40 }));
  return el('div', { class: 'vis vis-blocks' }, root);
}

// ------------------------------------------------------------- numberline ----
function renderNumberline(v: Extract<Visual, { kind: 'numberline' }>): HTMLElement {
  const step = v.step && v.step > 0 ? v.step : 1;
  const from = v.from, to = Math.max(v.to, from + step);
  const n = Math.min(60, Math.floor((to - from) / step + 1e-9) + 1);
  const W = 640, H = v.jumps?.length ? 170 : 130, ML = 44, MR = 44;
  const yLine = v.jumps?.length ? 112 : 72;
  const root = svg(W, H, 'vis-numberline-svg');
  const xAt = (val: number) => ML + ((val - from) / (to - from)) * (W - ML - MR);
  const id = uidv('nlArrow');
  const defs = s('defs');
  const marker = s('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
  marker.append(s('path', { d: 'M0,0 L10,5 L0,10 Z', fill: '#e5484d' }));
  defs.append(marker); root.append(defs);
  root.append(s('line', { x1: 14, y1: yLine, x2: W - 14, y2: yLine, stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }));
  root.append(s('polygon', { points: `${W - 14},${yLine} ${W - 28},${yLine - 8} ${W - 28},${yLine + 8}`, fill: INK }));
  root.append(s('polygon', { points: `14,${yLine} 28,${yLine - 8} 28,${yLine + 8}`, fill: INK }));
  const labelEvery = n > 21 ? 5 : 1;
  const marks = new Set(v.marks ?? []);
  for (let i = 0; i < n; i++) {
    const val = from + i * step;
    const x = xAt(val);
    root.append(s('line', { x1: x, y1: yLine - 11, x2: x, y2: yLine + 11, stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' }));
    const isBlank = v.blank !== undefined && Math.abs(val - v.blank) < 1e-9;
    if (isBlank) {
      root.append(s('rect', { x: x - 18, y: yLine + 20, width: 36, height: 32, rx: 8, fill: '#fff', stroke: '#e5484d', 'stroke-width': 3, 'stroke-dasharray': '6 4' }));
      root.append(txt(x, yLine + 37, '?', { size: 24, fill: '#e5484d' }));
    } else if (i % labelEvery === 0 || marks.has(val) || i === n - 1) {
      root.append(txt(x, yLine + 34, String(val), { size: 22 }));
    }
    if (marks.has(val)) root.append(s('circle', { cx: x, cy: yLine, r: 9, fill: '#ffb5c2', stroke: '#e5484d', 'stroke-width': 3 }));
  }
  (v.jumps ?? []).forEach((j, k) => {
    const x1 = xAt(j.from), x2 = xAt(j.to);
    const h = Math.min(70, 34 + Math.abs(x2 - x1) / 5);
    const color = ['#e5484d', '#3b82f6', '#16a34a', '#d97706'][k % 4];
    root.append(s('path', { d: `M${x1},${yLine - 12} Q${(x1 + x2) / 2},${yLine - 12 - h} ${x2},${yLine - 12}`, fill: 'none', stroke: color, 'stroke-width': 4, 'stroke-linecap': 'round', 'marker-end': `url(#${id})` }));
    const d = j.to - j.from;
    root.append(txt((x1 + x2) / 2, yLine - 16 - h / 2, (d > 0 ? '+' : '') + d, { size: 20, fill: color }));
  });
  return el('div', { class: 'vis vis-numberline' }, root);
}

// ---------------------------------------------------------------- lengths ----
function renderLengths(v: Extract<Visual, { kind: 'lengths' }>): HTMLElement {
  const items = v.items.slice(0, 6);
  const ROW = 58, LBL = 112, X0 = LBL + 8, X1 = 600 - 60;
  const footer = v.unit ? 36 : 12;
  const H = items.length * ROW + 10 + footer;
  const maxLen = Math.max(1, ...items.map((i) => i.length));
  const scale = (X1 - X0) / maxLen;
  const root = svg(600, H, 'vis-lengths-svg');
  if (v.showGrid) {
    for (let u = 0; u <= maxLen; u++) {
      const x = X0 + u * scale;
      root.append(s('line', { x1: x, y1: 6, x2: x, y2: items.length * ROW + 8, stroke: '#cbd5e1', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }));
    }
  }
  items.forEach((it, i) => {
    const cy = 10 + i * ROW + ROW / 2;
    root.append(txt(LBL - 4, cy, it.label, { size: 22, anchor: 'end' }));
    const w = Math.max(6, it.length * scale);
    root.append(s('rect', { x: X0, y: cy - 15, width: w, height: 30, rx: 10, fill: it.color || PASTEL[i % PASTEL.length], stroke: INK, 'stroke-width': 2.5 }));
    if (it.emoji) root.append(txt(X0 + w + 22, cy, it.emoji, { size: 32 }));
  });
  if (v.unit) {
    const y = items.length * ROW + 30;
    for (let u = 0; u <= maxLen; u++) {
      const x = X0 + u * scale;
      root.append(s('line', { x1: x, y1: y - 12, x2: x, y2: y - 4, stroke: INK, 'stroke-width': 2 }));
      if (maxLen <= 20 || u % 5 === 0) root.append(txt(x, y + 6, String(u), { size: 16 }));
    }
    root.append(s('line', { x1: X0, y1: y - 4, x2: X0 + maxLen * scale, y2: y - 4, stroke: INK, 'stroke-width': 2 }));
    root.append(txt(X0 + maxLen * scale + 26, y + 2, v.unit === 'cm' ? 'cm' : '칸', { size: 16, anchor: 'start' }));
  }
  return el('div', { class: 'vis vis-lengths' }, root);
}

// ------------------------------------------------------------------ ruler ----
function renderRuler(v: Extract<Visual, { kind: 'ruler' }>): HTMLElement {
  const start = Math.max(0, v.startCm ?? 0), len = Math.max(0.5, v.lengthCm);
  const total = Math.min(30, Math.max(5, Math.ceil(start + len) + 1));
  const W = 640, H = 176, X0 = 26, X1 = W - 26;
  const per = (X1 - X0) / total;
  const xAt = (c: number) => X0 + c * per;
  const root = svg(W, H, 'vis-ruler-svg');
  const RY = 100;
  root.append(s('rect', { x: X0 - 14, y: RY, width: X1 - X0 + 28, height: 66, rx: 8, fill: '#fff3bf', stroke: INK, 'stroke-width': 3 }));
  for (let c = 0; c <= total; c++) {
    const x = xAt(c);
    root.append(s('line', { x1: x, y1: RY, x2: x, y2: RY + 26, stroke: INK, 'stroke-width': 2.5 }));
    root.append(txt(x, RY + 46, String(c), { size: 18 }));
    if (c < total) {
      root.append(s('line', { x1: x + per / 2, y1: RY, x2: x + per / 2, y2: RY + 16, stroke: INK, 'stroke-width': 2 }));
      if (per >= 34) for (let m = 1; m < 10; m++) if (m !== 5) root.append(s('line', { x1: x + (per * m) / 10, y1: RY, x2: x + (per * m) / 10, y2: RY + 9, stroke: INK, 'stroke-width': 1.2 }));
    }
  }
  root.append(txt(X1 + 4, RY + 58, 'cm', { size: 14, anchor: 'end' }));
  const xs = xAt(start), xe = xAt(start + len), yc = 58;
  root.append(s('line', { x1: xs, y1: 22, x2: xs, y2: RY, stroke: '#94a3b8', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }));
  root.append(s('line', { x1: xe, y1: 22, x2: xe, y2: RY, stroke: '#94a3b8', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }));
  const st = { stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' } as const;
  const obj = v.object ?? 'pencil';
  const g = s('g', { class: `vis-ruler-obj vis-ruler-${obj}` });
  if (obj === 'pencil') {
    const tip = Math.min(30, (xe - xs) * 0.22), er = Math.min(18, (xe - xs) * 0.12);
    g.append(s('rect', { x: xs, y: yc - 14, width: er, height: 28, rx: 5, fill: '#ffb5c2', ...st }));
    g.append(s('rect', { x: xs + er, y: yc - 14, width: 6, height: 28, fill: '#cbd5e1', ...st }));
    g.append(s('rect', { x: xs + er + 6, y: yc - 14, width: Math.max(2, xe - xs - er - 6 - tip), height: 28, fill: '#ffd670', ...st }));
    g.append(s('polygon', { points: `${xe - tip},${yc - 14} ${xe},${yc} ${xe - tip},${yc + 14}`, fill: '#f6d5a8', ...st }));
    g.append(s('polygon', { points: `${xe - tip * 0.32},${yc - 4.5} ${xe},${yc} ${xe - tip * 0.32},${yc + 4.5}`, fill: INK }));
  } else if (obj === 'crayon') {
    const tip = Math.min(22, (xe - xs) * 0.2);
    g.append(s('path', { d: `M${xs},${yc - 13} H${xe - tip} L${xe},${yc} L${xe - tip},${yc + 13} H${xs} Z`, fill: '#ff8a80', ...st }));
    g.append(s('rect', { x: xs + 8, y: yc - 13, width: Math.max(4, (xe - xs - tip) * 0.55), height: 26, fill: '#fff', opacity: 0.5, stroke: 'none' }));
    g.append(s('line', { x1: xs + 8, y1: yc - 13, x2: xs + 8, y2: yc + 13, ...st }));
    g.append(s('line', { x1: xs + 8 + Math.max(4, (xe - xs - tip) * 0.55), y1: yc - 13, x2: xs + 8 + Math.max(4, (xe - xs - tip) * 0.55), y2: yc + 13, ...st }));
  } else if (obj === 'ribbon') {
    const w = xe - xs, seg = Math.max(1, Math.round(w / 60));
    let d = `M${xs},${yc}`;
    for (let i = 0; i < seg; i++) { const a = xs + (w / seg) * i, b = xs + (w / seg) * (i + 1); d += ` Q${(a + b) / 2},${yc + (i % 2 ? 16 : -16)} ${b},${yc}`; }
    g.append(s('path', { d, fill: 'none', stroke: '#ffb5c2', 'stroke-width': 22, 'stroke-linecap': 'butt' }));
    g.append(s('path', { d, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '0', opacity: 0.35 }));
    g.append(s('line', { x1: xs, y1: yc - 12, x2: xs, y2: yc + 12, ...st }));
    g.append(s('line', { x1: xe, y1: yc - 12, x2: xe, y2: yc + 12, ...st }));
  } else if (obj === 'key') {
    const r = Math.min(18, (xe - xs) * 0.2);
    g.append(s('rect', { x: xs + r * 1.6, y: yc - 6, width: Math.max(4, xe - xs - r * 1.6), height: 12, rx: 3, fill: '#ffd670', ...st }));
    g.append(s('rect', { x: xe - 10, y: yc + 4, width: 6, height: 12, fill: '#ffd670', ...st }));
    g.append(s('rect', { x: xe - 22, y: yc + 4, width: 6, height: 9, fill: '#ffd670', ...st }));
    g.append(s('circle', { cx: xs + r, cy: yc, r, fill: '#ffd670', ...st }));
    g.append(s('circle', { cx: xs + r, cy: yc, r: r * 0.38, fill: '#fff', ...st }));
  } else if (obj === 'leaf') {
    const mid = (xs + xe) / 2, bulge = Math.min(30, (xe - xs) * 0.35);
    g.append(s('path', { d: `M${xs},${yc} Q${mid},${yc - bulge} ${xe},${yc} Q${mid},${yc + bulge} ${xs},${yc} Z`, fill: '#a8e6cf', ...st }));
    g.append(s('line', { x1: xs + 4, y1: yc, x2: xe - 6, y2: yc, stroke: INK, 'stroke-width': 2, opacity: 0.6 }));
  }
  root.append(g);
  return el('div', { class: 'vis vis-ruler' }, root);
}

// ------------------------------------------------------------------ table ----
function renderTable(v: Extract<Visual, { kind: 'table' }>): HTMLElement {
  const table = el('table', { class: 'vis-table' });
  const thead = el('thead'); const tr = el('tr');
  for (const h of v.headers) tr.append(el('th', {}, String(h)));
  thead.append(tr); table.append(thead);
  const tbody = el('tbody');
  for (const row of v.rows) {
    const r = el('tr');
    for (const c of row) r.append(el('td', {}, String(c)));
    tbody.append(r);
  }
  table.append(tbody);
  return el('div', { class: 'vis vis-tablewrap' }, table);
}

// --------------------------------------------------------------- bargraph ----
function renderBargraph(v: Extract<Visual, { kind: 'bargraph' }>): HTMLElement {
  const n = Math.min(v.labels.length, v.values.length);
  if (v.symbol) {
    const wrap = el('div', { class: 'vis vis-pictograph' });
    if (v.title) wrap.append(el('div', { class: 'vis-title' }, v.title));
    const table = el('table', { class: 'vis-table vis-picto-table' });
    for (let i = 0; i < n; i++) {
      const cnt = clampN(v.values[i], 0, 20);
      const cell = el('td', { class: 'vis-picto-cells' });
      for (let k = 0; k < cnt; k++) cell.append(el('span', { class: 'vis-picto-sym' }, v.symbol));
      const tr = el('tr'); tr.append(el('th', {}, String(v.labels[i])), cell); table.append(tr);
    }
    wrap.append(table);
    wrap.append(el('div', { class: 'vis-legend' }, `${v.symbol} = 1${v.unitLabel ?? ''}`));
    return wrap;
  }
  const W = 520, H = v.title ? 340 : 310;
  const top = v.title ? 64 : 34;
  const X0 = 64, X1 = W - 20, Y1 = H - 50;
  const max = Math.max(1, v.max ?? Math.max(...v.values.slice(0, n)));
  const stepY = max <= 10 ? 1 : max <= 20 ? 2 : max <= 50 ? 5 : 10;
  const root = svg(W, H, 'vis-bargraph-svg');
  if (v.title) root.append(txt(W / 2, 26, v.title, { size: 24 }));
  for (let y = 0; y <= max; y += stepY) {
    const py = Y1 - (y / max) * (Y1 - top);
    root.append(s('line', { x1: X0, y1: py, x2: X1, y2: py, stroke: y === 0 ? INK : '#e2e8f0', 'stroke-width': y === 0 ? 3 : 1.5 }));
    root.append(txt(X0 - 12, py, String(y), { size: 17, anchor: 'end' }));
  }
  root.append(s('line', { x1: X0, y1: top - 10, x2: X0, y2: Y1, stroke: INK, 'stroke-width': 3 }));
  if (v.unitLabel) root.append(txt(X0 - 12, top - 20, `(${v.unitLabel})`, { size: 15, anchor: 'end' }));
  const slot = (X1 - X0) / Math.max(1, n), bw = Math.min(90, slot * 0.58);
  for (let i = 0; i < n; i++) {
    const val = Math.max(0, v.values[i]);
    const x = X0 + slot * i + (slot - bw) / 2;
    const h = (val / max) * (Y1 - top);
    root.append(s('rect', { x, y: Y1 - h, width: bw, height: h, rx: 6, fill: PASTEL[i % PASTEL.length], stroke: INK, 'stroke-width': 2.5, class: 'vis-bar' }));
    root.append(txt(x + bw / 2, Y1 - h - 14, String(val), { size: 19 }));
    root.append(txt(x + bw / 2, Y1 + 26, String(v.labels[i]), { size: 22 }));
  }
  return el('div', { class: 'vis vis-bargraph' }, root);
}

// ---------------------------------------------------------------- balance ----
function renderBalance(v: Extract<Visual, { kind: 'balance' }>): HTMLElement {
  const W = 420, H = 270, px = 210, py = 92, half = 140;
  const ang = v.heavier === 'left' ? -12 : v.heavier === 'right' ? 12 : 0;
  const rad = (ang * Math.PI) / 180;
  const root = svg(W, H, 'vis-balance-svg');
  root.append(s('rect', { x: px - 5, y: py, width: 10, height: 128, rx: 3, fill: '#b08968', stroke: INK, 'stroke-width': 2.5 }));
  root.append(s('rect', { x: px - 70, y: py + 126, width: 140, height: 20, rx: 8, fill: '#8d6e63', stroke: INK, 'stroke-width': 2.5 }));
  root.append(s('polygon', { points: `${px - 24},${py + 126} ${px},${py + 4} ${px + 24},${py + 126}`, fill: '#a1887f', stroke: INK, 'stroke-width': 2.5 }));
  const end = (sign: number) => ({ x: px + sign * half * Math.cos(rad), y: py + sign * half * Math.sin(rad) });
  const L = end(-1), R = end(1);
  root.append(s('line', { x1: L.x, y1: L.y, x2: R.x, y2: R.y, stroke: INK, 'stroke-width': 9, 'stroke-linecap': 'round' }));
  root.append(s('circle', { cx: px, cy: py, r: 8, fill: '#ffd670', stroke: INK, 'stroke-width': 2.5 }));
  const pan = (p: { x: number; y: number }, side: { emoji: string; label?: string }, i: number) => {
    const panY = p.y + 52;
    root.append(s('line', { x1: p.x, y1: p.y, x2: p.x - 44, y2: panY, stroke: INK, 'stroke-width': 2 }));
    root.append(s('line', { x1: p.x, y1: p.y, x2: p.x + 44, y2: panY, stroke: INK, 'stroke-width': 2 }));
    root.append(s('path', { d: `M${p.x - 48},${panY} Q${p.x},${panY + 30} ${p.x + 48},${panY} Z`, fill: PASTEL[3 + i], stroke: INK, 'stroke-width': 2.5 }));
    root.append(txt(p.x, panY - 22, side.emoji, { size: 42 }));
    if (side.label) root.append(txt(p.x, panY + 46, side.label, { size: 20 }));
  };
  pan(L, v.left, 0); pan(R, v.right, 1);
  return el('div', { class: 'vis vis-balance' }, root);
}

// ------------------------------------------------------------- containers ----
const CONTAINER_PATH: Record<'cup' | 'bottle' | 'bowl' | 'bucket', { d: string; top: number; bottom: number; extra?: string }> = {
  cup: { d: 'M28,28 H92 L84,140 H36 Z', top: 28, bottom: 140, extra: 'M92,52 C116,52 116,100 88,100' },
  bottle: { d: 'M44,18 H76 V36 C76,48 92,52 92,66 V132 A8,8 0 0 1 84,140 H36 A8,8 0 0 1 28,132 V66 C28,52 44,48 44,36 Z', top: 18, bottom: 140 },
  bowl: { d: 'M12,62 H108 C108,110 86,140 60,140 C34,140 12,110 12,62 Z', top: 62, bottom: 140 },
  bucket: { d: 'M22,36 H98 L88,140 H32 Z', top: 36, bottom: 140, extra: 'M26,36 C26,8 94,8 94,36' },
};
function renderContainers(v: Extract<Visual, { kind: 'containers' }>): HTMLElement {
  const wrap = el('div', { class: 'vis vis-containers' });
  for (const it of v.items.slice(0, 5)) {
    const shape = it.shape ?? 'cup';
    const spec = CONTAINER_PATH[shape] ?? CONTAINER_PATH.cup;
    const level = Math.max(0, Math.min(1, Number(it.level) || 0));
    const root = svg(120, 150, `vis-container-svg vis-container-${shape}`);
    const id = uidv('clip');
    const defs = s('defs'); const clip = s('clipPath', { id }); clip.append(s('path', { d: spec.d })); defs.append(clip); root.append(defs);
    if (spec.extra) root.append(s('path', { d: spec.extra, fill: 'none', stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' }));
    root.append(s('path', { d: spec.d, fill: '#f8fafc', stroke: 'none' }));
    const wy = spec.bottom - level * (spec.bottom - spec.top);
    const water = s('g', { 'clip-path': `url(#${id})` });
    water.append(s('rect', { x: 0, y: wy, width: 120, height: 150 - wy, fill: WATER }));
    water.append(s('rect', { x: 0, y: wy, width: 120, height: 4, fill: '#d6ecff' }));
    root.append(water);
    root.append(s('path', { d: spec.d, fill: 'none', stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' }));
    if (shape === 'bottle') root.append(s('rect', { x: 40, y: 8, width: 40, height: 12, rx: 3, fill: '#a9c9ff', stroke: INK, 'stroke-width': 2.5 }));
    wrap.append(el('div', { class: 'vis-container' }, root, label(it.label)));
  }
  return wrap;
}

// ------------------------------------------------------------------ areas ----
function renderAreas(v: Extract<Visual, { kind: 'areas' }>): HTMLElement {
  const wrap = el('div', { class: 'vis vis-areas' });
  const maxDim = Math.max(1, ...v.items.flatMap((i) => [i.w, i.h]));
  const cell = maxDim <= 4 ? 34 : maxDim <= 6 ? 28 : 22;
  v.items.slice(0, 4).forEach((it, i) => {
    const w = clampN(it.w, 1, 12), h = clampN(it.h, 1, 12);
    const root = svg(w * cell + 4, h * cell + 4, 'vis-area-svg');
    root.append(s('rect', { x: 2, y: 2, width: w * cell, height: h * cell, fill: it.color || PASTEL[i % PASTEL.length], stroke: INK, 'stroke-width': 3 }));
    for (let x = 1; x < w; x++) root.append(s('line', { x1: 2 + x * cell, y1: 2, x2: 2 + x * cell, y2: 2 + h * cell, stroke: INK, 'stroke-width': 1, opacity: 0.5 }));
    for (let y = 1; y < h; y++) root.append(s('line', { x1: 2, y1: 2 + y * cell, x2: 2 + w * cell, y2: 2 + y * cell, stroke: INK, 'stroke-width': 1, opacity: 0.5 }));
    wrap.append(el('div', { class: 'vis-area' }, root, label(it.label)));
  });
  return wrap;
}

// --------------------------------------------------------------- calendar ----
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
function renderCalendar(v: Extract<Visual, { kind: 'calendar' }>): HTMLElement {
  const year = clampN(v.year, 1900, 2200), month = clampN(v.month, 1, 12);
  const first = new Date(year, month - 1, 1).getDay();
  const days = new Date(year, month, 0).getDate();
  const hl = new Set(v.highlight ?? []);
  const wrap = el('div', { class: 'vis vis-calendar' });
  wrap.append(el('div', { class: 'vis-cal-title' }, `${year}년 ${month}월`));
  const table = el('table', { class: 'vis-cal-table' });
  const head = el('tr');
  WEEKDAYS.forEach((w, i) => head.append(el('th', { class: i === 0 ? 'is-sun' : i === 6 ? 'is-sat' : '' }, w)));
  table.append(el('thead', {}, head));
  const tbody = el('tbody');
  let tr = el('tr');
  for (let i = 0; i < first; i++) tr.append(el('td', { class: 'is-empty' }));
  for (let d = 1; d <= days; d++) {
    const dow = (first + d - 1) % 7;
    if (dow === 0 && d !== 1) { tbody.append(tr); tr = el('tr'); }
    const cls = ['vis-cal-day', dow === 0 ? 'is-sun' : dow === 6 ? 'is-sat' : '', hl.has(d) ? 'is-hl' : ''].filter(Boolean).join(' ');
    tr.append(el('td', { class: cls }, el('span', {}, String(d))));
  }
  const lastDow = (first + days - 1) % 7;
  for (let i = lastDow + 1; i <= 6; i++) tr.append(el('td', { class: 'is-empty' }));
  tbody.append(tr);
  table.append(tbody);
  wrap.append(table);
  return wrap;
}

// ------------------------------------------------------------------- grid ----
function renderGrid(v: Extract<Visual, { kind: 'grid' }>): HTMLElement {
  const table = el('table', { class: `vis-table vis-grid-table ${v.header ? 'has-header' : ''}` });
  v.rows.forEach((row, ri) => {
    const tr = el('tr');
    row.forEach((c, ci) => {
      const isHead = v.header && (ri === 0 || ci === 0);
      const cell = el(isHead ? 'th' : 'td', {});
      if (c === null || c === undefined) cell.append(el('span', { class: 'vis-blank' }, '?'));
      else cell.textContent = String(c);
      tr.append(cell);
    });
    table.append(tr);
  });
  return el('div', { class: 'vis vis-tablewrap vis-grid' }, table);
}

// -------------------------------------------------------------------- row ----
function renderRow(v: Extract<Visual, { kind: 'row' }>): HTMLElement {
  const wrap = el('div', { class: 'vis vis-row' });
  for (const it of v.items) wrap.append(el('div', { class: 'vis-row-item' }, renderVisual(it)));
  return wrap;
}
