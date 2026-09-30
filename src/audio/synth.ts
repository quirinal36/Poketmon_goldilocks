// ============================================================================
// Chiptune synth primitives on top of WebAudio.
// 2 pulse "channels" (duty 12.5 / 25 / 50 %), triangle, noise — the classic
// 4-voice hand-held feel. Everything here works on any BaseAudioContext so the
// same code drives real-time playback and OfflineAudioContext rendering.
// ============================================================================

export type WaveKind = 'p12' | 'p25' | 'p50' | 'tri' | 'noise';
export type DrumName = 'kick' | 'snare' | 'hat' | 'ohat' | 'tom' | 'htom' | 'clap';

/** ADSR-ish envelope, times in seconds, sustain as 0..1 of peak. */
export interface Env { a: number; d: number; s: number; r: number }
export const DEFAULT_ENV: Env = { a: 0.004, d: 0.06, s: 0.7, r: 0.04 };
export const PLUCK_ENV: Env = { a: 0.002, d: 0.12, s: 0.25, r: 0.05 };
export const SOFT_ENV: Env = { a: 0.02, d: 0.1, s: 0.8, r: 0.12 };

/** Handle to a scheduled sound so the sequencer can cut it short (pause/stop). */
export interface Voice {
  endsAt: number;
  stop(at?: number): void;
}

const DUTY: Record<'p12' | 'p25' | 'p50', number> = { p12: 0.125, p25: 0.25, p50: 0.5 };

export const midiToFreq = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

export class Synth {
  readonly ctx: BaseAudioContext;
  private waves = new Map<string, PeriodicWave>();
  private noiseBuf: AudioBuffer | null = null;

  constructor(ctx: BaseAudioContext) {
    this.ctx = ctx;
  }

  get now(): number { return this.ctx.currentTime; }

  /** Band-limited pulse wave with the given duty cycle (Fourier series, 48 partials). */
  pulseWave(duty: number): PeriodicWave {
    const key = duty.toFixed(4);
    let w = this.waves.get(key);
    if (!w) {
      const N = 48;
      const real = new Float32Array(N);
      const imag = new Float32Array(N);
      for (let n = 1; n < N; n++) {
        const k = n * Math.PI;
        real[n] = (2 / k) * Math.sin(2 * k * duty);
        imag[n] = (2 / k) * (1 - Math.cos(2 * k * duty));
      }
      w = this.ctx.createPeriodicWave(real, imag);
      this.waves.set(key, w);
    }
    return w;
  }

  /** 1 s of white noise, looped by noise sources. */
  noiseBuffer(): AudioBuffer {
    if (!this.noiseBuf) {
      const sr = this.ctx.sampleRate;
      const buf = this.ctx.createBuffer(1, sr, sr);
      const d = buf.getChannelData(0);
      // Deterministic LCG so offline renders are reproducible.
      let seed = 0x9e3779b9;
      for (let i = 0; i < d.length; i++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        d[i] = (seed / 0xffffffff) * 2 - 1;
      }
      this.noiseBuf = buf;
    }
    return this.noiseBuf;
  }

  /** Oscillator for a tonal wave kind (not 'noise'). */
  osc(kind: Exclude<WaveKind, 'noise'>, freq: number): OscillatorNode {
    const o = this.ctx.createOscillator();
    if (kind === 'tri') o.type = 'triangle';
    else o.setPeriodicWave(this.pulseWave(DUTY[kind]));
    o.frequency.value = Math.max(1, Math.min(freq, 20000));
    return o;
  }

  noiseSource(): AudioBufferSourceNode {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuffer();
    s.loop = true;
    return s;
  }

  /**
   * Apply an ADSR to a gain param. `hold` = seconds from t0 until release starts.
   * Returns the time the sound is fully silent.
   */
  envelope(g: AudioParam, t0: number, hold: number, peak: number, env: Env = DEFAULT_ENV): number {
    const a = Math.min(env.a, Math.max(0.001, hold * 0.5));
    const rel = Math.max(0.005, env.r);
    g.cancelScheduledValues(t0);
    g.setValueAtTime(0, t0);
    g.linearRampToValueAtTime(peak, t0 + a);
    g.setTargetAtTime(peak * env.s, t0 + a, Math.max(0.005, env.d) / 3);
    const t1 = t0 + Math.max(hold, a);
    g.setTargetAtTime(0, t1, rel / 3);
    return t1 + rel * 2.5;
  }

