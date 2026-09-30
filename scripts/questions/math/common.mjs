// Shared helpers for the math generators (deterministic; seeded by lesson id).
import { rng, seedOf, randInt, pick, shuffle, sample, makeChoices, nearNumbers, lessonBuilder, ORDINAL_KO } from '../lib.mjs';
export { rng, seedOf, randInt, pick, shuffle, sample, makeChoices, nearNumbers, ORDINAL_KO };

// ------------------------------------------------------------ korean text ----
export function batchim(w) {
  const s = String(w).trim();
  if (!s) return false;
  const ch = s[s.length - 1];
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
  if (/[0-9]/.test(ch)) return '013678'.includes(ch);
  return false;
}
export const eun = (w) => w + (batchim(w) ? '은' : '는');
export const iga = (w) => w + (batchim(w) ? '이' : '가');
export const eul = (w) => w + (batchim(w) ? '을' : '를');
export const wa = (w) => w + (batchim(w) ? '과' : '와');

const SINO_D = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
/** 한자어 수 읽기: 0..9999 (십, 백, 천 앞의 '일'은 생략). */
export function sino(n) {
  if (n === 0) return '영';
  const th = Math.floor(n / 1000), h = Math.floor(n / 100) % 10, t = Math.floor(n / 10) % 10, o = n % 10;
  let s = '';
  if (th) s += (th === 1 ? '' : SINO_D[th]) + '천';
  if (h) s += (h === 1 ? '' : SINO_D[h]) + '백';
  if (t) s += (t === 1 ? '' : SINO_D[t]) + '십';
  if (o) s += SINO_D[o];
  return s;
}
const NAT_ONES = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
const NAT_TENS = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
/** 고유어 수 읽기: 1..99. */
export function native(n) {
  if (n === 0) return '영';
  return NAT_TENS[Math.floor(n / 10)] + NAT_ONES[n % 10];
}

// ------------------------------------------------------------ objects ------
/** e = emoji, n = name, c = counter (개/마리/…). */
export const OBJ = [
  { e: '🍎', n: '사과', c: '개' }, { e: '🍓', n: '딸기', c: '개' }, { e: '🍌', n: '바나나', c: '개' }, { e: '🍊', n: '귤', c: '개' },
  { e: '⭐', n: '별', c: '개' }, { e: '🎈', n: '풍선', c: '개' }, { e: '🍪', n: '과자', c: '개' }, { e: '⚽', n: '공', c: '개' },
  { e: '🍩', n: '도넛', c: '개' }, { e: '🧁', n: '컵케이크', c: '개' }, { e: '🌸', n: '꽃', c: '송이' }, { e: '🍉', n: '수박', c: '개' },
  { e: '🐤', n: '병아리', c: '마리' }, { e: '🐟', n: '물고기', c: '마리' }, { e: '🐞', n: '무당벌레', c: '마리' }, { e: '🦋', n: '나비', c: '마리' },
  { e: '🐸', n: '개구리', c: '마리' }, { e: '🐶', n: '강아지', c: '마리' }, { e: '🐱', n: '고양이', c: '마리' }, { e: '🐰', n: '토끼', c: '마리' },
  { e: '🥕', n: '당근', c: '개' }, { e: '🎁', n: '선물', c: '개' }, { e: '🍬', n: '사탕', c: '개' }, { e: '🧸', n: '곰 인형', c: '개' },
  { e: '✏️', n: '연필', c: '자루' }, { e: '📚', n: '책', c: '권' }, { e: '🚗', n: '자동차', c: '대' }, { e: '🌻', n: '해바라기', c: '송이' },
];
export const obj = (r) => pick(r, OBJ);
export function obj2(r) { const [a, b] = sample(r, OBJ, 2); return [a, b]; }

// ------------------------------------------------------------ context ------
export function makeCtx(lessonId) {
  return { id: lessonId, L: lessonBuilder(lessonId, 'math'), r: rng(seedOf(lessonId)) };
}
const polish = text => typeof text !== 'string' ? text : text
  .replace(/([가-힣0-9]+)은\(는\)/g, (_, word) => eun(word))
  .replace(/([가-힣0-9]+)을\(를\)/g, (_, word) => eul(word))
  .replace(/([가-힣0-9]+)이\(가\)/g, (_, word) => iga(word))
  .replace(/([가-힣0-9]+)과\(와\)/g, (_, word) => wa(word));
