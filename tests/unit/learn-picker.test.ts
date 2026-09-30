import { describe, expect, it } from 'vitest';
import type { CurriculumData, Lesson, Question, Unit } from '../../src/core/types';
import { rng } from '../../src/core/util';
import { chooseLesson, chooseSubject, pickQuestion, reviewWeight, type PickEnv } from '../../src/learn/picker';
import { applyAnswer, defaultLearnState, markStarted, setStartState } from '../../src/learn/progress';

function lesson(id: string, subject: 'math' | 'english', order: number, extra: Partial<Lesson> = {}): Lesson {
  const [k, u] = id.split('-');
  return { id, unitId: `${k}-${u}`, subject, grade: 1, semester: 1, lessonNo: order, title: id, goal: 'g', order, requiredCorrect: 3, ...extra };
}
const CUR: CurriculumData = {
  version: 't',
  units: [{ id: 'm11-u1', subject: 'math', grade: 1, semester: 1, unitNo: 1, title: 'u', order: 1 } as Unit, { id: 'e11-u1', subject: 'english', grade: 1, semester: 1, unitNo: 1, title: 'u', order: 1 } as Unit],
  lessons: [lesson('m11-u1-l1', 'math', 1), lesson('m11-u1-l2', 'math', 2), lesson('m11-u1-l3', 'math', 3, { isReview: true }), lesson('e11-u1-l1', 'english', 1), lesson('e11-u1-l2', 'english', 2)],
};
function qs(lessonId: string, n: number, diff: (i: number) => 1 | 2 | 3 | 4 | 5 = (i) => ((i % 3) + 1) as 1 | 2 | 3): Question[] {
  return Array.from({ length: n }, (_, i) => ({ id: `${lessonId}-${String(i + 1).padStart(3, '0')}`, lessonId, subject: lessonId.startsWith('m') ? 'math' : 'english', type: 't', prompt: 'p', answerMode: 'numpad', answer: '1', difficulty: diff(i) }) as Question);
}
const NOW = new Date(2026, 8, 30, 10).getTime();
function env(seed = 1, state = defaultLearnState('2026-09-30')): PickEnv {
  return { state, cur: CUR, today: '2026-09-30', now: NOW, rand: rng(seed) };
}
const ok = { questionId: 'x', correct: true, firstTry: true, attempts: 1, elapsedMs: 1 };
const bad = { questionId: 'x', correct: false, firstTry: false, attempts: 2, elapsedMs: 1 };

describe('chooseSubject', () => {
  it('honours explicit subject and parent toggles', () => {
    const e = env();
    expect(chooseSubject(e, { purpose: 'wild', subject: 'english' })).toBe('english');
    e.state.parent.subjects.english = false;
    expect(chooseSubject(e, { purpose: 'wild', subject: 'english' })).toBe('math');
    expect(chooseSubject(e, { purpose: 'wild' })).toBe('math');
  });
  it('prefers the subject whose today-lesson is still open, else alternates', () => {
    const e = env();
    // math done today (pace 1) → english is the open one
    markStarted(e.state, 'math', 'm11-u1-l1');
    for (let i = 0; i < 3; i++) applyAnswer(e.state, CUR, qs('m11-u1-l1', 3)[i], ok, 'wild', new Date(NOW));
    expect(chooseSubject(e, { purpose: 'wild' })).toBe('english');
    // both open → alternate against the last answered subject
    const f = env();
    applyAnswer(f.state, CUR, qs('m11-u1-l1', 1)[0], ok, 'wild', new Date(NOW));
    expect(chooseSubject(f, { purpose: 'wild' })).toBe('english');
    applyAnswer(f.state, CUR, qs('e11-u1-l1', 1)[0], ok, 'wild', new Date(NOW));
    expect(chooseSubject(f, { purpose: 'wild' })).toBe('math');
  });
  it('forced lessonId decides the subject', () => {
    expect(chooseSubject(env(), { purpose: 'practice', lessonId: 'e11-u1-l2' })).toBe('english');
  });
});

