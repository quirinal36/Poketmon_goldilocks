// LearnService wiring: bank (data) + picker (selection) + progress (pacing, pure) + questionView (UI).
// All G access (save/ui/audio/net) lives here and is guarded so the service works before main.ts finishes boot.
import type {
  AskOptions, AskResult, CurriculumData, DailyPlan, LearnService, LearnState, Lesson, Question, QuestionContext, SfxId, Subject, Unit,
} from '../core/types';
import { todayStr } from '../core/util';
import { G } from '../game';
import { EMPTY_CURRICULUM, QuestionBank, generateFallbackQuestion, keyOf, loadCurriculum } from './bank';
import { chooseLesson, chooseSubject, pickQuestion, type PickEnv, type SourceMode } from './picker';
import {
  applyAnswer, currentLesson, currentStreak, dailyPlan, defaultLearnState, ensureLearnState, lessonsOf, markStarted,
  rolloverState, setStartState, stageOf,
} from './progress';
import { ask as askView } from './questionView';

export { defaultLearnState, ensureLearnState, currentStreak } from './progress';
export { renderVisual } from './visuals';
export { ask as askQuestion } from './questionView';

export const LESSON_REWARD = { money: 200, pokeballs: 1 };
export const DAILY_REWARD = { money: 500, pokeballs: 3 };
const FLUSH_DELAY_MS = 3000;

type LearnEvent = 'lessonComplete' | 'dailyComplete';
type Listener = (payload: unknown) => void;

export interface LessonCompletePayload { lesson: Lesson; subject: Subject; stage: number }
export interface DailyCompletePayload { date: string; plan: DailyPlan }

