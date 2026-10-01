import { expect, it, vi } from 'vitest';
import { createSave, repairSave } from '../../src/core/save';
import { MAPS } from '../../src/maps';
import { SCRIPTS_CHAPTER3 } from '../../src/story/chapter3';
import { SCRIPTS, TRAINERS } from '../../src/story';
import { validateMaps } from '../../src/world/validate';
import type { Game } from '../../src/core/types';

function game() {
  const save = createSave();
  save.write = vi.fn(() => true);
  const say = vi.fn(async () => {});
  const g = { save, ui: { say, yesNo: vi.fn(async () => true), showBadge: vi.fn(async () => {}) },
    world: { healParty: vi.fn(), setLastHeal: vi.fn(), refreshNpcs: vi.fn(), whiteout: vi.fn() },
    learn: { stage: () => 12 }, battle: { trainer: vi.fn(async () => 'won') },
  } as unknown as Game;
  return { g, save, say };
}
const ctx = { mapId: 'bill_house' } as const;

it('connects 53 maps and preserves new and legacy badge saves', () => {
  expect(Object.keys(MAPS)).toHaveLength(53);
  expect(validateMaps(MAPS, SCRIPTS, TRAINERS)).toEqual([]);
  const save = createSave();
  save.data.player.badges = ['boulder', 'cascade'];
  save.data.pos = { map: 'ss_anne_deck', x: 5, y: 5, facing: 'up' };
  save.data.lastHeal = { map: 'ss_anne_captain', x: 5, y: 5 };
  const restored = repairSave(JSON.parse(JSON.stringify(save.data)))!;
  expect(restored.pos).toEqual(save.data.pos);
  expect(restored.lastHeal).toEqual(save.data.lastHeal);
  expect(restored.flags.badge_cascade).toBe(true);
  expect(restored.player.badges).toEqual(['boulder', 'cascade']);
});

it('awards one ticket after ordered checks and recovers from interrupted dialogue', async () => {
  const { g, save, say } = game();
  await SCRIPTS_CHAPTER3.chapter3_bill(g, ctx);
  await SCRIPTS_CHAPTER3.chapter3_bill_connection(g, ctx);
  expect(save.flag('bill_connection_checked')).toBe(false);
  await SCRIPTS_CHAPTER3.chapter3_bill_light(g, ctx);
  await SCRIPTS_CHAPTER3.chapter3_bill_connection(g, ctx);
  say.mockRejectedValueOnce(Error('closed'));
  await expect(SCRIPTS_CHAPTER3.chapter3_bill(g, ctx)).rejects.toThrow('closed');
  expect(save.flag('ss_ticket_received')).toBe(true);
  expect(save.flag('bill_helped')).toBe(true);
  await SCRIPTS_CHAPTER3.chapter3_bill(g, ctx);
  expect(save.flag('ss_ticket_received')).toBe(true);
  expect(save.data.bag.potion).toBe(1);
});

it('keeps ship access and gym opening after an interrupted captain dialogue', async () => {
  const { g, save, say } = game();
  await SCRIPTS_CHAPTER3.chapter3_captain(g, { mapId: 'ss_anne_captain' });
  expect(save.flag('captain_helped')).toBe(false);
  await SCRIPTS_CHAPTER3.chapter3_sailor(g, { mapId: 'ss_anne_deck' });
  say.mockRejectedValueOnce(Error('closed'));
  await expect(SCRIPTS_CHAPTER3.chapter3_captain(g, { mapId: 'ss_anne_captain' })).rejects.toThrow();
  expect(save.flag('captain_helped')).toBe(true);
  expect(save.flag('vermilion_gym_open')).toBe(true);
  await SCRIPTS_CHAPTER3.chapter3_captain(g, { mapId: 'ss_anne_captain' });
});

it('requires the prior badges and 12 stamps, then resumes the badge ceremony', async () => {
  const { g, save } = game();
  save.setFlag('captain_helped');
  await SCRIPTS_CHAPTER3.chapter3_leader(g, { mapId: 'vermilion_gym' });
  expect(g.battle.trainer).not.toHaveBeenCalled();
  save.data.player.badges = ['boulder', 'cascade'];
  g.learn.stage = () => 11;
  await SCRIPTS_CHAPTER3.chapter3_leader(g, { mapId: 'vermilion_gym' });
  expect(g.battle.trainer).not.toHaveBeenCalled();
  g.learn.stage = () => 12;
  // The battle service persists the badge before presentation; model that handoff.
  vi.mocked(g.battle.trainer).mockImplementationOnce(async () => { save.data.player.badges.push('thunder'); save.setFlag('badge_thunder'); return 'won'; });
  await SCRIPTS_CHAPTER3.chapter3_leader(g, { mapId: 'vermilion_gym' });
  expect(g.ui.showBadge).toHaveBeenCalledWith('thunder');
  expect(save.flag('chapter3_complete')).toBe(true);
  await SCRIPTS_CHAPTER3.chapter3_leader(g, { mapId: 'vermilion_gym' });
  expect(g.battle.trainer).toHaveBeenCalledTimes(1);
});
