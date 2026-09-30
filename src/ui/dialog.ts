// GBC text box (DESIGN §2): white box, black double border, Galmuri11, 2 visible lines, typewriter,
// auto wrap, multi-page, blinking ▼, tap anywhere / A / B to advance (first tap completes the page),
// speaker tab, optional portrait, 🔊 button (ko-KR TTS; auto when parent.ttsDialog).
// choose(): GSC-style choice box on the right above the text box (rows ≥ 56px, ▶ cursor).
import type { SayOptions } from '../core/types';
import { G } from '../game';
import { input, type InputEvent } from '../core/input';
import { el } from '../core/util';

const SPEED_MS = { slow: 45, normal: 25, fast: 8 } as const;
const AUTO_ADVANCE_MS = 1100;

function testHooks(): { autoAnswer?: 'correct' | 'wrong'; fastText?: boolean } | undefined {
  return (window as any).__TEST__;
}

interface ChoiceSpec { options: string[]; cancelIndex?: number }

export class Dialog {
  private layer: HTMLElement;
  private root: HTMLElement;
  private capture: HTMLElement;
  private box: HTMLElement;
  private nameTab: HTMLElement;
  private portrait: HTMLImageElement;
  private textEl: HTMLElement;
  private lineEls: HTMLElement[];
  private arrow: HTMLElement;
  private speakBtn: HTMLElement;
  private choiceEl: HTMLElement;
  private queue: Promise<unknown> = Promise.resolve();
  private measureCtx: CanvasRenderingContext2D | null = null;

  private typing = false;
  private finishTyping: (() => void) | null = null;
  private dismiss: (() => void) | null = null;
  private currentPageText = '';
  private choiceState: { spec: ChoiceSpec; index: number; resolve: (i: number) => void; rows: HTMLElement[] } | null = null;
  private unsubscribe: (() => void) | null = null;
  private openCount = 0;

