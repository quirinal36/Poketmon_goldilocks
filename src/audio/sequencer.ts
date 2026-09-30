// ============================================================================
// Tiny sequencer: a Song is a tempo + per-channel MML patterns. Compiled into a
// flat, beat-sorted event list; SongPlayer schedules it ahead of time on a
// real-time context (loop / pause / resume / fade), renderSong renders it with
// an OfflineAudioContext (used by tests and the dev page).
// ============================================================================

import { parseMML, type NoteEvent } from './mml';
import { Synth, DEFAULT_ENV, type Env, type Voice, type WaveKind } from './synth';

export interface TrackDef {
  wave: WaveKind;
  mml: string;
  vol?: number;       // channel trim 0..1 (default 1)
  env?: Env;
  vibrato?: { rate: number; depth: number };
}

export interface Song {
  bpm: number;
  loop: boolean;
  tracks: TrackDef[];
  /** channel gain applied to the whole song (default 1) */
  gain?: number;
}

export interface CompiledEvent extends NoteEvent { wave: WaveKind; vol: number; env: Env; vibrato?: { rate: number; depth: number } }

export interface CompiledSong {
  bpm: number;
  loop: boolean;
  beats: number;                // length of one pass
  seconds: number;              // length of one pass in seconds
  events: CompiledEvent[];      // sorted by beat
  gain: number;
  trackBeats: number[];
}

export function compileSong(song: Song): CompiledSong {
  const parsed = song.tracks.map((t) => parseMML(t.mml, { drums: t.wave === 'noise' }));
  const beats = Math.max(0, ...parsed.map((p) => p.beats));
  const events: CompiledEvent[] = [];
  parsed.forEach((p, ti) => {
    const t = song.tracks[ti];
    if (!p.events.length || p.beats <= 0) return;
    // Loop songs: shorter patterns (e.g. a 2-bar drum loop) repeat to fill the song.
    const reps = song.loop ? Math.max(1, Math.ceil(beats / p.beats)) : 1;
    for (let k = 0; k < reps; k++) {
      const off = k * p.beats;
      for (const ev of p.events) {
        if (off + ev.beat >= beats) break;
        const c: CompiledEvent = { ...ev, beat: off + ev.beat, wave: ev.wave ?? t.wave, vol: t.vol ?? 1, env: t.env ?? DEFAULT_ENV };
        if (t.vibrato) c.vibrato = t.vibrato;
        events.push(c);
      }
    }
  });
  events.sort((a, b) => a.beat - b.beat);
  const spb = 60 / song.bpm;
  return { bpm: song.bpm, loop: song.loop, beats, seconds: beats * spb, events, gain: song.gain ?? 1, trackBeats: parsed.map((p) => p.beats) };
}

/** Schedule one event at absolute context time t. */
export function scheduleEvent(synth: Synth, dest: AudioNode, ev: CompiledEvent, t: number, spb: number): Voice | null {
  const vel = ev.vel * ev.vol;
  if (vel <= 0) return null;
  if (ev.drum) return synth.drum(ev.drum, t, vel, dest);
  const hold = Math.max(0.02, ev.dur * spb * ev.gate);
  return synth.note({ wave: ev.wave, freq: ev.freq, t0: t, hold, vel, env: ev.env, dest, vibrato: ev.vibrato });
}

const LOOKAHEAD = 0.25;   // seconds scheduled ahead of the clock
const TICK_MS = 60;

/**
 * Real-time player for one song. Owns a GainNode (for fades) connected to `dest`.
 * Time base is the AudioContext clock, so suspending the context pauses playback
 * consistently (the clock stops with it).
 */
export class SongPlayer {
  readonly song: CompiledSong;
  readonly out: GainNode;
  onEnded: (() => void) | null = null;
  private synth: Synth;
  private ctx: BaseAudioContext;
  private origin = 0;        // ctx time of beat 0 (pass 0)
  private pos = 0;           // index into events
  private iter = 0;          // loop pass
  private timer: ReturnType<typeof setInterval> | null = null;
  private live: Voice[] = [];
  private state: 'idle' | 'playing' | 'paused' | 'stopped' = 'idle';
  private endedFired = false;

  constructor(synth: Synth, dest: AudioNode, song: CompiledSong) {
    this.synth = synth;
    this.ctx = synth.ctx;
    this.song = song;
    this.out = synth.ctx.createGain();
    this.out.gain.value = song.gain;
    this.out.connect(dest);
  }

  get playing(): boolean { return this.state === 'playing'; }
  get finished(): boolean { return this.state === 'stopped'; }
  get paused(): boolean { return this.state === 'paused'; }

