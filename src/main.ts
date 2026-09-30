import './styles/global.css';
import { G } from './game';
import { createAudio } from './audio';
import { createNet } from './net';
import { createLearn } from './learn';
import { createBattle } from './battle';
import { createUI } from './ui';
import { createWorld } from './world';
import { createSave, repairSave } from './core/save';
import { loadData } from './data';
import { initArt } from './art';
import { input } from './core/input';
import { initLayout } from './core/layout';
import { initControls } from './ui/controls';

async function boot() {
  G.debug = new URLSearchParams(location.search).get('debug') === '1';
  if (G.debug) { (window as any).__G = G; (window as any).__TEST__ ||= {}; }
  G.save = createSave(); G.save.load();
  G.audio = createAudio(); G.net = createNet(); G.learn = createLearn(); G.battle = createBattle(); G.ui = createUI(); G.world = createWorld();
  input.init(); initControls(); initLayout();
  document.addEventListener('pointerdown', () => G.audio.unlock(), { once: true });
  document.addEventListener('keydown', () => G.audio.unlock(), { once: true });
  G.data = await loadData();
  await Promise.all([initArt(), G.net.init()]);
  const cloud = repairSave(await G.net.pullSave());
  if (cloud && (!G.save.exists() || Date.parse(cloud.updatedAt) > Date.parse(G.save.data.updatedAt))) G.save.data = cloud;
  await G.learn.init();
  G.audio.setVolumes(G.save.data.settings.music, G.save.data.settings.sfx);
  document.getElementById('boot')?.remove();
  if (cloud && G.save.data === cloud) G.save.write('cloud-restore');
  const action = await G.ui.showTitle();
  if (action === 'new') G.save.newGame();
  G.world.start();
  if (!G.save.flag('intro_done')) await G.world.runScript('intro_newgame');
  G.save.write('ready');
  let last = performance.now(), visible = !document.hidden;
  const saveSession = () => {
    const now = performance.now();
    if (visible) G.save.data.playTimeSec += Math.max(0, Math.round((now - last) / 1000));
    last = now; visible = !document.hidden; G.save.write('autosave');
  };
  setInterval(saveSession, 20000);
  document.addEventListener('visibilitychange', () => { saveSession(); if (!document.hidden) G.learn.rollover(); });
  window.addEventListener('pagehide', saveSession);
}
boot().catch(error => {
  console.error('[boot]', error);
  const boot = document.getElementById('boot') || document.body.appendChild(document.createElement('p'));
  boot.textContent = '불러오지 못했어요. 새로고침하면 다시 시작할 수 있어요.';
});
