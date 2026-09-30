import { test, expect } from '@playwright/test';
import { defaultSave } from '../../src/core/save';

for (const [width, height] of [[1024, 768], [768, 1024], [1280, 800], [820, 1180], [375, 667]]) {
  test(`chapter 2 maps and badge fit ${width}x${height}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'landscape', 'Each explicit viewport is checked once.');
    await page.setViewportSize({ width, height });
    const save = defaultSave();
    save.flags = { intro_done: true, got_starter: true, badge_boulder: true, route3_open: true, researcher_asked: true, rocket_won: true, notebook_returned: true, cerulean_arrived: true };
    save.player.badges = ['boulder', 'cascade'];
    save.party = [{ uid: 'visual', speciesId: 25, level: 20, exp: 0, hp: 78, maxHp: 78, friendship: 70, caughtAt: '', caughtArea: 'starter' }];
    save.pos = { map: 'cerulean', x: 11, y: 12, facing: 'down' };
    await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('/?debug=1');
    await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
    const shot = async (name: string) => {
      await page.screenshot({ animations: 'disabled', path: `test-results/chapter2-screens/${width}x${height}-${name}.png` });
      expect(await page.evaluate(() => {
        const stage = document.getElementById('stage')!.getBoundingClientRect();
        const panels = [...document.querySelectorAll<HTMLElement>('.game-screen:not([hidden]), .battle-screen, .dlg-root')].filter(e => e.offsetParent !== null);
        return { page: document.documentElement.scrollWidth > innerWidth,
          stage: stage.left < -1 || stage.right > innerWidth + 1 || stage.top < -1 || stage.bottom > innerHeight + 1,
          panel: panels.some(e => e.scrollWidth > e.clientWidth + 2 || e.getBoundingClientRect().right > innerWidth + 1) };
      }), name).toEqual({ page: false, stage: false, panel: false });
    };
    await shot('city');
    await page.evaluate(async () => { await (window as any).__G.world.teleport('mt_moon_front', 12, 12); });
    await shot('cave');
    await page.evaluate(async () => { await (window as any).__G.world.teleport('cerulean_gym', 5, 7); });
    await shot('gym');
    await page.evaluate(() => { void (window as any).__G.ui.showBadge('cascade'); });
    await expect(page.getByRole('dialog', { name: '블루배지를 받았어요!' })).toBeVisible();
    await shot('badge');
    await page.getByRole('button', { name: '모험 계속하기' }).click();
    await page.evaluate(() => { void (window as any).__G.ui.say('도장 8개를 모아요.', { speaker: '체육관 안내원' }); });
    await expect(page.locator('.dlg-root')).toBeVisible();
    await expect(page.locator('.dlg-box')).toContainText('모아요.');
    await shot('dialog');
    await page.keyboard.press('Enter');
    await expect(page.locator('.dlg-root')).toBeHidden();
    await page.evaluate(() => { (window as any).__TEST__.fastText = true; void (window as any).__G.battle.trainer('cerulean_swimmer'); });
    await expect(page.getByRole('button', { name: '싸운다', exact: true })).toBeVisible();
    await shot('battle');
    expect(errors).toEqual([]);
  });
}