describe('chooseLesson', () => {
  it('uses the active lesson when nothing is completed yet', () => {
    expect(chooseLesson(env(), { purpose: 'wild' }, 'math')).toEqual({ lessonId: 'm11-u1-l1', mode: 'active', subject: 'math' });
  });
  it('splits ~70/30 between active and review when review exists', () => {
    const e = env(7);
    setStartState(e.state, CUR, 'math', 2, new Date(NOW)); // l1 preset-completed → review pool, l2 active
    let active = 0, review = 0;
    for (let i = 0; i < 2000; i++) {
      const s = chooseLesson(e, { purpose: 'wild' }, 'math');
      if (s.mode === 'active') { active++; expect(s.lessonId).toBe('m11-u1-l2'); }
      else { review++; expect(s.lessonId).toBe('m11-u1-l1'); }
    }
    expect(active / 2000).toBeGreaterThan(0.64);
    expect(active / 2000).toBeLessThan(0.76);
    expect(review).toBeGreaterThan(0);
  });
  it('review only when the next lesson is locked (pace exhausted)', () => {
    const e = env(3);
    markStarted(e.state, 'math', 'm11-u1-l1');
    for (const q of qs('m11-u1-l1', 3)) applyAnswer(e.state, CUR, q, ok, 'wild', new Date(NOW));
    for (let i = 0; i < 50; i++) expect(chooseLesson(e, { purpose: 'wild' }, 'math')).toMatchObject({ mode: 'review', lessonId: 'm11-u1-l1' });
  });
  it('review weight = wrong×3 + staleness; weak lessons picked more often', () => {
    const e = env(5);
    setStartState(e.state, CUR, 'math', 3, new Date(NOW));
    // lesson 1: many wrong answers; lesson 2: none. Both same staleness.
    for (const q of qs('m11-u1-l1', 5)) applyAnswer(e.state, CUR, q, bad, 'wild', new Date(NOW));
    for (const q of qs('m11-u1-l2', 5)) applyAnswer(e.state, CUR, q, ok, 'wild', new Date(NOW));
    const l1 = CUR.lessons[0], l2 = CUR.lessons[1];
    expect(reviewWeight(e, l1)).toBeGreaterThan(reviewWeight(e, l2) + 10);
    e.state.parent.pace = 1; e.state.daily.startedLessons.math = ['zz']; // lock the active lesson → review only
    const counts: Record<string, number> = {};
    for (let i = 0; i < 1000; i++) { const s = chooseLesson(e, { purpose: 'wild' }, 'math'); counts[s.lessonId!] = (counts[s.lessonId!] || 0) + 1; }
    expect(counts['m11-u1-l1']).toBeGreaterThan(counts['m11-u1-l2'] * 2);
  });
  it('tutorial = first lesson; gym = completed lessons (prefers unit reviews); forced lessonId wins', () => {
    const e = env(2);
    expect(chooseLesson(e, { purpose: 'tutorial' }, 'math')).toMatchObject({ lessonId: 'm11-u1-l1', mode: 'tutorial' });
    expect(chooseLesson(e, { purpose: 'gym' }, 'math')).toMatchObject({ lessonId: 'm11-u1-l1', mode: 'gym' }); // nothing completed → falls back
    expect(chooseLesson(e, { purpose: 'practice', lessonId: 'm11-u1-l3' }, 'math')).toMatchObject({ lessonId: 'm11-u1-l3', mode: 'forced' });
    setStartState(e.state, CUR, 'math', 99, new Date(NOW)); // all completed
    const counts: Record<string, number> = {};
    for (let i = 0; i < 600; i++) { const s = chooseLesson(e, { purpose: 'gym' }, 'math'); counts[s.lessonId!] = (counts[s.lessonId!] || 0) + 1; }
    expect(counts['m11-u1-l3']).toBeGreaterThan(counts['m11-u1-l1']); // review lesson weighted ×2
  });
  it('returns none for an empty curriculum', () => {
    const e = env(); e.cur = { version: 'x', units: [], lessons: [] };
    expect(chooseLesson(e, { purpose: 'wild' }, 'math').mode).toBe('none');
  });
});

