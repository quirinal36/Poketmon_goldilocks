import { expect, test, vi } from 'vitest';
import { buildMath } from '../../scripts/questions/math.mjs';
import { rng } from '../../scripts/questions/lib.mjs';
import { G } from '../../src/game.ts';
import { generateFallbackQuestion, mergeCurriculum, QuestionBank } from '../../src/learn/bank.ts';
import { applyAnswer, currentLesson, defaultLearnState, stageOf } from '../../src/learn/progress.ts';
import { chooseLesson } from '../../src/learn/picker.ts';

const math = buildMath(), cur = { version: 'math-arithmetic', ...math };
function check(q, level) {
  expect(q.visual.kind).toBe('text');
  const [aText, op, bText] = q.visual.text.split(' = ')[0].split(' ');
  const a = Number(aText), b = Number(bText === '□' ? q.answer : bText);
  const value = op === '+' ? a + b : op === '-' ? a - b : a * b;
  const answer = q.answerMode === 'choice' ? q.choices.find(c => c.id === q.answer).text : q.answer;
  expect(Number(answer)).toBe(bText === '□' ? b : value);
  expect(b).toBeGreaterThan(0); expect(b).toBeLessThanOrEqual(9);
  if (level === 0) {
    expect(a).toBeLessThanOrEqual(9); expect(['+', '-']).toContain(op);
    expect(value).toBeGreaterThan(0); expect(value).toBeLessThan(10);
  } else if (level === 1) {
    expect(op).toBe('+'); expect(a).toBeLessThanOrEqual(9); expect(value).toBeGreaterThan(10);
  } else if (level === 2) {
    expect(op).toBe('-'); expect(a).toBeGreaterThan(10); expect(value).toBeGreaterThan(0); expect(value).toBeLessThan(10);
  } else {
    expect(op).toBe('×'); expect(level === 3 ? [2, 3] : level === 4 ? [4, 5] : [level + 1]).toContain(a);
  }
}

test('all nine stages are deterministic, satisfy exact boundaries, and progress without skipping', () => {
  expect(buildMath()).toEqual(math);
  const state = defaultLearnState('2026-10-02');
  state.parent.pace = 0;
  // Historical stamps survive, but an old counting lesson cannot complete new arithmetic.
  state.subjects.math.completed['m11-u1-l1'] = { at: '2026-10-01', correct: 8, total: 8 };
  for (const lesson of math.lessons) {
    expect(currentLesson(state, cur, 'math')?.id).toBe(lesson.id);
    const level = math.units.find(u => u.id === lesson.unitId).order - 1;
    const questions = math.questions.filter(q => q.lessonId === lesson.id);
    expect(questions).toHaveLength(24);
    questions.forEach(q => check(q, level));
    const env = { state, cur, today: '2026-10-02', now: Date.now(), rand: () => 0.5 };
    const source = chooseLesson(env, { purpose: 'wild' }, 'math');
    expect(math.lessons.find(l => l.id === source.lessonId).order).toBeLessThanOrEqual(lesson.order);
    for (const q of questions.slice(0, lesson.requiredCorrect)) applyAnswer(state, cur, q,
      { questionId: q.id, correct: true, firstTry: true, attempts: 1, elapsedMs: 1 }, 'wild', new Date('2026-10-02T12:00:00+09:00'));
  }
  expect(currentLesson(state, cur, 'math')).toBeNull();
  expect(stageOf(state)).toBe(28);
});

test('missing-data fallback obeys every stage and retains its lesson for progress', () => {
  const rand = rng(123);
  for (let level = 0; level <= 8; level++) for (let i = 0; i < 100; i++) {
    const q = generateFallbackQuestion(rand, 'wild', level, 'm22-u109-l1');
    expect(q.lessonId).toBe('m22-u109-l1'); check(q, level);
  }
  check(generateFallbackQuestion(rand, 'tutorial', 8), 0);
});

test('online accounts keep bundled math while English overrides still work', async () => {
  const oldNet = G.net;
  const english = { ...math.lessons[0], id: 'e11-u1-l1', subject: 'english' };
  const merged = mergeCurriculum(cur, { units: [{ ...math.units[0], title: 'old math' }], lessons: [{ ...math.lessons[0], title: 'old math' }, english] });
  expect(merged.lessons.filter(l => l.subject === 'math')).toEqual(math.lessons);
  expect(merged.lessons).toContainEqual(english);
  const remote = { ...math.questions[0], prompt: 'count fruit' };
  G.net = { online: true, fetchQuestions: vi.fn(async () => [remote]) };
  vi.stubGlobal('document', { baseURI: 'http://localhost/' });
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => math.questions })));
  try {
    const bank = new QuestionBank(() => merged);
    expect(await bank.forLesson(math.lessons[0].id)).toEqual(math.questions.filter(q => q.lessonId === math.lessons[0].id));
    expect(G.net.fetchQuestions).not.toHaveBeenCalled();
    await bank.loadKey('e11'); expect(G.net.fetchQuestions).toHaveBeenCalled();
  } finally { G.net = oldNet; vi.unstubAllGlobals(); }
});
