// ============================================================================
// Original chiptune songs for every MusicId. All melodies are written for this
// game — nothing here reproduces Nintendo / Game Freak music.
//
// Channel layout: lead pulse, harmony pulse, triangle bass, noise drums.
// Loops are 16 bars (24 for the 3/4 town waltz) so they do not get tiring;
// jingles are one-shots of 1.5 – 4 s.
// ============================================================================

import type { MusicId } from '../core/types';
import type { Song } from './sequencer';
import { PLUCK_ENV, SOFT_ENV, type Env } from './synth';

const LEAD_ENV: Env = { a: 0.004, d: 0.08, s: 0.65, r: 0.05 };
const ARP_ENV: Env = { a: 0.002, d: 0.05, s: 0.5, r: 0.03 };
const BASS_ENV: Env = { a: 0.004, d: 0.06, s: 0.8, r: 0.04 };
const PAD_ENV: Env = { a: 0.03, d: 0.15, s: 0.85, r: 0.15 };

// ----------------------------------------------------------------- title ----
// Hopeful adventure fanfare, C major, 120 bpm, 16 bars.
const title: Song = {
  bpm: 120, loop: true, gain: 0.9,
  tracks: [
    { wave: 'p50', vol: 0.55, env: LEAD_ENV, mml: `
      o5 l8 v11 q7
      c4 e g >c4< g e     | d4 f a g4 f e       | c e g >c< b a g4    | e2. r4 |
      a4 >c< a g4 e g     | f4 a f e4 d e       | c4 e g >c4 d c<     | b2. r4 |
      e4 g >c< g4 e c     | d4 f a >c4< a f     | g4 >c< g e4 c e     | d2 r8 d e f |
      g4 >c d e4 d c<     | a4 >c< a g4 e d     | c4 e g >c4< g e     | c1 |` },
    { wave: 'p25', vol: 0.32, env: ARP_ENV, mml: `
      o4 l8 v8 q6
      [c g >c< g]2 | [f >c f c<]2 | [c g >c< g]2 | [g >d g d<]2 |
      [a >e a e<]2 | [f >c f c<]2 | [c g >c< g]2 | [g >d g d<]2 |
      [c g >c< g]2 | [f >c f c<]2 | [c g >c< g]2 | [g >d g d<]2 |
      [c g >c< g]2 | [a >e a e<]2 | f >c f c< g >d g d< | c g >c< g c2 |` },
    { wave: 'tri', vol: 0.9, env: BASS_ENV, mml: `
      o3 l8 v13 q7
      c4 c c g4 g g | f4 f f >c4 c c< | c4 c c g4 g g | g4 g g >d4 d d< |
      a4 a a >e4 e e< | f4 f f >c4 c c< | c4 c c g4 g g | g4 g g >d4 d d< |
      c4 c c g4 g g | f4 f f >c4 c c< | c4 c c g4 g g | g4 g g >d4 d d< |
      c4 c c g4 g g | a4 a a >e4 e e< | f4 f f g4 g g | c4 c c g4 c4 |` },
    { wave: 'noise', vol: 0.5, mml: `
      l8 v10 c e d e c e d e | c e d e c c d f |` },
  ],
};

