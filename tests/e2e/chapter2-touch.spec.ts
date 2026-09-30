import { test, expect } from '@playwright/test';
import { defaultSave } from '../../src/core/save';

test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });

test('touch pad enters the cave and touch choice accepts the researcher request', async ({ page }) => {
  const save = defaultSave();
  save.flags = { intro_done: true, got_starter: true, got_dex: true, badge_boulder: true, route3_open: true };
  save.player.badges = ['boulder'];
  save.party = [{ uid: 'starter', speciesId: 25, level: 20, exp: 0, hp: 78, maxHp: 78, caughtAt: '', caughtArea: 'starter', friendship: 70 }];
  save.pos = { map: 'route3', x: 22, y: 12, facing: 'right' };
  await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
  await page.goto('/?debug=1');
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).tap();
  const right = (await page.locator('.dpad-cap.right').boundingBox())!;
  const tapRight = () => page.touchscreen.tap(right.x + right.width / 2, right.y + right.height / 2);
  await tapRight();
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.getPlayerPos().x)).toBe(23);
  await page.waitForTimeout(300); // let the first tile's walking animation finish
  await tapRight();
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.mapId)).toBe('mt_moon_front');
  await page.getByRole('button', { name: /가 볼게요/ }).tap();
  await expect.poll(() => page.evaluate(() => (window as any).__G.save.flag('researcher_asked'))).toBe(true);
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  await page.evaluate(async () => {
    (window as any).__TEST__.fastText = false;
    await (window as any).__G.world.teleport('mt_moon_front', 4, 11, 'up');
  });
  await page.getByRole('button', { name: 'A', exact: true }).tap();
  await expect(page.locator('.dlg-root')).toBeVisible();
});
