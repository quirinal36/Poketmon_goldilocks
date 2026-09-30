// ============================================================================
// Procedural creature cries: a 0.4 – 0.8 s chirp whose pitch contour, timbre,
// vibrato, chop and noise mix are derived from a PRNG seeded with the species
// id — every species sounds distinct but always the same. Heavier species are
// pitched lower when a weight is given.
// ============================================================================

import { Synth, type WaveKind } from './synth';

export type CryContour = 'rise' | 'fall' | 'risefall' | 'fallrise' | 'wobble' | 'steps';

export interface CryParams {
  dur: number;          // seconds 0.4..0.8
  base: number;         // Hz
  wave: WaveKind;
  contour: CryContour;
  span: number;         // pitch travel as ratio (1.2 .. 2.2)
  chops: number;        // 1..3 (repeated chirps)
  vibRate: number;      // Hz
  vibDepth: number;     // 0..0.06 (fraction of freq)
  noise: number;        // 0..0.4 noise mix
  duty2: boolean;       // add a detuned second pulse layer
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CONTOURS: CryContour[] = ['rise', 'fall', 'risefall', 'fallrise', 'wobble', 'steps'];
const WAVES: WaveKind[] = ['p12', 'p25', 'p50', 'tri', 'p25', 'p50'];

export function cryParams(speciesId: number, weightKg?: number): CryParams {
  const rnd = mulberry32((speciesId * 2654435761) ^ 0x5bd1e995);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
  let base = 220 * Math.pow(2, rnd() * 2.4);            // 220 .. ~1160 Hz
  if (weightKg !== undefined && weightKg > 0) {
    const f = Math.max(0.55, Math.min(1.5, 1.4 - Math.log10(weightKg + 1) * 0.35));
    base *= f;
  }
  base = Math.max(120, Math.min(2200, base));
  return {
    dur: 0.4 + rnd() * 0.4,
    base,
    wave: pick(WAVES),
    contour: pick(CONTOURS),
    span: 1.2 + rnd() * 1.0,
    chops: 1 + Math.floor(rnd() * 3),
    vibRate: 4 + rnd() * 10,
    vibDepth: rnd() < 0.4 ? 0 : rnd() * 0.06,
    noise: rnd() < 0.5 ? 0 : rnd() * 0.4,
    duty2: rnd() < 0.35,
  };
}

/** Pitch multiplier along the contour for x in 0..1. */
function contourAt(c: CryContour, x: number, span: number): number {
  const lg = Math.log2(span);
  switch (c) {
    case 'rise': return Math.pow(2, lg * x);
    case 'fall': return Math.pow(2, lg * (1 - x));
    case 'risefall': return Math.pow(2, lg * Math.sin(Math.PI * x));
    case 'fallrise': return Math.pow(2, lg * (1 - Math.sin(Math.PI * x)));
    case 'wobble': return Math.pow(2, lg * 0.5 * (0.5 + 0.5 * Math.sin(x * Math.PI * 4)));
    case 'steps': return Math.pow(2, lg * (Math.floor(x * 4) / 3));
  }
}

export function playCry(s: Synth, dest: AudioNode, t0: number, speciesId: number, weightKg?: number, gain = 0.32): number {
  const p = cryParams(speciesId, weightKg);
  const ctx = s.ctx;
  const N = 24;
  const curve = new Float32Array(N);
  for (let i = 0; i < N; i++) curve[i] = p.base * contourAt(p.contour, i / (N - 1), p.span);

  const master = ctx.createGain();
  master.gain.value = gain;
  master.connect(dest);

  // Chop envelope: 1..3 chirps inside the total duration.
  const chopLen = p.dur / p.chops;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t0);
  for (let k = 0; k < p.chops; k++) {
    const a = t0 + k * chopLen;
    env.gain.setValueAtTime(0, a);
    env.gain.linearRampToValueAtTime(1, a + 0.012);
    env.gain.setValueAtTime(1, a + chopLen * 0.7);
    env.gain.linearRampToValueAtTime(0, a + chopLen * 0.92);
  }
  env.connect(master);

  const makeOsc = (detuneCents: number, vol: number) => {
    const o = s.osc(p.wave === 'noise' ? 'p25' : p.wave, p.base);
    o.frequency.setValueCurveAtTime(curve, t0, p.dur);
    o.detune.value = detuneCents;
    const g = ctx.createGain();
    g.gain.value = vol;
    o.connect(g).connect(env);
    if (p.vibDepth > 0) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = p.vibRate;
      const lg = ctx.createGain();
      lg.gain.value = p.base * p.vibDepth;
      lfo.connect(lg).connect(o.frequency);
      lfo.start(t0);
      lfo.stop(t0 + p.dur + 0.05);
    }
    o.start(t0);
    o.stop(t0 + p.dur + 0.05);
  };
  makeOsc(0, 1);
  if (p.duty2) makeOsc(9, 0.45);

  if (p.noise > 0) {
    const n = s.noiseSource();
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 2.5;
    f.frequency.setValueCurveAtTime(curve.map((v) => Math.min(12000, v * 2)), t0, p.dur);
    const g = ctx.createGain();
    g.gain.value = p.noise;
    n.connect(f).connect(g).connect(env);
    n.start(t0);
    n.stop(t0 + p.dur + 0.05);
  }
  return p.dur + 0.05;
}