// ------------------------------------------------------------------ town ----
// Gentle waltz (3/4), G major, 100 bpm, 24 bars, no drums.
const town: Song = {
  bpm: 100, loop: true, gain: 0.9,
  tracks: [
    { wave: 'p25', vol: 0.5, env: SOFT_ENV, mml: `
      o5 l4 v10 q7
      d e g | b2 a | g e d | e2. | d e g | a2 b | g8 a8 g e | d2. |
      b >c< b | a g e | g a b | a2. | b >c< b | a g e | d e g | a2. |
      g a b | >d2 c< | b a g | e2. | d e g | b a g | a8 b8 a g | g2. |` },
    { wave: 'p12', vol: 0.35, env: ARP_ENV, mml: `
      o4 l8 v8 q5
      r4 b >d< b >d<   | r4 b >d< b >d<   | r4 g b g b       | r4 e g e g |
      r4 b >d< b >d<   | r4 f+ a f+ a     | r4 e g e g       | r4 b >d< b >d< |
      r4 b >d< b >d<   | r4 g b g b       | r4 e g e g       | r4 f+ a f+ a |
      r4 b >d< b >d<   | r4 g b g b       | r4 e g e g       | r4 f+ a f+ a |
      r4 b >d< b >d<   | r4 g b g b       | r4 e g e g       | r4 e g e g |
      r4 b >d< b >d<   | r4 g b g b       | r4 f+ a f+ a     | r4 b >d< b >d< |` },
    { wave: 'tri', vol: 0.85, env: BASS_ENV, mml: `
      o3 l4 v12 q7
      g2 >g< | g2 >g< | e2 >e< | c2 >c< | g2 >g< | d2 >d< | c2 >c< | g2 >g< |
      g2 >g< | e2 >e< | c2 >c< | d2 >d< | g2 >g< | e2 >e< | c2 >c< | d2 >d< |
      g2 >g< | e2 >e< | c2 >c< | c2 >c< | g2 >g< | e2 >e< | d2 >d< | g2 >g< |` },
  ],
};

// ----------------------------------------------------------------- route ----
// Walking, cheerful, C major, 132 bpm, 16 bars.
const route: Song = {
  bpm: 132, loop: true, gain: 0.9,
  tracks: [
    { wave: 'p50', vol: 0.5, env: LEAD_ENV, mml: `
      o5 l8 v11 q6
      e e g g a4 g4 | e e g g a4 >c4< | d d f f g4 f4 | e d c d e2 |
      e e g g a4 g4 | e e g g a4 >c4< | d d f f g4 a4 | g2 r4 g4 |
      >c4< a4 g e g4 | a4 g4 e d c4 | d4 f4 a g f4 | e d e f g2 |
      >c4< a4 g e g4 | a4 g4 e d c4 | d d e e f f g g | >c2.< r4 |` },
    { wave: 'p25', vol: 0.28, env: ARP_ENV, mml: `
      o4 l16 v8 q5
      [e g >c< g]4 | [e g >c< g]4 | [f a >c< a]4 | [e g >c< g]4 |
      [e g >c< g]4 | [e g >c< g]4 | [f a >c< a]4 | [g b >d< b]4 |
      [e a >c< a]4 | [e g >c< g]4 | [f a >c< a]4 | [e g >c< g]4 |
      [e a >c< a]4 | [e g >c< g]4 | [f a >c< a]2 [g b >d< b]2 | [e g >c< g]4 |` },
    { wave: 'tri', vol: 0.9, env: BASS_ENV, mml: `
      o3 l8 v13 q7
      c4 c c g4 c c | c4 c c g4 c c | f4 f f >c4< f f | c4 c c g4 c c |
      c4 c c g4 c c | c4 c c g4 c c | f4 f f >c4< f f | g4 g g >d4< g g |
      a4 a a >e4< a a | c4 c c g4 c c | f4 f f >c4< f f | c4 c c g4 c c |
      a4 a a >e4< a a | c4 c c g4 c c | f4 f f g4 g g | c4 c c g4 c4 |` },
    { wave: 'noise', vol: 0.45, mml: `
      l8 v10 c e d e c e d e | c e d e c e d d |` },
  ],
};

