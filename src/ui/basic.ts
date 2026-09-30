// Toasts (#layer-toast) and screen transitions (#layer-fade): fadeOut / fadeIn / flash.
import { el, sleep } from '../core/util';

function fast(): boolean { return !!(window as any).__TEST__?.fastText; }
function dur(ms: number): number { return fast() ? Math.min(ms, 30) : ms; }

let fadeToken = 0;

export function toast(msg: string, ms = 1800): void {
  const layer = document.getElementById('layer-toast');
  if (!layer) return;
  const t = el('div', { class: 'toast' }, msg);
  layer.append(t);
  requestAnimationFrame(() => t.classList.add('show'));
  const total = dur(ms);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, total);
}

function fadeLayer(): HTMLElement | null { return document.getElementById('layer-fade'); }

export async function fadeOut(ms = 300): Promise<void> {
  const f = fadeLayer();
  if (!f) return;
  const token = ++fadeToken;
  const d = dur(ms);
  f.style.background = '#000';
  f.style.transition = `opacity ${d}ms linear`;
  f.style.pointerEvents = 'auto';
  f.classList.add('active');
  void f.offsetWidth;
  f.style.opacity = '1';
  await sleep(d + 20);
  if (token !== fadeToken) return;
}

export async function fadeIn(ms = 300): Promise<void> {
  const f = fadeLayer();
  if (!f) return;
  const token = ++fadeToken;
  const d = dur(ms);
  f.style.transition = `opacity ${d}ms linear`;
  void f.offsetWidth;
  f.style.opacity = '0';
  await sleep(d + 20);
  if (token !== fadeToken) return;
  f.style.pointerEvents = 'none';
  f.classList.remove('active');
}

export async function flash(color = '#ffffff', ms = 200): Promise<void> {
  const f = fadeLayer();
  if (!f) return;
  const token = ++fadeToken;
  const d = dur(ms);
  f.style.transition = 'none';
  f.style.background = color;
  f.style.pointerEvents = 'auto';
  f.style.opacity = '1';
  void f.offsetWidth;
  f.style.transition = `opacity ${d}ms ease-out`;
  f.style.opacity = '0';
  await sleep(d + 20);
  if (token !== fadeToken) return;
  f.style.pointerEvents = 'none';
  f.style.background = '#000';
}
