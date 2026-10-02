import { test, expect, type Page } from '@playwright/test';

async function stepAcross(page: Page, map: string, waitUnlock = true, direction = 'ArrowRight') {
  await page.keyboard.down(direction);
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.mapId), { timeout: 10000 }).toBe(map);
  await page.keyboard.up(direction);
  if (waitUnlock) await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
}

async function teleport(page: Page, map: string, x: number, y: number, facing = 'right') {
  await page.evaluate(async p => { await (window as any).__G.world.teleport(p.map, p.x, p.y, p.facing); }, { map, x, y, facing });
}

async function fight(page: Page, flag: string) {
  for (let i = 0; i < 50; i++) {
    if (await page.evaluate(flag => (window as any).__G.save.flag(flag), flag)) return;
    const attack = page.getByRole('button', { name: '싸운다', exact: true });
    if (await attack.isVisible()) { await attack.click(); await page.locator('.battle-moves button').first().click(); }
    else await page.waitForTimeout(100);
  }
  await expect.poll(() => page.evaluate(flag => (window as any).__G.save.flag(flag), flag)).toBe(true);
}

test('old first-badge save reaches Moon cave, Cerulean gym, and restores second badge', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    // Local Vite picks up the live Supabase URL; anonymous signup is disabled there, so guest play gets 422.
    if (message.type() === 'error' && !message.text().includes('status of 422')) errors.push(message.text());
  });
  await page.goto('/?debug=1');
  await expect(page.getByRole('button', { name: '새로 시작', exact: true })).toBeVisible();
  await page.evaluate(() => {
    const g = (window as any).__G, d = g.save.data;
    d.flags = { intro_done: true, got_starter: true, got_dex: true, badge_boulder: true, route3_open: true, starter_species: 25 };
    d.player.badges = ['boulder'];
    d.defeatedTrainers = ['leader_woong'];
    d.party = [{ uid: 'starter', speciesId: 25, level: 20, exp: 0, hp: 78, maxHp: 78, caughtAt: new Date().toISOString(), caughtArea: 'starter', friendship: 70 }];
    d.pos = { map: 'route3', x: 22, y: 12, facing: 'right' };
    d.learn.parent.pace = 0;
    d.learn.parent.subjects.english = false;
    d.learn.parent.ttsQuestions = false;
    for (const lesson of g.learn.curriculum().lessons.filter((l: any) => l.subject === 'math').slice(0, 4))
      d.learn.subjects.math.completed[lesson.id] = { at: new Date().toISOString(), correct: 8, total: 8 };
    g.save.write('first-badge-fixture');
  });
  await page.reload();
  await page.evaluate(() => {
    const w = window as any;
    w.__TEST__.fastText = true; w.__TEST__.autoAnswer = 'correct'; Math.random = () => .5;
    w.__G.audio.setVolumes(0, 0);
  });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  expect(await page.evaluate(() => (window as any).__G.learn.stage())).toBe(4);

  await stepAcross(page, 'mt_moon_front', false);
  await page.getByRole('button', { name: /가 볼게요/ }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__G.save.flag('researcher_asked'))).toBe(true);
  await teleport(page, 'mt_moon_front', 22, 12);
  await stepAcross(page, 'mt_moon_deep');
  await teleport(page, 'mt_moon_deep', 16, 12);
  await page.keyboard.press('Enter');
  await fight(page, 'notebook_returned');
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  expect(await page.evaluate(() => (window as any).__G.save.data.bag.potion)).toBe(3);
  await teleport(page, 'mt_moon_deep', 22, 12);
  await stepAcross(page, 'route4');
  await teleport(page, 'route4', 22, 12);
  await stepAcross(page, 'cerulean');
  await teleport(page, 'cerulean', 5, 19, 'up');
  await page.keyboard.down('ArrowUp');
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.mapId)).toBe('cerulean_gym');
  await page.keyboard.up('ArrowUp');
  await teleport(page, 'cerulean_gym', 5, 3, 'up');
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  expect(await page.locator('.battle-screen').count()).toBe(0);

  await page.evaluate(async () => {
    const g = (window as any).__G;
    while (g.learn.stage() < 7) await g.learn.quiz({ purpose: 'practice' });
  });
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  expect(await page.locator('.battle-screen').count()).toBe(0);
  await page.evaluate(async () => {
    const g = (window as any).__G;
    while (g.learn.stage() < 8) await g.learn.quiz({ purpose: 'practice' });
  });
  await page.keyboard.press('Enter');
  await fight(page, 'badge_cascade');
  // Close during the badge presentation: the win is durable, and the presentation resumes.
  await page.reload();
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: '블루배지를 받았어요!' })).toBeVisible();
  await page.getByRole('button', { name: '모험 계속하기' }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__G.save.flag('chapter2_complete'))).toBe(true);
  await page.reload();
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  expect(await page.evaluate(() => (window as any).__G.world.mapId)).toBe('cerulean_gym');
  expect(await page.evaluate(() => (window as any).__G.save.data.player.badges)).toEqual(['boulder', 'cascade']);
  expect(await page.evaluate(() => (window as any).__G.save.data.bag.potion)).toBe(3);
  await page.evaluate(() => { Math.random = () => .5; }); // Keep the return-path check about exits, not random wild battles.
  await teleport(page, 'cerulean', 1, 12, 'left');
  await stepAcross(page, 'route4', true, 'ArrowLeft');
  await teleport(page, 'route4', 1, 12, 'left');
  await stepAcross(page, 'mt_moon_deep', true, 'ArrowLeft');
  await teleport(page, 'mt_moon_deep', 1, 12, 'left');
  await stepAcross(page, 'mt_moon_front', true, 'ArrowLeft');
  await teleport(page, 'mt_moon_front', 1, 12, 'left');
  await stepAcross(page, 'route3', true, 'ArrowLeft');
  expect(errors).toEqual([]);
});