// ---------------------------------------------------------------- forest ----
// Curious, light, A minor pentatonic, 108 bpm, 16 bars, hats only.
const forest: Song = {
  bpm: 108, loop: true, gain: 0.9,
  tracks: [
    { wave: 'p12', vol: 0.55, env: LEAD_ENV, vibrato: { rate: 5.5, depth: 3 }, mml: `
      o5 l8 v11 q6
      a4 r8 >c8< a4 g4 | e4 g4 a2 | a4 r8 >c8 d4 c4< | g2. r4 |
      e4 g4 a4 >c4< | d4 c4 <a2> | e4 g4 a4 g4 | e2. r4 |
      r4 a8 g8 a4 r4 | r4 >c8 d8 c4< r4 | a4 >c4 d4 e4< | d4 c4 <a4 g4> |
      e4 g4 a4 >c4< | d4 e4 d4 c4 | <a4> c4 d4 <a4 | a1> |` },
    { wave: 'p25', vol: 0.3, env: PAD_ENV, mml: `
      o4 l2 v7 q8
      c e | c e | a >c< | b >d< |
      c e | a >c< | b >d< | c e |
      c e | c e | a >c< | b >d< |
      c e | a >c< | f a | c e |` },
    { wave: 'tri', vol: 0.85, env: BASS_ENV, mml: `
      o3 l8 v12 q6
      a4 r4 a r >e4< | a4 r4 a r >e4< | f4 r4 f r >c4< | g4 r4 g r >d4< |
      a4 r4 a r >e4< | f4 r4 f r >c4< | g4 r4 g r >d4< | a4 r4 a r >e4< |
      a4 r4 a r >e4< | a4 r4 a r >e4< | f4 r4 f r >c4< | g4 r4 g r >d4< |
      a4 r4 a r >e4< | f4 r4 f r >c4< | d4 r4 d r a4 | a4 r4 a r >e4< |` },
    { wave: 'noise', vol: 0.3, mml: `
      l8 v7 e r e r e r e e | e r e r e e r e |` },
  ],
};

// ------------------------------------------------------------------ city ----
// Bouncy, F major, 140 bpm, 16 bars.
const city: Song = {
  bpm: 140, loop: true, gain: 0.9,
  tracks: [
    { wave: 'p50', vol: 0.5, env: LEAD_ENV, mml: `
      o5 l8 v11 q6
      f8. f16 a >c< a4 f4 | g8. g16 b- >d< b-4 g4 | a8. a16 >c d c4< a4 | g4 f4 e2 |
      f8. f16 a >c< a4 f4 | g8. g16 b- >d< b-4 g4 | a4 g4 f4 e4 | f2. r4 |
      >c4< a4 f4 a4 | b-4 >c4 d2< | >c4< a4 f4 a4 | g4 e4 c2 |
      f8. f16 a >c< a4 f4 | g8. g16 b- >d< b-4 g4 | >c4< b-4 a4 g4 | f1 |` },
    { wave: 'p25', vol: 0.3, env: PLUCK_ENV, mml: `
      o4 l8 v9 q4
      r a r >c< r a r >c< | r b- r >d< r b- r >d< | r a r >c< r a r >c< | r e r g r e r g |
      r a r >c< r a r >c< | r b- r >d< r b- r >d< | r e r g r e r g | r a r >c< r a r >c< |
      r a r >c< r a r >c< | r d r f r d r f | r a r >c< r a r >c< | r e r g r e r g |
      r a r >c< r a r >c< | r b- r >d< r b- r >d< | r e r g r e r g | r a r >c< r a r >c< |` },
    { wave: 'tri', vol: 0.9, env: BASS_ENV, mml: `
      o3 l8 v13 q5
      f r f r >c< r f r | g r g r >d< r g r | f r f r >c< r f r | c r c r g r c r |
      f r f r >c< r f r | g r g r >d< r g r | c r c r g r c r | f r f r >c< r f r |
      f r f r >c< r f r | b- r b- r f r b- r | f r f r >c< r f r | c r c r g r c r |
      f r f r >c< r f r | g r g r >d< r g r | c r c r g r c r | f r f r >c< r f4 |` },
    { wave: 'noise', vol: 0.5, mml: `
      l8 v10 c e d e c c d e | c e d e c e d d |` },
  ],
};