  /**
   * Schedule a single note. For 'noise' the frequency is the centre of a band-pass
   * filter so "pitched" noise still works (e.g. grass rustle, whoosh).
   */
  note(o: {
    wave: WaveKind; freq: number; t0: number; hold: number; vel: number;
    env?: Env; dest: AudioNode; detune?: number; vibrato?: { rate: number; depth: number };
    glideTo?: number; glideTime?: number;
  }): Voice {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.connect(o.dest);
    const end = this.envelope(g.gain, o.t0, o.hold, o.vel, o.env);
    let src: AudioScheduledSourceNode;
    let lfo: OscillatorNode | null = null;
    if (o.wave === 'noise') {
      const n = this.noiseSource();
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = Math.max(40, Math.min(o.freq, 16000));
      f.Q.value = 1.2;
      n.connect(f).connect(g);
      src = n;
    } else {
      const osc = this.osc(o.wave, o.freq);
      if (o.detune) osc.detune.value = o.detune;
      if (o.glideTo && o.glideTime) {
        osc.frequency.setValueAtTime(o.freq, o.t0);
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.glideTo), o.t0 + o.glideTime);
      }
      if (o.vibrato && o.vibrato.depth > 0) {
        lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = o.vibrato.rate;
        const lg = ctx.createGain();
        lg.gain.value = o.vibrato.depth; // in Hz
        lfo.connect(lg).connect(osc.frequency);
        lfo.start(o.t0);
        lfo.stop(end + 0.01);
      }
      osc.connect(g);
      src = osc;
    }
    src.start(o.t0);
    src.stop(end + 0.01);
    let stopped = false;
    return {
      endsAt: end,
      stop: (at?: number) => {
        if (stopped) return;
        stopped = true;
        const t = Math.max(ctx.currentTime, at ?? ctx.currentTime);
        try {
          g.gain.cancelScheduledValues(t);
          g.gain.setTargetAtTime(0, t, 0.01);
          src.stop(t + 0.05);
          lfo?.stop(t + 0.05);
        } catch { /* already stopped */ }
      },
    };
  }

  /** Percussion built from noise + pitched triangle drops. */
  drum(name: DrumName, t0: number, vel: number, dest: AudioNode): Voice {
    const ctx = this.ctx;
    const voices: Voice[] = [];
    const tri = (f0: number, f1: number, dur: number, v: number) => {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f0, t0);
      o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(v, t0);
      g.gain.exponentialRampToValueAtTime(0.0005, t0 + dur);
      o.connect(g).connect(dest);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
      voices.push({ endsAt: t0 + dur, stop: (at) => { try { o.stop(Math.max(ctx.currentTime, at ?? ctx.currentTime)); } catch { /* */ } } });
    };
    const noise = (type: BiquadFilterType, freq: number, q: number, dur: number, v: number, delay = 0) => {
      const n = this.noiseSource();
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      const g = ctx.createGain();
      const ts = t0 + delay;
      g.gain.setValueAtTime(v, ts);
      g.gain.exponentialRampToValueAtTime(0.0005, ts + dur);
      n.connect(f).connect(g).connect(dest);
      n.start(ts);
      n.stop(ts + dur + 0.02);
      voices.push({ endsAt: ts + dur, stop: (at) => { try { n.stop(Math.max(ctx.currentTime, at ?? ctx.currentTime)); } catch { /* */ } } });
    };
    switch (name) {
      case 'kick': tri(160, 42, 0.11, vel); noise('lowpass', 900, 0.5, 0.02, vel * 0.5); break;
      case 'snare': noise('bandpass', 1900, 0.6, 0.11, vel * 0.8); tri(190, 120, 0.06, vel * 0.5); break;
      case 'hat': noise('highpass', 6500, 0.7, 0.03, vel * 0.45); break;
      case 'ohat': noise('highpass', 6000, 0.7, 0.16, vel * 0.4); break;
      case 'tom': tri(220, 95, 0.16, vel * 0.9); break;
      case 'htom': tri(320, 170, 0.12, vel * 0.9); break;
      case 'clap':
        noise('bandpass', 1300, 1.0, 0.03, vel * 0.7, 0);
        noise('bandpass', 1300, 1.0, 0.03, vel * 0.7, 0.012);
        noise('bandpass', 1300, 1.0, 0.09, vel * 0.7, 0.024);
        break;
    }
    const endsAt = Math.max(...voices.map((v) => v.endsAt));
    return { endsAt, stop: (at) => voices.forEach((v) => v.stop(at)) };
  }
}

/** Root-mean-square of an AudioBuffer (all channels) — used by tests/dev page. */
export function bufferRms(buf: AudioBuffer): number {
  let sum = 0;
  let n = 0;
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < d.length; i++) { sum += d[i] * d[i]; n++; }
  }
  return n ? Math.sqrt(sum / n) : 0;
}
