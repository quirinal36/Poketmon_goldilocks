// Question/curriculum loading. Bundled JSON first (works offline), optional network overrides merged by id.
// Never throws: missing files → empty results, and generateFallbackQuestion() keeps the game playable.
import type { CurriculumData, Question, QuestionContext, Visual } from '../core/types';
import { asset, josa, pick } from '../core/util';
import { G } from '../game';

export const EMPTY_CURRICULUM: CurriculumData = { version: 'none', units: [], lessons: [] };
export const FALLBACK_LESSON_ID = 'gen';

/** Question file key for a lesson id: 'm11-u1-l1' → 'm11'. */
export const keyOf = (lessonId: string): string => lessonId.slice(0, 3);

export async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(asset(path));
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const bySubjectOrder = <T extends { subject: string; order: number }>(a: T, b: T) =>
  a.subject === b.subject ? a.order - b.order : a.subject < b.subject ? -1 : 1;

export function normalizeCurriculum(c: Partial<CurriculumData> | null | undefined): CurriculumData {
  const units = Array.isArray(c?.units) ? c.units.filter((u) => u && typeof u.id === 'string') : [];
  const lessons = Array.isArray(c?.lessons) ? c.lessons.filter((l) => l && typeof l.id === 'string') : [];
  for (const l of lessons) if (!(l.requiredCorrect >= 1)) l.requiredCorrect = l.isReview ? 10 : 8;
  return { version: String(c?.version ?? 'none'), units: units.slice().sort(bySubjectOrder), lessons: lessons.slice().sort(bySubjectOrder) };
}

/** Merge two lists by id; entries of `over` win. */
export function mergeById<T extends { id: string }>(base: T[], over: T[]): T[] {
  const map = new Map<string, T>();
  for (const b of base) map.set(b.id, b);
  for (const o of over) if (o && typeof o.id === 'string') map.set(o.id, o);
  return [...map.values()];
}

export function mergeCurriculum(base: CurriculumData, over: Partial<CurriculumData>): CurriculumData {
  return normalizeCurriculum({
    version: over.version || base.version,
    units: mergeById(base.units, over.units ?? []),
    lessons: mergeById(base.lessons, over.lessons ?? []),
  });
}

export function isQuestionLike(x: unknown): x is Question {
  const q = x as Question;
  return !!q && typeof q === 'object' && typeof q.id === 'string' && typeof q.lessonId === 'string'
    && typeof q.prompt === 'string' && typeof q.answer === 'string' && (q.answerMode === 'choice' || q.answerMode === 'numpad');
}

/** Bundled curriculum (+ network overrides when online). Missing file → empty curriculum. */
export async function loadCurriculum(): Promise<CurriculumData> {
  let cur = normalizeCurriculum(await fetchJson<CurriculumData>('data/curriculum.json'));
  const net = G.net;
  if (net?.online) {
    try {
      const remote = await net.fetchCurriculum();
      if (remote) cur = mergeCurriculum(cur, remote);
    } catch { /* ignore network problems */ }
  }
  return cur;
}

/** Lazy per-key question cache: public/data/questions/<key>.json (+ network overrides). */
export class QuestionBank {
  private cache = new Map<string, Promise<Question[]>>();
  constructor(private readonly getCurriculum: () => CurriculumData) {}

  loadKey(key: string): Promise<Question[]> {
    let p = this.cache.get(key);
    if (!p) {
      p = this.fetchKey(key);
      this.cache.set(key, p);
    }
    return p;
  }

  private async fetchKey(key: string): Promise<Question[]> {
    if (!/^[a-z0-9]{1,8}$/i.test(key)) return [];
    const local = await fetchJson<Question[]>(`data/questions/${key}.json`);
    if (local === null) this.cache.delete(key); // transient failure → retry next time
    let qs = Array.isArray(local) ? local.filter(isQuestionLike) : [];
    const net = G.net;
    if (net?.online) {
      try {
        const ids = this.getCurriculum().lessons.filter((l) => keyOf(l.id) === key).map((l) => l.id);
        const remote = ids.length ? await net.fetchQuestions(ids) : null;
        if (remote && remote.length) qs = mergeById(qs, remote.filter(isQuestionLike));
      } catch { /* ignore */ }
    }
    return qs;
  }

  async forLesson(lessonId: string): Promise<Question[]> {
    const all = await this.loadKey(keyOf(lessonId));
    return all.filter((q) => q.lessonId === lessonId).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  }

  async forLessons(ids: string[]): Promise<Question[]> {
    const out: Question[] = [];
    for (const id of ids) out.push(...(await this.forLesson(id)));
    return out;
  }

  invalidate(): void { this.cache.clear(); }
}

// ------------------------------------------------------------- fallback ----
const FALLBACK_EMOJI = ['🍎', '🍓', '⭐', '🎈', '🐤', '🍪'];

/** Built-in simple arithmetic so the game never breaks without question data. */
export function generateFallbackQuestion(rand: () => number = Math.random, purpose: QuestionContext['purpose'] = 'wild', stage = 0): Question {
  const max = purpose === 'tutorial' ? 5 : stage < 3 ? 9 : stage < 8 ? 10 : 20;
  const isAdd = purpose === 'tutorial' || rand() < 0.6;
  let a = 1 + Math.floor(rand() * max);
  let b = 1 + Math.floor(rand() * max);
  if (isAdd) { while (a + b > max) { if (a > 1) a--; else b--; } }
  else if (b > a) [a, b] = [b, a];
  const ans = isAdd ? a + b : a - b;
  const emoji = pick(FALLBACK_EMOJI, rand);
  const visual: Visual = isAdd
    ? { kind: 'groups', groups: [{ emoji, count: a }, { emoji, count: b }], op: '+' }
    : { kind: 'groups', groups: [{ emoji, count: a, crossed: b }], op: null };
  const expr = isAdd ? `${a} + ${b}` : `${a} - ${b}`;
  return {
    id: `gen-${isAdd ? 'add' : 'sub'}-${a}-${b}`,
    lessonId: FALLBACK_LESSON_ID,
    subject: 'math',
    type: isAdd ? 'add' : 'sub',
    prompt: `${josa(expr, '은/는')} 얼마일까요?`,
    speak: [{ text: `${a} ${isAdd ? '더하기' : '빼기'} ${josa(String(b), '은/는')} 얼마일까요?`, lang: 'ko-KR' }],
    visual,
    answerMode: 'numpad',
    answer: String(ans),
    hint: isAdd ? '그림을 하나씩 세어 보세요.' : '지워진 것을 빼고 세어 보세요.',
    explain: isAdd ? `${a}과 ${b}를 모으면 ${ans}이에요.`.replace(`${a}과`, josa(String(a), '와/과')).replace(`${b}를`, josa(String(b), '을/를')).replace(`${ans}이에요`, josa(String(ans), '이에요/예요'))
      : `${a}에서 ${josa(String(b), '을/를')} 빼면 ${josa(String(ans), '이에요/예요')}.`,
    difficulty: 1,
  };
}