// ------------------------------------------------------------------- lab ----
// Thoughtful, E minor, 100 bpm, 16 bars, no drums.
const lab: Song = {
  bpm: 100, loop: true, gain: 0.9,
  tracks: [
    { wave: 'p25', vol: 0.5, env: SOFT_ENV, mml: `
      o5 l4 v10 q7
      e g b2 | a g f+2 | e g a b | g2. r4 |
      e g b2 | >c< b a2 | g f+ e d | e2. r4 |
      b a g f+ | g a b2 | a g f+ e | f+2. r4 |
      e g b >d< | >c< b a g | f+ g a f+ | e1 |` },
    { wave: 'p12', vol: 0.32, env: ARP_ENV, mml: `
      o4 l8 v8 q6
      e g b >e< b g e g | d f+ a >d< a f+ d f+ | c e g >c< g e c e | g b >d g d< b g b |
      e g b >e< b g e g | c e g >c< g e c e | d f+ a >d< a f+ d f+ | e g b >e< b g e g |
      g b >d g d< b g b | e g b >e< b g e g | d f+ a >d< a f+ d f+ | d f+ a >d< a f+ d f+ |
      e g b >e< b g e g | c e g >c< g e c e | d f+ a >d< a f+ d f+ | e g b >e< b g e g |` },
    { wave: 'tri', vol: 0.85, env: BASS_ENV, mml: `
      o3 l4 v12 q8
      e2. b | d2. a | c2. g | g2. d |
      e2. b | c2. g | d2. a | e2. b |
      g2. d | e2. b | d2. a | d2. a |
      e2. b | c2. g | d2. a | e1 |` },
  ],
};

// ---------------------------------------------------------------- center ----
// Soothing lullaby, C major, 88 bpm, 16 bars, no drums.
const center: Song = {
  bpm: 88, loop: true, gain: 0.85,
  tracks: [
    { wave: 'p25', vol: 0.45, env: SOFT_ENV, mml: `
      o5 l4 v9 q8
      e2 g e | d2. r | c2 e g | a2. r |
      g2 a g | e2 c d | e2 d c | d1 |
      e2 g e | d2. r | c2 e g | a2 >c2< |
      g2 a g | e2 g e | d2 c d | c1 |` },
    { wave: 'p12', vol: 0.3, env: ARP_ENV, mml: `
      o4 l8 v7 q7
      c e g e c e g e | d g b g d g b g | c e g e c e g e | c f a f c f a f |
      c e g e c e g e | c e a e c e a e | c f a f c f a f | d g b g d g b g |
      c e g e c e g e | d g b g d g b g | c e g e c e g e | c f a f c f a f |
      c e g e c e g e | c e a e c e a e | d g b g d g b g | c e g e c2 |` },
    { wave: 'tri', vol: 0.8, env: BASS_ENV, mml: `
      o3 l2 v11 q8
      c g | g d | c g | f c |
      c g | a e | f c | g d |
      c g | g d | c g | f c |
      c g | a e | g d | c1 |` },
  ],
};

// ------------------------------------------------------------------- gym ----
// Determined, D minor, 126 bpm, 16 bars.
const gym: Song = {
  bpm: 126, loop: true, gain: 0.9,
  tracks: [
    { wave: 'p50', vol: 0.5, env: LEAD_ENV, mml: `
      o5 l8 v11 q6
      d4 d d f4 e4 | d4 c4 <a2> | d4 d d f4 g4 | a2 r8 a g f |
      e4 e e g4 f4 | e4 d4 c2 | d4 d d f4 g4 | a4 g4 f4 e4 |
      d4 f4 a4 >d4< | >c4< a4 f4 a4 | b-4 >d4 c4< a4 | g2 a2 |
      d4 f4 a4 >d4< | >c4< a4 g4 e4 | f4 e4 d4 c4 | d2. r4 |` },
    { wave: 'p25', vol: 0.3, env: ARP_ENV, mml: `
      o4 l8 v8 q6
      d f a f d f a f | d f a f d f a f | d f a f d f a f | f a >c< a f a >c< a |
      e g >c< g e g >c< g | e g >c< g e g >c< g | d f a f d f a f | e a >c< a e a >c< a |
      d f a f d f a f | f a >c< a f a >c< a | f b- >d< b- f b- >d< b- | g b- >d< b- e a >c+< a |
      d f a f d f a f | f a >c< a f a >c< a | e g >c< g e g >c< g | d f a f d2 |` },
    { wave: 'tri', vol: 0.9, env: BASS_ENV, mml: `
      o3 l8 v13 q6
      d d d d d d a a | d d d d d d a a | d d d d d d a a | f f f f f f >c c< |
      c c c c c c g g | c c c c c c g g | d d d d d d a a | a a a a a a >e e< |
      d d d d d d a a | f f f f f f >c c< | b- b- b- b- b- b- f f | g g g g a a a a |
      d d d d d d a a | f f f f f f >c c< | c c c c c c g g | d d d d d4 r4 |` },
    { wave: 'noise', vol: 0.5, mml: `
      l8 v11 c e d e c e d e | c e d e c c d d |` },
  ],
};

