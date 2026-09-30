import type { Script } from '../core/types';
import { maxHpFor } from '../core/types';
import { uid, josa } from '../core/util';
export const SCRIPTS_COMMON: Record<string, Script> = {
  nurse: async (g, ctx) => {
    await g.ui.say('어서 오세요! 포켓몬들을 쉬게 해 드릴게요.', { speaker: '간호사', portrait: 'nurse' });
    g.world.healParty();
    g.save.data.lastHeal = { map: ctx.mapId, x: 5, y: 5 };
    await g.audio.jingle('heal');
    await g.ui.say('모두 건강해졌어요! 또 놀러 오세요.');
  },
  home_heal: async g => { g.world.healParty(); await g.ui.say('푹 쉬렴. 모두 건강해졌어!'); },
  home_tv: async g => { await g.ui.say('매일 조금씩 공부하면 새로운 친구를 만나요!'); },
  shop: async g => g.ui.openShop([{ item: 'pokeball', price: 100 }, { item: 'greatball', price: 300 }, { item: 'potion', price: 150 }]),
  pc: async g => g.ui.openPC(),
  mirror: async g => { g.save.data.player.appearance = await g.ui.openCustomize('mirror'); },
  daily_board: async g => g.ui.openDailyPlan(),
  practice: async g => {
    const subject = await g.ui.choose('어떤 공부를 연습할까요?', ['수학', '영어', '돌아가기'], { cancelIndex: 2 });
    if (subject === 2) return;
    do {
      const result = await g.learn.quiz({ purpose: 'practice', subject: subject === 0 ? 'math' : 'english' });
      if (result.correct && g.save.data.party.length) await g.battle.giveExp(0, 5);
    } while (await g.ui.yesNo('한 문제 더 풀어 볼까요?'));
  },
  semester_gifts: async g => {
    const cur = g.learn.curriculum();
    const events = g.data.species.filter(s => s.obtainable === 'event');
    const completed = ['11', '12', '21', '22'].filter(key => {
      const lessons = cur.lessons.filter(l => `${l.grade}${l.semester}` === key);
      return lessons.length > 0 && lessons.every(l => g.save.data.learn.subjects[l.subject].completed[l.id]);
    });
    let received = false;
    for (const [i, s] of events.entries()) {
      const sem = Math.min(3, Math.floor(i * 4 / events.length));
      if (!completed.includes(['11', '12', '21', '22'][sem]) || g.save.flag(`gift_${s.id}`)) continue;
      g.save.addPokemon({ uid: uid('p_'), speciesId: s.id, level: 20, exp: 0, hp: maxHpFor(20), maxHp: maxHpFor(20), friendship: 100, caughtAt: new Date().toISOString(), caughtArea: 'event' });
      g.save.markCaught(s.id); g.save.setFlag(`gift_${s.id}`); received = true;
      await g.ui.say(`학기 공부를 마친 선물이야! ${josa(s.name, '와/과')} 친구가 되었어!`);
      g.save.write('semester-gift');
    }
    if (!received) await g.ui.say('수학과 영어를 한 학기씩 마치고 와 봐! 특별한 포켓몬을 소개해 줄게.');
  },
};
