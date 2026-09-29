// STUB boot — owned by the ENGINE agent.
import './styles/global.css';
import { G } from './game';
import { createAudio } from './audio';
import { createNet } from './net';
import { createLearn } from './learn';
import { createBattle } from './battle';
import { createUI } from './ui';
import { createWorld } from './world';

async function boot() {
  G.audio = createAudio(); G.net = createNet(); G.learn = createLearn(); G.battle = createBattle(); G.ui = createUI(); G.world = createWorld();
  G.debug = new URLSearchParams(location.search).has('debug');
  document.getElementById('boot')?.remove();
}
boot();
