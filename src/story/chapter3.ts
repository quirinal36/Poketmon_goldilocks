import type { Game, Script } from '../core/types';
import { rivalSpecies } from './chapter2';

const hasBadge = (g: Game, badge: string) => g.save.data.player.badges.includes(badge);
const remember = (g: Game, flag: string) => { g.save.setFlag(flag); g.save.write(flag); };
const heal = (g: Game, map: 'bill_house' | 'ss_anne_1f' | 'ss_anne_captain', x: number, y: number) => {
  g.world.healParty(); g.world.setLastHeal({ map, x, y }); g.save.write('chapter3-heal');
};
async function optionalBattle(g: Game, id: string, speaker: string) {
  if (g.save.data.defeatedTrainers.includes(id)) { await g.ui.say('함께 겨뤄서 즐거웠어!', { speaker }); return; }
  if (!await g.ui.yesNo('나와 한 번 겨뤄 볼래?', { speaker })) return;
  if (await g.battle.trainer(id) === 'lost') await g.world.whiteout();
}

export const SCRIPTS_CHAPTER3: Record<string, Script> = {
  chapter3_badge_guard: async g => { await g.ui.say('먼저 블루체육관에서 이슬에게 도전해 보세요. 블루배지를 받으면 새 길이 열려요.'); },
  chapter3_bridge_trainer: async g => optionalBattle(g, 'bridge_trainer', '지호'),
  chapter3_route6_trainer: async g => optionalBattle(g, 'route6_trainer', '하람'),
  chapter3_bill: async g => {
    if (!g.save.flag('bill_asked')) {
      if (!await g.ui.yesNo(['연구 장치가 멈춰 버렸어.', '표시등과 연결 장치를 살펴봐 주겠니?'], { speaker: '이수재' })) return;
      remember(g, 'bill_asked');
    }
    if (g.save.flag('bill_light_checked') && g.save.flag('bill_connection_checked') && !g.save.flag('ss_ticket_received')) {
      g.save.setFlag('bill_helped'); g.save.setFlag('ss_ticket_received'); g.save.write('bill-helped');
      await g.ui.say(['장치가 다시 움직여! 도와줘서 고마워.', '상트앙느호 승선권을 줄게. 갈색시티 선착장에서 보여 주렴.'], { speaker: '이수재' });
    } else if (!g.save.flag('ss_ticket_received')) {
      await g.ui.say(`이제 ${!g.save.flag('bill_light_checked') ? '왼쪽 표시등' : '오른쪽 연결 장치'}을 살펴봐 주겠니?`, { speaker: '이수재' });
    } else await g.ui.say('갈색시티 선착장에서 승선권을 보여 주렴!', { speaker: '이수재' });
    heal(g, 'bill_house', 5, 5);
  },
  chapter3_bill_light: async g => {
    if (!g.save.flag('bill_asked')) { await g.ui.say('먼저 이수재의 이야기를 들어 보세요.'); return; }
    if (!g.save.flag('bill_light_checked')) { remember(g, 'bill_light_checked'); await g.ui.say('표시등이 켜졌어요! 이제 연결 장치를 확인해 보세요.'); }
    else await g.ui.say('표시등이 잘 켜져 있어요.');
  },
  chapter3_bill_connection: async g => {
    if (!g.save.flag('bill_light_checked')) { await g.ui.say('먼저 왼쪽 표시등을 확인해 보세요.'); return; }
    if (!g.save.flag('bill_connection_checked')) { remember(g, 'bill_connection_checked'); await g.ui.say('연결 장치를 확인했어요. 이수재에게 돌아가세요!'); }
    else await g.ui.say('연결 장치가 잘 작동해요.');
  },
  chapter3_vermilion_arrive: async g => {
    if (g.save.flag('vermilion_arrived')) return;
    remember(g, 'vermilion_arrived');
    await g.ui.say('갈색시티에 도착했어요! 먼저 포켓몬센터에서 쉬어 가세요. 이수재의 승선권이 있다면 선착장에 가 보세요.');
  },
  chapter3_ship_gate: async g => { await g.ui.say('상트앙느호에 타려면 이수재의 승선권이 필요해요. 블루시티 북쪽 이수재의 집을 찾아가 보세요.', { speaker: '선원' }); },
  chapter3_ship_heal: async g => { heal(g, 'ss_anne_1f', 5, 5); await g.ui.say('배에서도 쉬어 가세요. 포켓몬들이 모두 건강해졌어요!', { speaker: '간호사' }); },
  chapter3_ship_rival: async g => {
    const rival = g.data.trainers.rival_ss_anne;
    rival.name = g.save.data.player.rivalName;
    const starter = Number(g.save.data.flags.starter_species) || [...g.save.data.party, ...g.save.data.box].find(p => p.caughtArea === 'starter')?.speciesId || 1;
    rival.team[0].speciesId = rivalSpecies(starter);
    await optionalBattle(g, 'rival_ss_anne', rival.name);
  },
  chapter3_sailor: async g => {
    if (g.save.flag('captain_helped')) { await g.ui.say('선장님이 많이 편해지셨어. 고마워!', { speaker: '선원' }); return; }
    if (!g.save.flag('ss_parcel_received')) {
      remember(g, 'ss_parcel_received');
      await g.ui.say('선장님께 이 휴식 꾸러미를 전해 줄래? 선장실은 선내 왼쪽 계단이야.', { speaker: '선원' });
    } else await g.ui.say('선장님께 꾸러미를 전해 줘. 선내 왼쪽 계단으로 가면 돼.', { speaker: '선원' });
  },
  chapter3_captain: async g => {
    if (!g.save.flag('ss_parcel_received')) { await g.ui.say('갑판의 선원이 전할 것이 있다고 했단다. 만나 보고 오렴.', { speaker: '선장' }); return; }
    if (!g.save.flag('captain_helped')) {
      g.save.setFlag('captain_helped'); g.save.setFlag('vermilion_gym_open'); g.save.write('captain-helped');
      await g.ui.say(['휴식 꾸러미를 가져다줘서 고맙구나!', '갈색체육관에 너희 이야기를 전해 둘게. 포켓몬들도 쉬어 가렴.'], { speaker: '선장' });
    } else await g.ui.say('갈색체육관에 가 보렴. 쉬고 싶으면 언제든 돌아오렴.', { speaker: '선장' });
    heal(g, 'ss_anne_captain', 5, 5);
  },
  chapter3_gym_gate: async g => { await g.ui.say('먼저 상트앙느호에서 선장을 도와주세요. 승선권은 이수재에게 받을 수 있어요.'); },
  chapter3_gym_guide: async g => {
    const stage = g.learn.stage();
    await g.ui.say(hasBadge(g, 'thunder') ? '오렌지배지를 받았구나! 축하해.'
      : !g.save.flag('captain_helped') ? '상트앙느호의 선장을 돕고 와 주세요.'
      : !hasBadge(g, 'boulder') || !hasBadge(g, 'cascade') ? '앞선 두 배지를 모아 와 주세요.'
      : `마티스 관장에게 도전하려면 누적 공부 도장 12개가 필요해요. 지금은 ${stage}개예요.`);
  },
  chapter3_trainee: async g => optionalBattle(g, 'vermilion_trainee', '수련생'),
  chapter3_leader: async g => {
    if (hasBadge(g, 'thunder')) {
      if (!g.save.flag('badge_thunder_shown')) { await g.ui.showBadge('thunder'); remember(g, 'badge_thunder_shown'); }
      if (!g.save.flag('chapter3_complete')) {
        await g.ui.say(['세 번째 배지도 얻었구나!', '블루시티 동쪽 9번도로로 가 보렴. 돌산터널 너머 보라타운이 있어.'], { speaker: '오박사의 전화', portrait: 'oak' });
        remember(g, 'chapter3_complete');
      } else await g.ui.say('함께 도전해서 즐거웠어!', { speaker: '마티스' });
      return;
    }
    if (!g.save.flag('captain_helped')) { await g.ui.say('먼저 상트앙느호의 선장을 도와주렴.', { speaker: '마티스' }); return; }
    if (!hasBadge(g, 'boulder') || !hasBadge(g, 'cascade')) { await g.ui.say('앞선 두 배지를 먼저 모아 오렴.', { speaker: '마티스' }); return; }
    if (g.learn.stage() < 12) { await g.ui.say(`공부 도장이 ${g.learn.stage()}개구나. 12개를 모으면 겨뤄 보자!`, { speaker: '마티스' }); return; }
    const outcome = await g.battle.trainer('leader_surge');
    if (outcome === 'lost') { await g.world.whiteout(); return; }
    if (outcome === 'won') await SCRIPTS_CHAPTER3.chapter3_leader(g, { mapId: 'vermilion_gym' });
  },
};
