import { test, expect } from '@playwright/test';
import { defaultSave } from '../../src/core/save';

for (const [width, height] of [[1024, 768], [768, 1024], [1280, 800], [820, 1180], [375, 667]]) {
  test(`chapter 3 maps and badge fit ${width}x${height}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'landscape', 'Each explicit viewport is checked once.');
    await page.setViewportSize({ width, height });
    const save = defaultSave();
    save.flags = { intro_done: true, badge_boulder: true, badge_cascade: true, chapter2_complete: true,
      chapter3_oak_called: true, bill_asked: true, bill_light_checked: true, bill_connection_checked: true,
      bill_helped: true, ss_ticket_received: true, ss_parcel_received: true, captain_helped: true, vermilion_gym_open: true };
    save.player.badges = ['boulder', 'cascade', 'thunder'];
    save.pos = { map: 'vermilion', x: 11, y: 12, facing: 'down' };
    await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('/?debug=1');
    await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
    const shot = async (name: string) => {
      await page.screenshot({ animations: 'disabled', path: `test-results/chapter3-screens/${width}x${height}-${name}.png` });
      expect(await page.evaluate(() => {
        const stage = document.getElementById('stage')!.getBoundingClientRect();
        const panels = [...document.querySelectorAll<HTMLElement>('.game-screen:not([hidden]), .battle-screen, .dlg-root')].filter(e => e.offsetParent !== null);
        return { page: document.documentElement.scrollWidth > innerWidth,
          stage: stage.left < -1 || stage.right > innerWidth + 1 || stage.top < -1 || stage.bottom > innerHeight + 1,
          panel: panels.some(e => e.scrollWidth > e.clientWidth + 2 || e.getBoundingClientRect().right > innerWidth + 1) };
      }), name).toEqual({ page: false, stage: false, panel: false });
    };
    await shot('vermilion');
    await page.evaluate(async () => { await (window as any).__G.world.teleport('route24', 11, 11); });
    await shot('bridge');
    await page.evaluate(async () => { await (window as any).__G.world.teleport('ss_anne_deck', 5, 7); });
    await shot('ship');
    await page.evaluate(async () => { await (window as any).__G.world.teleport('vermilion_gym', 5, 7); });
    await shot('gym');
    await page.evaluate(() => { void (window as any).__G.ui.showBadge('thunder'); });
    await expect(page.getByRole('dialog', { name: '오렌지배지를 받았어요!' })).toBeVisible();
    await shot('badge');
    await page.getByRole('button', { name: '모험 계속하기' }).click();
    expect(errors).toEqual([]);
  });
}