const ko = (text) => [{ text: polish(text), lang: 'ko-KR' }];

/** numpad question. answer: integer. */
export function addNum(ctx, { type, prompt, speak, visual, answer, hint, explain, difficulty }) {
  const a = Math.round(answer);
  if (!(a >= 0 && a <= 9999)) throw new Error(`${ctx.id}: numpad answer out of range ${answer} (${prompt})`);
  return ctx.L.add({ type, prompt: polish(prompt), speak: speak ? ko(speak) : undefined, visual, answerMode: 'numpad', answer: String(a), hint: polish(hint), explain: polish(explain), difficulty });
}
/** choice question. correct/distractors are values; toChoice renders them. */
export function addChoice(ctx, { type, prompt, speak, visual, correct, distractors, toChoice, hint, explain, difficulty, n = 4 }) {
  const { choices, answer } = makeChoices(ctx.r, correct, distractors, toChoice, n);
  if (choices.length < 2) return false;
  return ctx.L.add({ type, prompt: polish(prompt), speak: speak ? ko(speak) : undefined, visual, answerMode: 'choice', choices, answer, hint: polish(hint), explain: polish(explain), difficulty });
}
export const asText = (v) => ({ text: String(v) });
export const asEmoji = (v) => ({ emoji: String(v) });

/** difficulty ladder by fill progress: 1 → 2 → 3. */
export const ladder = (count, target) => Math.min(3, 1 + Math.floor((3 * count) / target));

/**
 * Fill a lesson to `target` questions. gens = one fn or an array of (ctx, d) => void.
 * Each gen call adds ≤ 1 question (duplicates are silently dropped by the builder).
 */
export function fill(ctx, target, gens) {
  const list = Array.isArray(gens) ? gens : [gens];
  let guard = 0;
  while (ctx.L.count < target && guard < target * 60) {
    const d = ladder(ctx.L.count, target);
    list[guard % list.length](ctx, d);
    guard++;
  }
  if (ctx.L.count < target) throw new Error(`${ctx.id}: only ${ctx.L.count}/${target} questions generated`);
}

// ------------------------------------------------------------ visuals ------
export const V = {
  text: (text, size = 'xl') => ({ kind: 'text', text, size }),
  count: (emoji, count, layout = 'grid') => ({ kind: 'count', emoji, count, layout }),
  groups: (groups, op = null) => ({ kind: 'groups', groups, op }),
  compare: (left, right) => ({ kind: 'compare', left, right }),
  clock: (hour, minute) => ({ kind: 'clock', hour, minute }),
  shapes: (items) => ({ kind: 'shapes', items }),
  pattern: (items) => ({ kind: 'pattern', items }),
  blocks: (o) => ({ kind: 'blocks', tens: 0, ones: 0, ...o }),
  numberline: (o) => ({ kind: 'numberline', ...o }),
  row: (items) => ({ kind: 'row', items }),
  grid: (rows, header = false) => ({ kind: 'grid', rows, header }),
};
export const countLayout = (n, d) => (n > 20 ? 'grid' : d >= 3 ? 'scatter' : n <= 5 ? 'row' : d === 1 ? 'tenframe' : 'grid');

// ------------------------------------------------------------ speak --------
/** '3 + 4 = □' → '3 더하기 4는 얼마일까요?' */
export function speakExpr(expr) {
  const s = expr.replace(/\s+/g, ' ').trim();
  const m = s.match(/^(.+?) = □$/);
  if (m) return `${speakTerms(m[1])}${batchim(lastTerm(m[1])) ? '은' : '는'} 얼마일까요?`;
  return speakTerms(s) + ' 빈칸에 알맞은 수는 얼마일까요?';
}
const lastTerm = (t) => t.trim().split(' ').pop();
export function speakTerms(t) {
  return t.replace(/ \+ /g, ' 더하기 ').replace(/ - /g, ' 빼기 ').replace(/ × /g, ' 곱하기 ').replace(/□/g, '어떤 수').replace(/ = /g, '는 ');
}