  /** Current position in beats since the song started (wraps for loops). */
  get beat(): number {
    if (this.state === 'idle' || this.state === 'stopped') return 0;
    const spb = 60 / this.song.bpm;
    return Math.max(0, (this.ctx.currentTime - this.origin) / spb);
  }

  start(fadeIn = 0, at?: number): void {
    if (this.state !== 'idle') return;
    const now = this.ctx.currentTime;
    this.origin = at ?? now + 0.03;
    this.pos = 0;
    this.iter = 0;
    this.state = 'playing';
    if (fadeIn > 0) {
      this.out.gain.setValueAtTime(0, now);
      this.out.gain.linearRampToValueAtTime(this.song.gain, now + fadeIn);
    }
    this.startTimer();
    this.tick();
  }

  pause(): void {
    if (this.state !== 'playing') return;
    const now = this.ctx.currentTime;
    const spb = 60 / this.song.bpm;
    const beatNow = (now - this.origin) / spb;
    this.stopTimer();
    for (const v of this.live) v.stop(now);
    this.live = [];
    this.state = 'paused';
    // Rewind the cursor to the first event at/after the pause point so resume
    // continues from here (notes that were cut get re-triggered — chip-style).
    const total = Math.max(0, beatNow);
    this.iter = this.song.loop ? Math.floor(total / this.song.beats) : 0;
    const inPass = total - this.iter * this.song.beats;
    this.pos = this.song.events.findIndex((e) => e.beat >= inPass);
    if (this.pos < 0) this.pos = this.song.events.length;
    this.pausedBeat = total;
  }
  private pausedBeat = 0;

  resume(): void {
    if (this.state !== 'paused') return;
    const spb = 60 / this.song.bpm;
    this.origin = this.ctx.currentTime + 0.03 - this.pausedBeat * spb;
    this.state = 'playing';
    this.startTimer();
    this.tick();
  }

  /** Fade out and release everything. Safe to call twice. */
  stop(fade = 0): void {
    if (this.state === 'stopped') return;
    this.stopTimer();
    const now = this.ctx.currentTime;
    const g = this.out.gain;
    try {
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(0, now + Math.max(0.01, fade));
    } catch { /* offline ctx after completion */ }
    const live = this.live;
    this.live = [];
    const kill = () => {
      for (const v of live) v.stop();
      try { this.out.disconnect(); } catch { /* */ }
    };
    if (fade > 0 && typeof setTimeout === 'function') setTimeout(kill, fade * 1000 + 60);
    else kill();
    this.state = 'stopped';
  }

  private startTimer(): void {
    if (this.timer || typeof setInterval !== 'function') return;
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }
  private stopTimer(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  private tick(): void {
    if (this.state !== 'playing') return;
    const now = this.ctx.currentTime;
    const spb = 60 / this.song.bpm;
    const song = this.song;
    // Prune finished voices.
    if (this.live.length > 64) this.live = this.live.filter((v) => v.endsAt > now);
    for (let guard = 0; guard < 4000; guard++) {
      if (this.pos >= song.events.length) {
        if (song.loop && song.beats > 0) { this.iter++; this.pos = 0; continue; }
        // one-shot: finished when the last note has faded
        const endAt = this.origin + song.beats * spb + 0.35;
        if (now >= endAt && !this.endedFired) {
          this.endedFired = true;
          this.stopTimer();
          this.state = 'stopped';
          try { this.out.disconnect(); } catch { /* */ }
          this.onEnded?.();
        }
        return;
      }
      const ev = song.events[this.pos];
      const t = this.origin + (this.iter * song.beats + ev.beat) * spb;
      if (t > now + LOOKAHEAD) return;
      const v = scheduleEvent(this.synth, this.out, ev, Math.max(t, now), spb);
      if (v) this.live.push(v);
      this.pos++;
    }
  }
}

/** Render `seconds` of a song with an OfflineAudioContext (browser only). Returns null if unavailable. */
export async function renderSong(song: Song | CompiledSong, seconds: number, sampleRate = 22050): Promise<AudioBuffer | null> {
  const OAC: typeof OfflineAudioContext | undefined =
    (globalThis as any).OfflineAudioContext ?? (globalThis as any).webkitOfflineAudioContext;
  if (!OAC) return null;
  const c = 'events' in song ? song : compileSong(song);
  const ctx = new OAC(1, Math.ceil(seconds * sampleRate), sampleRate);
  const synth = new Synth(ctx);
  const spb = 60 / c.bpm;
  const passes = c.loop ? Math.ceil(seconds / Math.max(0.1, c.seconds)) : 1;
  for (let k = 0; k < passes; k++) {
    for (const ev of c.events) {
      const t = (k * c.beats + ev.beat) * spb;
      if (t >= seconds) break;
      scheduleEvent(synth, ctx.destination, ev, t, spb);
    }
  }
  return ctx.startRendering();
}
