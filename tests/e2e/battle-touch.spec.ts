import { test, expect } from '@playwright/test';
import { defaultSave } from '../../src/core/save';

test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });

test('one-second touches never click battle commands revealed below a dialog', async ({ page }, info) => {
  test.skip(info.project.name !== 'landscape', 'Explicit mobile viewport is tested once.');
  const save = defaultSave();
  save.flags = { intro_done: true, got_starter: true, got_dex: true };
  save.party = [{ uid: 'touch', speciesId: 25, level: 50, exp: 0, hp: 168, maxHp: 168, friendship: 70, caughtAt: '' }];
  save.bag.pokeball = 5;
  save.learn.parent.ttsQuestions = false;
  save.learn.parent.subjects.english = false;
  await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
  await page.goto('/?debug=1');
  await page.getByRole('button', { name: '이어서 하기', exact: true }).tap();
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; void (window as any).__G.world.startWildBattle('route1'); });
  const fight = page.getByRole('button', { name: '싸운다', exact: true });
  const ball = page.getByRole('button', { name: '몬스터볼', exact: true });
  await expect(fight).toBeVisible();
  const box = (await ball.boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.evaluate(() => {
    (window as any).__TEST__.fastText = false;
    (window as any).__G.save.data.settings.textSpeed = 'fast';
    void (window as any).__G.ui.say('다음 공격을 골라 주세요.');
  });
  await expect(page.locator('.dlg-arrow.show')).toBeVisible();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await page.waitForTimeout(1000);
  await expect(page.locator('.dlg-root')).toBeVisible(); // Nothing disappears while the finger is down.
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('.dlg-root')).toBeHidden();
  await expect(fight).toBeVisible();
  await expect(page.locator('.qc-card')).toHaveCount(0);

  // Emulate a compatibility click retargeted after an automatic dialog transition.
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; void (window as any).__G.ui.say('힘내자!', { auto: true }); });
  await expect(page.locator('.dlg-root')).toBeVisible();
  await page.locator('.dlg-box').dispatchEvent('pointerdown', { pointerId: 9, pointerType: 'touch', isPrimary: true });
  await expect(page.locator('.dlg-root')).toBeHidden();
  await page.waitForTimeout(1000);
  await ball.dispatchEvent('pointerup', { pointerId: 9, pointerType: 'touch', isPrimary: true });
  await ball.dispatchEvent('click', { detail: 1 });
  await expect(fight).toBeVisible();
  await expect(page.locator('.qc-card')).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).__G.save.data.bag.pokeball)).toBe(5);
  // A new intentional gesture still opens a fight question.
  await fight.tap();
  await page.locator('.battle-moves button').first().tap();
  await expect(page.locator('.qc-card')).toBeVisible();
});
