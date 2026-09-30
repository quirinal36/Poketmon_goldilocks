// ============================================================================
// Synthesized sound effects. Each function schedules its nodes at time t0 on
// the given destination and returns the effect's duration in seconds.
// Everything is deliberately soft — the players are 7-year-olds on tablets.
// ============================================================================

import type { SfxId } from '../core/types';
import { Synth, type Env, type WaveKind } from './synth';

export type SfxFn = (s: Synth, dest: AudioNode, t0: number) => number;

const BLIP: Env = { a: 0.002, d: 0.03, s: 0.4, r: 0.03 };
const PING: Env = { a: 0.002, d: 0.12, s: 0.3, r: 0.12 };
const SOFT: Env = { a: 0.03, d: 0.1, s: 0.7, r: 0.1 };

/** Tone helper: freq -> optional glide, fixed hold. */
function tone(s: Synth, dest: AudioNode, t0: number, wave: WaveKind, freq: number, hold: number, vel: number, env: Env = BLIP, glideTo?: number, glideTime?: number): number {
  const v = s.note({ wave, freq, t0, hold, vel, env, dest, glideTo, glideTime });
  return v.endsAt - t0;
}

/** Filtered noise burst with its own envelope + optional filter sweep. */
function noiseBurst(s: Synth, dest: AudioNode, t0: number, o: {
  type: BiquadFilterType; f0: number; f1?: number; q?: number; dur: number; vel: number; attack?: number;
}): number {
  const ctx = s.ctx;
  const n = s.noiseSource();
  const f = ctx.createBiquadFilter();
  f.type = o.type;
  f.Q.value = o.q ?? 0.8;
  f.frequency.setValueAtTime(o.f0, t0);
  if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t0 + o.dur);
  const g = ctx.createGain();
  const a = o.attack ?? 0.004;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(o.vel, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0005, t0 + o.dur);
  n.connect(f).connect(g).connect(dest);
  n.start(t0);
  n.stop(t0 + o.dur + 0.02);
  return o.dur;
}

/** A sequence of short notes (arpeggio). */
function arp(s: Synth, dest: AudioNode, t0: number, wave: WaveKind, freqs: number[], step: number, vel: number, env: Env = BLIP, lastHold?: number): number {
  freqs.forEach((f, i) => {
    const last = i === freqs.length - 1;
    s.note({ wave, freq: f, t0: t0 + i * step, hold: last && lastHold ? lastHold : step * 0.9, vel, env, dest });
  });
  return step * (freqs.length - 1) + (lastHold ?? step) + env.r * 3;
}

