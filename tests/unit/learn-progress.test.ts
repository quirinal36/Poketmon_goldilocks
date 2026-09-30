import { describe, expect, it } from 'vitest';
import type { AskResult, CurriculumData, Lesson, Question, Unit } from '../../src/core/types';
import {
  applyAnswer, canStartToday, completedTodayLessons, currentLesson, currentStreak, dailyPlan, defaultLearnState, ensureLearnState,
  lessonStatus, markStarted, rolloverState, setStartState, stageOf, yesterdayOf,
} from '../../src/learn/progress';

// ------------------------------------------------------------ fixtures ----
function lesson(id: string, subject: 'math' | 'english', order: number, extra: Partial<Lesson> = {}): Lesson {
  const [k, u] = id.split('-');
  return { id, unitId: `${k}-${u}`, subject, grade: 1, semester: 1, lessonNo: order, title: `${subject} ${order}`, goal: 'goal', order, requiredCorrect: 3, ...extra };
}
function unit(id: string, subject: 'math' | 'english', order: number): Unit {
  return { id, subject, grade: 1, semester: 1, unitNo: order, title: `unit ${order}`, order };
}
const CUR: CurriculumData = {
  version: 'test',
  units: [unit('m11-u1', 'math', 1), unit('e11-u1', 'english', 1)],
  lessons: [
    lesson('m11-u1-l1', 'math', 1), lesson('m11-u1-l2', 'math', 2), lesson('m11-u1-l3', 'math', 3, { isReview: true, requiredCorrect: 4 }),
    lesson('e11-u1-l1', 'english', 1), lesson('e11-u1-l2', 'english', 2),
  ],
};
function q(lessonId: string, n: number, subject: 'math' | 'english' = lessonId.startsWith('m') ? 'math' : 'english'): Question {
  return { id: `${lessonId}-${String(n).padStart(3, '0')}`, lessonId, subject, type: 't', prompt: 'p', answerMode: 'numpad', answer: '1', difficulty: 1 };
}
const ok: AskResult = { questionId: 'x', correct: true, firstTry: true, attempts: 1, elapsedMs: 1000 };
const bad: AskResult = { questionId: 'x', correct: false, firstTry: false, attempts: 2, elapsedMs: 1000 };
const D1 = new Date(2026, 8, 30, 10, 0, 0); // 2026-09-30 local
const D2 = new Date(2026, 9, 1, 9, 0, 0);   // next day
const D4 = new Date(2026, 9, 3, 9, 0, 0);   // 3 days later

function answerN(state: ReturnType<typeof defaultLearnState>, lessonId: string, n: number, at = D1, from = 1) {
  const outs = [];
  for (let i = 0; i < n; i++) outs.push(applyAnswer(state, CUR, q(lessonId, from + i), { ...ok, questionId: `${lessonId}-${from + i}` }, 'wild', at));
  return outs;
}

// --------------------------------------------------------------- tests ----
describe('defaultLearnState / ensureLearnState', () => {
  it('has the documented defaults', () => {
    const s = defaultLearnState('2026-09-30');
    expect(s.parent).toEqual({ pace: 1, subjects: { math: true, english: true }, ttsQuestions: true, ttsDialog: false });
    expect(s.daily.date).toBe('2026-09-30');
    expect(s.subjects.math.current).toBeNull();
    expect(s.streak).toEqual({ days: 0, lastDate: '' });
    expect(s.recent).toEqual([]);
    expect(s.pendingLogs).toEqual([]);
  });
  it('repairs partial states in place', () => {
    const partial = { parent: { pace: 9 }, subjects: { math: { completed: { 'm11-u1-l1': { at: 'x', correct: 3, total: 3 } } } } } as any;
    const s = ensureLearnState(partial, '2026-09-30');
    expect(s).toBe(partial);
    expect(s.parent.pace).toBe(1);
    expect(s.parent.subjects.english).toBe(true);
    expect(s.subjects.english.completed).toEqual({});
    expect(s.subjects.math.completed['m11-u1-l1'].correct).toBe(3);
    expect(s.daily.startedLessons.math).toEqual([]);
    expect(s.qstats).toEqual({});
  });
});

