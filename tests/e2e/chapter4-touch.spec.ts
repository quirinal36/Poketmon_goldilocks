import { test, expect } from '@playwright/test';
import { defaultSave } from '../../src/core/save';

test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });

test('touch pad enters route 9 and A button talks to the gardener', async ({ page }) => {
  const save = defaultSave();
  save.flags = { intro_done: true, badge_boulder: true, badge_cascade: true, badge_thunder: true,
    chapter4_oak_called: true, garden_letter_received: true };
  save.player.badges = ['boulder', 'cascade', 'thunder'];
  save.pos = { map: 'cerulean', x: 21, y: 12, facing: 'right' };
  await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
  await page.goto('/?debug=1');
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; });
  await page.getByRole('button', { name: '이어서 하기', exact: true }).tap();
  const right = (await page.locator('.dpad-cap.right').boundingBox())!;
  const tapRight = () => page.touchscreen.tap(right.x + right.width / 2, right.y + right.height / 2);
  for (const x of [22, 23]) {
    await tapRight();
    await expect.poll(() => page.evaluate(() => (window as any).__G.world.getPlayerPos().x)).toBe(x);
    await page.waitForTimeout(300);
  }
  await tapRight();
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.mapId)).toBe('route9');
  await page.evaluate(async () => { await (window as any).__G.world.teleport('celadon_garden', 5, 3, 'up'); });
  await page.getByRole('button', { name: 'A', exact: true }).tap();
  await expect(page.locator('.dlg-root')).toContainText('씨앗상자');
});
