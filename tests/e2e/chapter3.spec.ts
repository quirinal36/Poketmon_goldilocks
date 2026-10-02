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

for (const width of [1024, 768]) test(`chapter 3 journey, badge, and save resume at ${width}px`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width, height: width === 1024 ? 768 : 1024 });
  const save = defaultSave();
  save.flags = { intro_done: true, got_starter: true, got_dex: true, badge_boulder: true, badge_cascade: true,
    chapter2_complete: true, chapter3_oak_called: true };
  save.player.badges = ['boulder', 'cascade'];
  save.defeatedTrainers = ['leader_woong', 'leader_misty'];
  save.pos = { map: 'cerulean', x: 11, y: 3, facing: 'up' };
  save.party = [{ uid: 'starter', speciesId: 25, level: 30, exp: 0, hp: 108, maxHp: 108,
    friendship: 70, caughtAt: '', caughtArea: 'starter' }];
  save.learn.parent.pace = 0; save.learn.parent.subjects.english = false; save.learn.parent.ttsQuestions = false;
  // A resumed learner has 11 stamps; the 12th is earned through the real quiz path below.
  const lessons = JSON.parse(readFileSync('public/data/curriculum.json', 'utf8')).lessons;
  for (const lesson of lessons.filter((l: any) => l.subject === 'math').slice(0, 11))
    save.learn.subjects.math.completed[lesson.id] = { at: new Date().toISOString(), correct: 8, total: 8 };
  await page.goto('/?debug=1');
  await page.evaluate(data => { (window as any).__G.save.data = data; (window as any).__G.save.write('chapter3-fixture'); }, save);
  await page.reload();
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; (window as any).__TEST__.autoAnswer = 'correct'; Math.random = () => .5; (window as any).__G.audio.setVolumes(0, 0); });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await jump(page, 'cerulean', 11, 0);
  await cross(page, 'route24', 'ArrowUp');
  await jump(page, 'route24', 11, 0);
  await cross(page, 'route25', 'ArrowUp');
  await jump(page, 'route25', 17, 7);
  await cross(page, 'bill_house', 'ArrowUp');
  await page.evaluate(() => { void (window as any).__G.world.runScript('chapter3_bill'); });
  await page.locator('.dlg-choice-row').first().click({ timeout: 10000 });
  await expect.poll(() => page.evaluate(() => (window as any).__G.save.flag('bill_asked'))).toBe(true);
  await script(page, 'chapter3_bill_light', 'bill_light_checked');
  await script(page, 'chapter3_bill_connection', 'bill_connection_checked');
  await script(page, 'chapter3_bill', 'ss_ticket_received');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('pokestudy.save.v1') || '{}').flags?.ss_ticket_received)).toBe(true);
  await page.reload();
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; (window as any).__TEST__.autoAnswer = 'correct'; Math.random = () => .5; });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  expect(await page.evaluate(() => (window as any).__G.save.flag('ss_ticket_received'))).toBe(true);

  await jump(page, 'cerulean', 11, 21, 'down');
  await cross(page, 'route5', 'ArrowDown');
  await jump(page, 'route5', 17, 12);
  await cross(page, 'underground_path', 'ArrowUp');
  await jump(page, 'underground_path', 5, 1);
  await cross(page, 'route6', 'ArrowUp');
  await jump(page, 'route6', 11, 21, 'down');
  await cross(page, 'vermilion', 'ArrowDown');
  await jump(page, 'vermilion', 17, 16);
  await cross(page, 'ss_anne_1f', 'ArrowUp');
  await jump(page, 'ss_anne_1f', 9, 3);
  await cross(page, 'ss_anne_deck', 'ArrowUp');
  await script(page, 'chapter3_sailor', 'ss_parcel_received');
  await jump(page, 'ss_anne_1f', 2, 3);
  await cross(page, 'ss_anne_captain', 'ArrowUp');
  await script(page, 'chapter3_captain', 'captain_helped');
  const before = await page.evaluate(() => (window as any).__G.save.data.player.money);
  await script(page, 'chapter3_captain', 'vermilion_gym_open');
  expect(await page.evaluate(() => (window as any).__G.save.data.player.money)).toBe(before);

  await jump(page, 'vermilion', 5, 18);
  await cross(page, 'vermilion_gym', 'ArrowUp');
  await jump(page, 'vermilion_gym', 5, 3);
  await page.evaluate(() => { void (window as any).__G.world.runScript('chapter3_leader'); });
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  expect(await page.evaluate(() => (window as any).__G.save.flag('badge_thunder'))).toBe(false);
  await page.evaluate(async () => { const g = (window as any).__G; while (g.learn.stage() < 12) await g.learn.quiz({ purpose: 'practice' }); });
  expect(await page.evaluate(() => (window as any).__G.learn.stage())).toBe(12);
  const beforeBattle = await page.evaluate(() => (window as any).__G.save.data.player.money);
  await page.evaluate(() => { void (window as any).__G.world.runScript('chapter3_leader'); });
  const battleDeadline = Date.now() + 90000;
  while (Date.now() < battleDeadline) {
    if (await page.evaluate(() => (window as any).__G.save.flag('badge_thunder'))) break;
    const attack = page.getByRole('button', { name: '싸운다', exact: true });
    if (await attack.isVisible()) { await attack.click(); await page.locator('.battle-moves button').first().click(); }
    else await page.waitForTimeout(200);
  }
  await expect.poll(() => page.evaluate(() => (window as any).__G.save.flag('badge_thunder'))).toBe(true);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('pokestudy.save.v1') || '{}').player?.badges?.includes('thunder'))).toBe(true);
  await page.reload();
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await page.evaluate(() => { void (window as any).__G.world.runScript('chapter3_leader'); });
  await expect(page.getByRole('dialog', { name: '오렌지배지를 받았어요!' })).toBeVisible();
  await page.getByRole('button', { name: '모험 계속하기' }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__G.save.flag('chapter3_complete'))).toBe(true);
  expect(await page.evaluate(() => (window as any).__G.save.data.player.money)).toBe(beforeBattle + 2000);
  await page.reload();
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  expect(await page.evaluate(() => (window as any).__G.save.data.player.badges)).toEqual(['boulder', 'cascade', 'thunder']);
  expect(await page.evaluate(() => (window as any).__G.save.data.player.money)).toBe(beforeBattle + 2000);
  expect(errors).toEqual([]);
});
