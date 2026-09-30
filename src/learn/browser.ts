// questions.html — teacher/parent "문제 미리보기". Renders every question statically with the real renderer.
// Works offline from bundled JSON (public/data). No game boot required.
import type { CurriculumData, Lesson, Question, Subject, Unit } from '../core/types';
import { el } from '../core/util';
import { G } from '../game';
import { QuestionBank, loadCurriculum } from './bank';
import { ask, isStackedLayout } from './questionView';
import { renderVisual } from './visuals';
import './learn.css';
import './browser.css';

const SUBJECT_LABEL: Record<Subject, string> = { math: '🔢 수학', english: '🔤 영어' };
const PAGE_SIZE = 60;
const ALL_KEYS = ['m11', 'm12', 'm21', 'm22', 'e11', 'e12', 'e21', 'e22'];

interface Filters { subject: '' | Subject; sem: string; unit: string; lesson: string; search: string }

const root = document.getElementById('qb-root')!;

function semLabel(g: number, s: number): string { return `${g}학년 ${s}학기`; }
function stars(d: number): string { return '★'.repeat(d) + '☆'.repeat(Math.max(0, 5 - d)); }

function questionCard(q: Question, lesson: Lesson | undefined): HTMLElement {
  const head = el('div', { class: 'qb-card-head' },
    el('span', { class: `qb-chip ${q.subject === 'english' ? 'is-english' : ''}` }, SUBJECT_LABEL[q.subject] ?? q.subject),
    el('span', { class: 'qb-id' }, q.id),
    el('span', { class: 'qb-tag' }, q.type),
    el('span', { class: 'qb-diff', title: `난이도 ${q.difficulty}` }, stars(q.difficulty)),
    q.shuffle === false ? el('span', { class: 'qb-tag' }, '순서 고정') : null,
    el('button', { class: 'qb-try', type: 'button', onclick: () => { void ask(q, { purpose: 'practice', title: lesson?.title ?? '미리보기' }); } }, '풀어보기'),
  );
  const speakLine = el('div', { class: 'qb-speak' });
  if (q.speak?.length) speakLine.append(el('span', {}, '🔊 ' + q.speak.map((s) => `${s.text} (${s.lang})`).join(' · ')));
  if (q.listen) speakLine.append(el('span', {}, `🎧 듣기: ${q.listen.text} (${q.listen.lang})`));
  const visual = q.visual ? el('div', { class: 'qb-visual' }, renderVisual(q.visual)) : null;
  let answers: HTMLElement;
  if (q.answerMode === 'choice') {
    const list = q.choices ?? [];
    answers = el('div', { class: `qb-choices ${isStackedLayout(list) ? 'is-stacked' : ''}` });
    for (const c of list) {
      answers.append(el('div', { class: `qb-choice ${c.id === q.answer ? 'is-answer' : ''}` },
        el('span', { class: 'qb-letter' }, c.id.toUpperCase()),
        c.visual ? renderVisual(c.visual) : null,
        c.emoji ? el('span', {}, c.emoji) : null,
        c.text ? el('span', {}, c.text) : null,
        c.speak ? el('span', { title: `${c.speak.text} (${c.speak.lang})` }, '🔊') : null,
      ));
    }
  } else {
    answers = el('div', {}, el('span', { class: 'qb-numpad' }, `숫자판 정답: ${q.answer}`));
  }
  const notes = el('div', { class: 'qb-notes' },
    q.hint ? el('div', {}, el('b', {}, '힌트: '), q.hint) : null,
    q.explain ? el('div', {}, el('b', {}, '설명: '), q.explain) : null,
  );
  return el('div', { class: 'qb-card' }, head, el('div', { class: 'qb-prompt' }, q.prompt), speakLine.childNodes.length ? speakLine : null, visual, answers, notes.childNodes.length ? notes : null);
}

