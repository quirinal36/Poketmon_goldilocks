import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { defaultSave } from '../../src/core/save';

test('new exits and ship stay gated until their saved prerequisites', async ({ page }) => {
  const save = defaultSave();
  save.flags = { intro_done: true, chapter3_oak_called: true };
  save.pos = { map: 'cerulean', x: 11, y: 2, facing: 'up' };
  await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
  await page.goto('/?debug=1');
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await page.keyboard.press('ArrowUp');
  expect(await page.evaluate(() => (window as any).__G.world.getPlayerPos().y)).toBe(2);
  expect(await page.evaluate(() => (window as any).__G.world.mapId)).toBe('cerulean');
  await page.evaluate(async () => { await (window as any).__G.world.teleport('vermilion', 17, 16, 'up'); });
  await page.keyboard.press('ArrowUp');
  expect(await page.evaluate(() => (window as any).__G.world.getPlayerPos().y)).toBe(16);
  expect(await page.evaluate(() => (window as any).__G.world.mapId)).toBe('vermilion');
});

test('direct battle call cannot bypass captain, prior badges, or 12 stamps', async ({ page }) => {
  const save = defaultSave();
  save.flags = { intro_done: true };
  save.pos = { map: 'vermilion_gym', x: 5, y: 7, facing: 'up' };
  await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
  await page.goto('/?debug=1');
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  const call = () => page.evaluate(async () => (window as any).__G.battle.trainer('leader_surge'));
  expect(await call()).toBe('fled');
  await page.evaluate(() => { (window as any).__G.save.setFlag('captain_helped'); });
  expect(await call()).toBe('fled');
  await page.evaluate(() => { (window as any).__G.save.data.player.badges = ['boulder', 'cascade']; });
  expect(await call()).toBe('fled');
  expect(await page.evaluate(() => (window as any).__G.save.data.player.badges)).toEqual(['boulder', 'cascade']);
});

test('losing to Surge returns to the last heal spot without awarding a badge', async ({ page }) => {
  const save = defaultSave();
  save.flags = { intro_done: true, badge_boulder: true, badge_cascade: true, captain_helped: true, vermilion_gym_open: true };
  save.player.badges = ['boulder', 'cascade'];
  save.pos = { map: 'vermilion_gym', x: 5, y: 3, facing: 'up' };
  save.lastHeal = { map: 'bill_house', x: 5, y: 5 };
  save.party = [{ uid: 'starter', speciesId: 25, level: 20, exp: 0, hp: 1, maxHp: 78, friendship: 70, caughtAt: '', caughtArea: 'starter' }];
  save.learn.parent.ttsQuestions = false;
  const lessons = JSON.parse(readFileSync('public/data/curriculum.json', 'utf8')).lessons;
  for (const lesson of lessons.filter((l: any) => l.subject === 'math').slice(0, 12))
    save.learn.subjects.math.completed[lesson.id] = { at: new Date().toISOString(), correct: 8, total: 8 };
  await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
  await page.goto('/?debug=1');
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; (window as any).__TEST__.autoAnswer = 'wrong'; (window as any).__G.audio.setVolumes(0, 0); });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await page.evaluate(() => { void (window as any).__G.world.runScript('chapter3_leader'); });
  await page.getByRole('button', { name: '싸운다', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.mapId)).toBe('bill_house');
  expect(await page.evaluate(() => (window as any).__G.save.data.party[0].hp)).toBe(78);
  expect(await page.evaluate(() => (window as any).__G.save.flag('badge_thunder'))).toBe(false);
  expect(await page.evaluate(() => (window as any).__G.save.data.defeatedTrainers.includes('leader_surge'))).toBe(false);
});
