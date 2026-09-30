// Owned by the STORY agents (wave 2). Initial data per docs/DESIGN.md §7.7.
import type { TrainerDef } from '../core/types';

export const TRAINERS: Record<string, TrainerDef> = {
  rival_lab: { id: 'rival_lab', name: '그린', className: '라이벌', image: 'rival', team: [{ speciesId: 4, level: 5 }], intro: ['잠깐! 내 포켓몬이랑 승부하자!'], defeat: ['뭐야! 제법인데?'], reward: 100, purpose: 'tutorial', music: 'battle_trainer' },
  bug_1: { id: 'bug_1', name: '민준', className: '벌레잡이 소년', image: 'bugcatcher', team: [{ speciesId: 10, level: 4 }, { speciesId: 13, level: 4 }], intro: ['벌레 포켓몬 최고! 승부다!'], defeat: ['으악, 졌다!'], after: ['숲에는 벌레 포켓몬이 많아!'], reward: 120, purpose: 'trainer' },
  bug_2: { id: 'bug_2', name: '서준', className: '벌레잡이 소년', image: 'bugcatcher', team: [{ speciesId: 14, level: 6 }, { speciesId: 11, level: 6 }], intro: ['내 단데기는 단단해!'], defeat: ['단단해도 졌네…'], after: ['회색시티는 숲을 나가면 바로야!'], reward: 150, purpose: 'trainer' },
  camper_gym: { id: 'camper_gym', name: '도윤', className: '캠프보이', image: 'camper', team: [{ speciesId: 27, level: 7 }], intro: ['관장님께 가려면 나부터 이겨야 해!'], defeat: ['대단한데!'], after: ['웅 관장님은 바위처럼 단단하셔!'], reward: 200, purpose: 'trainer' },
  leader_woong: { id: 'leader_woong', name: '웅', className: '관장', image: 'leader_woong', team: [{ speciesId: 74, level: 8 }, { speciesId: 95, level: 10 }], intro: ['나는 회색체육관 관장 웅!', '바위처럼 단단한 마음으로 공부했니?', '자, 승부다!'], defeat: ['훌륭하다! 너의 실력을 인정하마.'], after: ['매일 조금씩 공부하는 게 제일 강한 거란다.'], reward: 1000, purpose: 'gym', music: 'battle_gym', badge: 'boulder' },
  route3_camper: { id: 'route3_camper', name: '하준', className: '캠프보이', image: 'camper', team: [{ speciesId: 16, level: 10 }, { speciesId: 27, level: 10 }], intro: ['첫 배지를 받으려고 연습 중이야. 승부하자!'], defeat: ['졌네! 그래도 다시 연습할 거야.'], after: ['산에 들어가기 전에 친구들을 쉬게 해 줘!'], reward: 200, purpose: 'trainer' },
  moon_rocket: { id: 'moon_rocket', name: '로켓단 단원', className: '로켓단', image: 'rocket', team: [{ speciesId: 41, level: 11 }, { speciesId: 19, level: 12 }], intro: ['이 수첩만 있으면 반짝이는 돌을 찾을 수 있어!', '돌려 달라고? 승부로 정하자!'], defeat: ['알았어, 수첩은 돌려줄게!'], reward: 300, purpose: 'trainer' },
  rival_cerulean: { id: 'rival_cerulean', name: '그린', className: '라이벌', image: 'rival', team: [{ speciesId: 4, level: 13 }, { speciesId: 16, level: 12 }], intro: ['달맞이산을 넘어왔구나! 다시 승부해 보자!'], defeat: ['또 졌네. 다음엔 꼭 이길 거야!'], after: ['포켓몬센터에서 친구들을 쉬게 해 줘!'], reward: 300, purpose: 'trainer' },
  cerulean_swimmer: { id: 'cerulean_swimmer', name: '시온', className: '수련생', image: 'camper', team: [{ speciesId: 54, level: 13 }], intro: ['물 포켓몬과 한 번 겨뤄 볼래?'], defeat: ['차분하게 잘했어!'], after: ['이슬 관장님은 도장 8개를 기다리셔.'], reward: 250, purpose: 'trainer' },
  leader_misty: { id: 'leader_misty', name: '이슬', className: '관장', image: 'leader_misty', team: [{ speciesId: 120, level: 14 }, { speciesId: 121, level: 16 }], intro: ['나는 블루체육관 관장 이슬이야!', '포켓몬과 서로 믿고 도전하는 모습이 멋지네. 시작해 볼까?'], defeat: ['잘했어! 두 번째 배지를 받아 줘!'], after: ['친구들과 함께 더 모험해 봐!'], reward: 1500, purpose: 'gym', music: 'battle_gym', badge: 'cascade' },
};
