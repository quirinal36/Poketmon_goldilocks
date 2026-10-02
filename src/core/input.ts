// Unified input (DESIGN §2): keyboard + on-screen buttons (ui/controls.ts) + programmatic presses
// all become InputButton 'down' / 'repeat' / 'up' events. Handlers are called most-recent-first;
// a handler returning true consumes the event (so an open dialog shadows the overworld).
import type { Dir, InputButton } from './types';

export type InputEventType = 'down' | 'up' | 'repeat';
export interface InputEvent { button: InputButton; type: InputEventType }
export type InputHandler = (ev: InputEvent) => boolean | void;

export const KEYMAP: Record<string, InputButton> = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  KeyZ: 'a', Space: 'a', Enter: 'a', NumpadEnter: 'a',
  KeyX: 'b', Escape: 'b', Backspace: 'b',
  KeyM: 'start', Tab: 'start',
};

const DIRS: readonly Dir[] = ['up', 'down', 'left', 'right'];
const REPEAT_DELAY = 320;
const REPEAT_RATE = 110;

export const isDir = (b: InputButton): b is Dir => (DIRS as readonly string[]).includes(b);

function isEditable(t: EventTarget | null): boolean {
  const e = t as HTMLElement | null;
  if (!e || !e.tagName) return false;
  const tag = e.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || e.isContentEditable === true;
}

class InputManager {
  private handlers: InputHandler[] = [];
  private heldSince = new Map<InputButton, number>();
  private dirStack: Dir[] = [];
  private timers = new Map<InputButton, number>();
  private inited = false;
  /** Set true by the world while an on-map input source should be ignored (unused by core). */

  init(): void {
    if (this.inited) return;
    this.inited = true;
    // A released press must not activate a different surface revealed underneath it.
    let pressTarget: Element | null = null;
    window.addEventListener('pointerdown', e => {
      if (e.isPrimary) pressTarget = e.target instanceof Element ? e.target : null;
    }, true);
    window.addEventListener('pointercancel', e => { if (e.isPrimary) pressTarget = null; }, true);
    window.addEventListener('click', e => {
      if (e.detail === 0) return; // Native keyboard activation and programmatic clicks.
      const origin = pressTarget;
      pressTarget = null;
      const target = e.target;
      if (origin && (!origin.isConnected || !(target instanceof Node) ||
        !(origin.contains(target) || (target instanceof Element && target.contains(origin))))) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }, true);
    window.addEventListener('keydown', (e) => {
      if (isEditable(e.target)) return;
      const b = KEYMAP[e.code];
      if (!b) return;
      if (e.code === 'Tab') return;
      if ((e.code === 'Enter' || e.code === 'Space') && (e.target as HTMLElement)?.tagName === 'BUTTON') return;
      e.preventDefault();
      if (e.repeat) return;
      this.down(b);
    });
    window.addEventListener('keyup', (e) => {
      const b = KEYMAP[e.code];
      if (!b) return;
      if (!isEditable(e.target)) e.preventDefault();
      this.up(b);
    });
    window.addEventListener('blur', () => this.releaseAll());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.releaseAll(); });
  }

  subscribe(h: InputHandler): () => void {
    this.handlers.push(h);
    return () => this.unsubscribe(h);
  }
  unsubscribe(h: InputHandler): void {
    const i = this.handlers.lastIndexOf(h);
    if (i >= 0) this.handlers.splice(i, 1);
  }

  isHeld(b: InputButton): boolean { return this.heldSince.has(b); }
  heldFor(b: InputButton): number { const t = this.heldSince.get(b); return t === undefined ? 0 : performance.now() - t; }
  /** Most recently pressed direction that is still held (null if none). */
  heldDir(): Dir | null { return this.dirStack.length ? this.dirStack[this.dirStack.length - 1] : null; }

  down(b: InputButton): void {
    if (this.heldSince.has(b)) return;
    this.heldSince.set(b, performance.now());
    if (isDir(b)) { this.dirStack = this.dirStack.filter((d) => d !== b); this.dirStack.push(b); }
    this.emit({ button: b, type: 'down' });
    const t = window.setTimeout(() => this.startRepeat(b), REPEAT_DELAY);
    this.timers.set(b, t);
  }

  up(b: InputButton): void {
    if (!this.heldSince.has(b)) return;
    this.heldSince.delete(b);
    if (isDir(b)) this.dirStack = this.dirStack.filter((d) => d !== b);
    const t = this.timers.get(b);
    if (t !== undefined) { clearTimeout(t); clearInterval(t); this.timers.delete(b); }
    this.emit({ button: b, type: 'up' });
  }

  /** Programmatic tap (down + up). */
  press(b: InputButton): void { this.down(b); this.up(b); }

  releaseAll(): void {
    for (const b of Array.from(this.heldSince.keys())) this.up(b);
  }

  private startRepeat(b: InputButton): void {
    if (!this.heldSince.has(b)) return;
    this.emit({ button: b, type: 'repeat' });
    const t = window.setInterval(() => {
      if (!this.heldSince.has(b)) { clearInterval(t); return; }
      this.emit({ button: b, type: 'repeat' });
    }, REPEAT_RATE);
    this.timers.set(b, t);
  }

  private emit(ev: InputEvent): void {
    const hs = this.handlers.slice();
    for (let i = hs.length - 1; i >= 0; i--) {
      try { if (hs[i](ev) === true) return; } catch (e) { console.error('[input] handler error', e); }
    }
  }
}

export const input = new InputManager();
