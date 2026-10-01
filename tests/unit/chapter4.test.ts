import { expect, it, vi } from 'vitest';
import { createSave, repairSave } from '../../src/core/save';
import { MAPS } from '../../src/maps';
import { CHAPTER4_MAPS } from '../../src/maps/chapter4';
import { SCRIPTS_CHAPTER4 } from '../../src/story/chapter4';
import { SCRIPTS, TRAINERS } from '../../src/story';
import { validateMaps } from '../../src/world/validate';
import type { Game } from '../../src/core/types';

function game() {
  const save = createSave(); save.write = vi.fn(() => true);
  const say = vi.fn(async () => {});
  const g = { save, ui: { say, yesNo: vi.fn(async () => true), showBadge: vi.fn(async () => {}) },
    world: { healParty: vi.fn(), setLastHeal: vi.fn(), whiteout: vi.fn() },
    learn: { stage: () => 16 }, battle: { trainer: vi.fn(async () => 'won') },
  } as unknown as Game;
  return { g, save, say };
}

it('connects 53 maps and preserves old badges and new map saves', () => {
  expect(Object.keys(MAPS)).toHaveLength(53);
  expect(validateMaps(MAPS, SCRIPTS, TRAINERS)).toEqual([]);
  const save = createSave();
  save.data.player.badges = ['boulder', 'cascade', 'thunder'];
  save.data.pos = { map: 'rock_tunnel_b1f', x: 11, y: 20, facing: 'down' };
  save.data.lastHeal = { map: 'rock_tunnel_1f', x: 5, y: 6 };
  const restored = repairSave(JSON.parse(JSON.stringify(save.data)))!;
  expect(restored.pos).toEqual(save.data.pos);
  expect(restored.lastHeal).toEqual(save.data.lastHeal);
  expect(restored.flags.badge_thunder).toBe(true);
  for (const map of Object.values(CHAPTER4_MAPS)) {
    const point = { map: map.id, x: map.indoor ? 5 : 11, y: map.indoor ? 5 : 12 };
    save.data.pos = { ...point, facing: 'up' };
    save.data.lastHeal = point;
    const old = repairSave(JSON.parse(JSON.stringify(save.data)))!;
    expect(old.pos).toEqual(save.data.pos);
    expect(old.lastHeal).toEqual(save.data.lastHeal);
  }
});

it('recovers seeds from a persisted win and opens the gym once', async () => {
  const { g, save, say } = game();
  await SCRIPTS_CHAPTER4.chapter4_rocket(g, { mapId: 'celadon_garden' });
  expect(g.battle.trainer).not.toHaveBeenCalled();
  await SCRIPTS_CHAPTER4.chapter4_letter(g, { mapId: 'lavender' });
  expect(save.flag('garden_letter_received')).toBe(true);
  save.data.defeatedTrainers.push('celadon_rocket'); // Battle saved before the story dialogue.
  say.mockRejectedValueOnce(Error('closed'));
  await expect(SCRIPTS_CHAPTER4.chapter4_garden(g, { mapId: 'celadon_garden' })).rejects.toThrow('closed');
  expect(save.flag('celadon_garden_helped')).toBe(true);
  expect(save.flag('celadon_gym_open')).toBe(true);
  await SCRIPTS_CHAPTER4.chapter4_garden(g, { mapId: 'celadon_garden' });
  expect(g.battle.trainer).not.toHaveBeenCalled();
  const restored = repairSave(JSON.parse(JSON.stringify(save.data)))!;
  expect(restored.flags.garden_seeds_recovered).toBe(true);
});

it('requires three badges and 16 stamps, then resumes the rainbow badge ceremony', async () => {
  const { g, save } = game();
  save.setFlag('celadon_garden_helped');
  await SCRIPTS_CHAPTER4.chapter4_leader(g, { mapId: 'celadon_gym' });
  expect(g.battle.trainer).not.toHaveBeenCalled();
  save.data.player.badges = ['boulder', 'cascade', 'thunder'];
  g.learn.stage = () => 15;
  await SCRIPTS_CHAPTER4.chapter4_leader(g, { mapId: 'celadon_gym' });
  expect(g.battle.trainer).not.toHaveBeenCalled();
  g.learn.stage = () => 16;
  vi.mocked(g.battle.trainer).mockImplementationOnce(async () => { save.data.player.badges.push('rainbow'); save.setFlag('badge_rainbow'); return 'won'; });
  await SCRIPTS_CHAPTER4.chapter4_leader(g, { mapId: 'celadon_gym' });
  expect(g.ui.showBadge).toHaveBeenCalledWith('rainbow');
  expect(save.flag('chapter4_complete')).toBe(true);
  await SCRIPTS_CHAPTER4.chapter4_leader(g, { mapId: 'celadon_gym' });
  expect(g.battle.trainer).toHaveBeenCalledTimes(1);
});
