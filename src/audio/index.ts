// ============================================================================
// AudioService implementation — WebAudio chiptune music + sfx + procedural
// cries + Web Speech TTS. Owned by the AUDIO agent.
//
// Volumes: an explicit setVolumes() call wins for the session; until then the
// service follows G.save.data.settings.{music,sfx} (re-read before each play).
// TTS rate: opts.rate, else settings.ttsRate (Korean base; English is scaled
// by 0.85/0.95), else 0.95 ko / 0.85 en.
// ============================================================================

import type { AudioService, Lang, MusicId, Settings, SfxId, Speakable } from '../core/types';
import { G } from '../game';
import { asset } from '../core/util';
import { createEngine } from './engine';
import { SONGS } from './music';
import { SFX } from './sfx';
import { playCry as synthCry } from './cry';
import { compileSong, SongPlayer, type CompiledSong } from './sequencer';
import { createTts } from './tts';

export { SONGS, MUSIC_IDS, JINGLE_IDS } from './music';
export { SFX, SFX_IDS } from './sfx';
export { compileSong, renderSong, SongPlayer } from './sequencer';
export { bufferRms, Synth } from './synth';
export { cryParams, playCry as synthCry } from './cry';
export { parseMML } from './mml';

const MUSIC_FADE_OUT = 0.45;
const MUSIC_FADE_IN = 0.3;
const RECORDED_MUSIC: Partial<Record<MusicId, string>> = {
  title: 'assets/audio/town.mp3', town: 'assets/audio/town.mp3', city: 'assets/audio/town.mp3',
  lab: 'assets/audio/town.mp3', center: 'assets/audio/town.mp3',
  route: 'assets/audio/route.mp3', forest: 'assets/audio/forest.mp3',
  gym: 'assets/audio/battle.mp3', battle_wild: 'assets/audio/battle.mp3',
  battle_trainer: 'assets/audio/battle.mp3', battle_gym: 'assets/audio/battle.mp3',
};

class RecordedLoop {
  onEnded: (() => void) | null = null;
  private out: GainNode;
  private source: AudioBufferSourceNode | null = null;
  private offset = 0;
  private startedAt = 0;
  private paused = false;
  finished = false;

  constructor(private ctx: AudioContext, dest: AudioNode, private buffer: AudioBuffer) {
    this.out = ctx.createGain();
    this.out.connect(dest);
  }

  private run() {
    const source = this.ctx.createBufferSource();
    source.buffer = this.buffer;
    source.loop = true;
    source.connect(this.out);
    this.startedAt = this.ctx.currentTime;
    source.start(0, this.offset);
    this.source = source;
  }

  start(fade = 0) {
    this.out.gain.setValueAtTime(0, this.ctx.currentTime);
    this.out.gain.linearRampToValueAtTime(0.65, this.ctx.currentTime + Math.max(0.01, fade));
    this.run();
  }

  pause() {
    if (this.paused || this.finished) return;
    this.offset = (this.offset + this.ctx.currentTime - this.startedAt) % this.buffer.duration;
    this.paused = true;
    try { this.source?.stop(); } catch { /* already stopped */ }
    this.source?.disconnect();
    this.source = null;
  }

  resume() {
    if (!this.paused || this.finished) return;
    this.paused = false;
    this.run();
  }

  stop(fade = 0) {
    if (this.finished) return;
    this.finished = true;
    const now = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(0, now + Math.max(0.01, fade));
    try { this.source?.stop(now + Math.max(0.01, fade)); } catch { /* already stopped */ }
    if (fade > 0) setTimeout(() => this.out.disconnect(), fade * 1000 + 50);
    else this.out.disconnect();
  }
}

function readSettings(): Partial<Settings> | null {
  try {
    const s = (G as any)?.save?.data?.settings;
    return s && typeof s === 'object' ? (s as Partial<Settings>) : null;
  } catch { return null; }
}

function speciesWeight(id: number): number | undefined {
  try {
    const w = (G as any)?.data?.speciesById?.(id)?.weight;
    return typeof w === 'number' && w > 0 ? w : undefined;
  } catch { return undefined; }
}