// ------------------------------------------------------------ generic gens -
/** 세기(numpad): "사과는 모두 몇 개일까요?" */
export function qCount(ctx, d, lo, hi, { layout } = {}) {
  const r = ctx.r, o = obj(r), n = randInt(r, lo, hi);
  addNum(ctx, {
    type: 'count', prompt: `${eun(o.n)} 모두 몇 ${o.c}일까요?`, visual: V.count(o.e, n, layout || countLayout(n, d)), answer: n,
    hint: '하나씩 손가락으로 짚으며 세어 보세요.', explain: `${eun(o.n)} 모두 ${n}${o.c}예요.`, difficulty: d,
  });
}
/** 수에 맞는 그림 고르기(choice with count visuals). */
export function qCountPick(ctx, d, lo, hi) {
  const r = ctx.r, o = obj(r), n = randInt(r, lo, hi);
  const ds = nearNumbers(r, n, 3, { min: Math.max(1, lo - 1), max: hi + 1, spread: 2 });
  addChoice(ctx, {
    type: 'count', prompt: `${iga(o.n)} ${n}${o.c}인 그림을 골라 보세요.`, visual: V.text(String(n)),
    correct: n, distractors: ds, toChoice: (v) => ({ visual: V.count(o.e, v, v <= 5 ? 'row' : 'grid') }),
    hint: `그림마다 ${eul(o.n)} 세어 보세요.`, explain: `${iga(o.n)} ${n}${o.c}인 그림이 정답이에요.`, difficulty: d,
  });
}
/** 수 읽기(choice): "7은 어떻게 읽을까요?" native/sino */
export function qRead(ctx, d, lo, hi, { native: useNative = true } = {}) {
  const r = ctx.r, n = randInt(r, lo, hi);
  const nat = useNative && n <= 99 && r() < 0.5;
  const rd = nat ? native : sino;
  const ds = nearNumbers(r, n, 3, { min: Math.max(1, lo - 2), max: hi + 2, spread: 3 }).map(rd);
  addChoice(ctx, {
    type: 'read', prompt: `${eun(String(n))} 어떻게 읽을까요?`, speak: `이 수는 어떻게 읽을까요?`, visual: V.text(String(n)),
    correct: rd(n), distractors: ds, toChoice: asText,
    hint: nat ? '하나, 둘, 셋… 순서로 세어 보세요.' : '일, 이, 삼… 순서로 읽어 보세요.', explain: `${eun(String(n))} '${sino(n)}'${n <= 99 ? ` 또는 '${native(n)}'` : ''}라고 읽어요.`, difficulty: d,
  });
}
/** 읽은 수 쓰기(numpad): '삼십오' → 35 */
export function qWrite(ctx, d, lo, hi) {
  const r = ctx.r, n = randInt(r, lo, hi), word = sino(n);
  addNum(ctx, {
    type: 'read', prompt: `'${word}'을(를) 수로 써 보세요.`, speak: `${word}을 숫자로 써 보세요.`, visual: V.text(word, 'lg'), answer: n,
    hint: '십은 10, 백은 100을 나타내요.', explain: `${word}은(는) ${n}이에요.`, difficulty: d,
  });
}

