import type { Script } from '../core/types';
import { STARTERS, maxHpFor } from '../core/types';
import { uid } from '../core/util';
export const SCRIPTS_PALLET: Record<string, Script> = {
  intro_newgame: async g => {
    await g.ui.say(['포켓몬 세계에 온 걸 환영한단다!', '문제를 풀며 포켓몬과 친구가 되어 보렴.'], { speaker: '오박사', portrait: 'oak' });
    g.save.data.player.appearance = await g.ui.openCustomize('intro');
    g.save.data.player.name = await g.ui.openNameEntry('이름이 무엇인가요?', ['골드', '하늘', '지우']);
    g.save.data.player.rivalName = await g.ui.openNameEntry('라이벌의 이름은?', ['그린', '실버', '민우']);
    await g.ui.say('자, 포켓몬 세계로 출발!');
    g.save.setFlag('intro_done');
  },
  pallet_mom: async g => { g.save.setFlag('oak_called'); g.world.healParty(); await g.ui.say('오박사님이 연구소로 오라고 하셨단다!', { speaker: '엄마', portrait: 'mom' }); },
  pallet_stop: async g => {
    if (g.save.flag('got_starter')) return;
    g.world.spawnNpc({ id: 'oak_visit', x: 10, y: 1, sprite: 'oak' });
    await g.world.emote('oak_visit', '!');
    await g.ui.say('잠깐! 풀숲에는 야생 포켓몬이 있어! 연구소에 같이 가자.', { speaker: '오박사', portrait: 'oak' });
    g.save.setFlag('oak_stopped'); await g.world.warp('oak_lab', 5, 6, 'up');
  },
  pallet_starter: async g => {
    if (g.save.flag('got_dex')) { await g.ui.say('포켓몬을 잡고 도감을 채워 보렴!', { speaker: '오박사' }); return; }
    if (!g.save.flag('got_starter')) {
      await g.ui.say('문제를 풀면 포켓몬과 힘을 합칠 수 있단다. 친구를 골라 보렴!', { speaker: '오박사', portrait: 'oak' });
      const id = await g.ui.pickStarter(STARTERS);
      const p = { uid: uid('p_'), speciesId: id, level: 5, exp: 0, hp: maxHpFor(5), maxHp: maxHpFor(5), friendship: 70, caughtAt: new Date().toISOString(), caughtArea: 'starter' as const, nickname: undefined as string | undefined };
      if (await g.ui.yesNo('별명을 지어 줄까요?')) p.nickname = await g.ui.openNameEntry('친구의 별명', [g.data.speciesById(id).name]);
      g.save.addPokemon(p); g.save.markCaught(id); g.save.setFlag('got_starter'); g.save.write('starter');
    }
    const rival = g.data.trainers.rival_lab;
    rival.name = g.save.data.player.rivalName;
    rival.team = [{ speciesId: ({ 1: 4, 4: 7, 7: 1, 25: 133, 152: 155, 155: 158, 158: 152 } as Record<number, number>)[g.save.data.party[0].speciesId] || 133, level: 5 }];
    if (!g.save.flag('rival_lab_battle')) {
      await g.battle.trainer('rival_lab'); g.world.healParty(); g.save.setFlag('rival_lab_battle');
    }
    g.save.addItem('dex'); g.save.addItem('stamp_card'); g.save.addItem('pokeball', 5); g.save.setFlag('got_dex');
    await g.ui.say(['도감과 몬스터볼 5개를 받았다!', '야생 포켓몬의 힘을 절반으로 줄인 뒤 몬스터볼을 던져 보렴.']);
  },
  route1_tip: async g => { await g.ui.say(['여기는 오박사! 풀숲에서 포켓몬을 만날 수 있단다.', '문제를 맞혀 힘을 줄인 뒤 몬스터볼을 던져 보렴.'], { speaker: '오박사의 전화' }); },
};
