// Run with: node test-snake.cjs
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const assert = require('node:assert/strict');
const elements = new Map();
const context = new Proxy({}, { get: () => () => {} });
const document = {
  getElementById(id) {
    if (!elements.has(id)) elements.set(id, { getContext: () => context });
    return elements.get(id);
  },
  querySelectorAll: () => [],
  addEventListener() {},
};
const source = readFileSync(`${__dirname}/index.html`, 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
runInNewContext(source + `
  start(); turn('left'); tick();
  assert.equal(snake[0].x, 9, 'Cannot reverse');
  turn('up'); turn('left'); tick();
  assert.equal(snake[0].y, 9, 'Only one turn per tick');
  food = { x: 9, y: 8 }; tick();
  assert.equal(score, 1); assert.equal(snake.length, 4);
  assert.ok(!snake.some(p => p.x === food.x && p.y === food.y));
  pause(); tick(); assert.equal(snake[0].y, 8);
  pause(); assert.equal(state, 'running');
  snake = [{ x: 0, y: 0 }]; direction = nextDirection = directions.left;
  tick(); assert.equal(state, 'over', 'Wall collision ends game');
  start();
  snake = [{x: 2,y: 2}, {x: 2,y: 3}, {x: 3,y: 3}, {x: 3,y: 2}];
  food = { x: 10, y: 10 }; tick();
  assert.equal(state, 'running', 'Moving into vacated tail is legal');
  snake = [{x: 2,y: 2}, {x: 3,y: 2}, {x: 3,y: 3}, {x: 2,y: 3}];
  tick(); assert.equal(state, 'over', 'Body collision ends game');
  start(); assert.equal(score, 0); assert.equal(snake.length, 3);
  snake = Array.from({length: 400}, (_, i) => ({x: i % 20, y: Math.floor(i / 20)}));
  assert.equal(placeFood(), undefined, 'Full board has no food slot');
`, { document, localStorage: { getItem() { throw Error('Unavailable'); }, setItem() { throw Error('Unavailable'); } }, setTimeout() {}, clearTimeout() {}, assert });
console.log('Snake checks passed.');