/** 덧셈/뺄셈 numpad. op '+'|'-'; a,b ranges; withVisual → groups picture (d1). */
export function qArith(ctx, d, { op, a, b, min = 0, max = 9999, pic = false, cond } = {}) {
  const r = ctx.r;
  for (let t = 0; t < 40; t++) {
    const x = randInt(r, a[0], a[1]), y = randInt(r, b[0], b[1]);
    const ans = op === '+' ? x + y : op === '-' ? x - y : x * y;
    if (ans < min || ans > max || (op === '-' && x < y)) continue;
    if (cond && !cond(x, y, ans)) continue;
    const expr = `${x} ${op} ${y} = □`;
    let visual = V.text(expr);
    if (pic && x + y <= 30 && op !== '×') {
      const o = obj(r);
      visual = op === '+' ? V.groups([{ emoji: o.e, count: x }, { emoji: o.e, count: y }], '+') : V.groups([{ emoji: o.e, count: x, crossed: y }]);
      visual = V.row([visual, V.text(expr, 'lg')]);
    }
    const name = op === '+' ? '더하기' : op === '-' ? '빼기' : '곱하기';
    addNum(ctx, {
      type: op === '+' ? 'add' : op === '-' ? 'sub' : 'mul', prompt: '빈칸에 알맞은 수를 써 보세요.', speak: speakExpr(expr), visual, answer: ans,
      hint: op === '+' ? `${x}에서 ${y}만큼 이어 세어 보세요.` : op === '-' ? `${x}에서 ${y}만큼 거꾸로 세어 보세요.` : `${x}을(를) ${y}번 더해 보세요.`,
      explain: `${x} ${name} ${eun(String(y))} ${ans}입니다.`, difficulty: d,
    });
    return;
  }
}
/** □가 있는 식: "3 + □ = 7" / "□ - 2 = 5" (numpad). pos: 'a'|'b' which term is blank. */
export function qBlank(ctx, d, { op, a, b, min = 0, max = 9999, pos, cond } = {}) {
  const r = ctx.r;
  for (let t = 0; t < 40; t++) {
    const x = randInt(r, a[0], a[1]), y = randInt(r, b[0], b[1]);
    const res = op === '+' ? x + y : op === '-' ? x - y : x * y;
    if (res < min || res > max || (op === '-' && x < y) || (op === '×' && (x === 0 || y === 0))) continue;
    if (cond && !cond(x, y, res)) continue;
    const p = pos || (r() < 0.5 ? 'a' : 'b');
    const expr = p === 'a' ? `□ ${op} ${y} = ${res}` : `${x} ${op} □ = ${res}`;
    const ans = p === 'a' ? x : y;
    const name = op === '+' ? '더하기' : op === '-' ? '빼기' : '곱하기';
    const hint = op === '+' ? `${res}에서 ${p === 'a' ? y : x}을(를) 빼면 돼요.` : op === '-' ? (p === 'a' ? `${res}과(와) ${y}을(를) 더해 보세요.` : `${x}에서 ${res}을(를) 빼 보세요.`) : `${res}은(는) ${p === 'a' ? y : x}의 몇 배일까요?`;
    addNum(ctx, {
      type: 'blank', prompt: '□ 안에 알맞은 수를 써 보세요.', speak: speakExpr(expr), visual: V.text(expr), answer: ans,
      hint, explain: `${x} ${name} ${eun(String(y))} ${res}입니다. □에 ${eul(String(ans))} 넣어요.`, difficulty: d,
    });
    return;
  }
}
/** 이야기(문장제) numpad: op '+'|'-' */
export function qStory(ctx, d, { op, a, b, min = 0, max = 9999, cond } = {}) {
  const r = ctx.r;
  for (let t = 0; t < 40; t++) {
    const x = randInt(r, a[0], a[1]), y = randInt(r, b[0], b[1]);
    const ans = op === '+' ? x + y : x - y;
    if (ans < min || ans > max || (op === '-' && x < y)) continue;
    if (cond && !cond(x, y, ans)) continue;
    const o = obj(r);
    let prompt, explain;
    if (op === '+') {
      prompt = r() < 0.5 ? `${o.n} ${x}${o.c}와 ${y}${o.c}가 있어요. 모두 몇 ${o.c}일까요?` : `${o.n} ${x}${o.c}에 ${y}${o.c}를 더 샀어요. 모두 몇 ${o.c}일까요?`;
      explain = `${x} 더하기 ${eun(String(y))} ${ans}입니다.`;
    } else {
      prompt = r() < 0.5 ? `${o.n} ${x}${o.c} 중 ${y}${o.c}를 나눠 주었어요. 몇 ${o.c} 남았을까요?` : `${o.n} ${x}${o.c} 중 ${y}${o.c}를 주었어요. 몇 ${o.c} 남았을까요?`;
      explain = `${x} 빼기 ${eun(String(y))} ${ans}입니다.`;
    }
    if ([...prompt].length > 40) continue;
    const visual = x + y <= 30 ? (op === '+' ? V.groups([{ emoji: o.e, count: x }, { emoji: o.e, count: y }], '+') : V.groups([{ emoji: o.e, count: x, crossed: y }])) : V.text(`${x} ${op} ${y}`, 'lg');
    addNum(ctx, { type: 'story', prompt, visual, answer: ans, hint: `${op === '+' ? '덧셈식' : '뺄셈식'}으로 나타내면 ${x} ${op} ${y}예요.`, explain, difficulty: d });
    return;
  }
}

