// Question card modal (DESIGN §5.5). ask(q, opts) → AskResult; records via G.learn.record().
// Works without G.audio / G.save / G.learn (dev pages) — every G access is guarded.
import type { AskOptions, AskResult, Choice, Question, SfxId, Speakable } from '../core/types';
import { el, pick, shuffle, sleep } from '../core/util';
import { G } from '../game';
import { renderVisual } from './visuals';
import './learn.css';

export const PRAISE = ['딩동댕! 정답이에요!', '참 잘했어요!', '최고예요!', '와, 대단해요!', '정말 똑똑해요!', '멋져요!'];
export const COMFORT = '괜찮아요! 다음엔 꼭 맞힐 수 있어요!';
export const DEFAULT_HINT = '다시 한번 잘 생각해 볼까요?';
export const CORRECT_DELAY_MS = 900;
const WRONG_LOCK_MS = 520;
const SUBJECT_LABEL: Record<string, string> = { math: '🔢 수학', english: '🔤 영어' };
const NUMPAD_PLACEHOLDER = '숫자를 눌러 보세요';

interface TestHooks { autoAnswer?: 'correct' | 'wrong' }
const testHooks = (): TestHooks | undefined => (typeof window !== 'undefined' ? (window as unknown as { __TEST__?: TestHooks }).__TEST__ : undefined);

export function ensureModalLayer(): HTMLElement {
  let layer = document.getElementById('layer-modal');
  if (!layer) { layer = el('div', { id: 'layer-modal' }); document.body.append(layer); }
  return layer;
}

// ------------------------------------------------------- guarded G access ----
function sfx(id: SfxId): void { try { G.audio?.playSfx?.(id); } catch { /* ignore */ } }
function stopSpeaking(): void { try { G.audio?.stopSpeaking?.(); } catch { /* ignore */ } }
async function speak(items: Speakable | Speakable[], interrupt = true): Promise<void> {
  try { await G.audio?.speak?.(items, { interrupt }); } catch { /* ignore */ }
}
function ttsQuestionsEnabled(): boolean {
  try { return G.save?.data?.learn?.parent?.ttsQuestions ?? true; } catch { return true; }
}
const reducedMotion = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Long text answers (sentences) stack 1×N; short/emoji/visual answers use a 2×2 grid. */
export function isStackedLayout(choices: Choice[]): boolean {
  return choices.some((c) => !!c.text && !c.emoji && !c.visual && ([...c.text].length > 10 || c.text.trim().split(/\s+/).length >= 3));
}

export function normalizeNumber(s: string): string {
  const n = parseInt(String(s).trim(), 10);
  return Number.isFinite(n) ? String(n) : '';
}

function choiceContent(c: Choice): Node[] {
  const out: Node[] = [];
  if (c.visual) out.push(renderVisual(c.visual));
  if (c.emoji) out.push(el('span', { class: 'qc-choice-emoji' }, c.emoji));
  if (c.text) out.push(el('span', { class: 'qc-choice-text', lang: /[A-Za-z]/.test(c.text) && !/[가-힣]/.test(c.text) ? 'en' : 'ko' }, c.text));
  return out;
}

