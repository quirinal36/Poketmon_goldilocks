import type { Game, MapId, Script } from '../core/types';

const hasBadge = (g: Game, badge: string) => g.save.data.player.badges.includes(badge);
const remember = (g: Game, flag: string) => { g.save.setFlag(flag); g.save.write(flag); };
const hasSeeds = (g: Game) => g.save.flag('garden_seeds_recovered') || g.save.data.defeatedTrainers.includes('celadon_rocket');
function heal(g: Game, map: MapId, x: number, y: number) {
  g.world.healParty(); g.world.setLastHeal({ map, x, y }); g.save.write('chapter4-heal');
}
async function optionalBattle(g: Game, id: string, speaker: string) {
  if (g.save.data.defeatedTrainers.includes(id)) { await g.ui.say('함께 겨뤄서 즐거웠어!', { speaker }); return; }
  if (!await g.ui.yesNo('나와 한 번 겨뤄 볼래?', { speaker })) return;
  if (await g.battle.trainer(id) === 'lost') await g.world.whiteout();
}

export const SCRIPTS_CHAPTER4: Record<string, Script> = {
  chapter4_badge_guard: async g => { await g.ui.say('먼저 갈색체육관에서 오렌지배지를 받아 주세요. 블루시티 동쪽 길은 그다음에 열려요.'); },
  chapter4_oak: async g => {
    if (!hasBadge(g, 'thunder') || g.save.flag('chapter4_oak_called')) return;
    await g.ui.say(['오렌지배지도 받았구나!', '블루시티 동쪽 9번도로와 돌산터널을 지나 보라타운에 가 보렴.'], { speaker: '오박사의 전화', portrait: 'oak' });
    remember(g, 'chapter4_oak_called');
  },
  chapter4_route9_trainer: async g => optionalBattle(g, 'route9_camper', '유준'),
  chapter4_tunnel_trainer: async g => optionalBattle(g, 'rock_tunnel_hiker', '도현'),
  chapter4_route10_heal: async g => {
    heal(g, 'route10_north', 11, 10);
    await g.ui.say('포켓몬들이 쉬었어요. 동굴의 밝은 표지를 따라가세요.', { speaker: '안내원' });
  },
  chapter4_tunnel_heal: async g => {
    heal(g, 'rock_tunnel_1f', 5, 6);
    await g.ui.say('잠깐 쉬어 가렴. 오른쪽 위 사다리를 찾으면 보라타운으로 갈 수 있어.', { speaker: '안내원' });
  },
  chapter4_lavender_arrive: async g => {
    if (g.save.flag('lavender_arrived')) return;
    remember(g, 'lavender_arrived');
    await g.ui.say('보라타운에 도착했어요! 포켓몬센터에서 쉬고 정원사를 만나 보세요.');
  },
  chapter4_letter: async g => {
    if (g.save.flag('garden_letter_received')) {
      await g.ui.say('8번도로의 지하통로를 지나 무지개정원에 편지를 전해 줘.', { speaker: '정원사' }); return;
    }
    if (!await g.ui.yesNo(['무지개시티 정원에 도움이 필요하대.', '내 소개 편지를 전해 주겠니?'], { speaker: '정원사' })) return;
    remember(g, 'garden_letter_received');
    await g.ui.say('고마워! 8번도로의 서쪽 지하통로를 지나면 무지개시티야.', { speaker: '정원사' });
  },
  chapter4_celadon_arrive: async g => {
    if (g.save.flag('celadon_arrived')) return;
    remember(g, 'celadon_arrived');
    await g.ui.say('무지개시티에 도착했어요! 동쪽 무지개정원에서 정원사를 만나 보세요.');
  },
  chapter4_rocket: async g => {
    if (!g.save.flag('garden_letter_received')) { await g.ui.say('먼저 보라타운 정원사에게 소개 편지를 받아 오세요.', { speaker: '로켓단' }); return; }
    if (hasSeeds(g)) {
      if (!g.save.flag('garden_seeds_recovered')) remember(g, 'garden_seeds_recovered');
      await g.ui.say('씨앗상자는 정원사에게 돌려줘. 더는 가져가지 않을게.', { speaker: '로켓단' }); return;
    }
    const result = await g.battle.trainer('celadon_rocket');
    if (result === 'lost') { await g.world.whiteout(); return; }
    if (result === 'won') {
      remember(g, 'garden_seeds_recovered');
      await g.ui.say('씨앗상자를 되찾았어요! 정원사에게 돌려주세요.');
    }
  },
  chapter4_garden: async g => {
    if (!g.save.flag('garden_letter_received')) { await g.ui.say('보라타운의 친구에게 먼저 소개 편지를 받아 와 줄래?', { speaker: '정원사' }); return; }
    if (!hasSeeds(g)) { await g.ui.say('로켓단이 씨앗상자를 가져갔어. 정원 안쪽에서 찾아봐 주겠니?', { speaker: '정원사' }); return; }
    if (!g.save.flag('celadon_garden_helped')) {
      g.save.setFlag('garden_seeds_recovered'); g.save.setFlag('celadon_garden_helped'); g.save.setFlag('celadon_gym_open'); g.save.write('celadon-garden-helped');
      await g.ui.say(['씨앗상자를 돌려줘서 고마워!', '무지개체육관에 너희 이야기를 전해 둘게.'], { speaker: '정원사' });
      return;
    }
    await g.ui.say('정원이 다시 밝아졌어! 무지개체육관에 가 보렴.', { speaker: '정원사' });
  },
  chapter4_gym_gate: async g => { await g.ui.say('무지개정원의 씨앗상자를 정원사에게 돌려준 뒤에 오세요.'); },
  chapter4_gym_guide: async g => {
    await g.ui.say(hasBadge(g, 'rainbow') ? '무지개배지를 받았구나! 축하해.'
      : !g.save.flag('celadon_garden_helped') ? '무지개정원에서 정원사를 도와주세요.'
      : !['boulder', 'cascade', 'thunder'].every(b => hasBadge(g, b)) ? '앞선 세 배지를 모아 와 주세요.'
      : `민화 관장에게 도전하려면 누적 공부 도장 16개가 필요해요. 지금은 ${g.learn.stage()}개예요.`);
  },
  chapter4_trainee: async g => optionalBattle(g, 'celadon_trainee', '수련생'),
  chapter4_leader: async g => {
    if (hasBadge(g, 'rainbow')) {
      if (!g.save.flag('badge_rainbow_shown')) { await g.ui.showBadge('rainbow'); remember(g, 'badge_rainbow_shown'); }
      if (!g.save.flag('chapter4_complete')) {
        await g.ui.say(['네 번째 배지도 얻었구나!', '새 길이 준비될 때까지 친구들과 모험을 즐겨 보렴.'], { speaker: '오박사의 전화', portrait: 'oak' });
        remember(g, 'chapter4_complete');
      } else await g.ui.say('정원을 도와줘서 고마워!', { speaker: '민화' });
      return;
    }
    if (!g.save.flag('celadon_garden_helped')) { await g.ui.say('먼저 무지개정원에서 씨앗상자를 돌려주렴.', { speaker: '민화' }); return; }
    if (!['boulder', 'cascade', 'thunder'].every(b => hasBadge(g, b))) { await g.ui.say('앞선 세 배지를 먼저 모아 오렴.', { speaker: '민화' }); return; }
    if (g.learn.stage() < 16) { await g.ui.say(`공부 도장이 ${g.learn.stage()}개구나. 16개를 모으면 겨뤄 보자!`, { speaker: '민화' }); return; }
    const outcome = await g.battle.trainer('leader_erika');
    if (outcome === 'lost') { await g.world.whiteout(); return; }
    if (outcome === 'won') await SCRIPTS_CHAPTER4.chapter4_leader(g, { mapId: 'celadon_gym' });
  },
};