// ----------------------------------------------------------- battle_wild ----
// Energetic but friendly, E minor / G, 150 bpm, 16 bars.
const battle_wild: Song = {
  bpm: 150, loop: true, gain: 0.9,
  tracks: [
    { wave: 'p50', vol: 0.5, env: LEAD_ENV, mml: `
      o5 l8 v11 q6
      e e r e g a b4 | a g a g e2 | e e r e g a b4 | >d c< b a b2 |
      g g r g b >c d4< | >c< b a g a2 | b b r b a g f+4 | e2 r4 b4 |
      >e4 d4 c4< b4 | a4 b4 >c2< | >e4 d4 c4< b4 | a4 g4 f+2 |
      g g r g b >c d4< | >e d c< b >c2< | b b r b a g f+4 | e2. r4 |` },
    { wave: 'p25', vol: 0.28, env: ARP_ENV, mml: `
      o4 l16 v8 q5
      [e g b g]4 | [e g b g]4 | [e g b g]4 | [g b >d< b]4 |
      [e g >c< g]4 | [e a >c< a]4 | [f+ a >d< a]4 | [e g b g]4 |
      [e g >c< g]4 | [e a >c< a]4 | [e g >c< g]4 | [f+ a >d< a]4 |
      [e g >c< g]4 | [e a >c< a]4 | [f+ a >d< a]4 | [e g b g]4 |` },
    { wave: 'tri', vol: 0.9, env: BASS_ENV, mml: `
      o3 l8 v13 q6
      e e >e< e e e b b | e e >e< e e e b b | e e >e< e e e b b | g g >g< g g g d d |
      c c >c< c c c g g | a a >a< a a a e e | d d >d< d d d a a | e e >e< e e e b b |
      c c >c< c c c g g | a a >a< a a a e e | c c >c< c c c g g | d d >d< d d d a a |
      c c >c< c c c g g | a a >a< a a a e e | d d >d< d d d a a | e e >e< e e e b b |` },
    { wave: 'noise', vol: 0.5, mml: `
      l8 v11 c e d e c c d e | c e d e c e d16 d16 d |` },
  ],
};

// -------------------------------------------------------- battle_trainer ----
// More intense, A minor, 160 bpm, 16 bars.
const battle_trainer: Song = {
  bpm: 160, loop: true, gain: 0.9,
  tracks: [
    { wave: 'p50', vol: 0.5, env: LEAD_ENV, mml: `
      o5 l8 v11 q6
      a a a r >c< b a g | a4 e4 r2 | a a a r >c d e4< | d c d c a2 |
      f f f r a g f e | f4 d4 r2 | g g g r b a g f | e f g g+ a2 |
      >c4 c c d4 c4< | b4 a4 g4 e4 | a4 a a b4 >c4< | d4 c4 <b2> |
      >c4 c c d4 e4< | d4 c4 <b4 a4> | a a r a g+ a b >c< | a4 e4 a4 r4 |` },
    { wave: 'p25', vol: 0.28, env: ARP_ENV, mml: `
      o4 l16 v8 q5
      [a >c e c<]4 | [a >c e c<]4 | [a >c e c<]4 | [a >c e c<]4 |
      [d f a f]4 | [d f a f]4 | [g b >d< b]4 | [e g+ b g+]4 |
      [e g >c< g]4 | [g b >d< b]4 | [a >c e c<]4 | [e g+ b g+]4 |
      [e g >c< g]4 | [g b >d< b]4 | [e g+ b g+]4 | [a >c e c<]4 |` },
    { wave: 'tri', vol: 0.9, env: BASS_ENV, mml: `
      o3 l8 v13 q6
      a >a< a a a >a< a a | a >a< a a a >a< a a | a >a< a a a >a< a a | a >a< a a a >a< a a |
      d >d< d d d >d< d d | d >d< d d d >d< d d | g >g< g g g >g< g g | e >e< e e e >e< e e |
      c >c< c c c >c< c c | g >g< g g g >g< g g | a >a< a a a >a< a a | e >e< e e e >e< e e |
      c >c< c c c >c< c c | g >g< g g g >g< g g | e >e< e e e >e< e e | a >a< a a a4 r4 |` },
    { wave: 'noise', vol: 0.5, mml: `
      l8 v11 c e d e c c d e | c e d c c e d16 d16 d16 d16 |` },
  ],
};

