// ============================================================================
// Tiny MML (Music Macro Language) parser → note events in beats.
//
//   c d e f g a b   notes (+/# sharp, - flat), optional length + dots: c4 e8. g16
//   r               rest (same length syntax)
//   oN  > <         octave set / up / down            (default o4, c4 = middle C)
//   lN              default length (4 = quarter)      (default l4)
//   vN              volume 0..15                      (default 10)
//   qN              gate 1..8 (8 = legato)            (default 6)
//   @N              timbre override 0=p12 1=p25 2=p50 3=tri 4=noise/drums
//   &               tie: next note extends the previous one
//   [ ... ]N        repeat N times (default 2), nestable
//   |  whitespace   ignored (bar lines are for humans)
//
// Drum tracks (wave 'noise' / @4) read note letters as instruments:
//   c kick  d snare  e closed hat  f open hat  g tom  a high tom  b clap
// ============================================================================

import type { DrumName, WaveKind } from './synth';
import { midiToFreq } from './synth';

export interface NoteEvent {
  beat: number;       // start, in beats (quarter notes)
  dur: number;        // length in beats
  freq: number;       // Hz (0 for drums)
  vel: number;        // 0..1
  gate: number;       // 0..1 fraction of dur actually sounding
  wave?: WaveKind;    // override from '@'
  drum?: DrumName;    // set on drum tracks
}

export interface ParsedTrack { events: NoteEvent[]; beats: number }

const SEMI: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const DRUM: Record<string, DrumName> = { c: 'kick', d: 'snare', e: 'hat', f: 'ohat', g: 'tom', a: 'htom', b: 'clap' };
const WAVE_AT: WaveKind[] = ['p12', 'p25', 'p50', 'tri', 'noise'];

/** Expand [ ... ]N repeats textually, innermost first. */
export function expandRepeats(src: string): string {
  let s = src;
  const re = /\[([^[\]]*)\](\d*)/;
  for (let guard = 0; guard < 500; guard++) {
    const m = re.exec(s);
    if (!m) break;
    const n = m[2] ? parseInt(m[2], 10) : 2;
    s = s.slice(0, m.index) + (' ' + m[1] + ' ').repeat(n) + s.slice(m.index + m[0].length);
  }
  if (s.includes('[') || s.includes(']')) throw new Error('MML: unbalanced repeat brackets');
  return s;
}

export function parseMML(src: string, opts: { drums?: boolean } = {}): ParsedTrack {
  const s = expandRepeats(src);
  const events: NoteEvent[] = [];
  let i = 0;
  let beat = 0;
  let octave = 4;
  let defLen = 1;        // beats
  let vel = 10 / 15;
  let gate = 6 / 8;
  let wave: WaveKind | undefined;
  let tie = false;
  let drums = !!opts.drums;

  const readInt = (): number | null => {
    let j = i;
    while (j < s.length && s[j] >= '0' && s[j] <= '9') j++;
    if (j === i) return null;
    const v = parseInt(s.slice(i, j), 10);
    i = j;
    return v;
  };
  const readLen = (): number => {
    const n = readInt();
    let len = n ? 4 / n : defLen;
    let add = len / 2;
    while (s[i] === '.') { len += add; add /= 2; i++; }
    return len;
  };

  while (i < s.length) {
    const ch = s[i];
    if (ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r' || ch === '|' || ch === ',') { i++; continue; }
    if (ch === 'o') { i++; const n = readInt(); if (n !== null) octave = n; continue; }
    if (ch === '>') { i++; octave++; continue; }
    if (ch === '<') { i++; octave--; continue; }
    if (ch === 'l') { i++; defLen = readLen(); continue; }
    if (ch === 'v') { i++; const n = readInt(); if (n !== null) vel = Math.max(0, Math.min(15, n)) / 15; continue; }
    if (ch === 'q') { i++; const n = readInt(); if (n !== null) gate = Math.max(1, Math.min(8, n)) / 8; continue; }
    if (ch === '@') { i++; const n = readInt(); if (n !== null && WAVE_AT[n]) { wave = WAVE_AT[n]; drums = wave === 'noise'; } continue; }
    if (ch === '&') { i++; tie = true; continue; }
    if (ch === 'r') {
      i++;
      const len = readLen();
      beat += len;
      tie = false;
      continue;
    }
    if (SEMI[ch] !== undefined) {
      const letter = ch;
      i++;
      let semi = SEMI[letter];
      while (s[i] === '+' || s[i] === '#' || s[i] === '-') { semi += s[i] === '-' ? -1 : 1; i++; }
      const len = readLen();
      if (tie && events.length) {
        events[events.length - 1].dur += len;
        tie = false;
      } else {
        const midi = (octave + 1) * 12 + semi;
        const ev: NoteEvent = { beat, dur: len, freq: drums ? 0 : midiToFreq(midi), vel, gate };
        if (wave) ev.wave = wave;
        if (drums) ev.drum = DRUM[letter];
        events.push(ev);
      }
      beat += len;
      continue;
    }
    throw new Error(`MML: unexpected '${ch}' at ${i} in "${s.slice(Math.max(0, i - 12), i + 12)}"`);
  }
  return { events, beats: beat };
}