describe('rollover', () => {
  it('resets daily counters when the local date changes and keeps other state', () => {
    const s = defaultLearnState('2026-09-30');
    markStarted(s, 'math', 'm11-u1-l1');
    s.daily.correct.math = 5; s.daily.rewardClaimed = true;
    expect(rolloverState(s, '2026-09-30')).toBe(false);
    expect(rolloverState(s, '2026-10-01')).toBe(true);
    expect(s.daily).toEqual({ date: '2026-10-01', startedLessons: { math: [], english: [] }, correct: { math: 0, english: 0 }, answered: { math: 0, english: 0 }, rewardClaimed: false });
  });
  it('yesterdayOf handles month boundaries', () => {
    expect(yesterdayOf('2026-10-01')).toBe('2026-09-30');
    expect(yesterdayOf('2026-01-01')).toBe('2025-12-31');
  });
});

describe('pacing', () => {
  it('current lesson is the first not-completed by order and becomes active within pace', () => {
    const s = defaultLearnState('2026-09-30');
    expect(currentLesson(s, CUR, 'math')?.id).toBe('m11-u1-l1');
    const st = lessonStatus(s, CUR, 'math', '2026-09-30');
    expect(st.state).toBe('active');
    expect(st.lesson?.id).toBe('m11-u1-l1');
    expect(st.required).toBe(3);
  });
  it('after completing today with pace 1 → completed_today, next lesson locked, review only', () => {
    const s = defaultLearnState('2026-09-30');
    markStarted(s, 'math', 'm11-u1-l1');
    const outs = answerN(s, 'm11-u1-l1', 3);
    expect(outs[2].lessonCompleted?.id).toBe('m11-u1-l1');
    expect(s.subjects.math.current).toBe('m11-u1-l2');
    const st = lessonStatus(s, CUR, 'math', '2026-09-30');
    expect(st.state).toBe('completed_today');
    expect(st.lesson?.id).toBe('m11-u1-l1');
    expect(canStartToday(s, 'math', 'm11-u1-l2')).toBe(false);
    // tomorrow the next lesson opens
    rolloverState(s, '2026-10-01');
    expect(lessonStatus(s, CUR, 'math', '2026-10-01').state).toBe('active');
    expect(lessonStatus(s, CUR, 'math', '2026-10-01').lesson?.id).toBe('m11-u1-l2');
  });
  it('pace 2 allows a second lesson the same day; pace 0 is unlimited', () => {
    const s = defaultLearnState('2026-09-30');
    s.parent.pace = 2;
    markStarted(s, 'math', 'm11-u1-l1');
    answerN(s, 'm11-u1-l1', 3);
    expect(lessonStatus(s, CUR, 'math', '2026-09-30').state).toBe('active');
    expect(canStartToday(s, 'math', 'm11-u1-l2')).toBe(true);
    markStarted(s, 'math', 'm11-u1-l2');
    answerN(s, 'm11-u1-l2', 3);
    expect(lessonStatus(s, CUR, 'math', '2026-09-30').state).toBe('completed_today');
    const u = defaultLearnState('2026-09-30');
    u.parent.pace = 0;
    for (let i = 0; i < 5; i++) markStarted(u, 'math', `x${i}`);
    expect(canStartToday(u, 'math', 'm11-u1-l1')).toBe(true);
    expect(lessonStatus(u, CUR, 'math', '2026-09-30').state).toBe('active');
  });
  it('disabled subject and finished curriculum states', () => {
    const s = defaultLearnState('2026-09-30');
    s.parent.subjects.english = false;
    expect(lessonStatus(s, CUR, 'english', '2026-09-30').state).toBe('disabled');
    for (const l of CUR.lessons.filter((x) => x.subject === 'math')) s.subjects.math.completed[l.id] = { at: D1.toISOString(), correct: 3, total: 3 };
    expect(lessonStatus(s, CUR, 'math', '2026-09-30').state).toBe('finished');
    expect(lessonStatus(s, CUR, 'math', '2026-09-30').lesson).toBeNull();
  });
  it('locked_until_tomorrow when pace is exhausted by another lesson', () => {
    const s = defaultLearnState('2026-09-30');
    markStarted(s, 'math', 'm11-u1-l2'); // e.g. parent moved the start after a lesson was started today
    expect(lessonStatus(s, CUR, 'math', '2026-09-30').state).toBe('locked_until_tomorrow');
  });
});

