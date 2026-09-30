// Daily pacing / lesson completion — PURE logic over LearnState + CurriculumData.
// No DOM, no G access here (index.ts does rewards/toasts). Unit-tested in tests/unit/learn-progress.test.ts.
import type {
  AnswerLog, AskResult, CurriculumData, DailyPlan, LearnState, Lesson, LessonStatus, Question, QuestionContext, Subject,
} from '../core/types';
import { todayStr } from '../core/util';

export const SUBJECTS: Subject[] = ['math', 'english'];
export const RECENT_MAX = 30;
export const MISTAKES_MAX = 50;
export const PENDING_LOGS_MAX = 500;

// ------------------------------------------------------------- defaults ----
function freshDaily(date: string): LearnState['daily'] {
  return { date, startedLessons: { math: [], english: [] }, correct: { math: 0, english: 0 }, answered: { math: 0, english: 0 }, rewardClaimed: false };
}
function freshSubject(): LearnState['subjects']['math'] {
  return { current: null, completed: {}, lessonStats: {} };
}

/** Default learn state for a new save (imported by core/save.ts). */
export function defaultLearnState(date = todayStr()): LearnState {
  return {
    parent: { pace: 1, subjects: { math: true, english: true }, ttsQuestions: true, ttsDialog: false },
    subjects: { math: freshSubject(), english: freshSubject() },
    daily: freshDaily(date),
    qstats: {},
    recent: [],
    mistakes: [],
    pendingLogs: [],
    streak: { days: 0, lastDate: '' },
  };
}

/** Repair a (possibly partial / old) learn state in place, filling missing fields with defaults. */
export function ensureLearnState(s: Partial<LearnState> | undefined | null, date = todayStr()): LearnState {
  const d = defaultLearnState(date);
  const st = (s ?? {}) as LearnState;
  if (!st.parent || typeof st.parent !== 'object') st.parent = d.parent;
  else {
    if (![0, 1, 2, 3].includes(st.parent.pace)) st.parent.pace = 1;
    if (!st.parent.subjects) st.parent.subjects = { math: true, english: true };
    if (typeof st.parent.subjects.math !== 'boolean') st.parent.subjects.math = true;
    if (typeof st.parent.subjects.english !== 'boolean') st.parent.subjects.english = true;
    if (typeof st.parent.ttsQuestions !== 'boolean') st.parent.ttsQuestions = true;
    if (typeof st.parent.ttsDialog !== 'boolean') st.parent.ttsDialog = false;
  }
  if (!st.subjects || typeof st.subjects !== 'object') st.subjects = d.subjects;
  for (const sub of SUBJECTS) {
    const p = st.subjects[sub];
    if (!p || typeof p !== 'object') st.subjects[sub] = freshSubject();
    else {
      if (p.current === undefined) p.current = null;
      if (!p.completed || typeof p.completed !== 'object') p.completed = {};
      if (!p.lessonStats || typeof p.lessonStats !== 'object') p.lessonStats = {};
    }
  }
  if (!st.daily || typeof st.daily !== 'object' || typeof st.daily.date !== 'string') st.daily = freshDaily(date);
  else {
    if (!st.daily.startedLessons) st.daily.startedLessons = { math: [], english: [] };
    for (const sub of SUBJECTS) if (!Array.isArray(st.daily.startedLessons[sub])) st.daily.startedLessons[sub] = [];
    if (!st.daily.correct) st.daily.correct = { math: 0, english: 0 };
    if (!st.daily.answered) st.daily.answered = { math: 0, english: 0 };
    for (const sub of SUBJECTS) { st.daily.correct[sub] = st.daily.correct[sub] || 0; st.daily.answered[sub] = st.daily.answered[sub] || 0; }
    if (typeof st.daily.rewardClaimed !== 'boolean') st.daily.rewardClaimed = false;
  }
  if (!st.qstats || typeof st.qstats !== 'object') st.qstats = {};
  if (!Array.isArray(st.recent)) st.recent = [];
  if (!Array.isArray(st.mistakes)) st.mistakes = [];
  if (!Array.isArray(st.pendingLogs)) st.pendingLogs = [];
  if (!st.streak || typeof st.streak !== 'object') st.streak = { days: 0, lastDate: '' };
  else { st.streak.days = st.streak.days || 0; st.streak.lastDate = st.streak.lastDate || ''; }
  return st;
}

// ---------------------------------------------------------------- dates ----
/** Local date string of the day before `today` (YYYY-MM-DD). */
export function yesterdayOf(today: string): string {
  const [y, m, d] = today.split('-').map(Number);
  return todayStr(new Date(y, m - 1, d - 1));
}
/** Local date (YYYY-MM-DD) of an ISO timestamp; '' if unparsable. */
export function localDateOf(iso: string): string {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? todayStr(new Date(t)) : '';
}

