import { expect, it, vi } from 'vitest';
import { createSave, repairSave } from '../../src/core/save';
import { SCRIPTS_CHAPTER2 } from '../../src/story/chapter2';
import { MAPS } from '../../src/maps';
import { SCRIPTS, TRAINERS } from '../../src/story';
import { validateMaps } from '../../src/world/validate';
import { encounterPool, rollLevel } from '../../src/world/encounters';
import { readFileSync } from 'node:fs';
import type { Game, Species } from '../../src/core/types';

it('keeps all 25 maps connected and retains new map saves', () => {
  expect(validateMaps(MAPS, SCRIPTS, TRAINERS)).toEqual([]);
  expect(Object.keys(MAPS)).toHaveLength(25);
  const save = createSave();
  save.data.pos = { map: 'mt_moon_deep', x: 16, y: 12, facing: 'right' };
  save.data.lastHeal = { map: 'mt_moon_front', x: 3, y: 12 };
  const restored = repairSave(JSON.parse(JSON.stringify(save.data)))!;
  expect(restored.pos).toEqual(save.data.pos);
  expect(restored.lastHeal).toEqual(save.data.lastHeal);
  const invalid = repairSave({ ...save.data, pos: { ...save.data.pos, x: 999 } })!;
  expect(invalid.pos.map).toBe('player_house_2f');
});

it('has cave, road, and water encounters at their own level ranges', () => {
  const raw = JSON.parse(readFileSync('public/data/pokemon.json', 'utf8'));
  const species: Species[] = Array.isArray(raw) ? raw : raw.species;
  for (const area of ['mt_moon', 'route4', 'cerulean'] as const) {
    expect(encounterPool(area, 8, [], species).length).toBeGreaterThan(0);
    expect(rollLevel(area, 8, () => 0)).toBeGreaterThanOrEqual(9);
    expect(encounterPool(area, 8, [], species, { fishing: true }).every(p => p.species.types.includes('물'))).toBe(true);
  }
});

it('finishes notebook delivery after an interrupted reward dialogue without paying twice', async () => {
  const save = createSave();
  save.data.flags.researcher_asked = true;
  save.data.defeatedTrainers = ['moon_rocket'];
  save.write = vi.fn(() => true);
  let interrupted = true;
  const g = {
    save,
    ui: { say: vi.fn(async () => { if (interrupted) throw Error('closed during dialogue'); }) },
    world: { refreshNpcs: vi.fn() },
  } as unknown as Game;
  await expect(SCRIPTS_CHAPTER2.moon_deep_arrive(g, { mapId: 'mt_moon_deep' })).rejects.toThrow();
  expect(save.data.bag.potion).toBe(3);
  expect(save.flag('notebook_rewarded')).toBe(true);
  expect(save.flag('notebook_returned')).toBe(false);
  interrupted = false;
  await SCRIPTS_CHAPTER2.moon_deep_arrive(g, { mapId: 'mt_moon_deep' });
  expect(save.data.bag.potion).toBe(3);
  expect(save.flag('notebook_returned')).toBe(true);
});

it('uses the saved starter and rival name for the Cerulean rematch', async () => {
  for (const [starter, rivalSpecies] of [[1, 4], [4, 7], [7, 1], [25, 133], [152, 155], [155, 158], [158, 152]]) {
    const rival = structuredClone(TRAINERS.rival_cerulean);
    const g = {
      save: { data: { flags: { starter_species: starter }, player: { rivalName: '우리 라이벌' }, party: [], box: [], defeatedTrainers: [] } },
      data: { trainers: { rival_cerulean: rival } },
      ui: { yesNo: vi.fn(async () => false) },
    } as unknown as Game;
    await SCRIPTS_CHAPTER2.cerulean_rival(g, { mapId: 'cerulean' });
    expect(rival.name).toBe('우리 라이벌');
    expect(rival.team[0].speciesId).toBe(rivalSpecies);
  }
});
