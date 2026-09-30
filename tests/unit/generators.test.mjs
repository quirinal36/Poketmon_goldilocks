import { test, expect } from 'vitest';
import { nearNumbers } from '../../scripts/questions/lib.mjs';
test('numeric distractors terminate at both bounds and with undersized domains', () => {
  expect(nearNumbers(() => 1, 9, 3, { min: 0, max: 9 })).toEqual([0, 1, 2]);
  expect(nearNumbers(() => 0, 0, 3, { min: 0, max: 9 })).toEqual([1, 2, 3]);
  expect(nearNumbers(() => 1, 1, 3, { min: 0, max: 1 })).toEqual([0]);
});