// -------------------------------------------------------------------- ask ----
export function ask(q: Question, opts: AskOptions): Promise<AskResult> {
  return new Promise<AskResult>((resolve) => {
    const layer = ensureModalLayer();
    const t0 = performance.now();
    const allowRetry = opts.allowRetry !== false;
    const maxAttempts = allowRetry ? 2 : 1;
    let attempts = 0;
    let done = false;      // final outcome decided
    let busy = false;      // animation lock
    let finished = false;  // promise resolved
    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

    let lessonTitle = '';
    try { lessonTitle = G.learn?.lesson?.(q.lessonId)?.title ?? ''; } catch { /* ignore */ }

    // ---- header
    const tries = el('span', { class: 'qc-tries', 'aria-label': '남은 기회' }, '💛'.repeat(maxAttempts));
    const head = el('div', { class: 'qc-head' },
      el('span', { class: `qc-chip ${q.subject === 'english' ? 'is-english' : ''}` }, SUBJECT_LABEL[q.subject] ?? '📘 공부'),
      el('span', { class: 'qc-lesson' }, lessonTitle),
      opts.title ? el('span', { class: 'qc-context' }, opts.title) : null,
      tries,
    );

    // ---- prompt / listen / visual / bubble
    const promptItems: Speakable[] = q.speak?.length ? q.speak : [{ text: q.prompt, lang: 'ko-KR' }];
    const speakPrompt = () => speak(promptItems);
    const promptEl = el('div', { class: 'qc-prompt', lang: 'ko' }, q.prompt);
    const speakBtn = el('button', { class: 'qc-speak', type: 'button', 'aria-label': '문제 읽어 주기', onclick: () => { void speakPrompt(); } }, '🔊');
    let listenBtn: HTMLButtonElement | null = null;
    const playListen = async () => {
      if (!q.listen || !listenBtn) return;
      listenBtn.classList.add('is-playing');
      await speak(q.listen);
      listenBtn.classList.remove('is-playing');
    };
    if (q.listen) {
      listenBtn = el('button', { class: 'qc-listen', type: 'button', 'aria-label': '듣기', onclick: () => { void playListen(); } },
        el('span', { class: 'qc-listen-icon' }, '🔊'), el('span', {}, '들어 보세요'));
    }
    const visualEl = q.visual ? el('div', { class: 'qc-visual' }, renderVisual(q.visual)) : null;
    const bubble = el('div', { class: 'qc-bubble', role: 'status', 'aria-live': 'polite' });
    const left = el('div', { class: 'qc-left' }, el('div', { class: 'qc-prompt-row' }, promptEl, speakBtn), listenBtn, visualEl, bubble);
    const right = el('div', { class: 'qc-right' });
    const mark = el('div', { class: 'qc-mark', 'aria-hidden': 'true' });
    const card = el('div', {
      class: `qc-card qc-mode-${q.answerMode} ${q.visual ? 'qc-has-visual' : ''}`, tabindex: '-1', role: 'dialog', 'aria-modal': 'true', 'aria-label': q.prompt,
    }, head, el('div', { class: 'qc-main' }, left, right), mark);
    const root = el('div', { class: 'qc-backdrop', 'data-question': q.id }, card);

    // ---- feedback helpers
    let confirmBtn: HTMLButtonElement | null = null;
    function showBubble(text: string, kind: 'hint' | 'bad' | 'good', explain?: string, withConfirm = false) {
      bubble.className = `qc-bubble is-visible is-${kind}`;
      bubble.replaceChildren(el('span', { class: 'qc-bubble-text' }, text));
      if (explain) bubble.append(el('span', { class: 'qc-bubble-explain' }, explain));
      if (withConfirm) {
        confirmBtn = el('button', { class: 'qc-confirm', type: 'button', onclick: () => finish(false, false) }, '확인');
        bubble.append(el('div', { class: 'qc-bubble-actions' }, confirmBtn));
      }
      if (left.scrollHeight > left.clientHeight) bubble.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
    function showMark(symbol: string, text: string, kind: 'good' | 'bad') {
      mark.className = `qc-mark is-visible is-${kind}`;
      mark.replaceChildren(el('div', { class: 'qc-mark-inner' }, el('div', { class: 'qc-mark-symbol' }, symbol), text ? el('div', { class: 'qc-mark-text' }, text) : null));
    }
    function sparkle(at: HTMLElement | null) {
      if (reducedMotion() || !at) return;
      const r = at.getBoundingClientRect(), cr = card.getBoundingClientRect();
      for (let i = 0; i < 8; i++) {
        const sp = el('span', { class: 'qc-sparkle' }, pick(['✨', '⭐', '🌟']));
        sp.style.left = `${r.left - cr.left + r.width / 2}px`;
        sp.style.top = `${r.top - cr.top + r.height / 2}px`;
        sp.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 220)}px`);
        sp.style.setProperty('--dy', `${Math.round(-40 - Math.random() * 120)}px`);
        card.append(sp);
        later(() => sp.remove(), 950);
      }
    }
    function useTry() { tries.textContent = '💛'.repeat(Math.max(0, maxAttempts - attempts)) + '🤍'.repeat(Math.min(maxAttempts, attempts)); }

    // ---- answers
    const choiceBtns: HTMLButtonElement[] = [];
    let typed = '';
    let display: HTMLElement | null = null;
    let keyBtns: HTMLButtonElement[] = [];
    const correctAnswer = q.answerMode === 'numpad' ? normalizeNumber(q.answer) : q.answer;

    const disableAll = () => { for (const b of choiceBtns) b.disabled = true; for (const b of keyBtns) b.disabled = true; };

    if (q.answerMode === 'choice') {
      const list = q.choices ?? [];
      const ordered = q.shuffle === false ? list.slice() : shuffle(list);
      const grid = el('div', { class: `qc-choices ${isStackedLayout(ordered) ? 'qc-stacked' : 'qc-grid'}`, role: 'group', 'aria-label': '보기' });
      for (const c of ordered) {
        const btn = el('button', {
          class: ['qc-choice', c.emoji && !c.text && !c.visual ? 'is-emoji' : '', c.visual ? 'has-visual' : '', c.speak ? 'has-speak' : ''].filter(Boolean).join(' '),
          type: 'button', 'data-choice': c.id,
        }, ...choiceContent(c));
        btn.addEventListener('click', () => submit(c.id, btn));
        if (c.speak) {
          const sp = el('span', { class: 'qc-choice-speak', role: 'button', tabindex: '0', 'aria-label': '듣기' }, '🔊');
          const hear = (e: Event) => { e.stopPropagation(); e.preventDefault(); void speak(c.speak!); };
          sp.addEventListener('click', hear);
          sp.addEventListener('pointerdown', (e) => e.stopPropagation());
          sp.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') hear(e); });
          btn.append(sp);
        }
        choiceBtns.push(btn);
        grid.append(btn);
      }
      right.append(grid);
    } else {
      display = el('div', { class: 'qc-display is-empty', 'aria-live': 'polite' }, NUMPAD_PLACEHOLDER);
      const renderDisplay = () => {
        if (!display) return;
        display.classList.toggle('is-empty', !typed);
        display.replaceChildren(typed || NUMPAD_PLACEHOLDER);
        if (typed) display.append(el('span', { class: 'qc-cursor' }));
      };
      const press = (k: string) => {
        if (done || busy) return;
        if (k === 'del') typed = typed.slice(0, -1);
        else if (typed.length < 4) typed = typed === '0' ? k : typed + k;
        sfx('cursor');
        renderDisplay();
      };
      const keys = el('div', { class: 'qc-keys' });
      for (const k of ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok']) {
        const isDel = k === 'del', isOk = k === 'ok';
        const b = el('button', { class: `qc-key-btn ${isDel ? 'is-del' : ''} ${isOk ? 'is-ok' : ''}`, type: 'button', 'data-key': k, 'aria-label': isDel ? '지우기' : isOk ? '확인' : k },
          isDel ? '⌫' : isOk ? '확인' : k);
        b.addEventListener('click', () => { if (isOk) confirmNumpad(); else press(k); });
        keyBtns.push(b);
        keys.append(b);
      }
      right.append(el('div', { class: 'qc-numpad' }, display, keys));
      (right as HTMLElement & { __press?: (k: string) => void }).__press = press;
      (right as HTMLElement & { __render?: () => void }).__render = renderDisplay;
    }

    function confirmNumpad() {
      if (done || busy || !display) return;
      if (!typed) {
        display.classList.remove('is-wrong'); void display.offsetWidth; display.classList.add('is-wrong');
        later(() => display?.classList.remove('is-wrong'), WRONG_LOCK_MS);
        sfx('bump');
        return;
      }
      submit(normalizeNumber(typed));
    }
    const numpadPress = (k: string) => (right as HTMLElement & { __press?: (k: string) => void }).__press?.(k);
    const numpadRender = () => (right as HTMLElement & { __render?: () => void }).__render?.();

    // ---- flow
    function submit(value: string, btn?: HTMLButtonElement) {
      if (done || busy) return;
      stopSpeaking();
      attempts++;
      if (value === correctAnswer) { void onCorrect(btn); return; }
      if (attempts < maxAttempts) void onWrongRetry(btn); else onWrongFinal(btn);
    }

    async function onCorrect(btn?: HTMLButtonElement) {
      done = true; busy = true;
      elapsed = performance.now() - t0;
      const first = attempts === 1;
      disableAll();
      btn?.classList.add('is-correct');
      display?.classList.add('is-correct');
      sfx('correct');
      const praise = pick(PRAISE);
      showMark('⭕', praise, 'good');
      showBubble(praise, 'good');
      sparkle(btn ?? display);
      if (ttsQuestionsEnabled()) void speak({ text: praise, lang: 'ko-KR' });
      await sleep(CORRECT_DELAY_MS);
      finish(true, first);
    }

    async function onWrongRetry(btn?: HTMLButtonElement) {
      busy = true;
      useTry();
      sfx('wrong');
      if (btn) { btn.classList.add('is-wrong'); btn.disabled = true; }
      if (display) { display.classList.add('is-wrong'); }
      const hint = q.hint || DEFAULT_HINT;
      showBubble(hint, 'hint');
      if (ttsQuestionsEnabled()) void speak({ text: hint, lang: 'ko-KR' });
      await sleep(WRONG_LOCK_MS);
      if (display) { typed = ''; numpadRender(); display.classList.remove('is-wrong'); }
      busy = false;
    }

    function onWrongFinal(btn?: HTMLButtonElement) {
      done = true; busy = true;
      elapsed = performance.now() - t0;
      useTry();
      disableAll();
      sfx('wrong');
      if (btn) btn.classList.add('is-wrong');
      for (const b of choiceBtns) {
        if (b.dataset.choice === q.answer) b.classList.add('is-answer');
        else if (b !== btn) b.classList.add('is-dim');
      }
      if (display) {
        display.classList.remove('is-empty', 'is-wrong');
        display.classList.add('is-answer');
        display.replaceChildren(correctAnswer);
      }
      showBubble(COMFORT, 'bad', q.explain, true);
      if (ttsQuestionsEnabled()) {
        const items: Speakable[] = [{ text: COMFORT, lang: 'ko-KR' }];
        if (q.explain) items.push({ text: q.explain, lang: 'ko-KR' });
        void speak(items);
      }
      later(() => confirmBtn?.focus({ preventScroll: true }), 50);
    }

    function finish(correct: boolean, firstTry: boolean) {
      if (finished) return;
      finished = true;
      const result: AskResult = { questionId: q.id, correct, firstTry, attempts, elapsedMs: Math.round(elapsed || performance.now() - t0) };
      cleanup();
      if (!correct) stopSpeaking();
      try { G.learn?.record?.(q, result, opts.purpose); } catch (err) { console.warn('[learn] record failed', err); }
      resolve(result);
    }
    function cleanup() {
      for (const t of timers) clearTimeout(t);
      window.removeEventListener('keydown', onKey, true);
      root.remove();
    }

    // ---- keyboard
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (done) {
        if (confirmBtn && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); confirmBtn.click(); }
        else if (finished) return;
        e.stopPropagation();
        return;
      }
      e.stopPropagation();
      if (busy) return;
      if (q.answerMode === 'choice') {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= choiceBtns.length) { e.preventDefault(); const b = choiceBtns[n - 1]; if (!b.disabled) b.click(); }
      } else if (/^[0-9]$/.test(e.key)) { e.preventDefault(); numpadPress(e.key); }
      else if (e.key === 'Backspace') { e.preventDefault(); numpadPress('del'); }
      else if (e.key === 'Enter') { e.preventDefault(); confirmNumpad(); }
    }
    window.addEventListener('keydown', onKey, true);

    // ---- mount
    layer.append(root);
    card.focus({ preventScroll: true });
    void (async () => {
      if (ttsQuestionsEnabled()) await speakPrompt();
      if (q.listen && !finished) await playListen();
    })();

    // ---- e2e hook: window.__TEST__.autoAnswer = 'correct' | 'wrong'
    const hooks = testHooks();
    if (hooks?.autoAnswer) {
      const mode = hooks.autoAnswer;
      const act = () => {
        if (finished) return;
        if (done) { confirmBtn?.click(); return; }
        if (busy) { later(act, 300); return; }
        if (q.answerMode === 'choice') {
          const target = choiceBtns.find((b) => !b.disabled && ((b.dataset.choice === q.answer) === (mode === 'correct')));
          (target ?? choiceBtns.find((b) => !b.disabled))?.click();
        } else {
          typed = mode === 'correct' ? correctAnswer : String((parseInt(correctAnswer, 10) + 1) % 10000);
          numpadRender();
          confirmNumpad();
        }
        later(act, 300);
      };
      later(act, 300);
    }
  });
}
