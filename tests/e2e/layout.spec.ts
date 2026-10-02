import { test, expect, type Page } from '@playwright/test';
import { defaultSave } from '../../src/core/save';

const sizes = [[1024,768],[768,1024],[1280,800],[820,1180],[375,667]];
for (const [width,height] of sizes) test(`10 screens fit ${width}x${height}`, async ({ page }, info) => {
  test.skip(info.project.name !== 'landscape', 'Each explicit viewport is tested once.');
  await page.setViewportSize({ width, height });
  const save = defaultSave(); save.flags = { intro_done: true, got_starter: true, got_dex: true }; save.bag = { pokeball: 5, potion: 2, dex: 1, stamp_card: 1 };
  save.party = [{ uid: 'visual', speciesId: 25, level: 5, exp: 0, hp: 33, maxHp: 33, friendship: 70, caughtAt: '' }];
  save.dex = { seen: [1, 25, 158], caught: [25] }; save.learn.parent.ttsQuestions = false;
  await page.addInitScript(save => localStorage.setItem('pokestudy.save.v1', JSON.stringify(save)), save);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/?debug=1');
  await expect(page.getByRole('button', { name: '이어서 하기', exact: true })).toBeVisible();
  async function shot(name: string) {
    await page.screenshot({ animations: 'disabled', path: `test-results/screens/${width}x${height}-${name}.png` });
    const overflow = await page.evaluate(() => {
      const rect = document.getElementById('stage')!.getBoundingClientRect();
      const panels = [...document.querySelectorAll<HTMLElement>('.game-screen:not([hidden]), .qc-card')].filter(e => e.getBoundingClientRect().width);
      return { page: document.documentElement.scrollWidth > innerWidth, stage: rect.left < -1 || rect.right > innerWidth + 1 || rect.top < -1 || rect.bottom > innerHeight + 1,
        panels: panels.some(e => e.scrollWidth > e.clientWidth + 2 || e.getBoundingClientRect().right > innerWidth + 1) };
    });
    expect(overflow, name).toEqual({ page: false, stage: false, panels: false });
    const smallTargets = await page.evaluate(() => [...document.querySelectorAll<HTMLButtonElement>('.game-screen:not([hidden]) button, .qc-card button, .battle-screen button')]
      .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 56 || r.height < 56); })
      .map(e => e.className || e.textContent?.trim()));
    expect(smallTargets, `${name} touch targets`).toEqual([]);
    if (name === 'battle' || name === 'moves') {
      const bounds = await page.locator('.battle-screen').evaluate(e => ({ height: e.clientHeight, content: e.scrollHeight }));
      expect(bounds.content).toBeLessThanOrEqual(bounds.height + 1);
      for (const [sprite, status] of [['.enemy-sprite', '.enemy-status'], ['.ally-sprite', '.ally-status']]) {
        const rects = await page.locator('.battle-arena').evaluate((arena, selectors) => {
          const sprite = arena.querySelector(selectors[0] + ' .pokemon-sprite')!.getBoundingClientRect();
          const status = arena.querySelector(selectors[1])!.getBoundingClientRect();
          const bounds = arena.getBoundingClientRect();
          return { size: sprite.width, fits: sprite.left >= bounds.left && sprite.right <= bounds.right + 1 && sprite.top >= bounds.top && sprite.bottom <= bounds.bottom + 1,
            overlaps: sprite.left < status.right && sprite.right > status.left && sprite.top < status.bottom && sprite.bottom > status.top };
        }, [sprite, status]);
        expect(rects.size).toBeGreaterThanOrEqual(112);
        expect(rects.fits).toBe(true); expect(rects.overlaps).toBe(false);
      }
    }
  }
  await shot('title');
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await page.waitForTimeout(250); await shot('world');
  await page.evaluate(() => { void (window as any).__G.ui.say('오늘도 친구와 함께 모험해 볼까요?', { portrait: 'oak', speaker: '오박사' }); });
  await page.waitForTimeout(1300); await shot('dialog');
  await page.keyboard.press('Enter'); await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  for (const [name, fn] of [['dex','openPokedex'],['party','openParty'],['bag','openBag'],['daily','openDailyPlan']] as const) {
    await page.evaluate(fn => { void (window as any).__G.ui[fn](); }, fn);
    await expect(page.getByRole('button', { name: '닫기', exact: true })).toBeVisible(); await shot(name);
    await page.getByRole('button', { name: '닫기', exact: true }).click();
  }
  await page.evaluate(() => { void (window as any).__G.ui.openParentArea(); });
  const question = await page.getByRole('dialog', { name: '보호자 확인' }).locator('p').first().textContent();
  const [a,b] = question!.match(/\d+/g)!.map(Number);
  await page.getByRole('textbox').fill(String(a*b)); await page.getByRole('button', { name: '확인', exact: true }).click();
  await expect(page.getByRole('heading', { name: '보호자 메뉴', exact: true })).toBeVisible(); await shot('parent');
  await page.getByRole('button', { name: '닫기', exact: true }).click();
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; void (window as any).__G.world.startWildBattle('route1'); });
  await expect(page.getByRole('button', { name: '싸운다', exact: true })).toBeVisible(); await shot('battle');
  await page.evaluate(() => { (window as any).__G.save.data.party[0].level = 50; });
  await page.getByRole('button', { name: '싸운다', exact: true }).click(); await shot('moves');
  await page.locator('.battle-moves button').first().click();
  await expect(page.locator('.qc-card')).toBeVisible(); await page.waitForTimeout(300); await shot('question');
  expect(errors).toEqual([]);
});
