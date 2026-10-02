// Bundled math is authoritative; English may use network overrides merged by id.
// Never throws: missing files → empty results, and generateFallbackQuestion() keeps the game playable.
import type { CurriculumData, Question, QuestionContext } from '../core/types';
import { asset, josa } from '../core/util';
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

/** Keep the arithmetic sequence when the server still contains the former counting curriculum. */
export function mergeCurriculum(base: CurriculumData, over: Partial<CurriculumData>): CurriculumData {
  return normalizeCurriculum({
    version: over.version || base.version,
    units: mergeById(base.units, (over.units ?? []).filter(u => u.subject !== 'math')),
    lessons: mergeById(base.lessons, (over.lessons ?? []).filter(l => l.subject !== 'math')),
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
    if (net?.online && !key.startsWith('m')) {
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
/** Arithmetic fallback uses the same 0–8 progression as the bundled math lessons. */
export function generateFallbackQuestion(rand: () => number = Math.random, purpose: QuestionContext['purpose'] = 'wild', stage = 0, lessonId = FALLBACK_LESSON_ID): Question {
  const level = purpose === 'tutorial' ? 0 : Math.max(0, Math.min(8, Math.floor(stage)));
  const int = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
  let a: number, b: number, op: string;
  if (level === 0) {
    op = rand() < 0.5 ? '+' : '-';
    a = op === '+' ? int(1, 8) : int(2, 9);
    b = int(1, op === '+' ? 9 - a : a - 1);
  } else if (level === 1) {
    op = '+'; a = int(2, 9); b = int(11 - a, 9);
  } else if (level === 2) {
    op = '-'; a = int(11, 18); b = int(a - 9, 9);
  } else {
    op = '×'; a = level === 3 ? int(2, 3) : level === 4 ? int(4, 5) : level + 1; b = int(1, 9);
  }
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  const expr = `${a} ${op} ${b}`, word = op === '+' ? '더하기' : op === '-' ? '빼기' : '곱하기';
  return {
    id: `${lessonId}-fallback-${a}-${op}-${b}`,
    lessonId, subject: 'math', type: 'equation',
    prompt: '빈칸에 알맞은 수를 써 보세요.',
    speak: [{ text: `${a} ${word} ${josa(String(b), '은/는')} 얼마일까요?`, lang: 'ko-KR' }],
    visual: { kind: 'text', text: `${expr} = □`, size: 'xl' },
    answerMode: 'numpad', answer: String(answer),
    hint: op === '×' ? `${a}씩 더하는 구구단을 떠올려 보세요.` : '수를 모으거나 빼며 계산해 보세요.',
    explain: `${expr} = ${answer}`, difficulty: 1,
  };
}