describe('lesson completion', () => {
  it('completes exactly when correct answers from that lesson reach requiredCorrect', () => {
    const s = defaultLearnState('2026-09-30');
    const o1 = applyAnswer(s, CUR, q('m11-u1-l1', 1), ok, 'wild', D1);
    const o2 = applyAnswer(s, CUR, q('m11-u1-l1', 2), bad, 'wild', D1);
    const o3 = applyAnswer(s, CUR, q('m11-u1-l1', 3), ok, 'wild', D1);
    expect([o1, o2, o3].map((o) => o.lessonCompleted)).toEqual([null, null, null]);
    expect(s.subjects.math.lessonStats['m11-u1-l1']).toEqual({ c: 2, w: 1 });
    const o4 = applyAnswer(s, CUR, q('m11-u1-l1', 4), ok, 'catch', D1);
    expect(o4.lessonCompleted?.id).toBe('m11-u1-l1');
    expect(s.subjects.math.completed['m11-u1-l1']).toEqual({ at: D1.toISOString(), correct: 3, total: 4 });
    // further answers don't re-complete
    expect(applyAnswer(s, CUR, q('m11-u1-l1', 5), ok, 'wild', D1).lessonCompleted).toBeNull();
  });
  it('only answers from that lesson count', () => {
    const s = defaultLearnState('2026-09-30');
    answerN(s, 'm11-u1-l2', 3);   // other lesson
    expect(s.subjects.math.completed['m11-u1-l1']).toBeUndefined();
    expect(s.subjects.math.completed['m11-u1-l2']).toBeDefined();
    answerN(s, 'e11-u1-l1', 2);
    expect(s.subjects.english.lessonStats['e11-u1-l1']).toEqual({ c: 2, w: 0 });
    expect(s.subjects.math.lessonStats['e11-u1-l1']).toBeUndefined();
  });
  it('records qstats, recent (max 30), mistakes (max 50), logs and daily counters', () => {
    const s = defaultLearnState('2026-09-30');
    for (let i = 0; i < 40; i++) applyAnswer(s, CUR, q('m11-u1-l1', i), i % 2 ? ok : bad, 'wild', D1);
    expect(s.recent.length).toBe(30);
    expect(s.recent[29]).toBe('m11-u1-l1-039');
    expect(s.mistakes.length).toBe(20);
    expect(s.pendingLogs.length).toBe(40);
    expect(s.pendingLogs[0]).toMatchObject({ questionId: 'm11-u1-l1-000', lessonId: 'm11-u1-l1', subject: 'math', correct: false, purpose: 'wild' });
    expect(s.qstats['m11-u1-l1-001']).toMatchObject({ c: 1, w: 0 });
    expect(s.daily.answered.math).toBe(40);
    expect(s.daily.correct.math).toBe(20);
  });
});