export function createAudio(): AudioService {
  const engine = createEngine();
  const loops = new Map<MusicId, CompiledSong>();
  const onces = new Map<MusicId, CompiledSong>();
  let current: { id: MusicId; player: SongPlayer | RecordedLoop } | null = null;
  const recordings = new Map<string, Promise<AudioBuffer>>();
  let musicRequest = 0;
  let pendingMusic: MusicId | null | undefined;     // requested before the context existed
  let explicitVolumes = false;
  let activeJingles = 0;

  const tts = createTts({
    onSpeaking: (v) => engine.duck(v),
    settingsRate: () => readSettings()?.ttsRate,
  });

  const loopSong = (id: MusicId): CompiledSong => {
    let c = loops.get(id);
    if (!c) { c = compileSong(SONGS[id]); loops.set(id, c); }
    return c;
  };
  const onceSong = (id: MusicId): CompiledSong => {
    let c = onces.get(id);
    if (!c) { c = SONGS[id].loop ? compileSong({ ...SONGS[id], loop: false }) : loopSong(id); onces.set(id, c); }
    return c;
  };

  const syncVolumes = () => {
    if (explicitVolumes) return;
    const s = readSettings();
    if (!s) return;
    const m = typeof s.music === 'number' ? s.music : engine.volumes.music;
    const f = typeof s.sfx === 'number' ? s.sfx : engine.volumes.sfx;
    const cur = engine.volumes;
    if (m !== cur.music || f !== cur.sfx) engine.setVolumes(m, f);
  };

  function playMusic(id: MusicId | null): void {
    if (!SONGS[id as MusicId] && id !== null) return;
    if (!engine.ready) { pendingMusic = id; return; }
    if (current && current.id === id && !current.player.finished) return;
    const request = ++musicRequest;
    const synth = engine.synth!;
    const bus = engine.musicBus!;
    syncVolumes();
    const start = (player: SongPlayer | RecordedLoop) => {
      if (request !== musicRequest) return;
      current?.player.stop(MUSIC_FADE_OUT);
      player.onEnded = () => { if (current?.player === player) current = null; };
      try {
        player.start(MUSIC_FADE_IN);
        if (activeJingles > 0) player.pause();
      } catch { return; }
      current = { id: id!, player };
      engine.resume();
    };
    if (id === null) {
      current?.player.stop(MUSIC_FADE_OUT);
      current = null;
      return;
    }
    const path = RECORDED_MUSIC[id];
    if (!path) { start(new SongPlayer(synth, bus, loopSong(id))); return; }
    let recording = recordings.get(path);
    if (!recording) {
      recording = fetch(asset(path)).then(r => {
        if (!r.ok) throw Error(`music ${r.status}`);
        return r.arrayBuffer();
      }).then(data => engine.ctx!.decodeAudioData(data));
      recordings.set(path, recording);
    }
    void recording.then(buffer => {
      if (request === musicRequest) start(new RecordedLoop(engine.ctx!, bus, buffer));
    }).catch(() => {
      recordings.delete(path);
      if (request === musicRequest) start(new SongPlayer(synth, bus, loopSong(id)));
    });
  }

  engine.onReady(() => {
    if (pendingMusic !== undefined) {
      const id = pendingMusic;
      pendingMusic = undefined;
      playMusic(id);
    }
  });

  function playSfx(id: SfxId): void {
    const fn = SFX[id];
    if (!fn || !engine.ready || !engine.synth || !engine.sfxBus) return;
    syncVolumes();
    try { fn(engine.synth, engine.sfxBus, engine.synth.now + 0.005); } catch { /* */ }
  }

  function playCry(speciesId: number): void {
    if (!engine.ready || !engine.synth || !engine.sfxBus) return;
    const id = Math.max(1, Math.floor(Number(speciesId) || 1));
    syncVolumes();
    try { synthCry(engine.synth, engine.sfxBus, engine.synth.now + 0.005, id, speciesWeight(id)); } catch { /* */ }
  }

  function jingle(id: MusicId): Promise<void> {
    if (G.debug && typeof window !== 'undefined' && (window as any).__TEST__?.fastText) return Promise.resolve();
    if (!SONGS[id]) return Promise.resolve();
    const song = onceSong(id);
    const durMs = song.seconds * 1000 + 350;
    if (!engine.ready || !engine.synth || !engine.musicBus) {
      // No context yet (node / not unlocked): keep the pacing without sound.
      const wait = engine.ready ? durMs : 0;
      return new Promise((r) => (wait > 0 ? setTimeout(r, wait) : r()));
    }
    syncVolumes();
    activeJingles++;
    current?.player.pause();
    const player = new SongPlayer(engine.synth, engine.musicBus, song);
    return new Promise<void>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        activeJingles = Math.max(0, activeJingles - 1);
        if (activeJingles === 0) current?.player.resume();
        resolve();
      };
      player.onEnded = finish;
      try { player.start(); } catch { finish(); return; }
      engine.resume();
      // Safety net: a suspended context never advances its clock.
      setTimeout(() => { player.stop(0.1); finish(); }, durMs + 1500);
    });
  }

  function setVolumes(music: number, sfx: number): void {
    explicitVolumes = true;
    engine.setVolumes(music, sfx);
  }

  function speak(items: Speakable | Speakable[], opts?: { rate?: number; interrupt?: boolean }): Promise<void> {
    try { return tts.speak(items, opts); } catch { return Promise.resolve(); }
  }

  function stopSpeaking(): void {
    try { tts.stop(); } catch { /* */ }
  }

  function ttsAvailable(lang: Lang): boolean {
    try { return tts.available(lang); } catch { return false; }
  }

  return {
    unlock: () => { try { engine.unlock(); } catch { /* */ } },
    playMusic,
    playSfx,
    playCry,
    jingle,
    setVolumes,
    speak,
    stopSpeaking,
    ttsAvailable,
  };
}
