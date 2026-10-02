import { describe, expect, it, vi } from 'vitest';
import { defaultSave, repairSave, createSave } from '../../src/core/save';
import { createBattle, attackDamage, catchChance, movesFor } from '../../src/battle';
import { G } from '../../src/game';
import { repairSpecies } from '../../src/data';
import { MAPS } from '../../src/maps';
import { SCRIPTS, TRAINERS } from '../../src/story';
import { validateMaps } from '../../src/world/validate';
import { encounterPool } from '../../src/world/encounters';
import { readFileSync } from 'node:fs';
import type { Species } from '../../src/core/types';
const raw = JSON.parse(readFileSync('public/data/pokemon.json', 'utf8'));
const species: Species[] = Array.isArray(raw) ? raw : raw.species;

describe('game integration contracts', () => {
  it('accepts every map and rejects broken width, exits, script, trainer and warp', () => {
    expect(validateMaps(MAPS, SCRIPTS, TRAINERS)).toEqual([]);
    const maps = structuredClone(MAPS);
    maps.pallet.tiles[0] = 'T'; maps.pallet.exits![0].offset = 99;
    maps.pallet.npcs[0].script = 'missing'; maps.pallet.npcs[0].trainer = 'missing'; maps.pallet.warps[0].tx = -1;
    const errors = validateMaps(maps, SCRIPTS, TRAINERS).join('\n');
    for (const text of ['width', 'exit', 'script', 'trainer', 'warp destination']) expect(errors).toContain(text);
  });
  it('repairs partial/corrupt values without losing intact progress', () => {
    const raw = defaultSave(); raw.player.money = -5; raw.pos.map = 'missing' as any;
    raw.party = [null as any]; raw.settings.music = 4;
    const d = repairSave(raw)!;
    expect(d.player.money).toBe(0); expect(d.party).toEqual([]); expect(d.pos.map).toBe('player_house_2f'); expect(d.settings.music).toBe(1);
    expect(repairSave(null)).toBeNull();
  });
  it('keeps overflow party members and repairs nonfinite pokemon and positions', () => {
    const raw = defaultSave();
    raw.party = Array.from({ length: 7 }, (_, i) => ({ uid: String(i), speciesId: 25, level: Infinity, hp: NaN, maxHp: -1, exp: -20, friendship: 999, caughtAt: '' }));
    raw.pos.x = Infinity; raw.dex.caught = [25, 25, 1.5, 0, 252];
    const d = repairSave(raw)!;
    expect(d.party).toHaveLength(6); expect(d.box).toHaveLength(1);
    expect(d.party[0]).toMatchObject({ level: 5, hp: 33, maxHp: 33, exp: 0, friendship: 255 });
    expect(d.pos).toEqual(defaultSave().pos); expect(d.dex.caught).toEqual([25]);
  });
  it('damage is bounded and weakened catches are guaranteed', () => {
    expect(attackDamage(100, false, 0)).toBe(35); expect(attackDamage(100, true, 1)).toBe(60);
    expect(catchChance(50, 100, false)).toBe(1); expect(catchChance(100, 100, true)).toBe(.8);
    expect(catchChance(100, 100, true, true)).toBe(1);
  });
  it('honors chosen branch and saves level-up/evolution', async () => {
    const save = createSave(); G.save = save; save.write = vi.fn();
    G.data = { speciesById: (id: number) => species.find(s => s.id === id)! } as any;
    G.ui = { say: vi.fn(async () => {}), flash: vi.fn(async () => {}), pickEvolution: vi.fn(async () => 135) } as any;
    G.audio = { jingle: vi.fn(async () => {}) } as any;
    const eevee = species.find(s => s.id === 133)!; const level = Math.max(...eevee.evolvesTo.map(e => e.level));
    save.data.party.push({ uid: 'test', speciesId: 133, level: level - 1, exp: 0, hp: 1, maxHp: 18 + 3 * (level - 1), friendship: 70, caughtAt: '' });
    await createBattle().giveExp(0, 20 + 6 * (level - 1));
    expect(save.data.party[0].speciesId).toBe(135); expect(save.data.dex.caught).toContain(135);
    expect(save.data.party[0].hp).toBe(save.data.party[0].maxHp); expect(save.write).toHaveBeenCalled();
  });
  it('never puts evolution-only or event species in wild pools', () => {
    const pool = encounterPool('route3', 200, [], species);
    expect(pool.length).toBeGreaterThan(0); expect(pool.every(p => p.species.obtainable === 'wild' && p.species.tier < 9)).toBe(true);
  });
});


it('keeps guest and account saves separate, including reset and import', () => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  try {
    const guest = createSave(), a = createSave('account:a'), b = createSave('account:b');
    const guestSave = defaultSave(), accountSave = defaultSave();
    guest.importData(guestSave); a.importData(accountSave);
    expect(guest.load()?.id).toBe(guestSave.id);
    expect(a.load()?.id).toBe(accountSave.id);
    expect(b.exists()).toBe(false);
    a.reset();
    expect(a.exists()).toBe(false);
    expect(guest.peek()?.id).toBe(guestSave.id);
  } finally { vi.unstubAllGlobals(); }
});


it('reports local storage failure while still queuing the cloud save', () => {
  const oldNet = G.net, oldUI = G.ui;
  const pushSave = vi.fn();
  vi.stubGlobal('localStorage', { setItem: () => { throw new Error('quota exceeded'); } });
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  G.net = { pushSave } as any; G.ui = { toast: vi.fn() } as any;
  try {
    const save = createSave();
    expect(save.write()).toBe(false);
    expect(pushSave).toHaveBeenCalledWith(save.data);
    vi.stubGlobal('localStorage', { setItem: vi.fn() });
    expect(save.write()).toBe(true);
  } finally {
    G.net = oldNet; G.ui = oldUI; warn.mockRestore(); vi.unstubAllGlobals();
  }
});


it('offers at most four learned attacks for all species, without mutating their learnsets', () => {
  for (const s of species) for (const level of [1, 5, 25, 100]) {
    const before = structuredClone(s.moves), moves = movesFor(s, level);
    expect(moves.length).toBeGreaterThan(0); expect(moves.length).toBeLessThanOrEqual(4);
    expect(moves.every(m => m.level <= level && ['physical', 'special'].includes(m.kind))).toBe(true);
    expect(s.moves).toEqual(before);
  }
  expect(repairSpecies({ id: 25, moves: [null, { id: 1, level: -1 }] as any }).moves).toEqual([]);
  const pikachu = species.find(s => s.id === 25)!;
  expect(movesFor(pikachu, 5).map(m => m.name)).toEqual(['전기쇼크']);
  expect(movesFor(pikachu, 26).map(m => m.name)).toContain('10만볼트');
  expect(movesFor(species.find(s => s.id === 129)!, 5)[0].name).toBe('몸부림');
});
