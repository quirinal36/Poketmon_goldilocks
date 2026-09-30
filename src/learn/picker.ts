// Question selection — PURE (DESIGN §5.3). Injectable rng for tests.
// Two phases because question files load lazily:
//   1. chooseSubject() + chooseLesson()  → which lesson to draw from (sync, needs only curriculum + state)
//   2. pickQuestion()                    → which question among that lesson's loaded questions
import type { CurriculumData, LearnState, Lesson, Question, QuestionContext, Subject } from '../core/types';
import { weightedPick } from '../core/util';
import { activeLesson, currentLesson, isCompleted, lessonsOf } from './progress';

export const NO_REPEAT_WINDOW = 12;
export const ACTIVE_SHARE = 0.7;
const DAY_MS = 86_400_000;

export interface PickEnv {
  state: LearnState;
  cur: CurriculumData;
  today: string;     // YYYY-MM-DD local
  now: number;       // epoch ms
  rand: () => number;
}

export type SourceMode = 'active' | 'review' | 'tutorial' | 'gym' | 'forced' | 'none';
export interface Source { lessonId: string | null; mode: SourceMode; subject: Subject }

// -------------------------------------------------------------- subject ----
function lastSubject(state: LearnState): Subject | null {
  for (let i = state.recent.length - 1; i >= 0; i--) {
    const id = state.recent[i];
    if (id.startsWith('m')) return 'math';
    if (id.startsWith('e')) return 'english';
  }
  return null;
}

/** Subject for this question: explicit (if enabled) → the one whose today-lesson is still open → alternate. */
export function chooseSubject(env: PickEnv, ctx: QuestionContext): Subject {
  const { state, cur } = env;
  const enabled = (['math', 'english'] as Subject[]).filter((s) => state.parent.subjects[s]);
  if (ctx.lessonId) {
    const l = cur.lessons.find((x) => x.id === ctx.lessonId);
    if (l) return l.subject;
  }
  if (ctx.subject && (enabled.includes(ctx.subject) || enabled.length === 0)) return ctx.subject;
  if (enabled.length === 0) return ctx.subject ?? 'math';
  if (enabled.length === 1) return enabled[0];
  if (ctx.purpose === 'tutorial') return 'math';
  const open = enabled.filter((s) => activeLesson(state, cur, s) !== null);
  if (open.length === 1) return open[0];
  const last = lastSubject(state);
  if (last && enabled.includes(last)) return enabled[(enabled.indexOf(last) + 1) % enabled.length];
  return enabled[env.rand() < 0.5 ? 0 : 1];
}

// --------------------------------------------------------------- lesson ----
/** Days since the child last touched any question of this lesson (30 = never / long ago). */
export function lessonStaleness(env: PickEnv, lesson: Lesson): number {
  let last = 0;
  const prefix = lesson.id + '-';
  for (const [id, st] of Object.entries(env.state.qstats)) if (id.startsWith(prefix) && st.last > last) last = st.last;
  if (!last) {
    const c = env.state.subjects[lesson.subject]?.completed[lesson.id];
    const t = c ? Date.parse(c.at) : NaN;
    if (Number.isFinite(t)) last = t;
  }
  if (!last) return 30;
  return Math.max(0, Math.min(30, (env.now - last) / DAY_MS));
}

/** Review weight: wrong answers × 3 + staleness (days, ≤ 30), min 1. */
export function reviewWeight(env: PickEnv, lesson: Lesson): number {
  const st = env.state.subjects[lesson.subject]?.lessonStats[lesson.id];
  return 1 + (st?.w ?? 0) * 3 + lessonStaleness(env, lesson);
}

export function reviewLessons(env: PickEnv, subject: Subject): Lesson[] {
  return lessonsOf(env.cur, subject).filter((l) => isCompleted(env.state, subject, l.id));
}

/** Which lesson to draw the next question from. */
export function chooseLesson(env: PickEnv, ctx: QuestionContext, subject: Subject): Source {
  const { state, cur, rand } = env;
  if (ctx.lessonId) return { lessonId: ctx.lessonId, mode: 'forced', subject };
  const all = lessonsOf(cur, subject);
  if (!all.length) return { lessonId: null, mode: 'none', subject };

  if (ctx.purpose === 'tutorial') return { lessonId: all[0].id, mode: 'tutorial', subject };

  const review = reviewLessons(env, subject);
  const active = activeLesson(state, cur, subject);

  if (ctx.purpose === 'gym') {
    if (review.length) {
      const l = weightedPick(review, (x) => reviewWeight(env, x) * (x.isReview ? 2 : 1), rand);
      return { lessonId: l.id, mode: 'gym', subject };
    }
    const fallback = active ?? currentLesson(state, cur, subject) ?? all[0];
    return { lessonId: fallback.id, mode: 'gym', subject };
  }

  if (active && (!review.length || rand() < ACTIVE_SHARE)) return { lessonId: active.id, mode: 'active', subject };
  if (review.length) return { lessonId: weightedPick(review, (x) => reviewWeight(env, x), rand).id, mode: 'review', subject };
  if (active) return { lessonId: active.id, mode: 'active', subject };
  // nothing completed and current is locked (rare: setStart/pace change today) → practice the current lesson as review
  const cl = currentLesson(state, cur, subject);
  return cl ? { lessonId: cl.id, mode: 'review', subject } : { lessonId: null, mode: 'none', subject };
}

// ------------------------------------------------------------- question ----
function progressOf(env: PickEnv, lessonId: string, subject: Subject): number {
  const lesson = env.cur.lessons.find((l) => l.id === lessonId);
  const st = env.state.subjects[subject]?.lessonStats[lessonId];
  if (!lesson) return 0;
  return Math.max(0, Math.min(1, (st?.c ?? 0) / Math.max(1, lesson.requiredCorrect)));
}

/** Pick one question from a lesson's questions for the given mode. Returns null only for an empty list. */
export function pickQuestion(env: PickEnv, ctx: QuestionContext, qs: Question[], mode: SourceMode): Question | null {
  if (!qs.length) return null;
  const { state, rand } = env;
  const recent = new Set(state.recent.slice(-NO_REPEAT_WINDOW));
  let pool = qs.filter((q) => !recent.has(q.id));
  if (!pool.length) pool = qs;

  const withDiff = (pred: (d: number) => boolean) => { const f = pool.filter((q) => pred(q.difficulty)); return f.length ? f : pool; };
  if (mode === 'tutorial') { const min = Math.min(...pool.map((q) => q.difficulty)); pool = withDiff((d) => d === min); }
  if (ctx.purpose === 'catch') pool = withDiff((d) => d <= 3);
  if (ctx.purpose === 'gym' || mode === 'gym') pool = withDiff((d) => d >= 2);

  const subject: Subject = state.subjects[qs[0].subject] ? qs[0].subject : 'math';
  const target = mode === 'active' || mode === 'forced'
    ? Math.min(3, 1 + Math.floor(progressOf(env, qs[0].lessonId, subject) * 3))
    : 0;
  if (target) pool = withDiff((d) => d <= target);

  return weightedPick(pool, (q) => {
    const st = state.qstats[q.id];
    const wrong = st?.w ?? 0, seen = !!st;
    const staleDays = st?.last ? Math.min(30, (env.now - st.last) / DAY_MS) : 10;
    if (mode === 'review' || mode === 'gym') return 1 + wrong * 3 + staleDays;
    if (target) return (q.difficulty === target ? 3 : 1) * (seen ? 1 : 2) * (wrong ? 1.5 : 1);
    return 1 + wrong + (seen ? 0 : 1);
  }, rand);
}