async function main() {
  const cur: CurriculumData = await loadCurriculum();
  const bank = new QuestionBank(() => cur);
  const keys = [...new Set([...ALL_KEYS, ...cur.lessons.map((l) => l.id.slice(0, 3))])];
  const loaded = await Promise.all(keys.map((k) => bank.loadKey(k)));
  const questions: Question[] = loaded.flat();
  const lessonMap = new Map<string, Lesson>(cur.lessons.map((l) => [l.id, l]));
  const unitMap = new Map<string, Unit>(cur.units.map((u) => [u.id, u]));
  const known = new Set(cur.lessons.map((l) => l.id));
  const orphanLessons = [...new Set(questions.filter((q) => !known.has(q.lessonId)).map((q) => q.lessonId))];

  const f: Filters = { subject: '', sem: '', unit: '', lesson: '', search: '' };
  let shown = PAGE_SIZE;

  const subjectSel = el('select', { 'aria-label': '과목' }, el('option', { value: '' }, '모든 과목'), el('option', { value: 'math' }, '수학'), el('option', { value: 'english' }, '영어'));
  const semSel = el('select', { 'aria-label': '학년 학기' });
  const unitSel = el('select', { 'aria-label': '단원' });
  const lessonSel = el('select', { 'aria-label': '차시' });
  const search = el('input', { type: 'search', placeholder: '문제 번호나 낱말로 찾기', 'aria-label': '검색' });
  const resetBtn = el('button', { type: 'button' }, '초기화');
  const count = el('span', { class: 'qb-count' });
  const grid = el('div', { class: 'qb-grid' });
  const lessonBox = el('div');
  const main = el('div', { class: 'qb-main' }, lessonBox, grid);

  const header = el('div', { class: 'qb-header' },
    el('div', { class: 'qb-title-row' }, el('h1', { class: 'qb-title' }, '📘 문제 미리보기', el('small', {}, `교육과정 ${cur.version} · 문제 ${questions.length}개`)), count),
    el('div', { class: 'qb-filters' }, subjectSel, semSel, unitSel, lessonSel, search, resetBtn),
  );
  root.replaceChildren(header, main);

  function fillSem() {
    const subs = f.subject ? [f.subject] : (['math', 'english'] as Subject[]);
    const sems = new Set<string>();
    for (const u of cur.units) if (subs.includes(u.subject)) sems.add(`${u.grade}-${u.semester}`);
    semSel.replaceChildren(el('option', { value: '' }, '모든 학기'), ...[...sems].sort().map((s) => { const [g, se] = s.split('-'); return el('option', { value: s }, semLabel(+g, +se)); }));
    semSel.value = [...sems].includes(f.sem) ? f.sem : '';
    f.sem = semSel.value;
  }
  function fillUnits() {
    const units = cur.units.filter((u) => (!f.subject || u.subject === f.subject) && (!f.sem || `${u.grade}-${u.semester}` === f.sem));
    unitSel.replaceChildren(el('option', { value: '' }, '모든 단원'), ...units.map((u) => el('option', { value: u.id }, `${u.unitNo}. ${u.title}`)));
    unitSel.value = units.some((u) => u.id === f.unit) ? f.unit : '';
    f.unit = unitSel.value;
  }
  function fillLessons() {
    const lessons = cur.lessons.filter((l) => (!f.subject || l.subject === f.subject) && (!f.sem || `${l.grade}-${l.semester}` === f.sem) && (!f.unit || l.unitId === f.unit));
    lessonSel.replaceChildren(el('option', { value: '' }, '모든 차시'), ...lessons.map((l) => el('option', { value: l.id }, `${l.lessonNo}. ${l.title}${l.isReview ? ' (복습)' : ''}`)));
    lessonSel.value = lessons.some((l) => l.id === f.lesson) ? f.lesson : '';
    f.lesson = lessonSel.value;
  }

  function filtered(): Question[] {
    const s = f.search.trim().toLowerCase();
    return questions.filter((q) => {
      const l = lessonMap.get(q.lessonId);
      if (f.subject && q.subject !== f.subject) return false;
      if (f.sem && (!l || `${l.grade}-${l.semester}` !== f.sem)) return false;
      if (f.unit && (!l || l.unitId !== f.unit)) return false;
      if (f.lesson && q.lessonId !== f.lesson) return false;
      if (s) {
        const hay = [q.id, q.prompt, q.hint, q.explain, q.type, q.listen?.text, ...(q.choices ?? []).map((c) => `${c.text ?? ''} ${c.emoji ?? ''}`)].join(' ').toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }

  function renderLessonBox(list: Question[]) {
    lessonBox.replaceChildren();
    if (orphanLessons.length) lessonBox.append(el('div', { class: 'qb-warn' }, `⚠️ 교육과정에 없는 차시의 문제가 있어요: ${orphanLessons.slice(0, 8).join(', ')}${orphanLessons.length > 8 ? ' …' : ''}`));
    if (f.lesson) {
      const l = lessonMap.get(f.lesson);
      if (l) {
        const u = unitMap.get(l.unitId);
        const diffs = [1, 2, 3, 4, 5].map((d) => list.filter((q) => q.difficulty === d).length);
        lessonBox.append(el('div', { class: 'qb-lesson' },
          el('h2', {}, `${SUBJECT_LABEL[l.subject]} · ${semLabel(l.grade, l.semester)} · ${u ? `${u.unitNo}. ${u.title}` : l.unitId} · ${l.lessonNo}차시 ${l.title}`),
          el('div', { class: 'qb-goal' }, `🎯 학습 목표: ${l.goal}`),
          el('div', { class: 'qb-meta' }, `${l.id} · 순서 ${l.order} · 완료 조건 ${l.requiredCorrect}문제 정답${l.isReview ? ' · 복습 차시' : ''} · 난이도별 문제 수: ${diffs.map((n, i) => `${i + 1}:${n}`).join('  ')}`),
        ));
      }
    } else if (f.unit) {
      const u = unitMap.get(f.unit);
      const lessons = cur.lessons.filter((l) => l.unitId === f.unit);
      if (u) lessonBox.append(el('div', { class: 'qb-lesson' },
        el('h2', {}, `${SUBJECT_LABEL[u.subject]} · ${semLabel(u.grade, u.semester)} · ${u.unitNo}. ${u.title}`),
        u.description ? el('div', { class: 'qb-goal' }, u.description) : null,
        el('div', { class: 'qb-meta' }, `차시 ${lessons.length}개 · 문제 ${list.length}개`),
      ));
    }
  }

  function render() {
    const list = filtered();
    count.textContent = `${list.length}개 표시 (전체 ${questions.length}개)`;
    renderLessonBox(list);
    grid.replaceChildren();
    if (!list.length) {
      grid.append(el('div', { class: 'qb-empty' }, questions.length ? '조건에 맞는 문제가 없어요.' : '문제 데이터가 아직 없어요. (public/data/questions/*.json)'));
      return;
    }
    for (const q of list.slice(0, shown)) grid.append(questionCard(q, lessonMap.get(q.lessonId)));
    const more = document.getElementById('qb-more');
    more?.remove();
    if (list.length > shown) main.append(el('button', { id: 'qb-more', class: 'qb-more', type: 'button', onclick: () => { shown += PAGE_SIZE; render(); } }, `더 보기 (${list.length - shown}개 남음)`));
  }

  const onFilter = () => { shown = PAGE_SIZE; render(); };
  subjectSel.addEventListener('change', () => { f.subject = subjectSel.value as Filters['subject']; fillSem(); fillUnits(); fillLessons(); onFilter(); });
  semSel.addEventListener('change', () => { f.sem = semSel.value; fillUnits(); fillLessons(); onFilter(); });
  unitSel.addEventListener('change', () => { f.unit = unitSel.value; fillLessons(); onFilter(); });
  lessonSel.addEventListener('change', () => { f.lesson = lessonSel.value; onFilter(); });
  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  search.addEventListener('input', () => { if (searchTimer) clearTimeout(searchTimer); searchTimer = setTimeout(() => { f.search = search.value; onFilter(); }, 200); });
  resetBtn.addEventListener('click', () => { f.subject = ''; f.sem = ''; f.unit = ''; f.lesson = ''; f.search = ''; subjectSel.value = ''; search.value = ''; fillSem(); fillUnits(); fillLessons(); onFilter(); });

  // deep link: ?lesson=m11-u1-l1 / ?q=m11-u1-l1-003 / ?subject=math
  const p = new URLSearchParams(location.search);
  const qId = p.get('q');
  if (p.get('subject') === 'math' || p.get('subject') === 'english') { f.subject = p.get('subject') as Subject; subjectSel.value = f.subject; }
  if (p.get('lesson')) { const l = lessonMap.get(p.get('lesson')!); if (l) { f.subject = l.subject; subjectSel.value = l.subject; f.sem = `${l.grade}-${l.semester}`; f.unit = l.unitId; f.lesson = l.id; } }
  if (qId) { f.search = qId; search.value = qId; }
  fillSem(); fillUnits(); fillLessons();
  render();
  (window as unknown as { __QB: unknown }).__QB = { curriculum: cur, questions };
}

void G; // browser page runs without the game registry; questionView guards every G access
main().catch((err) => { root.textContent = '문제를 불러오지 못했어요. ' + String(err); console.error(err); });
