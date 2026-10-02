import { test, expect, type Page } from '@playwright/test';
import { defaultSave } from '../../src/core/save';
import { readFileSync } from 'node:fs';

async function jump(page: Page, map: string, x: number, y: number, facing = 'up') {
  await page.evaluate(async p => { await (window as any).__G.world.teleport(p.map, p.x, p.y, p.facing); }, { map, x, y, facing });
}
async function cross(page: Page, map: string, direction: string) {
  await page.keyboard.down(direction);
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.mapId), { timeout: 10000 }).toBe(map);
  await page.keyboard.up(direction);
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
}
async function script(page: Page, id: string, flag: string) {
  await page.evaluate(id => { void (window as any).__G.world.runScript(id); }, id);
  await expect.poll(() => page.evaluate(flag => (window as any).__G.save.flag(flag), flag)).toBe(true);
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
}
async function battle(page: Page, id: string, flag: string) {
  await page.evaluate(id => { void (window as any).__G.world.runScript(id); }, id);
  const deadline = Date.now() + 100000;
  while (Date.now() < deadline) {
    if (await page.evaluate(flag => (window as any).__G.save.flag(flag), flag)) break;
    const attack = page.getByRole('button', { name: '싸운다', exact: true });
    if (await attack.isVisible()) { await attack.click(); await page.locator('.battle-moves button').first().click(); }
    else await page.waitForTimeout(150);
  }
  await expect.poll(() => page.evaluate(flag => (window as any).__G.save.flag(flag), flag)).toBe(true);
}

for (const width of [1024, 768]) test(`chapter 4 journey, badge, and save resume at ${width}px`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width, height: width === 1024 ? 768 : 1024 });
  const save = defaultSave();
  save.flags = { intro_done: true, got_starter: true, got_dex: true, badge_boulder: true,
    badge_cascade: true, badge_thunder: true, chapter3_oak_called: true };
  save.player.badges = ['boulder', 'cascade', 'thunder'];
  save.defeatedTrainers = ['leader_woong', 'leader_misty', 'leader_surge'];
  save.pos = { map: 'cerulean', x: 22, y: 12, facing: 'right' };
  save.party = [{ uid: 'starter', speciesId: 25, level: 45, exp: 0, hp: 153, maxHp: 153,
    friendship: 70, caughtAt: '', caughtArea: 'starter' }];
  save.learn.parent.pace = 0; save.learn.parent.subjects.english = false; save.learn.parent.ttsQuestions = false;
  const lessons = JSON.parse(readFileSync('public/data/curriculum.json', 'utf8')).lessons;
  for (const lesson of lessons.filter((l: any) => l.subject === 'math').slice(0, 15))
    save.learn.subjects.math.completed[lesson.id] = { at: new Date().toISOString(), correct: 8, total: 8 };
  await page.goto('/?debug=1');
  await page.evaluate(data => { (window as any).__G.save.data = data; (window as any).__G.save.write('chapter4-fixture'); }, save);
  await page.reload();
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; (window as any).__TEST__.autoAnswer = 'correct'; Math.random = () => .5; (window as any).__G.audio.setVolumes(0, 0); });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await cross(page, 'route9', 'ArrowRight');
  await jump(page, 'route9', 23, 12, 'right');
  await cross(page, 'route10_north', 'ArrowRight');
  await jump(page, 'route10_north', 17, 12);
  await cross(page, 'rock_tunnel_1f', 'ArrowUp');
  await script(page, 'chapter4_tunnel_heal', 'chapter4_oak_called');
  await jump(page, 'rock_tunnel_1f', 18, 5);
  await cross(page, 'rock_tunnel_b1f', 'ArrowUp');
  await jump(page, 'rock_tunnel_b1f', 11, 20, 'down');
  await cross(page, 'route10_south', 'ArrowDown');
  await jump(page, 'route10_south', 11, 21, 'down');
  await cross(page, 'lavender', 'ArrowDown');
  await page.evaluate(() => { void (window as any).__G.world.runScript('chapter4_letter'); });
  await page.locator('.dlg-choice-row').first().click({ timeout: 10000 });
  await expect.poll(() => page.evaluate(() => (window as any).__G.save.flag('garden_letter_received'))).toBe(true);
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  await page.reload();
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; (window as any).__TEST__.autoAnswer = 'correct'; Math.random = () => .5; });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  expect(await page.evaluate(() => (window as any).__G.save.flag('garden_letter_received'))).toBe(true);
  await jump(page, 'lavender', 0, 12, 'left');
  await cross(page, 'route8', 'ArrowLeft');
  await jump(page, 'route8', 17, 12);
  await cross(page, 'underground_path_west', 'ArrowUp');
  await jump(page, 'underground_path_west', 5, 1);
  await cross(page, 'route7', 'ArrowUp');
  await jump(page, 'route7', 23, 12, 'right');
  await cross(page, 'celadon', 'ArrowRight');
  await jump(page, 'celadon', 17, 16);
  await cross(page, 'celadon_garden', 'ArrowUp');
  const beforeRocket = await page.evaluate(() => (window as any).__G.save.data.player.money);
  await battle(page, 'chapter4_rocket', 'garden_seeds_recovered');
  expect(await page.evaluate(() => (window as any).__G.save.data.player.money)).toBe(beforeRocket + 500);
  await page.reload();
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; (window as any).__TEST__.autoAnswer = 'correct'; Math.random = () => .5; });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await script(page, 'chapter4_garden', 'celadon_garden_helped');
  expect(await page.evaluate(() => (window as any).__G.save.flag('celadon_gym_open'))).toBe(true);
  await jump(page, 'celadon', 5, 18);
  await cross(page, 'celadon_gym', 'ArrowUp');
  await page.evaluate(() => { void (window as any).__G.world.runScript('chapter4_leader'); });
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  expect(await page.evaluate(() => (window as any).__G.save.flag('badge_rainbow'))).toBe(false);
  await page.evaluate(async () => { const g = (window as any).__G; while (g.learn.stage() < 16) await g.learn.quiz({ purpose: 'practice' }); });
  const beforeLeader = await page.evaluate(() => (window as any).__G.save.data.player.money);
  await battle(page, 'chapter4_leader', 'badge_rainbow');
  await page.reload();
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await page.evaluate(() => { void (window as any).__G.world.runScript('chapter4_leader'); });
  await expect(page.getByRole('dialog', { name: '무지개배지를 받았어요!' })).toBeVisible();
  await page.getByRole('button', { name: '모험 계속하기' }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__G.save.flag('chapter4_complete'))).toBe(true);
  expect(await page.evaluate(() => (window as any).__G.save.data.player.money)).toBe(beforeLeader + 2500);
  await page.reload();
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  expect(await page.evaluate(() => (window as any).__G.save.data.player.badges)).toEqual(['boulder', 'cascade', 'thunder', 'rainbow']);
  expect(await page.evaluate(() => (window as any).__G.save.data.player.money)).toBe(beforeLeader + 2500);
  expect(errors).toEqual([]);
});
