// Dev page for the audio module: every music / jingle / sfx / cry / TTS path
// behind a button, plus offline renders with RMS so silence is easy to spot.
// Served by Vite at /dev/audio.html (not part of the game build).

import type { Lang, MusicId, SfxId } from '../src/core/types';
import {
  createAudio, SONGS, MUSIC_IDS, JINGLE_IDS, SFX, SFX_IDS,
  compileSong, renderSong, bufferRms, Synth, synthCry, cryParams,
} from '../src/audio';
import { createTts } from '../src/audio/tts';

const audio = createAudio();
const tts = createTts();   // only used to show which voice gets picked

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const logEl = $('log');
const logs: string[] = [];
function log(msg: string): void {
  const line = `${new Date().toISOString().slice(11, 23)} ${msg}`;
  logs.push(line);
  logEl.textContent = logs.slice(-60).join('\n');
  logEl.scrollTop = logEl.scrollHeight;
}

const ctxOf = (): AudioContext | null => (globalThis as any).__audioCtxProbe ?? null;

function refreshStatus(): void {
  const st = $('status');
  const ac = ctxOf();
  const ko = audio.ttsAvailable('ko-KR');
  const en = audio.ttsAvailable('en-US');
  st.textContent = `ctx: ${ac ? ac.state : '(none)'} | tts ko=${ko} en=${en} | voices=${(() => { try { return speechSynthesis.getVoices().length; } catch { return 'n/a'; } })()}`;
}
setInterval(refreshStatus, 500);

// ----------------------------------------------------------------- volumes --
const volMusic = $<HTMLInputElement>('vol-music');
const volSfx = $<HTMLInputElement>('vol-sfx');
const applyVol = () => {
  audio.setVolumes(parseFloat(volMusic.value), parseFloat(volSfx.value));
  $('vol-music-v').textContent = parseFloat(volMusic.value).toFixed(2);
  $('vol-sfx-v').textContent = parseFloat(volSfx.value).toFixed(2);
};
volMusic.addEventListener('input', applyVol);
volSfx.addEventListener('input', applyVol);
$('unlock').addEventListener('click', () => { audio.unlock(); log('unlock()'); });

// ------------------------------------------------------------------- music --
const loopIds = MUSIC_IDS.filter((id) => !JINGLE_IDS.includes(id));
let currentMusic: MusicId | null = null;
const musicRow = $('music');
for (const id of loopIds) {
  const b = document.createElement('button');
  const c = compileSong(SONGS[id]);
  b.textContent = `${id} (${c.bpm}bpm, ${(c.beats / (id === 'town' ? 3 : 4)) | 0} bars, ${c.seconds.toFixed(0)}s)`;
  b.dataset.kind = 'music';
  b.dataset.id = id;
  b.addEventListener('click', () => {
    audio.unlock();
    audio.playMusic(id);
    currentMusic = id;
    musicRow.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x.dataset.id === id));
    log(`playMusic(${id})`);
  });
  musicRow.appendChild(b);
}
$('music-stop').addEventListener('click', () => {
  audio.playMusic(null);
  currentMusic = null;
  musicRow.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
  log('playMusic(null)');
});

const jRow = $('jingles');
for (const id of JINGLE_IDS) {
  const b = document.createElement('button');
  const c = compileSong(SONGS[id]);
  b.textContent = `${id} (${c.seconds.toFixed(1)}s)`;
  b.className = 'jingle';
  b.dataset.kind = 'jingle';
  b.dataset.id = id;
  b.addEventListener('click', async () => {
    audio.unlock();
    const t0 = performance.now();
    log(`jingle(${id}) …`);
    await audio.jingle(id);
    log(`jingle(${id}) resolved after ${(performance.now() - t0).toFixed(0)} ms`);
  });
  jRow.appendChild(b);
}

// --------------------------------------------------------------------- sfx --
const sfxRow = $('sfx');
for (const id of SFX_IDS) {
  const b = document.createElement('button');
  b.textContent = id;
  b.dataset.kind = 'sfx';
  b.dataset.id = id;
  b.addEventListener('click', () => { audio.unlock(); audio.playSfx(id); log(`playSfx(${id})`); });
  sfxRow.appendChild(b);
}

