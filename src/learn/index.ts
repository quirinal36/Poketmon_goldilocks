// STUB — owned by the LEARN agent.
import type { LearnService, Question } from '../core/types';
const DUMMY: Question = { id: 'stub-001', lessonId: 'stub', subject: 'math', type: 'add', prompt: '1 + 1 = ?', answerMode: 'numpad', answer: '2', difficulty: 1 };
export function createLearn(): LearnService {
  const today = new Date().toISOString().slice(0, 10);
  const st = (subject: 'math' | 'english') => ({ subject, lesson: null, state: 'finished' as const, correct: 0, required: 8 });
  return {
    async init() {}, curriculum: () => ({ version: 'stub', units: [], lessons: [] }), lesson: () => undefined, unit: () => undefined,
    async next() { return DUMMY; },
    async ask(q) { const ok = window.confirm(q.prompt + ' (확인=정답)'); return { questionId: q.id, correct: ok, firstTry: ok, attempts: 1, elapsedMs: 0 }; },
    async quiz(ctx, opts) { const q = await this.next(ctx); return this.ask(q, { purpose: ctx.purpose, ...opts }); },
    record() {}, plan: () => ({ date: today, math: st('math'), english: st('english'), allDoneToday: false, rewardClaimed: false }),
    stage: () => 0, rollover() {}, setStart() {}, on: () => () => {}, async questionsForLesson() { return []; },
  };
}
