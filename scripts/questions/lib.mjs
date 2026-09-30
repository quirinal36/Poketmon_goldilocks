// Shared helpers for question generators. Deterministic: same seed → same output (stable ids!).

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string into a 32-bit seed. */
export function seedOf(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export const randInt = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
export function shuffle(r, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export function sample(r, arr, n) { return shuffle(r, arr).slice(0, n); }

export const CHOICE_IDS = ['a', 'b', 'c', 'd'];

/**
 * Build choices from a correct value + distractors. Returns { choices, answer }.
 * values are rendered with toChoice(value) → partial Choice (text/emoji/visual/speak).
 * Correct position is randomized deterministically (renderer may reshuffle anyway).
 */
export function makeChoices(r, correct, distractors, toChoice = (v) => ({ text: String(v) }), n = 4) {
  const uniq = [];
  const key = (v) => JSON.stringify(v);
  const seen = new Set([key(correct)]);
  for (const d of distractors) { const k = key(d); if (!seen.has(k)) { seen.add(k); uniq.push(d); } }
  const opts = shuffle(r, [correct, ...uniq.slice(0, n - 1)]);
  const choices = opts.map((v, i) => ({ id: CHOICE_IDS[i], ...toChoice(v) }));
  const answer = CHOICE_IDS[opts.findIndex((v) => key(v) === key(correct))];
  return { choices, answer };
}

/** Numeric distractors near the answer (non-negative, unique, within [min,max]). */
export function nearNumbers(r, ans, count = 3, { min = 0, max = 9999, spread = 3 } = {}) {
  const set = new Set();
  let guard = 0;
  while (set.size < count && guard++ < 200) {
    const d = ans + (r() < 0.5 ? -1 : 1) * randInt(r, 1, spread);
    if (d !== ans && d >= min && d <= max) set.add(d);
  }
  for (let d = min; d <= max && set.size < count; d++) {
    if (d !== ans) set.add(d);
  }
  return [...set];
}

export const pad3 = (n) => String(n).padStart(3, '0');

/** Emoji sets for counting / pictures (widely supported on iOS/Android). */
export const COUNT_EMOJI = ['🍎', '🍓', '🍌', '🍇', '🍊', '⭐', '🌸', '🐟', '🐤', '🎈', '🍪', '⚽', '🚗', '🐞', '🍩', '🧁', '🌻', '🦋', '🐸', '🍉'];
export const NUM_KO = ['영', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
export const NUM_SINO = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십'];
export const ORDINAL_KO = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째'];

/**
 * Lesson builder utility: collects questions with auto ids.
 *   const L = lessonBuilder('m11-u1-l1', 'math');
 *   L.add({ type, prompt, ... });  → id m11-u1-l1-001 ...
 */
export function lessonBuilder(lessonId, subject) {
  const qs = [];
  const sigs = new Set();
  return {
    questions: qs,
    /** Adds unless an identical question (same prompt+visual+answer text) already exists. Returns true if added. */
    add(q) {
      const correctChoice = q.choices?.find((c) => c.id === q.answer);
      const sig = JSON.stringify([q.prompt, q.visual, q.listen, q.answerMode === 'numpad' ? q.answer : correctChoice]);
      if (sigs.has(sig)) return false;
      sigs.add(sig);
      qs.push({ id: `${lessonId}-${pad3(qs.length + 1)}`, lessonId, subject, shuffle: true, ...q });
      return true;
    },
    get count() { return qs.length; },
  };
}
