import { describe, expect, it } from 'vitest';
import type { MusicId, SfxId } from '../../src/core/types';
import { createAudio } from '../../src/audio';
import { SONGS, JINGLE_IDS } from '../../src/audio/music';
import { SFX } from '../../src/audio/sfx';
import { compileSong } from '../../src/audio/sequencer';
import { parseMML, expandRepeats } from '../../src/audio/mml';
import { cryParams } from '../../src/audio/cry';

const MUSIC_IDS: MusicId[] = [
  'title', 'town', 'route', 'forest', 'city', 'lab', 'center', 'gym',
  'battle_wild', 'battle_trainer', 'battle_gym', 'victory', 'caught', 'levelup',
  'evolution', 'heal', 'badge',
];
const SFX_IDS: SfxId[] = [
  'select', 'cursor', 'back', 'bump', 'door', 'stairs', 'ledge', 'grass', 'encounter',
  'correct', 'wrong', 'hit', 'hit_super', 'faint', 'ball_throw', 'ball_shake', 'ball_pop',
  'catch', 'exp', 'coin', 'save', 'stamp',
];

describe('createAudio() in node (no window / AudioContext)', () => {
  it('constructs and every method is safe to call', async () => {
    expect(typeof AudioContext).toBe('undefined');
    const a = createAudio();
    expect(() => a.unlock()).not.toThrow();
    expect(() => a.playMusic('title')).not.toThrow();
    expect(() => a.playMusic(null)).not.toThrow();
    for (const id of SFX_IDS) expect(() => a.playSfx(id)).not.toThrow();
    expect(() => a.playCry(25)).not.toThrow();
    expect(() => a.setVolumes(0.5, 0.5)).not.toThrow();
    await expect(a.jingle('victory')).resolves.toBeUndefined();
    await expect(a.speak({ text: '안녕', lang: 'ko-KR' })).resolves.toBeUndefined();
    await expect(a.speak([{ text: 'hi', lang: 'en-US' }], { rate: 1, interrupt: false })).resolves.toBeUndefined();
    expect(() => a.stopSpeaking()).not.toThrow();
    expect(a.ttsAvailable('ko-KR')).toBe(false);
    expect(a.ttsAvailable('en-US')).toBe(false);
  });
});

describe('music definitions', () => {
  it('has a song for every MusicId', () => {
    for (const id of MUSIC_IDS) expect(SONGS[id], id).toBeDefined();
  });

  it('every song compiles, tracks line up on bars, loops are >= 16 bars', () => {
    for (const id of MUSIC_IDS) {
      const song = SONGS[id];
      const c = compileSong(song);
      expect(c.events.length, `${id} has notes`).toBeGreaterThan(0);
      const barBeats = id === 'town' ? 3 : 4;
      if (song.loop) {
        c.trackBeats.forEach((b, ti) => {
          // every track is a whole number of bars
          expect(b % barBeats, `${id} track ${ti} (${song.tracks[ti].wave}) beats=${b}`).toBeCloseTo(0, 6);
        });
        const melodic = c.trackBeats.filter((b, ti) => song.tracks[ti].wave !== 'noise');
        for (const b of melodic) expect(b / barBeats, `${id} bars`).toBeGreaterThanOrEqual(16);
        expect(c.beats).toBeGreaterThanOrEqual(16 * barBeats);
        // all melodic tracks equal length (no drift)
        expect(new Set(melodic).size, `${id} melodic tracks same length`).toBe(1);
      } else {
        expect(c.seconds, `${id} jingle length`).toBeGreaterThanOrEqual(1.5);
        expect(c.seconds, `${id} jingle length`).toBeLessThanOrEqual(4);
      }
    }
  });

  it('jingle ids are one-shots and loop ids loop', () => {
    for (const id of JINGLE_IDS) expect(SONGS[id].loop).toBe(false);
    for (const id of MUSIC_IDS) if (!JINGLE_IDS.includes(id)) expect(SONGS[id].loop, id).toBe(true);
  });

  it('pitches stay in a sane chiptune range', () => {
    for (const id of MUSIC_IDS) {
      const c = compileSong(SONGS[id]);
      for (const ev of c.events) {
        if (ev.drum) continue;
        expect(ev.freq, `${id} low note`).toBeGreaterThanOrEqual(55);     // A1
        expect(ev.freq, `${id} high note`).toBeLessThanOrEqual(4200);     // ~C8
      }
    }
  });
});

describe('sfx definitions', () => {
  it('has a synth function for every SfxId', () => {
    for (const id of SFX_IDS) expect(typeof SFX[id], id).toBe('function');
  });
});

describe('cries', () => {
  it('are deterministic per species and vary between species', () => {
    const a = cryParams(25);
    const b = cryParams(25);
    const c = cryParams(26);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    for (let id = 1; id <= 251; id++) {
      const p = cryParams(id);
      expect(p.dur).toBeGreaterThanOrEqual(0.4);
      expect(p.dur).toBeLessThanOrEqual(0.8);
      expect(p.base).toBeGreaterThan(100);
      expect(p.base).toBeLessThan(2500);
    }
  });
});

describe('MML parser', () => {
  it('expands repeats', () => {
    expect(expandRepeats('[c d]3').replace(/\s+/g, '')).toBe('cdcdcd');
    expect(expandRepeats('[[c]2 e]2').replace(/\s+/g, '')).toBe('ccecce');
  });
  it('parses lengths, dots, ties, rests, octaves', () => {
    const t = parseMML('o4 l8 c4 d. e16 r8 f&f >c< c');
    expect(t.beats).toBeCloseTo(1 + 0.75 + 0.25 + 0.5 + 1 + 0.5 + 0.5, 6);
    expect(t.events.length).toBe(6); // tie merges f&f
    expect(t.events[0].freq).toBeCloseTo(261.63, 1);
    expect(t.events[4].freq).toBeCloseTo(523.25, 1); // >c
    expect(t.events[5].freq).toBeCloseTo(261.63, 1); // <c
  });
  it('maps drum letters', () => {
    const t = parseMML('l8 c d e f', { drums: true });
    expect(t.events.map((e) => e.drum)).toEqual(['kick', 'snare', 'hat', 'ohat']);
  });
  it('throws on garbage', () => {
    expect(() => parseMML('c x')).toThrow();
    expect(() => parseMML('[c')).toThrow();
  });
});