export function createLearn(): LearnService {
  let cur: CurriculumData = EMPTY_CURRICULUM;
  const lessonMap = new Map<string, Lesson>();
  const unitMap = new Map<string, Unit>();
  const bank = new QuestionBank(() => cur);
  const listeners: Record<LearnEvent, Set<Listener>> = { lessonComplete: new Set(), dailyComplete: new Set() };
  const detachedState = defaultLearnState();   // used only when G.save is not registered (dev pages)
  let flushTimer: ReturnType<typeof setTimeout> | null = null;

  const state = (): LearnState => {
    const save = G.save?.data;
    if (!save) return detachedState;
    if (!save.learn) save.learn = defaultLearnState();
    return ensureLearnState(save.learn);
  };
  const env = (): PickEnv => ({ state: state(), cur, today: todayStr(), now: Date.now(), rand: Math.random });
  const emit = (ev: LearnEvent, payload: unknown) => {
    for (const cb of listeners[ev]) { try { cb(payload); } catch (err) { console.warn('[learn] listener failed', err); } }
  };
  const toast = (msg: string, ms?: number) => { try { G.ui?.toast?.(msg, ms); } catch { /* ignore */ } };
  const sfx = (id: SfxId) => { try { G.audio?.playSfx?.(id); } catch { /* ignore */ } };
  const write = (reason: string) => { try { G.save?.write?.(reason); } catch { /* ignore */ } };

  function indexCurriculum() {
    lessonMap.clear(); unitMap.clear();
    for (const l of cur.lessons) lessonMap.set(l.id, l);
    for (const u of cur.units) unitMap.set(u.id, u);
  }

  function scheduleFlush() {
    if (flushTimer || !G.net?.online) return;
    flushTimer = setTimeout(async () => {
      flushTimer = null;
      const st = state();
      const batch = st.pendingLogs.slice(0, 200);
      if (!batch.length) return;
      try {
        const ok = await G.net.flushLogs(batch);
        if (ok) { const sent = new Set(batch); st.pendingLogs = st.pendingLogs.filter((l) => !sent.has(l)); }
      } catch { /* keep for later */ }
    }, FLUSH_DELAY_MS);
  }

  function grantLesson(lesson: Lesson) {
    const save = G.save;
    try {
      save?.addMoney?.(LESSON_REWARD.money);
      save?.addItem?.('pokeball', LESSON_REWARD.pokeballs);
      if (save?.data?.stats) save.data.stats.stampsTotal = (save.data.stats.stampsTotal || 0) + 1;
    } catch { /* ignore */ }
    sfx('stamp');
    toast(`⭐ 공부 도장을 받았어요! ₩${LESSON_REWARD.money} + 몬스터볼 ${LESSON_REWARD.pokeballs}개`, 3500);
    const payload: LessonCompletePayload = { lesson, subject: lesson.subject, stage: stageOf(state()) };
    emit('lessonComplete', payload);
  }

  function grantDaily(plan: DailyPlan) {
    const save = G.save;
    try {
      save?.addMoney?.(DAILY_REWARD.money);
      save?.addItem?.('pokeball', DAILY_REWARD.pokeballs);
      save?.setFlag?.('daily_special', true);
    } catch { /* ignore */ }
    sfx('stamp');
    toast(`🎉 오늘의 공부를 다 했어요! ₩${DAILY_REWARD.money} + 몬스터볼 ${DAILY_REWARD.pokeballs}개! 특별한 포켓몬이 기다려요!`, 4500);
    const payload: DailyCompletePayload = { date: plan.date, plan };
    emit('dailyComplete', payload);
  }

  /** Questions from the first lesson of the subject that actually has data (used when the chosen lesson has none). */
  async function anyQuestionsOf(subject: Subject): Promise<Question[]> {
    const keys = [...new Set(lessonsOf(cur, subject).map((l) => keyOf(l.id)))];
    for (const k of keys) {
      const qs = (await bank.loadKey(k)).filter((q) => q.subject === subject || !q.subject);
      if (qs.length) return qs;
    }
    return [];
  }

  const svc: LearnService = {
    async init() {
      cur = await loadCurriculum();
      indexCurriculum();
      const st = state();
      rolloverState(st);
      // warm the cache for today's lessons (fire and forget)
      for (const s of ['math', 'english'] as Subject[]) {
        const l = currentLesson(st, cur, s);
        if (l) void bank.loadKey(keyOf(l.id)).catch(() => undefined);
      }
    },
    curriculum: () => cur,
    lesson: (id) => lessonMap.get(id),
    unit: (id) => unitMap.get(id),

    async next(ctx) {
      const e = env();
      rolloverState(e.state, e.today);
      const subject = chooseSubject(e, ctx);
      const src = chooseLesson(e, ctx, subject);
      let mode: SourceMode = src.mode;
      let qs: Question[] = src.lessonId ? await bank.forLesson(src.lessonId) : [];
      if (!qs.length && subject !== 'math') { qs = await anyQuestionsOf(subject); if (qs.length) mode = 'review'; }
      const q = qs.length ? pickQuestion(e, ctx, qs, mode) : null;
      if (!q) {
        const lesson = src.lessonId ? lessonMap.get(src.lessonId) : undefined;
        const level = subject === 'math' && lesson ? (unitMap.get(lesson.unitId)?.order ?? 1) - 1 : 0;
        if (mode === 'active' && src.lessonId) markStarted(e.state, subject, src.lessonId);
        return generateFallbackQuestion(Math.random, ctx.purpose, level, subject === 'math' ? src.lessonId ?? undefined : undefined);
      }
      if (mode === 'active' && src.lessonId) markStarted(e.state, subject, src.lessonId);
      return q;
    },

    ask: (q: Question, opts: AskOptions) => askView(q, opts),

    async quiz(ctx: QuestionContext, opts?: Partial<AskOptions>) {
      const q = await svc.next(ctx);
      return svc.ask(q, { ...opts, purpose: opts?.purpose ?? ctx.purpose });
    },

    record(q: Question, result: AskResult, purpose: QuestionContext['purpose']) {
      const st = state();
      const out = applyAnswer(st, cur, q, result, purpose, new Date());
      const stats = G.save?.data?.stats;
      if (stats) { if (result.correct) stats.correct = (stats.correct || 0) + 1; else stats.wrong = (stats.wrong || 0) + 1; }
      if (out.lessonCompleted) grantLesson(out.lessonCompleted);
      if (out.dailyCompleted) grantDaily(dailyPlan(st, cur));
      if (out.lessonCompleted || out.dailyCompleted) write('lesson');
      scheduleFlush();
    },

    plan: () => dailyPlan(state(), cur),
    stage: () => stageOf(state()),
    rollover() { rolloverState(state()); },
    setStart(subject, lessonOrder) {
      setStartState(state(), cur, subject, lessonOrder, new Date());
      write('setStart');
    },
    on(ev, cb) {
      const set = listeners[ev];
      if (!set) return () => undefined;
      set.add(cb);
      return () => { set.delete(cb); };
    },
    questionsForLesson: (lessonId) => bank.forLesson(lessonId),
  };
  return svc;
}