// ------------------------------------------------------------ battle_gym ----
// Heroic, C major, 156 bpm, 16 bars.
const battle_gym: Song = {
  bpm: 156, loop: true, gain: 0.9,
  tracks: [
    { wave: 'p50', vol: 0.5, env: LEAD_ENV, mml: `
      o5 l8 v11 q6
      c4 g4 >c4 d e< | >d c< b a g2 | c4 g4 >c4 d e< | >f4 e4 d2< |
      a4 >c4< a4 g4 | f4 g4 a2 | g4 e4 c4 d4 | e2 r4 g4 |
      >c4 c c d4 e4< | >d4 c4< b4 g4 | a4 a a b4 >c4< | b2 g2 |
      >c4 c c d4 e4< | >f4 e4 d4 c4< | >d4 c4< b4 >d4< | >c2.< r4 |` },
    { wave: 'p25', vol: 0.28, env: ARP_ENV, mml: `
      o4 l16 v8 q5
      [e g >c< g]4 | [d g b g]4 | [e g >c< g]4 | [d g b g]4 |
      [f a >c< a]4 | [f a >c< a]4 | [e g >c< g]4 | [e g >c< g]4 |
      [e g >c< g]4 | [d g b g]4 | [f a >c< a]4 | [d g b g]4 |
      [e g >c< g]4 | [f a >c< a]4 | [d g b g]4 | [e g >c< g]4 |` },
    { wave: 'tri', vol: 0.9, env: BASS_ENV, mml: `
      o3 l8 v13 q6
      c c c g c c g g | g g g d g g d d | c c c g c c g g | g g g d g g d d |
      f f f c f f c c | f f f c f f c c | c c c g c c g g | c c c g c c g g |
      c c c g c c g g | g g g d g g d d | f f f c f f c c | g g g d g g d d |
      c c c g c c g g | f f f c f f c c | g g g d g g d d | c c c g c4 r4 |` },
    { wave: 'noise', vol: 0.5, mml: `
      l8 v11 c e d e c e d e | c c d e c e d d |` },
  ],
};

// --------------------------------------------------------------- jingles ----
// victory: 8 beats @150 = 3.2 s
const victory: Song = {
  bpm: 150, loop: false, gain: 0.9,
  tracks: [
    { wave: 'p50', vol: 0.5, env: LEAD_ENV, mml: `o5 l8 v12 q7 c e g >c4< r g >c d e2.< r` },
    { wave: 'p25', vol: 0.3, env: ARP_ENV, mml: `o4 l8 v9 q6 e g >c e4< r e g b >c2.< r` },
    { wave: 'tri', vol: 0.9, env: BASS_ENV, mml: `o3 l4 v13 q6 c c g g c2 c2` },
    { wave: 'noise', vol: 0.5, mml: `l8 v10 c e d e c e d16 d16 d c4 r4 c4 r4` },
  ],
};

