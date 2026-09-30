import type { Script } from '../core/types';
export const SCRIPTS_VIRIDIAN: Record<string, Script> = {
  viridian_arrive: async g => {
    if (g.save.flag('viridian_arrived')) return;
    g.save.setFlag('viridian_arrived'); await g.ui.say('상록시티에 도착했어요! 빨간 지붕의 포켓몬센터에서 쉴 수 있어요.');
  },
  viridian_closed: async g => { await g.ui.say('관장님은 외출 중이에요. 북쪽 숲을 지나 회색시티로 가 보세요.'); },
  viridian_rod: async g => {
    if (g.save.flag('got_rod')) { await g.ui.say('물가를 바라보고 A를 누르면 낚시할 수 있어!'); return; }
    g.save.addItem('rod'); g.save.setFlag('got_rod'); await g.ui.say(['낚싯대를 줄게!', '물가를 바라보고 A를 눌러 봐. 물 포켓몬이 기다릴 거야.']);
  },
};
