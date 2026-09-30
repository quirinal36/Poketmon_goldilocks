import { expect, test } from '@playwright/test';

test('recorded music switches by scene and resumes after a jingle', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__recordedStarts = 0;
    const create = AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function () {
      const source = create.call(this);
      const start = source.start.bind(source);
      source.start = (...args) => {
        if (source.buffer && source.buffer.duration > 40) (window as any).__recordedStarts++;
        return start(...args);
      };
      return source;
    };
  });

  await page.goto('/?debug=1');
  await page.waitForFunction(() => (window as any).__G?.audio);
  await page.mouse.click(2, 2);
  await page.evaluate(() => {
    (window as any).__G.audio.playMusic(null);
    (window as any).__recordedStarts = 0;
  });

  for (const [index, id] of ['title', 'route', 'forest', 'battle_wild'].entries()) {
    await page.evaluate(id => (window as any).__G.audio.playMusic(id), id);
    await expect.poll(() => page.evaluate(() => (window as any).__recordedStarts)).toBe(index + 1);
  }

  await page.evaluate(() => (window as any).__G.audio.jingle('heal'));
  await expect.poll(() => page.evaluate(() => (window as any).__recordedStarts)).toBe(5);
});

test('chip music plays when a recording cannot load', async ({ page }) => {
  await page.route('**/assets/audio/town.mp3', route => route.abort());
  await page.addInitScript(() => {
    (window as any).__chipStarts = 0;
    const create = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () {
      const source = create.call(this);
      const start = source.start.bind(source);
      source.start = (...args) => {
        (window as any).__chipStarts++;
        return start(...args);
      };
      return source;
    };
  });

  await page.goto('/?debug=1');
  await page.waitForFunction(() => (window as any).__G?.audio);
  await page.mouse.click(2, 2);
  await expect.poll(() => page.evaluate(() => (window as any).__chipStarts)).toBeGreaterThan(0);
});