/** 크기 비교. mode: 'bigger'|'smaller'|'biggest'|'smallest'|'sign'|'pic' */
export function qCompare(ctx, d, lo, hi, mode) {
  const r = ctx.r;
  if (mode === 'pic') {
    const [o1, o2] = obj2(r);
    let a = randInt(r, lo, hi), b = randInt(r, lo, hi);
    if (a === b) b = a === hi ? a - 1 : a + 1;
    const more = r() < 0.5;
    const ans = (a > b) === more ? o1 : o2;
    addChoice(ctx, {
      type: 'compare', prompt: `어느 것이 더 ${more ? '많을' : '적을'}까요?`, visual: V.compare({ emoji: o1.e, count: a, label: o1.n }, { emoji: o2.e, count: b, label: o2.n }),
      correct: ans.n, distractors: [ans === o1 ? o2.n : o1.n], toChoice: asText, n: 2,
      hint: '하나씩 짝을 지어 비교해 보세요.', explain: `${o1.n} ${a}${o1.c}, ${o2.n} ${b}${o2.c}이므로 ${iga(ans.n)} 더 ${more ? '많아요' : '적어요'}.`, difficulty: d,
    });
    return;
  }
  if (mode === 'sign') {
    let a = randInt(r, lo, hi), b = randInt(r, lo, hi);
    if (a === b) b = a === hi ? a - 1 : a + 1;
    const sign = a > b ? '>' : '<';
    addChoice(ctx, {
      type: 'compare', prompt: '○ 안에 >, < 중 알맞은 것을 골라 보세요.', speak: `${a}과 ${b} 중 어느 수가 더 클까요? 알맞은 기호를 골라 보세요.`, visual: V.text(`${a} ○ ${b}`),
      correct: sign, distractors: ['<', '>'], toChoice: asText, n: 2,
      hint: '벌어진 쪽이 더 큰 수예요.', explain: `${a}은(는) ${b}보다 ${a > b ? '크므로' : '작으므로'} ${a} ${sign} ${b}예요.`, difficulty: d,
    });
    return;
  }
  if (mode === 'biggest' || mode === 'smallest') {
    const set = new Set();
    while (set.size < 3) set.add(randInt(r, lo, hi));
    const arr = [...set];
    const ans = mode === 'biggest' ? Math.max(...arr) : Math.min(...arr);
    addChoice(ctx, {
      type: 'compare', prompt: `가장 ${mode === 'biggest' ? '큰' : '작은'} 수를 골라 보세요.`, visual: V.text(arr.join('   '), 'lg'),
      correct: ans, distractors: arr.filter((v) => v !== ans), toChoice: asText, n: 3,
      hint: hi >= 10 ? '자릿수가 많거나 앞자리 숫자가 큰 수가 더 커요.' : '수를 순서대로 세어 보면 뒤에 오는 수가 더 커요.', explain: `${arr.join(', ')} 중 가장 ${mode === 'biggest' ? '큰' : '작은'} 수는 ${ans}이에요.`, difficulty: d,
    });
    return;
  }
  let a = randInt(r, lo, hi), b = randInt(r, lo, hi);
  if (a === b) b = a === hi ? a - 1 : a + 1;
  const bigger = mode === 'bigger';
  const ans = bigger === a > b ? a : b;
  addChoice(ctx, {
    type: 'compare', prompt: `더 ${bigger ? '큰' : '작은'} 수를 골라 보세요.`, visual: V.compare({ number: a }, { number: b }),
    correct: ans, distractors: [ans === a ? b : a], toChoice: asText, n: 2,
    hint: hi >= 10 ? '앞자리 숫자부터 비교해 보세요.' : '수를 순서대로 세면 뒤에 오는 수가 더 커요.', explain: `${a}과(와) ${b} 중 더 ${bigger ? '큰' : '작은'} 수는 ${ans}이에요.`, difficulty: d,
  });
}