// ------------------------------------------------------------------- cries --
const cryId = $<HTMLInputElement>('cry-id');
const cryInfo = $('cry-info');
const playCryNow = () => {
  audio.unlock();
  const id = Math.max(1, Math.min(251, parseInt(cryId.value, 10) || 1));
  cryId.value = String(id);
  audio.playCry(id);
  const p = cryParams(id);
  cryInfo.textContent = `#${id}: ${p.wave} ${p.contour} base=${p.base.toFixed(0)}Hz dur=${p.dur.toFixed(2)}s chops=${p.chops} noise=${p.noise.toFixed(2)}`;
  log(`playCry(${id})`);
};
$('cry-play').addEventListener('click', playCryNow);
$('cry-prev').addEventListener('click', () => { cryId.value = String(Math.max(1, (parseInt(cryId.value, 10) || 1) - 1)); playCryNow(); });
$('cry-next').addEventListener('click', () => { cryId.value = String(Math.min(251, (parseInt(cryId.value, 10) || 1) + 1)); playCryNow(); });
$('cry-random').addEventListener('click', async () => {
  for (let i = 0; i < 5; i++) {
    cryId.value = String(1 + Math.floor(Math.random() * 251));
    playCryNow();
    await new Promise((r) => setTimeout(r, 900));
  }
});

// --------------------------------------------------------------------- tts --
const ttsRate = $<HTMLInputElement>('tts-rate');
ttsRate.addEventListener('input', () => { $('tts-rate-v').textContent = parseFloat(ttsRate.value).toFixed(2); });
const rate = () => parseFloat(ttsRate.value);
const showVoices = () => {
  const vk = tts.voiceFor('ko-KR');
  const ve = tts.voiceFor('en-US');
  $('tts-info').textContent = `voice ko: ${vk ? `${vk.name} (${vk.lang})` : '—'} | voice en: ${ve ? `${ve.name} (${ve.lang})` : '—'}`;
};
setInterval(showVoices, 1000);
const speakLog = async (items: { text: string; lang: Lang }[]) => {
  const t0 = performance.now();
  log(`speak(${items.map((i) => `${i.lang}:"${i.text}"`).join(', ')}) …`);
  await audio.speak(items, { rate: rate() });
  log(`speak resolved after ${(performance.now() - t0).toFixed(0)} ms`);
};
$('tts-speak-ko').addEventListener('click', () => speakLog([{ text: $<HTMLInputElement>('tts-ko').value, lang: 'ko-KR' }]));
$('tts-speak-en').addEventListener('click', () => speakLog([{ text: $<HTMLInputElement>('tts-en').value, lang: 'en-US' }]));
$('tts-speak-both').addEventListener('click', () => speakLog([
  { text: $<HTMLInputElement>('tts-ko').value, lang: 'ko-KR' },
  { text: $<HTMLInputElement>('tts-en').value, lang: 'en-US' },
]));
$('tts-stop').addEventListener('click', () => { audio.stopSpeaking(); log('stopSpeaking()'); });

// ---------------------------------------------------------- offline render --
async function renderMusicRms(id: MusicId, seconds = 6): Promise<number> {
  const buf = await renderSong(SONGS[id], seconds);
  return buf ? bufferRms(buf) : -1;
}
async function renderSfxRms(id: SfxId): Promise<number> {
  const OAC = (globalThis as any).OfflineAudioContext as typeof OfflineAudioContext | undefined;
  if (!OAC) return -1;
  const ctx = new OAC(1, 22050, 22050);
  const s = new Synth(ctx);
  SFX[id](s, ctx.destination, 0.01);
  return bufferRms(await ctx.startRendering());
}
async function renderCryRms(id: number): Promise<number> {
  const OAC = (globalThis as any).OfflineAudioContext as typeof OfflineAudioContext | undefined;
  if (!OAC) return -1;
  const ctx = new OAC(1, 22050, 22050);
  const s = new Synth(ctx);
  synthCry(s, ctx.destination, 0.01, id);
  return bufferRms(await ctx.startRendering());
}
const renderOut = $('render-out');
$('render-all').addEventListener('click', async () => {
  const parts: string[] = [];
  for (const id of MUSIC_IDS) {
    const r = await renderMusicRms(id, 6);
    parts.push(`${id}=${r.toFixed(3)}`);
    renderOut.textContent = parts.join('  ');
  }
  log('render music: ' + parts.join(' '));
});
$('render-sfx').addEventListener('click', async () => {
  const parts: string[] = [];
  for (const id of SFX_IDS) {
    const r = await renderSfxRms(id);
    parts.push(`${id}=${r.toFixed(3)}`);
    renderOut.textContent = parts.join('  ');
  }
  log('render sfx: ' + parts.join(' '));
});

// Probe the live context for the status line (the service keeps it private).
{
  const OrigCtx = (globalThis as any).AudioContext;
  if (typeof OrigCtx === 'function') {
    (globalThis as any).AudioContext = class extends OrigCtx {
      constructor(...args: any[]) { super(...args); (globalThis as any).__audioCtxProbe = this; }
    };
  }
}

// Hooks for the Playwright check script.
(globalThis as any).__audioDev = {
  audio, logs, MUSIC_IDS, JINGLE_IDS, SFX_IDS,
  renderMusicRms, renderSfxRms, renderCryRms,
  currentMusic: () => currentMusic,
  ctxState: () => ctxOf()?.state ?? null,
};
log('ready');
refreshStatus();
