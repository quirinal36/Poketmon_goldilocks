import { test, expect, type Page } from '@playwright/test';

async function ready(page: Page) {
  await page.goto('/?debug=1');
  await expect(page.getByRole('button', { name: '새로 시작', exact: true })).toBeVisible();
  await page.evaluate(() => {
    const w = window as any;
    w.__TEST__.fastText = true; w.__TEST__.autoAnswer = 'correct'; Math.random = () => .5;
    w.__G.save.data.learn.parent.ttsQuestions = false;
    w.__G.audio.setVolumes(0, 0);
  });
}
async function newGame(page: Page) {
  await page.getByRole('button', { name: '새로 시작', exact: true }).click();
  await page.getByRole('button', { name: '이 모습으로 결정' }).click();
  await page.getByRole('button', { name: '결정', exact: true }).click();
  await page.getByRole('button', { name: '결정', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__G.save.flag('intro_done'))).toBe(true);
  await page.evaluate(() => { const g = (window as any).__G; g.save.data.learn.parent.ttsQuestions = false; });
}
async function warp(page: Page, map: string, x = 5, y = 6) {
  await page.evaluate(async ({ map, x, y }) => { await (window as any).__G.world.teleport(map, x, y); }, { map, x, y });
}
async function script(page: Page, id: string) {
  await page.evaluate(id => { void (window as any).__G.world.runScript(id); }, id);
}
async function fight(page: Page, until: () => Promise<boolean>) {
  for (let i = 0; i < 40; i++) {
    if (await until()) return;
    const fight = page.getByRole('button', { name: '싸운다', exact: true });
    const badge = page.getByRole('button', { name: '모험 계속하기' });
    if (await badge.isVisible()) await badge.click();
    else if (await fight.isVisible()) { await fight.click(); await page.locator('.battle-moves button').first().click(); }
    await page.waitForTimeout(350);
  }
  await expect.poll(until).toBe(true);
}

// Dialogs/questions use the documented debug acceleration; commands and selections use real DOM input.
test('new adventure, starter, rival, catch, study, badge, restore and whiteout', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
  await ready(page); await newGame(page);
  // Actual keyboard movement and stair warp from the bedroom.
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(450); await page.keyboard.up('ArrowRight');
  expect(await page.evaluate(() => (window as any).__G.world.getPlayerPos().x)).toBeGreaterThan(4);
  await warp(page, 'pallet', 11, 2);
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(400); await page.keyboard.up('ArrowUp');
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.mapId)).toBe('oak_lab');
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  await script(page, 'pallet_starter');
  await page.getByRole('button', { name: /피카츄 · 전기/ }).click();
  await page.getByRole('button', { name: /▶\s*예$/ }).click();
  await page.getByRole('button', { name: /▶\s*아니오$/ }).click();
  await fight(page, () => page.evaluate(() => (window as any).__G.save.flag('got_dex')));
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  expect(await page.evaluate(() => (window as any).__G.save.data.bag.pokeball)).toBe(5);
  await warp(page, 'route1', 11, 11);
  await script(page, 'route1_tip');
  await page.evaluate(() => { void (window as any).__G.world.startWildBattle('route1'); });
  await page.getByRole('button', { name: '싸운다', exact: true }).click(); await page.locator('.battle-moves button').first().click();
  await expect(page.getByRole('button', { name: '싸운다', exact: true })).toBeVisible();
  // A second attack is only needed when the first roll left >50% HP.
  const hp = await page.locator('.enemy-status progress').getAttribute('value');
  const max = await page.locator('.enemy-status progress').getAttribute('max');
  if (Number(hp) > Number(max) / 2) { await page.getByRole('button', { name: '싸운다', exact: true }).click(); await page.locator('.battle-moves button').first().click(); }
  await page.getByRole('button', { name: '몬스터볼', exact: true }).click();
  await page.getByRole('button', { name: /▶\s*아니오$/ }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__G.save.data.stats.caught)).toBe(1);
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  // Region arrival/nurse/fishing scripts run on the actual region maps.
  await warp(page, 'viridian', 11, 20); await warp(page, 'viridian_center');
  await script(page, 'nurse'); await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  await warp(page, 'route22', 10, 8); await script(page, 'viridian_rod');
  await expect.poll(() => page.evaluate(() => (window as any).__G.save.flag('got_rod'))).toBe(true);
  await warp(page, 'route2', 11, 20); await warp(page, 'forest', 11, 20); await warp(page, 'pewter', 11, 20); await warp(page, 'pewter_gym');
  await script(page, 'pewter_leader'); await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  expect(await page.locator('.battle-screen').count()).toBe(0);
  // Earn stamps through real question cards, never by assigning completed lessons/stamps.
  await page.evaluate(async () => {
    const g = (window as any).__G; g.save.data.learn.parent.pace = 0;
    while (g.learn.stage() < 4) await g.learn.quiz({ purpose: 'practice' });
  });
  await script(page, 'pewter_leader');
  await fight(page, () => page.evaluate(() => (window as any).__G.save.flag('badge_boulder')));
  await page.getByRole('button', { name: '모험 계속하기' }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  expect(await page.evaluate(() => (window as any).__G.save.flag('route3_open'))).toBe(true);
  await warp(page, 'pewter', 22, 12);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(700); await page.keyboard.up('ArrowRight');
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.mapId)).toBe('route3');
  await page.screenshot({ path: `test-results/badge-${test.info().project.name}.png` });
  await page.reload();
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__G.save.flag('badge_boulder'))).toBe(true);
  await page.evaluate(() => {
    const w = window as any; w.__TEST__.fastText = true; w.__TEST__.autoAnswer = 'wrong';
    w.__G.save.data.learn.parent.ttsQuestions = false;
    w.__G.save.data.party.forEach((p: any) => { p.hp = 0; }); w.__G.save.data.party[0].hp = 1;
    void w.__G.world.startWildBattle('route3');
  });
  await fight(page, () => page.evaluate(() => (window as any).__G.world.mapId === 'viridian_center'));
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  expect(await page.evaluate(() => (window as any).__G.save.data.party.every((p: any) => p.hp === p.maxHp))).toBe(true);
  await page.evaluate(() => { void (window as any).__G.world.startWildBattle('route1'); });
  await page.getByRole('button', { name: '도망간다', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  expect(errors).toEqual([]);
});