  constructor(layer: HTMLElement) {
    this.layer = layer;
    this.capture = el('div', { class: 'dlg-capture' });
    this.nameTab = el('div', { class: 'dlg-name' });
    this.portrait = el('img', { class: 'dlg-portrait', alt: '' });
    this.lineEls = [el('div', { class: 'dlg-line' }), el('div', { class: 'dlg-line' })];
    this.textEl = el('div', { class: 'dlg-text' }, ...this.lineEls);
    this.arrow = el('div', { class: 'dlg-arrow' }, '▼');
    this.speakBtn = el('button', { class: 'dlg-speak', type: 'button', 'aria-label': '읽어 주기' }, '🔊');
    this.box = el('div', { class: 'dlg-box' }, this.portrait, this.textEl, this.arrow);
    this.choiceEl = el('div', { class: 'dlg-choice' });
    this.root = el('div', { class: 'dlg-root' }, this.capture, this.nameTab, this.speakBtn, this.choiceEl, this.box);
    this.root.style.display = 'none';
    layer.append(this.root);

    this.capture.addEventListener('pointerdown', (e) => { e.preventDefault(); this.advance(); });
    this.box.addEventListener('pointerdown', (e) => { e.preventDefault(); this.advance(); });
    this.speakBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); });
    this.speakBtn.addEventListener('click', (e) => { e.stopPropagation(); this.speakCurrent(); });
  }

  get isOpen(): boolean { return this.openCount > 0; }

  say(lines: string | string[], opts: SayOptions = {}): Promise<void> {
    return this.enqueue(() => this.run(lines, opts, null)) as Promise<void>;
  }

  choose(prompt: string | string[], options: string[], opts: SayOptions & { cancelIndex?: number } = {}): Promise<number> {
    const spec: ChoiceSpec = { options: options.length ? options : ['확인'], cancelIndex: opts.cancelIndex };
    return this.enqueue(() => this.run(prompt, opts, spec)) as Promise<number>;
  }

  async yesNo(prompt: string | string[], opts: SayOptions = {}): Promise<boolean> {
    const i = await this.choose(prompt, ['예', '아니오'], { ...opts, cancelIndex: 1 });
    return i === 0;
  }

  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const p = this.queue.then(fn, fn);
    this.queue = p.catch(() => undefined);
    return p;
  }

  // ---------------------------------------------------------------- core
  private async run(lines: string | string[], opts: SayOptions, choice: ChoiceSpec | null): Promise<number | void> {
    const pages = this.paginate(lines);
    this.show(opts);
    try {
      for (let i = 0; i < pages.length; i++) {
        const isLast = i === pages.length - 1;
        await this.showPage(pages[i], opts, !(isLast && choice));
      }
      if (choice) return await this.showChoice(choice);
    } finally {
      this.hide();
    }
  }

  private show(opts: SayOptions): void {
    this.openCount++;
    this.root.style.display = '';
    this.arrow.classList.remove('show');
    this.choiceEl.style.display = 'none';
    this.choiceEl.replaceChildren();
    if (opts.speaker) { this.nameTab.textContent = opts.speaker; this.nameTab.style.display = ''; }
    else this.nameTab.style.display = 'none';
    const url = opts.portrait ? G.data?.images?.[opts.portrait] : undefined;
    if (url) { this.portrait.src = url; this.portrait.style.display = ''; this.box.classList.add('has-portrait'); }
    else { this.portrait.removeAttribute('src'); this.portrait.style.display = 'none'; this.box.classList.remove('has-portrait'); }
    if (this.openCount === 1) {
      try { G.world?.lock?.(); } catch { /* ignore */ }
      this.unsubscribe = input.subscribe((ev) => this.onInput(ev));
    }
  }

  private hide(): void {
    this.openCount = Math.max(0, this.openCount - 1);
    if (this.openCount > 0) return;
    this.root.style.display = 'none';
    this.choiceState = null;
    this.typing = false;
    this.finishTyping = null;
    this.dismiss = null;
    for (const l of this.lineEls) l.textContent = '';
    this.unsubscribe?.();
    this.unsubscribe = null;
    try { G.world?.unlock?.(); } catch { /* ignore */ }
  }

  private onInput(ev: InputEvent): boolean {
    if (this.choiceState) {
      if (ev.type === 'up') return true;
      const cs = this.choiceState;
      if (ev.button === 'up' || ev.button === 'down') {
        const n = cs.spec.options.length;
        cs.index = (cs.index + (ev.button === 'up' ? n - 1 : 1)) % n;
        this.renderCursor();
        this.sfx('cursor');
        return true;
      }
      if (ev.type !== 'down') return true;
      if (ev.button === 'a') { this.pickChoice(cs.index); return true; }
      if (ev.button === 'b') {
        if (cs.spec.cancelIndex !== undefined) { this.sfx('back'); this.pickChoice(cs.spec.cancelIndex); }
        return true;
      }
      return true;
    }
    if (ev.type === 'down' && (ev.button === 'a' || ev.button === 'b')) { this.advance(); return true; }
    return true; // shadow everything else while a dialog is open
  }

  private advance(): void {
    if (this.choiceState) return;
    if (this.typing && this.finishTyping) { this.finishTyping(); return; }
    if (this.dismiss) { const d = this.dismiss; this.dismiss = null; d(); }
  }

  private sfx(id: 'cursor' | 'select' | 'back'): void {
    try { G.audio?.playSfx(id); } catch { /* ignore */ }
  }

  private speakCurrent(): void {
    const text = this.currentPageText.trim();
    if (!text) return;
    try { void G.audio.speak({ text, lang: 'ko-KR' }, { interrupt: true }); } catch { /* ignore */ }
  }

  private async showPage(page: string[], opts: SayOptions, waitDismiss: boolean): Promise<void> {
    const fast = !!testHooks()?.fastText;
    this.arrow.classList.remove('show');
    for (const l of this.lineEls) l.textContent = '';
    this.currentPageText = page.join(' ');
    if (G.save?.data?.learn?.parent?.ttsDialog) this.speakCurrent();

    const speedKey = G.save?.data?.settings?.textSpeed ?? 'normal';
    const perChar = fast ? 0 : SPEED_MS[speedKey] ?? SPEED_MS.normal;
    if (perChar > 0) {
      await new Promise<void>((resolve) => {
        this.typing = true;
        let li = 0, ci = 0;
        let timer = 0;
        const finish = () => {
          clearTimeout(timer);
          for (let i = 0; i < this.lineEls.length; i++) this.lineEls[i].textContent = page[i] ?? '';
          this.typing = false; this.finishTyping = null;
          resolve();
        };
        this.finishTyping = finish;
        const step = () => {
          if (!this.typing) return;
          while (li < page.length && ci >= page[li].length) { li++; ci = 0; }
          if (li >= page.length) { finish(); return; }
          ci++;
          this.lineEls[li].textContent = page[li].slice(0, ci);
          const ch = page[li][ci - 1];
          timer = window.setTimeout(step, ch === ' ' ? Math.max(4, perChar / 2) : perChar);
        };
        step();
      });
    } else {
      for (let i = 0; i < this.lineEls.length; i++) this.lineEls[i].textContent = page[i] ?? '';
    }

    if (!waitDismiss) return;
    this.arrow.classList.add('show');
    await new Promise<void>((resolve) => {
      let done = false;
      const finish = () => { if (done) return; done = true; this.dismiss = null; resolve(); };
      this.dismiss = finish;
      if (fast) setTimeout(finish, 50);
      else if (opts.auto) setTimeout(finish, AUTO_ADVANCE_MS);
    });
    this.arrow.classList.remove('show');
  }

  private showChoice(spec: ChoiceSpec): Promise<number> {
    return new Promise<number>((resolve) => {
      const rows = spec.options.map((label, i) => {
        const row = el('button', { class: 'dlg-choice-row', type: 'button' },
          el('span', { class: 'dlg-cursor' }, '▶'), el('span', { class: 'dlg-choice-label' }, label));
        row.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); });
        row.addEventListener('click', (e) => { e.stopPropagation(); this.pickChoice(i); });
        return row;
      });
      this.choiceEl.replaceChildren(...rows);
      this.choiceEl.style.display = '';
      this.choiceState = { spec, index: 0, resolve, rows };
      this.renderCursor();
    });
  }

  private renderCursor(): void {
    const cs = this.choiceState;
    if (!cs) return;
    cs.rows.forEach((r, i) => r.classList.toggle('sel', i === cs.index));
  }

  private pickChoice(i: number): void {
    const cs = this.choiceState;
    if (!cs) return;
    this.sfx('select');
    this.choiceState = null;
    this.choiceEl.style.display = 'none';
    cs.resolve(i);
  }

  // ------------------------------------------------------------ wrapping
  private measurer(): ((s: string) => number) {
    if (!this.measureCtx) {
      const c = document.createElement('canvas');
      this.measureCtx = c.getContext('2d');
    }
    const ctx = this.measureCtx;
    const font = getComputedStyle(this.textEl).font || '22px Galmuri11';
    if (ctx) ctx.font = font;
    return (s: string) => (ctx ? ctx.measureText(s).width : s.length * 12);
  }

  private maxTextWidth(): number {
    const w = this.textEl.clientWidth;
    if (w > 0) return w;
    const px = parseFloat(getComputedStyle(document.getElementById('stage') ?? document.body).getPropertyValue('--px')) || 2;
    return 200 * px;
  }

  /** Split text into pages of 2 lines. Each array element starts a new page; '\n' forces a line break. */
  paginate(lines: string | string[]): string[][] {
    const wasHidden = this.root.style.display === 'none';
    if (wasHidden) { this.root.style.visibility = 'hidden'; this.root.style.display = ''; }
    const maxW = this.maxTextWidth();
    const measure = this.measurer();
    if (wasHidden) { this.root.style.display = 'none'; this.root.style.visibility = ''; }
    const arr = (Array.isArray(lines) ? lines : [lines]).map((s) => String(s ?? ''));
    const pages: string[][] = [];
    for (const entry of arr) {
      const wrapped: string[] = [];
      for (const hard of entry.split('\n')) wrapped.push(...wrapLine(hard, maxW, measure));
      if (!wrapped.length) wrapped.push('');
      for (let i = 0; i < wrapped.length; i += 2) pages.push(wrapped.slice(i, i + 2));
    }
    if (!pages.length) pages.push(['']);
    return pages;
  }
}

export function wrapLine(text: string, maxW: number, measure: (s: string) => number): string[] {
  const out: string[] = [];
  const words = text.split(' ');
  let cur = '';
  const pushWord = (w: string) => {
    const candidate = cur ? cur + ' ' + w : w;
    if (measure(candidate) <= maxW) { cur = candidate; return; }
    if (cur) { out.push(cur); cur = ''; }
    if (measure(w) <= maxW) { cur = w; return; }
    // break a too-long word by characters
    let piece = '';
    for (const ch of Array.from(w)) {
      if (measure(piece + ch) > maxW && piece) { out.push(piece); piece = ''; }
      piece += ch;
    }
    cur = piece;
  };
  for (const w of words) pushWord(w);
  if (cur || !out.length) out.push(cur);
  return out;
}
