import type { Script } from '../core/types';
export const SCRIPTS_PEWTER: Record<string, Script> = {
  pewter_arrive: async g => {
    if (g.save.flag('pewter_arrived')) return;
    g.save.setFlag('pewter_arrived'); await g.ui.say('회색시티에 도착했어요! 공부 도장 4개를 모아 체육관에 도전해 보세요.');
  },
  pewter_guide: async g => { await g.ui.say(`공부 도장 ${g.learn.stage()}개를 모았구나! ${g.learn.stage() < 4 ? '4개를 모으면 웅 관장님에게 도전할 수 있어.' : '이제 웅 관장님에게 도전해 봐!'}`); },
  pewter_leader: async g => {
    if (g.save.flag('badge_boulder')) { await g.ui.say('매일 조금씩 공부하면 새로운 친구를 만날 수 있단다.', { speaker: '웅' }); return; }
    if (g.learn.stage() < 4) { await g.ui.say(`도장 ${g.learn.stage()}/4개! 오늘의 공부를 마치고 다시 와 보렴.`, { speaker: '웅' }); return; }
    const result = await g.battle.trainer('leader_woong');
    if (result === 'lost') { const h = g.save.data.lastHeal; await g.world.warp(h.map, h.x, h.y); g.world.healParty(); }
    if (result === 'won') await g.ui.say(['회색배지 획득을 축하한단다!', '3번도로가 열렸어! 매일 공부하면 더 많은 포켓몬을 만날 수 있단다.'], { speaker: '오박사의 전화' });
  },
};
