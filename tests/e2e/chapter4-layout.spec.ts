import { test, expect } from '@playwright/test';
import { defaultSave } from '../../src/core/save';

for (const [width, height] of [[1024, 768], [768, 1024], [1280, 800], [820, 1180], [375, 667]]) {
  test(`chapter 4 maps and badge fit ${width}x${height}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'landscape', 'Each explicit viewport is checked once.');
    await page.setViewportSize({ width, height });
    const save = defaultSave();
    save.flags = { intro_done: true, badge_boulder: true, badge_cascade: true, badge_thunder: true,
      chapter4_oak_called: true, lavender_arrived: true, celadon_arrived: true,
      garden_letter_received: true, celadon_garden_helped: true, celadon_gym_open: true };
    save.player.badges = ['boulder', 'cascade', 'thunder', 'rainbow'];
    save.pos = { map: 'celadon', x: 11, y: 12, facing: 'down' };
    await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('/?debug=1');
    await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
    const shot = async (name: string) => {
      await page.screenshot({ animations: 'disabled', path: `test-results/chapter4-screens/${width}x${height}-${name}.png` });
      expect(await page.evaluate(() => {
        const stage = document.getElementById('stage')!.getBoundingClientRect();
        const panels = [...document.querySelectorAll<HTMLElement>('.game-screen:not([hidden]), .battle-screen, .dlg-root')].filter(e => e.offsetParent !== null);
        return { page: document.documentElement.scrollWidth > innerWidth,
          stage: stage.left < -1 || stage.right > innerWidth + 1 || stage.top < -1 || stage.bottom > innerHeight + 1,
          panel: panels.some(e => e.scrollWidth > e.clientWidth + 2 || e.getBoundingClientRect().right > innerWidth + 1) };
      }), name).toEqual({ page: false, stage: false, panel: false });
    };
    await shot('celadon');
    await page.evaluate(async () => { await (window as any).__G.world.teleport('rock_tunnel_1f', 11, 12); });
    await shot('tunnel');
    await page.evaluate(async () => { await (window as any).__G.world.teleport('lavender', 11, 12); });
    await shot('lavender');
    await page.evaluate(async () => { await (window as any).__G.world.teleport('celadon_garden', 5, 7); });
    await shot('garden');
    await page.evaluate(async () => { await (window as any).__G.world.teleport('celadon_gym', 5, 7); });
    await shot('gym');
    await page.evaluate(() => { void (window as any).__G.ui.showBadge('rainbow'); });
    await expect(page.getByRole('dialog', { name: '무지개배지를 받았어요!' })).toBeVisible();
    await shot('badge');
    await page.getByRole('button', { name: '모험 계속하기' }).click();
    expect(errors).toEqual([]);
  });
}