/** 수 모형(blocks) 읽기 numpad. ranges: {th:[..], h:[..], t:[..], o:[..]} */
export function qBlocks(ctx, d, rg) {
  const r = ctx.r;
  const th = rg.th ? randInt(r, rg.th[0], rg.th[1]) : 0, h = rg.h ? randInt(r, rg.h[0], rg.h[1]) : 0, t = rg.t ? randInt(r, rg.t[0], rg.t[1]) : 0, o = rg.o ? randInt(r, rg.o[0], rg.o[1]) : 0;
  const n = th * 1000 + h * 100 + t * 10 + o;
  if (n === 0) return;
  const parts = [th && `천 모형 ${th}개`, h && `백 모형 ${h}개`, t && `십 모형 ${t}개`, o && `일 모형 ${o}개`].filter(Boolean).join(', ');
  addNum(ctx, {
    type: 'place-value', prompt: '수 모형이 나타내는 수를 써 보세요.', visual: V.blocks({ thousands: th, hundreds: h, tens: t, ones: o }), answer: n,
    hint: n < 100 ? '10개씩 묶음의 수와 낱개의 수를 세어 보세요.' : '천, 백, 십, 일 모형의 수를 차례로 세어 보세요.', explain: `${parts}이므로 ${n}이에요.`, difficulty: d,
  });
}
/** "100이 2개, 10이 3개, 1이 5개인 수" numpad */
export function qCompose(ctx, d, rg) {
  const r = ctx.r;
  const th = rg.th ? randInt(r, rg.th[0], rg.th[1]) : 0, h = rg.h ? randInt(r, rg.h[0], rg.h[1]) : 0, t = rg.t ? randInt(r, rg.t[0], rg.t[1]) : 0, o = rg.o ? randInt(r, rg.o[0], rg.o[1]) : 0;
  const n = th * 1000 + h * 100 + t * 10 + o;
  if (n === 0) return;
  const parts = [];
  if (rg.th) parts.push(`1000이 ${th}개`);
  if (rg.h) parts.push(`100이 ${h}개`);
  if (rg.t) parts.push(n < 100 ? `10개씩 묶음 ${t}개` : `10이 ${t}개`);
  if (rg.o) parts.push(n < 100 ? `낱개 ${o}개` : `1이 ${o}개`);
  const text = parts.join(', ');
  addNum(ctx, {
    type: 'place-value', prompt: `${text}인 수를 써 보세요.`, visual: V.text(text.replace(/, /g, '\n'), 'lg'), answer: n,
    hint: '큰 자리부터 차례로 써 보세요.', explain: `${text}인 수는 ${n}이에요.`, difficulty: d,
  });
}
/** 자릿값: "352에서 5는 얼마를 나타낼까요?" / "십의 자리 숫자는?" */
export function qPlaceValue(ctx, d, lo, hi) {
  const r = ctx.r, n = randInt(r, lo, hi), s = String(n);
  const names = ['일', '십', '백', '천'];
  let i = randInt(r, 0, s.length - 1);
  if (s[s.length - 1 - i] === '0') i = s.length - 1;
  const digit = Number(s[s.length - 1 - i]), value = digit * 10 ** i;
  if (r() < 0.5) {
    addNum(ctx, {
      type: 'place-value', prompt: `${n}에서 ${names[i]}의 자리 숫자를 써 보세요.`, visual: V.text(s), answer: digit,
      hint: `오른쪽에서 ${['첫째', '둘째', '셋째', '넷째'][i]} 자리가 ${names[i]}의 자리예요.`, explain: `${n}의 ${names[i]}의 자리 숫자는 ${digit}이에요.`, difficulty: d,
    });
  } else {
    addNum(ctx, {
      type: 'place-value', prompt: `${n}에서 숫자 ${digit}은(는) 얼마를 나타낼까요?`, visual: V.text(s), answer: value,
      hint: `숫자 ${digit}은(는) ${names[i]}의 자리에 있어요.`, explain: `${names[i]}의 자리 ${digit}은(는) ${value}을(를) 나타내요.`, difficulty: d,
    });
  }
}
/** 뛰어 세기 / 수 배열 규칙: pattern with a blank → numpad */
export function qSkip(ctx, d, { start, step, len = 5, down = false, type = 'pattern' } = {}) {
  const r = ctx.r;
  const s0 = randInt(r, start[0], start[1]);
  const seq = Array.from({ length: len }, (_, i) => (down ? s0 - i * step : s0 + i * step));
  if (seq.some((v) => v < 0 || v > 9999)) return;
  const bi = randInt(r, 1, len - 1);
  const items = seq.map((v, i) => (i === bi ? null : String(v)));
  addNum(ctx, {
    type, prompt: '규칙을 찾아 빈칸에 알맞은 수를 써 보세요.', visual: V.pattern(items), answer: seq[bi],
    hint: `${step}씩 ${down ? '작아지고' : '커지고'} 있어요.`, explain: `${step}씩 ${down ? '거꾸로 ' : ''}뛰어 세면 빈칸은 ${seq[bi]}이에요.`, difficulty: d,
  });
}
/** 수직선 빈칸 numpad */
export function qNumberline(ctx, d, { from, span = 9, step = 1 } = {}) {
  const r = ctx.r;
  const f = randInt(r, from[0], from[1]);
  const to = f + span * step;
  const blank = f + step * randInt(r, 1, span - 1);
  addNum(ctx, {
    type: 'order', prompt: '수직선의 빈칸에 알맞은 수를 써 보세요.', visual: V.numberline({ from: f, to, step, blank }), answer: blank,
    hint: `${f}부터 ${step === 1 ? '1씩' : step + '씩'} 커지는 수직선이에요.`, explain: `빈칸의 수는 ${blank}이에요.`, difficulty: d,
  });
}
/** 다음 수 / 1 큰 수 / 1 작은 수 / 사이의 수 (numpad) */
export function qNext(ctx, d, lo, hi) {
  const r = ctx.r, n = randInt(r, lo, hi), k = randInt(r, 0, 3);
  if (k === 0 && n < 9999) addNum(ctx, { type: 'order', prompt: `${n} 바로 다음 수를 써 보세요.`, visual: V.text(`${n} → □`), answer: n + 1, hint: '수를 순서대로 셀 때 바로 뒤에 오는 수예요.', explain: `${n} 다음 수는 ${n + 1}이에요.`, difficulty: d });
  else if (k === 1 && n < 9999) addNum(ctx, { type: 'order', prompt: `${n}보다 1 큰 수를 써 보세요.`, visual: V.text(String(n)), answer: n + 1, hint: '1 큰 수는 바로 다음 수예요.', explain: `${n}보다 1 큰 수는 ${n + 1}이에요.`, difficulty: d });
  else if (k === 2 && n > 0) addNum(ctx, { type: 'order', prompt: `${n}보다 1 작은 수를 써 보세요.`, visual: V.text(String(n)), answer: n - 1, hint: '1 작은 수는 바로 앞의 수예요.', explain: `${n}보다 1 작은 수는 ${n - 1}이에요.`, difficulty: d });
  else if (n > 0 && n < 9999) addNum(ctx, { type: 'order', prompt: `${n - 1}과 ${n + 1} 사이에 있는 수를 써 보세요.`, visual: V.text(`${n - 1}  □  ${n + 1}`), answer: n, hint: `${n - 1} 다음 수를 생각해 보세요.`, explain: `${n - 1}과 ${n + 1} 사이의 수는 ${n}이에요.`, difficulty: d });
}