export const SFX: Record<SfxId, SfxFn> = {
  // UI ---------------------------------------------------------------------
  select: (s, d, t) => { tone(s, d, t, 'p50', 660, 0.04, 0.28); tone(s, d, t + 0.045, 'p50', 990, 0.06, 0.28); return 0.15; },
  cursor: (s, d, t) => tone(s, d, t, 'p25', 1180, 0.025, 0.2),
  back: (s, d, t) => { tone(s, d, t, 'p50', 990, 0.04, 0.24); tone(s, d, t + 0.045, 'p50', 620, 0.07, 0.24); return 0.16; },
  save: (s, d, t) => { arp(s, d, t, 'p50', [1047, 1319, 1568], 0.07, 0.25, PING, 0.25); tone(s, d, t + 0.02, 'tri', 523, 0.3, 0.2, SOFT); return 0.6; },
  coin: (s, d, t) => { tone(s, d, t, 'p50', 988, 0.05, 0.26); tone(s, d, t + 0.055, 'p50', 1319, 0.22, 0.26, PING); return 0.4; },

  // Overworld --------------------------------------------------------------
  bump: (s, d, t) => { tone(s, d, t, 'tri', 120, 0.08, 0.5, { a: 0.002, d: 0.05, s: 0.3, r: 0.04 }, 55, 0.08); noiseBurst(s, d, t, { type: 'lowpass', f0: 500, dur: 0.05, vel: 0.15 }); return 0.14; },
  door: (s, d, t) => { noiseBurst(s, d, t, { type: 'lowpass', f0: 1200, f1: 300, dur: 0.09, vel: 0.3 }); tone(s, d, t + 0.02, 'p50', 320, 0.09, 0.2, BLIP, 200, 0.09); tone(s, d, t + 0.14, 'tri', 180, 0.06, 0.3, BLIP, 90, 0.06); return 0.26; },
  stairs: (s, d, t) => arp(s, d, t, 'p50', [420, 520, 640, 780], 0.055, 0.22),
  ledge: (s, d, t) => {
    tone(s, d, t, 'p50', 300, 0.16, 0.25, { a: 0.003, d: 0.05, s: 0.7, r: 0.04 }, 640, 0.14);
    tone(s, d, t + 0.2, 'tri', 140, 0.06, 0.4, BLIP, 60, 0.06);
    noiseBurst(s, d, t + 0.2, { type: 'lowpass', f0: 600, dur: 0.05, vel: 0.15 });
    return 0.32;
  },
  grass: (s, d, t) => { noiseBurst(s, d, t, { type: 'bandpass', f0: 1800, f1: 2600, q: 0.6, dur: 0.12, vel: 0.3, attack: 0.01 }); noiseBurst(s, d, t + 0.07, { type: 'bandpass', f0: 2400, f1: 1600, q: 0.6, dur: 0.1, vel: 0.22, attack: 0.01 }); return 0.2; },
  encounter: (s, d, t) => arp(s, d, t, 'p50', [523, 659, 784, 1047, 1319, 1568], 0.045, 0.3, PING, 0.3),

  // Learning feedback ------------------------------------------------------
  // "ding-dong": two bright bell notes (C6 → E6) with a soft triangle body.
  correct: (s, d, t) => {
    tone(s, d, t, 'p50', 1047, 0.13, 0.3, PING);
    tone(s, d, t, 'tri', 2093, 0.13, 0.15, PING);
    tone(s, d, t + 0.15, 'p50', 1319, 0.28, 0.3, PING);
    tone(s, d, t + 0.15, 'tri', 2637, 0.28, 0.15, PING);
    return 0.6;
  },
  // "bwoop": gentle, low, rounded slide. Never harsh.
  wrong: (s, d, t) => { tone(s, d, t, 'tri', 300, 0.26, 0.4, SOFT, 175, 0.24); tone(s, d, t + 0.02, 'p25', 150, 0.22, 0.12, SOFT, 88, 0.2); return 0.45; },

  // Battle -----------------------------------------------------------------
  hit: (s, d, t) => { noiseBurst(s, d, t, { type: 'lowpass', f0: 2200, f1: 400, dur: 0.11, vel: 0.35 }); tone(s, d, t, 'p50', 220, 0.09, 0.28, BLIP, 70, 0.09); return 0.18; },
  hit_super: (s, d, t) => {
    noiseBurst(s, d, t, { type: 'lowpass', f0: 3200, f1: 300, dur: 0.22, vel: 0.42 });
    tone(s, d, t, 'p50', 320, 0.1, 0.32, BLIP, 60, 0.1);
    tone(s, d, t + 0.09, 'p50', 260, 0.12, 0.3, BLIP, 50, 0.12);
    tone(s, d, t + 0.02, 'tri', 90, 0.2, 0.4, BLIP, 40, 0.2);
    return 0.32;
  },
  faint: (s, d, t) => {
    // stepped descending slide (chip style)
    const steps = [660, 560, 470, 400, 330, 270, 220, 170, 130, 100];
    steps.forEach((f, i) => s.note({ wave: 'p50', freq: f, t0: t + i * 0.05, hold: 0.045, vel: 0.28 - i * 0.012, env: BLIP, dest: d }));
    return 0.6;
  },
  ball_throw: (s, d, t) => noiseBurst(s, d, t, { type: 'bandpass', f0: 500, f1: 3200, q: 1.2, dur: 0.32, vel: 0.35, attack: 0.08 }),
  ball_shake: (s, d, t) => {
    noiseBurst(s, d, t, { type: 'highpass', f0: 3000, dur: 0.015, vel: 0.3 });
    tone(s, d, t + 0.01, 'tri', 210, 0.14, 0.4, { a: 0.003, d: 0.06, s: 0.5, r: 0.05 }, 150, 0.14);
    tone(s, d, t + 0.01, 'p25', 420, 0.1, 0.12, BLIP, 300, 0.1);
    return 0.24;
  },
  ball_pop: (s, d, t) => { tone(s, d, t, 'p50', 900, 0.05, 0.28, BLIP, 1500, 0.05); noiseBurst(s, d, t, { type: 'bandpass', f0: 2500, q: 1.5, dur: 0.05, vel: 0.25 }); return 0.12; },
  catch: (s, d, t) => arp(s, d, t, 'p50', [1047, 1319, 1568, 2093], 0.06, 0.28, PING, 0.35),
  exp: (s, d, t) => tone(s, d, t, 'p25', 1000, 0.045, 0.2, BLIP, 1500, 0.045),

  // Reward -----------------------------------------------------------------
  stamp: (s, d, t) => {
    // thunk
    tone(s, d, t, 'tri', 130, 0.06, 0.55, BLIP, 55, 0.06);
    noiseBurst(s, d, t, { type: 'lowpass', f0: 800, dur: 0.04, vel: 0.3 });
    // sparkle
    arp(s, d, t + 0.1, 'p12', [1568, 1976, 2637, 3136], 0.045, 0.22, PING, 0.3);
    return 0.65;
  },
};

export const SFX_IDS = Object.keys(SFX) as SfxId[];
