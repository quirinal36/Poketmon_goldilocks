import { test, expect } from '@playwright/test';
import { defaultSave } from '../../src/core/save';

test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });

test('touch pad enters the new north road and accepts Bill’s request', async ({ page }) => {
  const save = defaultSave();
  save.flags = { intro_done: true, badge_boulder: true, badge_cascade: true, chapter2_complete: true, chapter3_oak_called: true };
  save.player.badges = ['boulder', 'cascade'];
  save.pos = { map: 'cerulean', x: 11, y: 2, facing: 'up' };
  await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
  await page.goto('/?debug=1');
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).tap();
  const up = (await page.locator('.dpad-cap.up').boundingBox())!;
  const tapUp = () => page.touchscreen.tap(up.x + up.width / 2, up.y + up.height / 2);
  await tapUp();
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.getPlayerPos().y)).toBe(1);
  await page.waitForTimeout(300);
  await tapUp();
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.getPlayerPos().y)).toBe(0);
  await page.waitForTimeout(300);
  await tapUp();
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.mapId)).toBe('route24');
  await page.evaluate(async () => { await (window as any).__G.world.teleport('bill_house', 5, 3, 'up'); });
  await page.getByRole('button', { name: 'A', exact: true }).tap();
  await page.getByRole('button', { name: /예/ }).tap();
  await expect.poll(() => page.evaluate(() => (window as any).__G.save.flag('bill_asked'))).toBe(true);
});