/** 시계 읽기. minutes: allowed minute values; mode 'read'|'numpad'|'pick' */
export function qClock(ctx, d, minutes, mode = 'read') {
  const r = ctx.r, h = randInt(r, 1, 12), m = pick(r, minutes);
  const label = (hh, mm) => (mm === 0 ? `${hh}시` : `${hh}시 ${mm}분`);
  const h1 = (h % 12) + 1, hm = ((h + 10) % 12) + 1;
  if (mode === 'pick') {
    const ds = [[h1, m], [h, m === 0 ? 30 : 0], [hm, m]].filter(([a, b]) => !(a === h && b === m));
    addChoice(ctx, {
      type: 'clock', prompt: `${label(h, m)}를 나타내는 시계를 골라 보세요.`, correct: [h, m], distractors: ds, toChoice: ([a, b]) => ({ visual: V.clock(a, b) }),
      hint: m === 0 ? '짧은바늘이 시, 긴바늘이 12를 가리켜야 해요.' : `긴바늘이 ${m === 30 ? '6' : m / 5}을 가리켜야 해요.`, explain: `${label(h, m)}는 짧은바늘이 ${m === 30 ? `${h}과 ${h1} 사이` : h}, 긴바늘이 ${m === 0 ? 12 : m / 5}을 가리켜요.`, difficulty: d,
    });
    return;
  }
  if (mode === 'numpad') {
    addNum(ctx, {
      type: 'clock', prompt: m === 0 ? '시계는 몇 시를 나타낼까요?' : `시계는 ${h}시 몇 분을 나타낼까요?`, visual: V.clock(h, m), answer: m === 0 ? h : m,
      hint: m === 0 ? '짧은바늘이 가리키는 숫자를 읽어요.' : '긴바늘이 가리키는 숫자에 5씩 곱해 보세요.', explain: `시계는 ${label(h, m)}를 나타내요.`, difficulty: d,
    });
    return;
  }
  const ds = new Set();
  ds.add(label(h1, m));
  if (m % 5 === 0 && m !== 0) ds.add(label(h, m / 5)); else ds.add(label(h, (m + 5) % 60));
  ds.add(label(hm, m));
  if (m === 30) ds.add(label(h, 0));
  ds.delete(label(h, m));
  addChoice(ctx, {
    type: 'clock', prompt: '시계가 나타내는 시각을 골라 보세요.', visual: V.clock(h, m), correct: label(h, m), distractors: [...ds], toChoice: asText,
    hint: m === 0 ? '긴바늘이 12를 가리키면 "몇 시"예요.' : '짧은바늘은 시, 긴바늘은 분을 나타내요.', explain: `짧은바늘이 ${m === 0 ? h : `${h}을(를) 지나고`}, 긴바늘이 ${m === 0 ? 12 : m % 5 === 0 ? m / 5 : `${Math.floor(m / 5)}에서 ${m % 5}칸 더`}${m === 0 ? '을(를) 가리키므로' : '이므로'} ${label(h, m)}예요.`, difficulty: d,
  });
}

