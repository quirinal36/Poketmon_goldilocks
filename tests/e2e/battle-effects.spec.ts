import { test, expect } from '@playwright/test';
import { defaultSave } from '../../src/core/save';

test('choose learned moves, lunge at the enemy, throw a ball and show escape or capture', async ({ page }) => {
  const save = defaultSave();
  save.flags = { intro_done: true, got_starter: true, got_dex: true };
  save.party = [{ uid: 'effects', speciesId: 25, level: 30, exp: 0, hp: 108, maxHp: 108, friendship: 70, caughtAt: '' }];
  save.bag.pokeball = 5; save.learn.parent.ttsQuestions = false;
  await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
  await page.goto('/?debug=1');
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await page.evaluate(() => {
    const w = window as any; w.__TEST__.fastText = true; w.__TEST__.autoAnswer = 'correct';
    w.__G.audio.setVolumes(0, 0); w.__phases = []; w.__motions = [];
    const animate = HTMLElement.prototype.animate;
    HTMLElement.prototype.animate = function(frames, options) {
      w.__motions.push({ target: this.className, frames }); return animate.call(this, frames, options);
    };
    new MutationObserver(records => {
      for (const record of records) if (record.attributeName === 'data-phase') {
        const root = record.target as HTMLElement;
        w.__phases.push({ phase: root.dataset.phase, ball: !!root.querySelector('.battle-ball'), hidden: (root.querySelector('.enemy-sprite') as HTMLElement)?.style.visibility === 'hidden' });
      }
    }).observe(document.getElementById('layer-screen')!, { subtree: true, attributes: true, attributeFilter: ['data-phase'] });
    void w.__G.battle.wild(19, 5);
  });
  const fight = page.getByRole('button', { name: '싸운다', exact: true });
  await fight.click();
  await expect(page.locator('.battle-moves button')).toHaveCount(5);
  await expect(page.getByRole('button', { name: '10만볼트 · 전기', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(fight).toBeVisible();
  await fight.click(); await page.getByRole('button', { name: '전광석화 · 노말', exact: true }).click();
  await expect(fight).toBeVisible();
  const motions = await page.evaluate(() => (window as any).__motions);
  expect(motions.some((m: any) => m.target === 'ally-sprite' && m.frames.some((f: any) => f.transform?.includes('translate(30px')))).toBe(true);
  expect(motions.some((m: any) => m.target === 'enemy-sprite' && m.frames.some((f: any) => f.opacity === .4))).toBe(true);
  // Start with full enemy HP so a normal high roll exercises the breakout branch.
  await page.getByRole('button', { name: '도망간다', exact: true }).click();
  await expect(page.locator('.battle-screen')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => (window as any).__G.world.isLocked())).toBe(false);
  await page.evaluate(() => { void (window as any).__G.battle.wild(19, 5); });
  await expect(fight).toBeVisible();
  await page.evaluate(() => { (window as any).__TEST__.fastText = false; Math.random = () => .95; });
  await page.getByRole('button', { name: '몬스터볼', exact: true }).click();
  await expect(page.locator('.battle-screen[data-phase="shake"] .battle-ball')).toBeVisible();
  await expect(page.locator('.enemy-sprite')).toBeHidden();
  await page.screenshot({ path: `test-results/ball-shake-${test.info().project.name}.png` });
  await expect(page.locator('.battle-screen[data-phase="breakout"] .battle-ball.is-open')).toBeVisible();
  await expect(page.locator('.enemy-sprite')).toBeVisible();
  await expect(page.locator('.battle-ball.is-open .ball-top')).toHaveCSS('opacity', '0');
  await expect(page.locator('.dlg-arrow.show')).toBeVisible(); await page.keyboard.press('Enter');
  await expect(fight).toBeVisible();
  await page.evaluate(() => { (window as any).__TEST__.fastText = true; Math.random = () => 0; });
  await page.getByRole('button', { name: '몬스터볼', exact: true }).click();
  await expect(page.locator('.battle-screen')).toHaveCount(0);
  const phases = await page.evaluate(() => (window as any).__phases);
  for (const phase of ['attack', 'hit', 'throw', 'absorb', 'shake', 'breakout', 'caught']) expect(phases.some((p: any) => p.phase === phase)).toBe(true);
  expect(phases.some((p: any) => p.phase === 'shake' && p.ball && p.hidden)).toBe(true);
  expect(await page.evaluate(() => (window as any).__G.save.data.stats.caught)).toBe(1);
  expect(await page.evaluate(() => (window as any).__G.save.data.party.at(-1).nickname)).toBeUndefined();
  expect(await page.evaluate(() => (window as any).__G.save.data.bag.pokeball)).toBe(3);
});

test('reduced motion still completes a capture without moving sprites', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const save = defaultSave();
  save.flags = { intro_done: true, got_starter: true, got_dex: true };
  save.party = [{ uid: 'reduced', speciesId: 25, level: 5, exp: 0, hp: 33, maxHp: 33, friendship: 70, caughtAt: '' }];
  save.bag.pokeball = 2; save.learn.parent.ttsQuestions = false;
  await page.addInitScript(data => localStorage.setItem('pokestudy.save.v1', JSON.stringify(data)), save);
  await page.goto('/?debug=1'); await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await page.evaluate(() => {
    const w = window as any; w.__TEST__.fastText = true; w.__TEST__.autoAnswer = 'correct'; Math.random = () => 0;
    w.__animations = 0;
    const animate = HTMLElement.prototype.animate;
    HTMLElement.prototype.animate = function(frames, options) { w.__animations++; return animate.call(this, frames, options); };
    void w.__G.battle.wild(19, 5);
  });
  await page.getByRole('button', { name: '몬스터볼', exact: true }).click();
  await expect(page.locator('.battle-screen')).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).__animations)).toBe(0);
  expect(await page.evaluate(() => (window as any).__G.save.data.stats.caught)).toBe(1);
  expect(await page.evaluate(() => (window as any).__G.save.data.party.at(-1).nickname)).toBeUndefined();
});
