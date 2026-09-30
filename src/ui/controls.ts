// On-screen GBC controls (#controls): D-pad (pointer events, multi-touch, slide between directions),
// A / B round buttons, START pill. All feed core/input.ts. Also blocks page zoom/scroll/selection.
import type { Dir, InputButton } from '../core/types';
import { input } from '../core/input';
import { el } from '../core/util';

const DEAD_ZONE = 0.16;
const MIN_DPAD_TAP_MS = 80; // Let the 60 fps world sample a brief touch; tune with real devices.

function dirFromPoint(dx: number, dy: number): Dir | null {
  const r = Math.hypot(dx, dy);
  if (r < DEAD_ZONE) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

export function initControls(): void {
  const host = document.getElementById('controls');
  if (!host || host.dataset.ready) return;
  host.dataset.ready = '1';

  // ---------------------------------------------------------------- D-pad
  const dpad = el('div', { class: 'dpad', role: 'group', 'aria-label': '방향키' },
    el('div', { class: 'dpad-arm v' }), el('div', { class: 'dpad-arm h' }),
    el('div', { class: 'dpad-cap up' }, '▲'), el('div', { class: 'dpad-cap down' }, '▼'),
    el('div', { class: 'dpad-cap left' }, '◀'), el('div', { class: 'dpad-cap right' }, '▶'),
    el('div', { class: 'dpad-center' }));
  const dpadWrap = el('div', { class: 'ctl-dpad' }, dpad);

  const pointers = new Map<number, Dir | null>();
  const pressedAt = new Map<number, number>();
  const pendingRelease = new Map<number, number>();
  const held = (d: Dir) => Array.from(pointers.values()).includes(d);
  const applyDir = (id: number, d: Dir | null) => {
    const prev = pointers.get(id) ?? null;
    if (prev === d) return;
    pointers.set(id, d);
    if (prev && !held(prev)) { input.up(prev); dpad.classList.remove('p-' + prev); }
    if (d) { input.down(d); dpad.classList.add('p-' + d); }
  };
  const release = (id: number) => {
    const prev = pointers.get(id) ?? null;
    pointers.delete(id);
    pressedAt.delete(id);
    const timer = pendingRelease.get(id);
    if (timer !== undefined) clearTimeout(timer);
    pendingRelease.delete(id);
    if (prev && !held(prev)) { input.up(prev); dpad.classList.remove('p-' + prev); }
  };
  const releaseAfterTap = (id: number) => {
    if (pendingRelease.has(id)) return;
    const remaining = MIN_DPAD_TAP_MS - (performance.now() - (pressedAt.get(id) ?? 0));
    if (remaining <= 0) release(id);
    else pendingRelease.set(id, window.setTimeout(() => release(id), remaining));
  };
  const point = (e: PointerEvent): Dir | null => {
    const r = dpad.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    return dirFromPoint(dx, dy);
  };
  dpad.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (pendingRelease.has(e.pointerId)) release(e.pointerId);
    pressedAt.set(e.pointerId, performance.now());
    try { dpad.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    applyDir(e.pointerId, point(e));
  });
  dpad.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    e.preventDefault();
    applyDir(e.pointerId, point(e));
  });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
    dpad.addEventListener(ev, (e) => { releaseAfterTap((e as PointerEvent).pointerId); });
  }

  // ------------------------------------------------------------- buttons
  const makeButton = (button: InputButton, cls: string, label: string) => {
    const b = el('div', { class: `ctl-btn ${cls}`, role: 'button', 'aria-label': label, tabindex: -1 }, label);
    const active = new Set<number>();
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { b.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      active.add(e.pointerId);
      b.classList.add('pressed');
      input.down(button);
    });
    const up = (e: PointerEvent) => {
      if (!active.has(e.pointerId)) return;
      active.delete(e.pointerId);
      if (!active.size) { b.classList.remove('pressed'); input.up(button); }
    };
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('lostpointercapture', up);
    return b;
  };
  const btnA = makeButton('a', 'btn-a', 'A');
  const btnB = makeButton('b', 'btn-b', 'B');
  const btnStart = makeButton('start', 'btn-start', 'START');
  const ab = el('div', { class: 'ab' }, btnB, btnA);
  const btnsWrap = el('div', { class: 'ctl-btns' }, ab, btnStart);

  host.replaceChildren(dpadWrap, btnsWrap);

  // ------------------------------------------------ page gesture blocking
  const block = (e: Event) => e.preventDefault();
  host.addEventListener('contextmenu', block);
  host.addEventListener('touchstart', block, { passive: false });
  host.addEventListener('touchmove', block, { passive: false });
  document.getElementById('stage')?.addEventListener('contextmenu', block);
  document.addEventListener('gesturestart', block, { passive: false } as AddEventListenerOptions);
  document.addEventListener('gesturechange', block, { passive: false } as AddEventListenerOptions);
  document.addEventListener('dblclick', block, { passive: false });
  // iOS: double-tap zoom prevention (touch-action handles most; this covers stragglers)
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd < 300 && !(e.target as HTMLElement | null)?.closest?.('button,[role="button"],input,textarea,select,[contenteditable]')) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
  window.addEventListener('blur', () => { for (const id of Array.from(pointers.keys())) release(id); });
}
