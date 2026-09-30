import type { Script } from '../core/types';

const rivalSpecies = (starter: number): number => ({ 1: 4, 4: 7, 7: 1, 25: 133, 152: 155, 155: 158, 158: 152 } as Record<number, number>)[starter] ?? 133;

const finishNotebook: Script = async g => {
  if (!g.save.flag('rocket_won') || g.save.flag('notebook_returned')) return;
  if (!g.save.flag('notebook_rewarded')) {
    g.save.addItem('potion', 2);
    g.save.setFlag('notebook_rewarded');
    g.save.write('notebook-reward');
  }
  await g.ui.say(['연구원에게 탐사 수첩을 돌려주었어요.', '고맙구나! 이곳은 포켓몬들의 집이기도 하단다.', '상처약 2개를 받았어요. 이제 4번도로로 가 보렴!'], { speaker: '연구원' });
  g.save.setFlag('notebook_returned');
  g.save.write('notebook-returned');
  g.world.refreshNpcs();
};

const askResearcher: Script = async g => {
  if (g.save.flag('notebook_returned')) {
    g.world.healParty(); g.world.setLastHeal({ map: 'mt_moon_front', x: 3, y: 12 });
    g.save.write('moon-heal');
    await g.ui.say('고맙구나! 포켓몬들이 힘들면 언제든 쉬어 가렴.', { speaker: '연구원' });
    return;
  }
  if (!g.save.flag('researcher_asked')) {
    const choice = await g.ui.choose(['로켓단이 내 탐사 수첩을 가져갔어.', '안쪽에서 소란이 들리면 살펴봐 주겠니?'], ['가 볼게요', '잠깐 쉬고 갈게요'], { speaker: '연구원' });
    if (choice === 0) { g.save.setFlag('researcher_asked'); g.save.write('researcher-asked'); }
  }
  g.world.healParty();
  g.world.setLastHeal({ map: 'mt_moon_front', x: 3, y: 12 });
  g.save.write('moon-heal');
  await g.ui.say(g.save.flag('researcher_asked') ? '친구들을 쉬게 해 주었단다. 안쪽에서 소란이 들리는지 살펴봐 줘.' : '푹 쉬렴. 마음이 준비되면 다시 말해 줘.', { speaker: '연구원' });
};