describe('daily plan & rewards', () => {
  it('daily completes once when every enabled subject finished its lesson today', () => {
    const s = defaultLearnState('2026-09-30');
    const m = answerN(s, 'm11-u1-l1', 3);
    expect(m[2].lessonCompleted).not.toBeNull();
    expect(m[2].dailyCompleted).toBe(false);
    expect(dailyPlan(s, CUR, '2026-09-30').allDoneToday).toBe(false);
    const e = answerN(s, 'e11-u1-l1', 3);
    expect(e[2].dailyCompleted).toBe(true);
    const plan = dailyPlan(s, CUR, '2026-09-30');
    expect(plan.allDoneToday).toBe(true);
    expect(plan.rewardClaimed).toBe(true);
    expect(plan.math.state).toBe('completed_today');
    expect(plan.english.state).toBe('completed_today');
    // no second daily reward the same day, even after more study (pace 0 test below covers extra lessons)
    expect(applyAnswer(s, CUR, q('m11-u1-l2', 1), ok, 'wild', D1).dailyCompleted).toBe(false);
  });
  it('only enabled subjects are required; english off → math alone completes the day', () => {
    const s = defaultLearnState('2026-09-30');
    s.parent.subjects.english = false;
    const m = answerN(s, 'm11-u1-l1', 3);
    expect(m[2].dailyCompleted).toBe(true);
  });
  it('pace 2 needs two lessons per subject for the daily reward', () => {
    const s = defaultLearnState('2026-09-30');
    s.parent.pace = 2; s.parent.subjects.english = false;
    expect(answerN(s, 'm11-u1-l1', 3)[2].dailyCompleted).toBe(false);
    expect(answerN(s, 'm11-u1-l2', 3)[2].dailyCompleted).toBe(true);
  });
  it('setStart presets do not count as completed today', () => {
    const s = defaultLearnState('2026-09-30');
    s.parent.subjects.english = false;
    setStartState(s, CUR, 'math', 3, D1);
    expect(completedTodayLessons(s, CUR, 'math', '2026-09-30')).toEqual([]);
    expect(dailyPlan(s, CUR, '2026-09-30').allDoneToday).toBe(false);
    expect(lessonStatus(s, CUR, 'math', '2026-09-30')).toMatchObject({ state: 'active', lesson: { id: 'm11-u1-l3' }, required: 4 });
  });
});

describe('streak', () => {
  it('counts consecutive study days and breaks after a gap', () => {
    const s = defaultLearnState('2026-09-30');
    expect(currentStreak(s, '2026-09-30')).toBe(0);
    applyAnswer(s, CUR, q('m11-u1-l1', 1), ok, 'wild', D1);
    applyAnswer(s, CUR, q('m11-u1-l1', 2), bad, 'wild', D1);
    expect(s.streak).toEqual({ days: 1, lastDate: '2026-09-30' });
    applyAnswer(s, CUR, q('m11-u1-l1', 3), ok, 'wild', D2);
    expect(s.streak).toEqual({ days: 2, lastDate: '2026-10-01' });
    expect(currentStreak(s, '2026-10-02')).toBe(2);
    expect(currentStreak(s, '2026-10-03')).toBe(0);
    applyAnswer(s, CUR, q('m11-u1-l1', 4), ok, 'wild', D4);
    expect(s.streak).toEqual({ days: 1, lastDate: '2026-10-03' });
  });
  it('rollover clears a broken streak', () => {
    const s = defaultLearnState('2026-09-30');
    s.streak = { days: 5, lastDate: '2026-09-20' };
    rolloverState(s, '2026-09-30');
    expect(s.streak.days).toBe(0);
    const t = defaultLearnState('2026-09-30');
    t.streak = { days: 5, lastDate: '2026-09-30' };
    rolloverState(t, '2026-10-01');
    expect(t.streak.days).toBe(5);
  });
});

describe('setStart & stage', () => {
  it('marks earlier lessons completed (preset) and moves current', () => {
    const s = defaultLearnState('2026-09-30');
    setStartState(s, CUR, 'math', 3, D1);
    expect(Object.keys(s.subjects.math.completed).sort()).toEqual(['m11-u1-l1', 'm11-u1-l2']);
    expect(s.subjects.math.completed['m11-u1-l1']).toEqual({ at: D1.toISOString(), correct: 0, total: 0 });
    expect(s.subjects.math.current).toBe('m11-u1-l3');
    expect(stageOf(s)).toBe(2);
  });
  it('moving the start backwards removes presets but keeps real completions', () => {
    const s = defaultLearnState('2026-09-30');
    setStartState(s, CUR, 'math', 3, D1);
    answerN(s, 'm11-u1-l3', 4);  // real completion of l3
    setStartState(s, CUR, 'math', 1, D1);
    expect(Object.keys(s.subjects.math.completed)).toEqual(['m11-u1-l3']);
    expect(s.subjects.math.current).toBe('m11-u1-l1');
  });
  it('stage counts completed lessons across both subjects', () => {
    const s = defaultLearnState('2026-09-30');
    answerN(s, 'm11-u1-l1', 3);
    answerN(s, 'e11-u1-l1', 3);
    setStartState(s, CUR, 'english', 3, D1);
    expect(stageOf(s)).toBe(3);
  });
});
