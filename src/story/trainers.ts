// Owned by the STORY agents (wave 2). Initial data per docs/DESIGN.md §7.7.
import type { TrainerDef } from '../core/types';

export const TRAINERS: Record<string, TrainerDef> = {
  rival_lab: { id: 'rival_lab', name: '그린', className: '라이벌', image: 'rival', team: [{ speciesId: 4, level: 5 }], intro: ['잠깐! 내 포켓몬이랑 승부하자!'], defeat: ['뭐야! 제법인데?'], reward: 100, purpose: 'tutorial', music: 'battle_trainer' },
  bug_1: { id: 'bug_1', name: '민준', className: '벌레잡이 소년', image: 'bugcatcher', team: [{ speciesId: 10, level: 4 }, { speciesId: 13, level: 4 }], intro: ['벌레 포켓몬 최고! 승부다!'], defeat: ['으악, 졌다!'], after: ['숲에는 벌레 포켓몬이 많아!'], reward: 120, purpose: 'trainer' },
  bug_2: { id: 'bug_2', name: '서준', className: '벌레잡이 소년', image: 'bugcatcher', team: [{ speciesId: 14, level: 6 }, { speciesId: 11, level: 6 }], intro: ['내 단데기는 단단해!'], defeat: ['단단해도 졌네…'], after: ['회색시티는 숲을 나가면 바로야!'], reward: 150, purpose: 'trainer' },
  camper_gym: { id: 'camper_gym', name: '도윤', className: '캠프보이', image: 'camper', team: [{ speciesId: 27, level: 7 }], intro: ['관장님께 가려면 나부터 이겨야 해!'], defeat: ['대단한데!'], after: ['웅 관장님은 바위처럼 단단하셔!'], reward: 200, purpose: 'trainer' },
  leader_woong: { id: 'leader_woong', name: '웅', className: '관장', image: 'leader_woong', team: [{ speciesId: 74, level: 8 }, { speciesId: 95, level: 10 }], intro: ['나는 회색체육관 관장 웅!', '바위처럼 단단한 마음으로 공부했니?', '자, 승부다!'], defeat: ['훌륭하다! 너의 실력을 인정하마.'], after: ['매일 조금씩 공부하는 게 제일 강한 거란다.'], reward: 1000, purpose: 'gym', music: 'battle_gym', badge: 'boulder' },
};