export const SCRIPTS_CHAPTER2: Record<string, Script> = {
  chapter2_oak_call: async g => {
    if (!g.save.data.player.badges.includes('boulder')) return;
    await g.ui.say(['첫 배지를 얻었구나! 이제 달맞이산 너머 블루시티로 가 보렴.', '산에서는 포켓몬과 함께 천천히 길을 살펴보는 거야.'], { speaker: '오박사의 전화', portrait: 'oak' });
  },
  route3_camper: async g => {
    if (g.save.data.defeatedTrainers.includes('route3_camper')) { await g.ui.say('산에 들어가기 전에 친구들을 쉬게 해 줘!', { speaker: '캠프보이' }); return; }
    if (!await g.ui.yesNo('나와 한 번 겨뤄 볼래?', { speaker: '캠프보이' })) return;
    if (await g.battle.trainer('route3_camper') === 'lost') await g.world.whiteout();
  },
  moon_front_arrive: async g => {
    if (!g.save.flag('researcher_asked') && !g.save.flag('notebook_returned')) await askResearcher(g, { mapId: 'mt_moon_front' });
  },
  moon_researcher: askResearcher,
  moon_deep_arrive: async g => {
    if (!g.save.flag('researcher_asked')) await askResearcher(g, { mapId: 'mt_moon_deep' });
    if (g.save.data.defeatedTrainers.includes('moon_rocket') && !g.save.flag('rocket_won')) {
      g.save.setFlag('rocket_won'); g.save.write('rocket-resume');
    }
    if (g.save.flag('rocket_won') && !g.save.flag('notebook_returned')) await finishNotebook(g, { mapId: 'mt_moon_deep' });
  },
  moon_clefairy: async g => {
    if (!g.save.flag('clefairy_seen')) {
      await g.ui.say(['삐삐가 놀라서 바위 뒤에 숨어 있어요.', '큰 소리가 나는 쪽을 바라보고 있네요.'], { speaker: '삐삐' });
      g.save.setFlag('clefairy_seen'); g.save.write('clefairy');
    } else await g.ui.say('삐삐가 안쪽 길을 가리켜요.', { speaker: '삐삐' });
  },
  moon_rocket: async g => {
    if (!g.save.flag('researcher_asked')) await askResearcher(g, { mapId: 'mt_moon_deep' });
    if (!g.save.flag('researcher_asked')) return;
    if (!g.save.flag('clefairy_seen')) await SCRIPTS_CHAPTER2.moon_clefairy(g, { mapId: 'mt_moon_deep' });
    if (!g.save.data.defeatedTrainers.includes('moon_rocket')) {
      const outcome = await g.battle.trainer('moon_rocket');
      if (outcome === 'lost') { await g.world.whiteout(); return; }
      if (outcome !== 'won') return;
    }
    g.save.setFlag('rocket_won'); g.save.write('rocket-won');
    g.world.refreshNpcs();
    await finishNotebook(g, { mapId: 'mt_moon_deep' });
  },
  moon_exit_gate: async g => {
    if (g.save.flag('rocket_won')) await finishNotebook(g, { mapId: 'mt_moon_deep' });
    else await g.ui.say('연구원의 수첩을 찾고 로켓단을 멈춰야 지나갈 수 있어요.');
  },
  cerulean_arrive: async g => {
    if (g.save.flag('cerulean_arrived')) return;
    await g.ui.say('달맞이산을 넘어 블루시티에 도착했어요! 먼저 포켓몬센터에서 쉬어 가세요.');
    g.save.setFlag('cerulean_arrived'); g.save.write('cerulean-arrive');
  },
  cerulean_rival: async g => {
    const rival = g.data.trainers.rival_cerulean;
    rival.name = g.save.data.player.rivalName;
    const starter = Number(g.save.data.flags.starter_species) || [...g.save.data.party, ...g.save.data.box].find(p => p.caughtArea === 'starter')?.speciesId || 1;
    rival.team[0].speciesId = rivalSpecies(starter);
    if (g.save.data.defeatedTrainers.includes('rival_cerulean')) { await g.ui.say('포켓몬들도 더 든든해 보이네!', { speaker: rival.name }); return; }
    if (!await g.ui.yesNo('쉬고 나서 한 번 겨뤄 볼래?', { speaker: rival.name, portrait: 'rival' })) return;
    if (await g.battle.trainer('rival_cerulean') === 'lost') await g.world.whiteout();
  },
  cerulean_guide: async g => {
    const stage = g.learn.stage();
    await g.ui.say(g.save.data.player.badges.includes('boulder')
      ? `이곳의 관장은 이슬이야. 공부 도장 ${stage}개구나! ${stage < 8 ? '8개를 모으면 도전할 수 있어.' : '이제 도전할 수 있어!'}`
      : '먼저 회색시티에서 첫 배지를 받아 와 줘.');
  },
  cerulean_swimmer: async g => {
    if (g.save.data.defeatedTrainers.includes('cerulean_swimmer')) { await g.ui.say('이슬 관장님은 도장 8개를 기다리셔.'); return; }
    if (!await g.ui.yesNo('물 포켓몬과 한 번 겨뤄 볼래?', { speaker: '수련생' })) return;
    if (await g.battle.trainer('cerulean_swimmer') === 'lost') await g.world.whiteout();
  },
  cerulean_leader: async g => {
    if (g.save.data.player.badges.includes('cascade')) {
      if (!g.save.flag('badge_cascade_shown')) {
        await g.ui.showBadge('cascade');
        g.save.setFlag('badge_cascade_shown'); g.save.write('badge-shown');
      }
      if (!g.save.flag('chapter2_complete')) {
        await g.ui.say(['두 번째 배지도 얻었구나!', '새로운 길이 준비될 때까지 친구들과 모험을 더 즐겨 보렴.'], { speaker: '오박사의 전화', portrait: 'oak' });
        g.save.setFlag('chapter2_complete'); g.save.write('chapter2-complete');
      } else await g.ui.say('친구들과 함께 더 모험해 봐!', { speaker: '이슬' });
      return;
    }
    if (!g.save.data.player.badges.includes('boulder')) { await g.ui.say('먼저 회색배지를 받아 와 줘.', { speaker: '이슬' }); return; }
    if (g.learn.stage() < 8) { await g.ui.say(`지금은 공부 도장이 ${g.learn.stage()}개구나. 8개를 모으면 겨뤄 보자!`, { speaker: '이슬' }); return; }
    const outcome = await g.battle.trainer('leader_misty');
    if (outcome === 'lost') { await g.world.whiteout(); return; }
    if (outcome === 'won') await SCRIPTS_CHAPTER2.cerulean_leader(g, { mapId: 'cerulean_gym' });
  },
};
