// Stage layout (DESIGN §2): sizes #stage to the largest area for the logical viewport,
// landscape 240x176 (15x11 tiles) / portrait 176x208 (11x13 tiles), and publishes the
// scale as the CSS variable --px (1 logical pixel in CSS px) on #stage and #app.
import { TILE } from './types';

export interface LayoutInfo {
  landscape: boolean;
  cols: number;
  rows: number;
  /** logical viewport size in pixels */
  w: number;
  h: number;
  /** CSS px per logical px */
  scale: number;
}

export const LANDSCAPE = { cols: 15, rows: 11 };
export const PORTRAIT = { cols: 11, rows: 13 };

type Listener = (l: LayoutInfo) => void;
const listeners: Listener[] = [];
let raf = 0;

export const layout = {
  current: {
    landscape: true, cols: LANDSCAPE.cols, rows: LANDSCAPE.rows,
    w: LANDSCAPE.cols * TILE, h: LANDSCAPE.rows * TILE, scale: 2,
  } as LayoutInfo,
  onChange(cb: Listener): () => void {
    listeners.push(cb);
    return () => { const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); };
  },
  /** Recompute now (e.g. after controls were (re)built). */
  apply,
  /** Convert a pointer event on the stage/canvas to logical pixel coordinates. */
  toLogical(clientX: number, clientY: number): { x: number; y: number } {
    const stage = document.getElementById('stage');
    if (!stage) return { x: 0, y: 0 };
    const r = stage.getBoundingClientRect();
    const s = layout.current.scale || 1;
    return { x: (clientX - r.left) / s, y: (clientY - r.top) / s };
  },
};

function num(v: string): number { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; }

function apply(): void {
  const app = document.getElementById('app');
  const stage = document.getElementById('stage');
  const canvas = document.getElementById('world') as HTMLCanvasElement | null;
  if (!app || !stage || !canvas) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const landscape = vw >= vh;
  document.body.classList.toggle('landscape', landscape);
  document.body.classList.toggle('portrait', !landscape);

  const dims = landscape ? LANDSCAPE : PORTRAIT;
  const w = dims.cols * TILE;
  const h = dims.rows * TILE;

  const cs = getComputedStyle(app);
  const padL = num(cs.paddingLeft), padR = num(cs.paddingRight), padT = num(cs.paddingTop), padB = num(cs.paddingBottom);
  const gap = num(cs.columnGap) || num(cs.gap) || 8;

  const dpad = document.querySelector<HTMLElement>('.ctl-dpad');
  const btns = document.querySelector<HTMLElement>('.ctl-btns');
  const dpadW = dpad?.offsetWidth ?? 0, dpadH = dpad?.offsetHeight ?? 0;
  const btnsW = btns?.offsetWidth ?? 0, btnsH = btns?.offsetHeight ?? 0;

  let availW: number, availH: number;
  if (landscape) {
    availW = vw - padL - padR - dpadW - btnsW - gap * 2;
    availH = vh - padT - padB;
  } else {
    availW = vw - padL - padR;
    availH = vh - padT - padB - Math.max(dpadH, btnsH) - gap;
  }
  availW = Math.max(availW, 120);
  availH = Math.max(availH, 100);

  const raw = Math.min(availW / w, availH / h);
  const dpr = window.devicePixelRatio || 1;
  // Integer scale in *device* pixels when possible (pixel-perfect); fractional only when tiny.
  let scale = Math.floor(raw * dpr) / dpr;
  if (scale < 1) scale = Math.max(0.5, raw);
  scale = Math.round(scale * 1000) / 1000;

  const cssW = Math.round(w * scale);
  const cssH = Math.round(h * scale);
  stage.style.width = cssW + 'px';
  stage.style.height = cssH + 'px';
  stage.style.setProperty('--px', scale + 'px');
  app.style.setProperty('--px', scale + 'px');
  document.documentElement.style.setProperty('--px', scale + 'px');
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }

  layout.current = { landscape, cols: dims.cols, rows: dims.rows, w, h, scale };
  for (const cb of listeners.slice()) { try { cb(layout.current); } catch (e) { console.error(e); } }
}

function schedule(): void {
  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => { raf = 0; apply(); });
}

let inited = false;
export function initLayout(): void {
  if (inited) return;
  inited = true;
  apply();
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', () => { schedule(); setTimeout(apply, 300); });
  window.visualViewport?.addEventListener('resize', schedule);
  // fonts / controls can change control sizes slightly after first paint
  setTimeout(apply, 50);
  setTimeout(apply, 500);
}
