// Visual QA page: renders every sample question card statically (real renderer) with a button
// to open it in the real question modal. Query params: ?open=<id> opens that modal on load;
// ?auto=correct|wrong enables the e2e auto-answer hook; ?filter=<kind> shows one visual kind.
import type { Question, Visual } from '../src/core/types';
import { el } from '../src/core/util';
import { G } from '../src/game';
import { createLearn } from '../src/learn';
import { ask } from '../src/learn/questionView';
import { renderVisual } from '../src/learn/visuals';
import samplesJson from './sample-questions.json';
import '../src/learn/learn.css';

const samples = samplesJson as unknown as Question[];
const params = new URLSearchParams(location.search);
const auto = params.get('auto');
if (auto === 'correct' || auto === 'wrong') (window as unknown as { __TEST__: unknown }).__TEST__ = { autoAnswer: auto };

G.learn = createLearn();
G.debug = true;
void G.learn.init();

const root = document.getElementById('dv-root')!;
const log = el('div', { class: 'dv-log' }, '카드의 [모달 열기]를 눌러 실제 문제 카드를 확인하세요.');

function visualKinds(q: Question): string[] {
  const kinds = new Set<string>();
  const walk = (v?: Visual) => { if (!v) return; kinds.add(v.kind); if (v.kind === 'row') v.items.forEach(walk); };
  walk(q.visual);
  q.choices?.forEach((c) => { if (c.visual) { kinds.add('choice:' + c.visual.kind); } });
  if (q.listen) kinds.add('listen');
  if (q.answerMode === 'numpad') kinds.add('numpad');
  if (q.choices?.some((c) => c.emoji && !c.text)) kinds.add('emoji-choices');
  return [...kinds];
}

async function openModal(q: Question) {
  log.textContent = `열림: ${q.id}`;
  const r = await ask(q, { purpose: 'practice', title: '연습 문제' });
  log.textContent = `${q.id} → ${r.correct ? '정답' : '오답'} (시도 ${r.attempts}, ${Math.round(r.elapsedMs)}ms, firstTry=${r.firstTry})`;
  (window as unknown as { __LAST_RESULT: unknown }).__LAST_RESULT = r;
}

function card(q: Question): HTMLElement {
  const kinds = visualKinds(q);
  const head = el('div', { class: 'dv-card-head' }, el('span', {}, q.id), ...kinds.map((k) => el('span', { class: 'kind' }, k)),
    el('button', { class: 'open', type: 'button', onclick: () => { void openModal(q); } }, '모달 열기'));
  const body = el('div', { class: 'dv-visual' }, q.visual ? renderVisual(q.visual) : el('span', { style: { color: '#aaa' } }, q.listen ? `🔊 ${q.listen.text}` : '(그림 없음)'));
  const answers = el('div', { class: 'dv-choices' });
  if (q.answerMode === 'choice') {
    for (const c of q.choices ?? []) {
      answers.append(el('div', { class: `dv-choice ${c.id === q.answer ? 'is-answer' : ''}` },
        el('b', {}, c.id + '.'), c.visual ? renderVisual(c.visual) : null, c.emoji ?? '', c.text ?? '', c.speak ? ' 🔊' : ''));
    }
  } else answers.append(el('div', { class: 'dv-answer' }, `숫자판 정답: ${q.answer}`));
  return el('div', { class: 'dv-card', 'data-id': q.id }, head, el('div', { class: 'dv-prompt' }, q.prompt), body, answers);
}

const filter = params.get('filter');
const shown = filter ? samples.filter((q) => visualKinds(q).some((k) => k.includes(filter))) : samples;

const top = el('div', { class: 'dv-top' },
  el('h1', {}, `Visual QA (${shown.length}/${samples.length})`),
  el('button', { type: 'button', onclick: () => { void openModal(shown[0]); } }, '첫 문제 모달'),
  el('button', { type: 'button', onclick: async () => { for (const q of shown) await openModal(q); } }, '전부 차례로 풀기'),
  el('label', {}, el('input', { type: 'checkbox', onchange: (e: Event) => { (window as unknown as { __TEST__?: unknown }).__TEST__ = (e.target as HTMLInputElement).checked ? { autoAnswer: 'correct' } : undefined; } }), ' 자동 정답(테스트)'),
);
root.append(top, el('div', { class: 'dv-grid' }, ...shown.map(card)), log);

const openId = params.get('open');
if (openId) {
  const q = samples.find((x) => x.id === openId);
  if (q) setTimeout(() => { void openModal(q); }, 50);
  else log.textContent = `없는 id: ${openId}`;
}