/** 그림 → 알맞은 식 고르기(choice). op '+'|'-' */
export function qEqPick(ctx, d, { op, a, b, max = 9 } = {}) {
  const r = ctx.r;
  for (let t = 0; t < 40; t++) {
    const x = randInt(r, a[0], a[1]), y = randInt(r, b[0], b[1]);
    if (op === '-' && x < y) continue;
    const ans = op === '+' ? x + y : x - y;
    if (ans > max || x + y > 30) continue;
    const o = obj(r);
    const eq = (p, q, o2 = op) => `${p} ${o2} ${q} = ${o2 === '+' ? p + q : p - q}`;
    const ds = [eq(x, y, op === '+' ? '-' : '+'), eq(x + 1, y), eq(x, y + 1)].filter((s) => !s.includes('-') || Number(s.split(' ')[0]) >= Number(s.split(' ')[2]));
    addChoice(ctx, {
      type: op === '+' ? 'add' : 'sub', prompt: op === '+' ? '그림을 보고 알맞은 덧셈식을 골라 보세요.' : '그림을 보고 알맞은 뺄셈식을 골라 보세요.',
      visual: op === '+' ? V.groups([{ emoji: o.e, count: x }, { emoji: o.e, count: y }], '+') : V.groups([{ emoji: o.e, count: x, crossed: y }]),
      correct: eq(x, y), distractors: ds, toChoice: (v) => ({ text: v, speak: { text: speakTerms(v), lang: 'ko-KR' } }),
      hint: op === '+' ? `${o.n} ${x}${o.c}와 ${y}${o.c}를 더해요.` : `${o.n} ${x}${o.c} 중 ${y}${o.c}가 없어졌어요.`, explain: `${eq(x, y)}이(가) 알맞은 식이에요.`, difficulty: d,
    });
    return;
  }
}