/** Apply daily rollover if the date changed. Returns true when the day rolled over. */
export function rolloverState(state: LearnState, today = todayStr()): boolean {
  state.streak.days = currentStreak(state, today);
  if (state.daily.date === today) return false;
  state.daily = freshDaily(today);
  return true;
}

/** Streak as it should be displayed today (0 when the chain is broken). */
export function currentStreak(state: LearnState, today = todayStr()): number {
  const last = state.streak.lastDate;
  if (!last) return 0;
  if (last === today || last === yesterdayOf(today)) return state.streak.days;
  return 0;
}

// ----------------------------------------------------------- curriculum ----
export function lessonsOf(cur: CurriculumData, subject: Subject): Lesson[] {
  return cur.lessons.filter((l) => l.subject === subject).sort((a, b) => a.order - b.order);
}
export function lessonById(cur: CurriculumData, id: string): Lesson | undefined {
  return cur.lessons.find((l) => l.id === id);
}
export function isCompleted(state: LearnState, subject: Subject, lessonId: string): boolean {
  return !!state.subjects[subject]?.completed[lessonId];
}
export function effectivePace(state: LearnState): number {
  return state.parent.pace === 0 ? Infinity : state.parent.pace;
}

/** First not-completed lesson of the subject (by order). Also syncs `subjects[s].current`. */
export function currentLesson(state: LearnState, cur: CurriculumData, subject: Subject): Lesson | null {
  const ls = lessonsOf(cur, subject);
  const next = ls.find((l) => !isCompleted(state, subject, l.id)) ?? null;
  state.subjects[subject].current = next ? next.id : null;
  return next;
}

/** Lessons the child completed today (presets from setStart have correct 0 and do not count). */
export function completedTodayLessons(state: LearnState, cur: CurriculumData, subject: Subject, today = todayStr()): Lesson[] {
  const done = state.subjects[subject].completed;
  return lessonsOf(cur, subject).filter((l) => {
    const c = done[l.id];
    return !!c && c.correct > 0 && localDateOf(c.at) === today;
  });
}

/** Can a (not yet completed) lesson be studied today under the pace rule? */
export function canStartToday(state: LearnState, subject: Subject, lessonId: string): boolean {
  const started = state.daily.startedLessons[subject];
  if (started.includes(lessonId)) return true;
  return started.length < effectivePace(state);
}

/** Mark a lesson as "became active today" (consumes one pace slot). */
export function markStarted(state: LearnState, subject: Subject, lessonId: string): void {
  const started = state.daily.startedLessons[subject];
  if (!started.includes(lessonId)) started.push(lessonId);
}

/** The lesson new questions should come from today, or null (locked / finished / disabled). */
export function activeLesson(state: LearnState, cur: CurriculumData, subject: Subject): Lesson | null {
  if (!state.parent.subjects[subject]) return null;
  const cl = currentLesson(state, cur, subject);
  if (!cl) return null;
  return canStartToday(state, subject, cl.id) ? cl : null;
}

export function lessonStatus(state: LearnState, cur: CurriculumData, subject: Subject, today = todayStr()): LessonStatus {
  const base = { subject, correct: 0, required: 8 };
  if (!state.parent.subjects[subject]) return { ...base, lesson: null, state: 'disabled' };
  const cl = currentLesson(state, cur, subject);
  if (!cl) return { ...base, lesson: null, state: 'finished' };
  const pace = effectivePace(state);
  const doneToday = completedTodayLessons(state, cur, subject, today);
  if (pace !== Infinity && doneToday.length >= pace) {
    const last = doneToday[doneToday.length - 1];
    return { subject, lesson: last, state: 'completed_today', correct: last.requiredCorrect, required: last.requiredCorrect };
  }
  const stats = state.subjects[subject].lessonStats[cl.id];
  const st = { subject, lesson: cl, correct: Math.min(stats?.c ?? 0, cl.requiredCorrect), required: cl.requiredCorrect };
  if (canStartToday(state, subject, cl.id)) return { ...st, state: 'active' };
  return { ...st, state: 'locked_until_tomorrow' };
}

/** Is this subject's daily plan satisfied today? */
export function subjectDoneToday(state: LearnState, cur: CurriculumData, subject: Subject, today = todayStr()): boolean {
  if (!state.parent.subjects[subject]) return false;
  if (!currentLesson(state, cur, subject)) return true; // curriculum finished
  const need = state.parent.pace === 0 ? 1 : state.parent.pace;
  return completedTodayLessons(state, cur, subject, today).length >= need;
}