describe('pickQuestion', () => {
  it('never repeats any of the last 12 ids when alternatives exist', () => {
    const e = env(11);
    const pool = qs('m11-u1-l1', 20);
    const seen: string[] = [];
    for (let i = 0; i < 300; i++) {
      const q = pickQuestion(e, { purpose: 'wild' }, pool, 'active')!;
      const last12 = seen.slice(-12);
      expect(last12).not.toContain(q.id);
      seen.push(q.id);
      applyAnswer(e.state, CUR, q, ok, 'wild', new Date(NOW));
      // keep the lesson "in progress" so difficulty gating stays stable
      e.state.subjects.math.completed = {};
      e.state.subjects.math.lessonStats['m11-u1-l1'].c = 1;
    }
  });
  it('falls back to repeats only when the pool is smaller than the window', () => {
    const e = env(4);
    const pool = qs('m11-u1-l1', 3);
    for (let i = 0; i < 20; i++) { const q = pickQuestion(e, { purpose: 'wild' }, pool, 'review')!; expect(q).toBeTruthy(); applyAnswer(e.state, CUR, q, ok, 'wild', new Date(NOW)); }
  });
  it('tutorial picks the lowest difficulty; catch ≤ 3; gym ≥ 2; active ramps with progress', () => {
    const e = env(9);
    const pool = qs('m11-u1-l1', 30, (i) => ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5);
    for (let i = 0; i < 100; i++) expect(pickQuestion(e, { purpose: 'tutorial' }, pool, 'tutorial')!.difficulty).toBe(1);
    for (let i = 0; i < 100; i++) expect(pickQuestion(e, { purpose: 'catch' }, pool, 'active')!.difficulty).toBeLessThanOrEqual(3);
    for (let i = 0; i < 100; i++) expect(pickQuestion(e, { purpose: 'gym' }, pool, 'gym')!.difficulty).toBeGreaterThanOrEqual(2);
    // active lesson at 0 progress → only difficulty 1
    for (let i = 0; i < 100; i++) expect(pickQuestion(e, { purpose: 'wild' }, pool, 'active')!.difficulty).toBe(1);
    // 2 of 3 correct → target 3 → difficulties ≤ 3, and 3 is the most frequent
    e.state.subjects.math.lessonStats['m11-u1-l1'] = { c: 2, w: 0 };
    const hist = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 600; i++) { const d = pickQuestion(e, { purpose: 'wild' }, pool, 'active')!.difficulty; expect(d).toBeLessThanOrEqual(3); hist[d]++; }
    expect(hist[3]).toBeGreaterThan(hist[1]);
    expect(hist[3]).toBeGreaterThan(hist[2]);
  });
  it('review prefers wrong and stale questions', () => {
    const e = env(6);
    const pool = qs('m11-u1-l1', 4, () => 1);
    for (const q of pool) applyAnswer(e.state, CUR, q, ok, 'wild', new Date(NOW - 100));
    e.state.recent = [];
    e.state.qstats[pool[0].id] = { c: 0, w: 4, last: NOW - 100 };            // wrong ×4 → +12
    e.state.qstats[pool[1].id] = { c: 1, w: 0, last: NOW - 20 * 86_400_000 }; // stale 20 days → +20
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < 2000; i++) { const q = pickQuestion(e, { purpose: 'wild' }, pool, 'review')!; counts[pool.indexOf(q)]++; }
    expect(counts[1]).toBeGreaterThan(counts[2] * 3);
    expect(counts[0]).toBeGreaterThan(counts[2] * 2);
  });
  it('returns null for an empty list', () => {
    expect(pickQuestion(env(), { purpose: 'wild' }, [], 'active')).toBeNull();
  });
});