test('losing to Rocket returns to the researcher and keeps the encounter retryable', async ({ page }) => {
  await page.goto('/?debug=1');
  await page.evaluate(() => {
    const g = (window as any).__G, d = g.save.data;
    d.flags = { intro_done: true, got_starter: true, got_dex: true, badge_boulder: true, route3_open: true, researcher_asked: true, clefairy_seen: true };
    d.player.badges = ['boulder'];
    d.party = [{ uid: 'starter', speciesId: 25, level: 20, exp: 0, hp: 1, maxHp: 78, caughtAt: '', caughtArea: 'starter', friendship: 70 }];
    d.lastHeal = { map: 'mt_moon_front', x: 3, y: 12 };
    g.save.write('rocket-loss-fixture');
  });
  await page.reload();
  await page.evaluate(() => {
    const w = window as any;
    w.__TEST__.fastText = true; w.__TEST__.autoAnswer = 'wrong'; Math.random = () => .5;
    w.__G.save.data.learn.parent.ttsQuestions = false;
    w.__G.audio.setVolumes(0, 0);
  });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await teleport(page, 'mt_moon_deep', 16, 12);
  await page.evaluate(() => { void (window as any).__G.world.runScript('moon_rocket'); });
  await page.getByRole('button', { name: '싸운다', exact: true }).click(); await page.locator('.battle-moves button').first().click();
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.mapId)).toBe('mt_moon_front');
  expect(await page.evaluate(() => (window as any).__G.save.flag('rocket_won'))).toBe(false);
  expect(await page.evaluate(() => (window as any).__G.save.data.party[0].hp)).toBe(78);
  await page.evaluate(() => { (window as any).__TEST__.autoAnswer = 'correct'; });
  await teleport(page, 'mt_moon_deep', 16, 12);
  await page.evaluate(() => { void (window as any).__G.world.runScript('moon_rocket'); });
  await fight(page, 'notebook_returned');
  expect(await page.evaluate(() => (window as any).__G.save.data.defeatedTrainers.includes('moon_rocket'))).toBe(true);
});