export function dailyPlan(state: LearnState, cur: CurriculumData, today = todayStr()): DailyPlan {
  rolloverState(state, today);
  const enabled = SUBJECTS.filter((s) => state.parent.subjects[s]);
  const allDoneToday = enabled.length > 0 && enabled.every((s) => subjectDoneToday(state, cur, s, today));
  return {
    date: today,
    math: lessonStatus(state, cur, 'math', today),
    english: lessonStatus(state, cur, 'english', today),
    allDoneToday,
    rewardClaimed: state.daily.rewardClaimed,
  };
}

/** Total completed lessons across subjects = study stage = number of 공부 도장. */
export function stageOf(state: LearnState): number {
  return SUBJECTS.reduce((n, s) => n + Object.keys(state.subjects[s]?.completed ?? {}).length, 0);
}

// ----------------------------------------------------------- recording ----
export interface RecordOutcome {
  lessonCompleted: Lesson | null;   // a lesson crossed requiredCorrect with this answer
  dailyCompleted: boolean;          // the daily plan became complete (reward not yet claimed before)
  log: AnswerLog;
}

function pushCapped(arr: string[], id: string, max: number): void {
  const i = arr.indexOf(id);
  if (i >= 0) arr.splice(i, 1);
  arr.push(id);
  while (arr.length > max) arr.shift();
}

/**
 * Count one answered question. Updates qstats / lessonStats / daily counters / streak / logs and
 * completes the lesson when its correct count reaches `requiredCorrect`.
 * Only answers whose `q.lessonId` matches a lesson count toward that lesson.
 */
export function applyAnswer(
  state: LearnState, cur: CurriculumData, q: Question, result: AskResult, purpose: QuestionContext['purpose'], now = new Date(),
): RecordOutcome {
  const today = todayStr(now);
  rolloverState(state, today);
  const subject: Subject = state.subjects[q.subject] ? q.subject : 'math';
  const ok = !!result.correct;

  const qs = (state.qstats[q.id] ||= { c: 0, w: 0, last: 0 });
  if (ok) qs.c++; else qs.w++;
  qs.last = now.getTime();

  const prog = state.subjects[subject];
  const ls = (prog.lessonStats[q.lessonId] ||= { c: 0, w: 0 });
  if (ok) ls.c++; else ls.w++;

  pushCapped(state.recent, q.id, RECENT_MAX);
  if (!ok) pushCapped(state.mistakes, q.id, MISTAKES_MAX);
  else { const i = state.mistakes.indexOf(q.id); if (i >= 0 && result.firstTry) state.mistakes.splice(i, 1); }

  state.daily.answered[subject]++;
  if (ok) state.daily.correct[subject]++;

  if (state.streak.lastDate !== today) {
    state.streak.days = state.streak.lastDate === yesterdayOf(today) ? state.streak.days + 1 : 1;
    state.streak.lastDate = today;
  }

  const log: AnswerLog = {
    questionId: q.id, lessonId: q.lessonId, subject, correct: ok, firstTry: !!result.firstTry,
    elapsedMs: Math.max(0, Math.round(result.elapsedMs || 0)), purpose, at: now.toISOString(),
  };
  state.pendingLogs.push(log);
  while (state.pendingLogs.length > PENDING_LOGS_MAX) state.pendingLogs.shift();

  let lessonCompleted: Lesson | null = null;
  const lesson = lessonById(cur, q.lessonId);
  if (lesson && lesson.subject === subject && !isCompleted(state, subject, lesson.id) && ls.c >= lesson.requiredCorrect) {
    prog.completed[lesson.id] = { at: now.toISOString(), correct: ls.c, total: ls.c + ls.w };
    currentLesson(state, cur, subject);
    lessonCompleted = lesson;
  }

  let dailyCompleted = false;
  if (lessonCompleted && !state.daily.rewardClaimed) {
    const plan = dailyPlan(state, cur, today);
    if (plan.allDoneToday) { state.daily.rewardClaimed = true; dailyCompleted = true; }
  }
  return { lessonCompleted, dailyCompleted, log };
}

// ------------------------------------------------------------- setStart ----
/**
 * Parent: start at lesson `order` of a subject. Lessons before it are marked completed (preset, correct 0
 * so they don't count as "done today"); preset completions at/after it are removed so moving the start
 * backwards works. Real completions (correct > 0) are never removed.
 */
export function setStartState(state: LearnState, cur: CurriculumData, subject: Subject, order: number, now = new Date()): void {
  const prog = state.subjects[subject];
  for (const l of lessonsOf(cur, subject)) {
    const c = prog.completed[l.id];
    if (l.order < order) {
      if (!c) prog.completed[l.id] = { at: now.toISOString(), correct: 0, total: 0 };
    } else if (c && c.correct === 0 && c.total === 0) {
      delete prog.completed[l.id];
    }
  }
  currentLesson(state, cur, subject);
}
