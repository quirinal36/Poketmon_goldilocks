// ============================================================================
// Text-to-speech via the Web Speech API. Fully guarded: when speechSynthesis
// is missing (node, sandboxed iframes) every call is a harmless no-op.
// ============================================================================

import type { Lang, Speakable } from '../core/types';

const PREFERRED: Record<Lang, string[]> = {
  'ko-KR': ['Yuna', 'Google 한국', 'Sora', 'Heami'],
  'en-US': ['Samantha', 'Google US English', 'Aaron', 'Nicky'],
};
const DEFAULT_RATE: Record<Lang, number> = { 'ko-KR': 0.95, 'en-US': 0.85 };

export interface TtsOptions {
  /** Called with true when speech starts, false when the queue drains / is cancelled. */
  onSpeaking?: (speaking: boolean) => void;
  /** Settings rate (ko base). Read on every speak() so it tracks the parent settings. */
  settingsRate?: () => number | undefined;
}

export interface Tts {
  speak(items: Speakable | Speakable[], opts?: { rate?: number; interrupt?: boolean }): Promise<void>;
  stop(): void;
  available(lang: Lang): boolean;
  /** Best voice found for a language (for the dev page). */
  voiceFor(lang: Lang): SpeechSynthesisVoice | null;
}

function synth(): SpeechSynthesis | null {
  try {
    const s = (globalThis as any).speechSynthesis as SpeechSynthesis | undefined;
    return s && typeof s.speak === 'function' ? s : null;
  } catch { return null; }
}

export function createTts(o: TtsOptions = {}): Tts {
  const cache = new Map<Lang, SpeechSynthesisVoice | null>();
  let generation = 0;
  let speaking = false;

  const setSpeaking = (v: boolean) => {
    if (speaking === v) return;
    speaking = v;
    try { o.onSpeaking?.(v); } catch { /* */ }
  };

  const voices = (): SpeechSynthesisVoice[] => {
    try { return synth()?.getVoices() ?? []; } catch { return []; }
  };

  const pickVoice = (lang: Lang): SpeechSynthesisVoice | null => {
    if (cache.has(lang)) return cache.get(lang)!;
    const all = voices();
    if (!all.length) return null;             // not loaded yet — do not cache
    const prefix = lang.slice(0, 2).toLowerCase();
    const norm = (s: string) => (s || '').replace(/[_-]/g, '-').toLowerCase();
    const sameLang = all.filter((v) => norm(v.lang).startsWith(prefix));
    let best: SpeechSynthesisVoice | null = null;
    for (const name of PREFERRED[lang]) {
      best = sameLang.find((v) => v.name.includes(name)) ?? all.find((v) => v.name.includes(name) && norm(v.lang).startsWith(prefix)) ?? null;
      if (best) break;
    }
    if (!best) best = sameLang.find((v) => norm(v.lang) === norm(lang)) ?? null;
    if (!best) best = sameLang.find((v) => v.localService) ?? sameLang[0] ?? null;
    cache.set(lang, best);
    return best;
  };

  const s0 = synth();
  if (s0) {
    try {
      s0.addEventListener?.('voiceschanged', () => cache.clear());
      if (typeof (s0 as any).onvoiceschanged !== 'undefined' && !s0.addEventListener) (s0 as any).onvoiceschanged = () => cache.clear();
      s0.getVoices(); // kick off async loading in Chrome
    } catch { /* */ }
  }

  const rateFor = (lang: Lang, explicit?: number): number => {
    if (typeof explicit === 'number' && isFinite(explicit)) return clamp(explicit, 0.5, 1.6);
    let base = DEFAULT_RATE['ko-KR'];
    try { const r = o.settingsRate?.(); if (typeof r === 'number' && isFinite(r)) base = r; } catch { /* */ }
    const r = lang === 'en-US' ? base * (DEFAULT_RATE['en-US'] / DEFAULT_RATE['ko-KR']) : base;
    return clamp(r, 0.5, 1.6);
  };

  const speakOne = (item: Speakable, rate: number, gen: number): Promise<void> =>
    new Promise<void>((resolve) => {
      const ss = synth();
      const text = (item.text || '').trim();
      if (!ss || !text || gen !== generation) return resolve();
      let done = false;
      let timer: ReturnType<typeof setTimeout> | null = null;
      const finish = () => {
        if (done) return;
        done = true;
        if (timer) clearTimeout(timer);
        resolve();
      };
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = item.lang;
        const v = pickVoice(item.lang);
        if (v) u.voice = v;
        u.rate = rate;
        u.pitch = 1;
        u.volume = 1;
        u.onend = finish;
        u.onerror = finish;
        // iOS Safari sometimes never fires onend: hard safety timeout.
        const ms = (400 + 90 * text.length) / Math.max(0.5, rate) + 1500;
        timer = setTimeout(finish, ms);
        ss.speak(u);
        // Some engines (Chrome) stay "paused" after a cancel — nudge them.
        if (ss.paused) { try { ss.resume(); } catch { /* */ } }
      } catch {
        finish();
      }
    });

  async function speak(items: Speakable | Speakable[], opts: { rate?: number; interrupt?: boolean } = {}): Promise<void> {
    const list = (Array.isArray(items) ? items : [items]).filter((it) => it && typeof it.text === 'string' && it.text.trim());
    const ss = synth();
    if (!ss || !list.length) return;
    const interrupt = opts.interrupt !== false;
    if (interrupt) {
      generation++;
      try { ss.cancel(); } catch { /* */ }
    }
    const gen = generation;
    setSpeaking(true);
    try {
      for (const item of list) {
        if (gen !== generation) break;
        await speakOne(item, rateFor(item.lang, opts.rate), gen);
      }
    } finally {
      // Only the newest queue owns the "speaking" flag.
      if (gen === generation) {
        let stillBusy = false;
        try { stillBusy = !!ss.speaking || !!ss.pending; } catch { /* */ }
        if (!stillBusy) setSpeaking(false);
      }
    }
  }

  function stop(): void {
    generation++;
    const ss = synth();
    if (ss) { try { ss.cancel(); } catch { /* */ } }
    setSpeaking(false);
  }

  function available(lang: Lang): boolean {
    const ss = synth();
    if (!ss || typeof (globalThis as any).SpeechSynthesisUtterance === 'undefined') return false;
    const all = voices();
    if (!all.length) return true;            // API exists, voices not loaded yet
    return pickVoice(lang) !== null;
  }

  return { speak, stop, available, voiceFor: pickVoice };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
