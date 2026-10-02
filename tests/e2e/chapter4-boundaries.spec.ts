import { test, expect } from '@playwright/test';
import { defaultSave } from '../../src/core/save';
import { readFileSync } from 'node:fs';

const lessons = JSON.parse(readFileSync('public/data/curriculum.json', 'utf8')).lessons.filter((l: any) => l.subject === 'math');
function fixture(stamps: number) {
  const save = defaultSave();
  save.flags = { intro_done: true };
  save.pos = { map: 'celadon_gym', x: 5, y: 6, facing: 'up' };
  save.learn.parent.subjects.english = false;
  save.learn.parent.ttsQuestions = false;
  for (const lesson of lessons.slice(0, stamps))
    save.learn.subjects.math.completed[lesson.id] = { at: new Date().toISOString(), correct: 8, total: 8 };
  return save;
}

test('new route and garden rocket require their saved prerequisites', async ({ page }) => {
  const save = fixture(15); save.pos = { map: 'cerulean', x: 21, y: 12, facing: 'right' };
  await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
  await page.goto('/?debug=1');
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => (window as any).__G.world.getPlayerPos().x)).toBe(21);
  expect(await page.evaluate(() => (window as any).__G.world.mapId)).toBe('cerulean');
  await page.evaluate(async () => { await (window as any).__G.world.teleport('celadon_garden', 5, 7); });
  await page.evaluate(() => { void (window as any).__G.world.runScript('chapter4_rocket'); });
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  expect(await page.evaluate(() => (window as any).__G.save.data.defeatedTrainers.includes('celadon_rocket'))).toBe(false);
});

test('direct Erika battle cannot bypass garden, three badges, or 16 stamps', async ({ page }) => {
  const save = fixture(15);
  await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
  await page.goto('/?debug=1');
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  const call = () => page.evaluate(async () => (window as any).__G.battle.trainer('leader_erika'));
  expect(await call()).toBe('fled');
  await page.evaluate(() => { (window as any).__G.save.setFlag('celadon_garden_helped'); });
  expect(await call()).toBe('fled');
  await page.evaluate(() => { (window as any).__G.save.data.player.badges = ['boulder', 'cascade', 'thunder']; });
  expect(await call()).toBe('fled');
  expect(await page.evaluate(() => (window as any).__G.save.data.player.badges)).toEqual(['boulder', 'cascade', 'thunder']);
});

test('losing to Erika returns to the last heal spot without a badge', async ({ page }) => {
  const save = fixture(16);
  save.flags = { ...save.flags, celadon_garden_helped: true, celadon_gym_open: true };
  save.player.badges = ['boulder', 'cascade', 'thunder'];
  save.lastHeal = { map: 'rock_tunnel_1f', x: 5, y: 6 };
  save.party = [{ uid: 'starter', speciesId: 25, level: 25, exp: 0, hp: 1, maxHp: 93,
    friendship: 70, caughtAt: '', caughtArea: 'starter' }];
  await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
  await page.goto('/?debug=1');
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; (window as any).__TEST__.autoAnswer = 'wrong'; (window as any).__G.audio.setVolumes(0, 0); });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await page.evaluate(() => { void (window as any).__G.world.runScript('chapter4_leader'); });
  await page.getByRole('button', { name: '싸운다', exact: true }).click(); await page.locator('.battle-moves button').first().click();
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.mapId)).toBe('rock_tunnel_1f');
  expect(await page.evaluate(() => (window as any).__G.save.flag('badge_rainbow'))).toBe(false);
  expect(await page.evaluate(() => (window as any).__G.save.data.defeatedTrainers.includes('leader_erika'))).toBe(false);
});

test('losing to the garden Rocket keeps the seed box retryable', async ({ page }) => {
  const save = fixture(15);
  save.flags = { ...save.flags, garden_letter_received: true };
  save.pos = { map: 'celadon_garden', x: 8, y: 6, facing: 'up' };
  save.lastHeal = { map: 'lavender_center', x: 5, y: 5 };
  save.party = [{ uid: 'starter', speciesId: 25, level: 25, exp: 0, hp: 1, maxHp: 93,
    friendship: 70, caughtAt: '', caughtArea: 'starter' }];
  await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
  await page.goto('/?debug=1');
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; (window as any).__TEST__.autoAnswer = 'wrong'; (window as any).__G.audio.setVolumes(0, 0); });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await page.evaluate(() => { void (window as any).__G.world.runScript('chapter4_rocket'); });
  await page.getByRole('button', { name: '싸운다', exact: true }).click(); await page.locator('.battle-moves button').first().click();
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.mapId)).toBe('lavender_center');
  expect(await page.evaluate(() => (window as any).__G.save.flag('garden_seeds_recovered'))).toBe(false);
  expect(await page.evaluate(() => (window as any).__G.save.data.defeatedTrainers.includes('celadon_rocket'))).toBe(false);
});
