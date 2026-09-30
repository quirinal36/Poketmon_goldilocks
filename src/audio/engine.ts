// ============================================================================
// AudioContext lifecycle + bus graph.
//
//   music players → musicBus → duck → musicGain ─┐
//   sfx / cries   → sfxBus  → sfxGain ───────────┴→ master → compressor → out
//
// The context is created lazily inside the first user gesture (unlock), which
// is what iOS requires; a 1-sample silent buffer is played inside that gesture.
// Suspends while the document is hidden, resumes when visible, and recovers
// from iOS's 'interrupted' state on the next gesture / visibility change.
// ============================================================================

import { Synth } from './synth';

const MUSIC_TRIM = 0.55;   // keeps chip music modest even at settings.music = 1
const SFX_TRIM = 0.8;
const DUCK_LEVEL = 0.35;   // music level while TTS is speaking

export interface Engine {
  readonly ctx: AudioContext | null;
  readonly synth: Synth | null;
  readonly musicBus: GainNode | null;
  readonly sfxBus: GainNode | null;
  /** true once the context exists (it may still be suspended). */
  readonly ready: boolean;
  readonly running: boolean;
  unlock(): void;
  /** Try to resume if suspended/interrupted (safe anywhere). */
  resume(): void;
  setVolumes(music: number, sfx: number): void;
  duck(on: boolean): void;
  onReady(cb: () => void): void;
  /** Current volumes (0..1, before trims). */
  readonly volumes: { music: number; sfx: number };
}

type Ctor = new (opts?: AudioContextOptions) => AudioContext;

function contextCtor(): Ctor | null {
  const g = globalThis as any;
  const C = g.AudioContext ?? g.webkitAudioContext;
  return typeof C === 'function' ? (C as Ctor) : null;
}

export function createEngine(): Engine {
  let ctx: AudioContext | null = null;
  let synth: Synth | null = null;
  let master: GainNode | null = null;
  let musicGain: GainNode | null = null;
  let sfxGain: GainNode | null = null;
  let duckGain: GainNode | null = null;
  let musicBus: GainNode | null = null;
  let sfxBus: GainNode | null = null;
  const volumes = { music: 0.7, sfx: 0.8 };
  let ducked = false;
  let hiddenSuspended = false;
  const readyCbs: (() => void)[] = [];

  const applyVolumes = () => {
    if (!ctx || !musicGain || !sfxGain) return;
    const t = ctx.currentTime;
    musicGain.gain.setTargetAtTime(clamp01(volumes.music) * MUSIC_TRIM, t, 0.03);
    sfxGain.gain.setTargetAtTime(clamp01(volumes.sfx) * SFX_TRIM, t, 0.03);
  };

  const build = (): boolean => {
    if (ctx) return true;
    const C = contextCtor();
    if (!C) return false;
    try {
      ctx = new C({ latencyHint: 'interactive' });
    } catch {
      try { ctx = new C(); } catch { ctx = null; return false; }
    }
    synth = new Synth(ctx);
    master = ctx.createGain();
    master.gain.value = 1;
    let out: AudioNode = ctx.destination;
    try {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 18;
      comp.ratio.value = 3;
      comp.attack.value = 0.003;
      comp.release.value = 0.15;
      comp.connect(ctx.destination);
      out = comp;
    } catch { /* no compressor: go direct */ }
    master.connect(out);
    musicGain = ctx.createGain();
    sfxGain = ctx.createGain();
    duckGain = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    musicBus.connect(duckGain).connect(musicGain).connect(master);
    sfxBus.connect(sfxGain).connect(master);
    duckGain.gain.value = ducked ? DUCK_LEVEL : 1;
    musicGain.gain.value = clamp01(volumes.music) * MUSIC_TRIM;
    sfxGain.gain.value = clamp01(volumes.sfx) * SFX_TRIM;
    try {
      ctx.addEventListener?.('statechange', () => {
        // iOS: after an interruption (call, Siri) the state is 'interrupted';
        // resume as soon as we are visible again.
        const st = (ctx as any)?.state as string;
        if (st === 'interrupted' && isVisible()) tryResume();
      });
    } catch { /* */ }
    for (const cb of readyCbs.splice(0)) { try { cb(); } catch { /* */ } }
    return true;
  };

  const tryResume = () => {
    if (!ctx) return;
    const st = (ctx as any).state as string;
    if (st === 'running' || st === 'closed') return;
    try { const p = ctx.resume(); if (p && typeof p.catch === 'function') p.catch(() => { /* needs a gesture */ }); } catch { /* */ }
  };

  const unlock = () => {
    if (!build() || !ctx) return;
    tryResume();
    // iOS needs an actual sound started inside the gesture.
    try {
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch { /* */ }
  };

  // Visibility: pause when hidden, resume when visible.
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    try {
      document.addEventListener('visibilitychange', () => {
        if (!ctx) return;
        if (document.hidden) {
          if ((ctx as any).state === 'running') {
            hiddenSuspended = true;
            try { ctx.suspend().catch(() => { /* */ }); } catch { /* */ }
          }
        } else {
          if (hiddenSuspended || (ctx as any).state === 'interrupted') {
            hiddenSuspended = false;
            tryResume();
          }
        }
      });
      // Any gesture re-arms a suspended/interrupted context (iOS after a call etc).
      const onGesture = () => { if (ctx && (ctx as any).state !== 'running') unlock(); };
      for (const ev of ['pointerdown', 'touchend', 'keydown', 'click']) {
        document.addEventListener(ev, onGesture, { capture: true, passive: true });
      }
    } catch { /* */ }
  }

  return {
    get ctx() { return ctx; },
    get synth() { return synth; },
    get musicBus() { return musicBus; },
    get sfxBus() { return sfxBus; },
    get ready() { return !!ctx; },
    get running() { return !!ctx && (ctx as any).state === 'running'; },
    get volumes() { return { ...volumes }; },
    unlock,
    resume: tryResume,
    setVolumes(music, sfx) {
      volumes.music = clamp01(music);
      volumes.sfx = clamp01(sfx);
      applyVolumes();
    },
    duck(on) {
      ducked = on;
      if (!ctx || !duckGain) return;
      duckGain.gain.setTargetAtTime(on ? DUCK_LEVEL : 1, ctx.currentTime, on ? 0.05 : 0.25);
    },
    onReady(cb) {
      if (ctx) cb(); else readyCbs.push(cb);
    },
  };
}

const clamp01 = (v: number) => (Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0);
const isVisible = () => typeof document === 'undefined' || !document.hidden;