// caught: 6 beats @140 = 2.6 s
const caught: Song = {
  bpm: 140, loop: false, gain: 0.9,
  tracks: [
    { wave: 'p50', vol: 0.5, env: LEAD_ENV, mml: `o5 l8 v12 q7 e g >c< g4 r >c d e2<` },
    { wave: 'p25', vol: 0.3, env: ARP_ENV, mml: `o4 l8 v9 q6 c e g e4 r e g >c2<` },
    { wave: 'tri', vol: 0.9, env: BASS_ENV, mml: `o3 l4 v13 q6 c g c g c2` },
    { wave: 'noise', vol: 0.45, mml: `l8 v10 c e d e c e d4 c4 r4` },
  ],
};

// levelup: 4.5 beats @160 = 1.7 s
const levelup: Song = {
  bpm: 160, loop: false, gain: 0.9,
  tracks: [
    { wave: 'p50', vol: 0.5, env: LEAD_ENV, mml: `o5 l16 v12 q7 c e g >c8 e8 d8 c4.< r8 r16` },
    { wave: 'p25', vol: 0.3, env: ARP_ENV, mml: `o4 l8 v9 q6 r e16 g16 >c e< g e4. r` },
    { wave: 'tri', vol: 0.9, env: BASS_ENV, mml: `o3 l8 v13 q6 c g >c< g c2 r` },
  ],
};

// evolution: 8.5 beats @130 = 3.9 s (whole-tone rise → bright major arpeggio)
const evolution: Song = {
  bpm: 130, loop: false, gain: 0.9,
  tracks: [
    { wave: 'p50', vol: 0.5, env: LEAD_ENV, mml: `o4 l16 v11 q7 c d e f+ g+ a+ >c d e f+ g+ a+ >c8< r8 <c8 e8 g8 >c2.<` },
    { wave: 'p12', vol: 0.32, env: PAD_ENV, mml: `o4 l8 v9 q8 r1 e g >c e2.<` },
    { wave: 'tri', vol: 0.85, env: BASS_ENV, mml: `o3 l1 v12 q8 c c` },
    { wave: 'noise', vol: 0.4, mml: `l4 v9 r1 r f r r` },
  ],
};

// heal: 4 beats @120 = 2.0 s
const heal: Song = {
  bpm: 120, loop: false, gain: 0.9,
  tracks: [
    { wave: 'p50', vol: 0.45, env: SOFT_ENV, mml: `o5 l8 v11 q8 e4 g4 >c2<` },
    { wave: 'p25', vol: 0.3, env: SOFT_ENV, mml: `o4 l8 v9 q8 c4 e4 g2` },
    { wave: 'p12', vol: 0.3, env: ARP_ENV, mml: `o6 l16 v8 q6 r2 c e g >c8.<` },
    { wave: 'tri', vol: 0.8, env: BASS_ENV, mml: `o3 l2 v12 q8 c c` },
  ],
};

// badge: 8 beats @132 = 3.6 s
const badge: Song = {
  bpm: 132, loop: false, gain: 0.9,
  tracks: [
    { wave: 'p50', vol: 0.5, env: LEAD_ENV, mml: `o4 l8 v12 q7 g >c d e4 c4 d e f g2.<` },
    { wave: 'p25', vol: 0.3, env: ARP_ENV, mml: `o4 l8 v9 q6 r e g >c4< a4 b >c d e2.<` },
    { wave: 'tri', vol: 0.9, env: BASS_ENV, mml: `o3 l4 v13 q6 c c f f g g c2` },
    { wave: 'noise', vol: 0.5, mml: `l8 v10 c e d e c e d e c4 d4 c2` },
  ],
};

export const SONGS: Record<MusicId, Song> = {
  title, town, route, forest, city, lab, center, gym,
  battle_wild, battle_trainer, battle_gym,
  victory, caught, levelup, evolution, heal, badge,
};

export const MUSIC_IDS = Object.keys(SONGS) as MusicId[];
export const JINGLE_IDS: MusicId[] = ['victory', 'caught', 'levelup', 'evolution', 'heal', 'badge'];
