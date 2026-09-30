// English curriculum + question generator → buildEnglish(): { units, lessons, questions }
// Deterministic (seeded per lesson id). See docs/CURRICULUM_ENGLISH.md.
import { rng, seedOf, shuffle, lessonBuilder } from './lib.mjs';
import * as V from './english/vocab.mjs';
import * as G from './english/gen.mjs';

const { words, phrases, colors, phrase } = V;
const { cyc, T } = G;
const REVIEW_SIZE = 30;

// ============================================================ drills ======
/** Standard vocabulary drill (listen → picture ×2, picture → word, word → meaning, [listen → written word]). */
function vocabDrill(L, r, list, pool, { reading = true, easy = true, meaning = true } = {}) {
  if (easy) list.forEach((w, i) => G.listenPicture(L, r, w, pool, { n: 2 + (i % 2), v: 0 }));
  list.forEach((w, i) => G.listenPicture(L, r, w, pool, { n: 4, v: 1 + (i % 2) }));
  list.forEach((w, i) => G.pictureWord(L, r, w, pool, { v: i % 2 }));
  if (meaning) list.forEach((w, i) => G.wordMeaning(L, r, w, pool, { v: i % 2 }));
  if (reading) list.forEach((w, i) => G.listenWord(L, r, w, pool, { v: i % 2 }));
}
/** Sentence drill for a template: picture → sentence (×2 prompts) and 🔊 sentence → picture. */
function sentenceDrill(L, r, list, pool, tpl, { listen = true, n = 4 } = {}) {
  list.forEach((w, i) => G.sentencePicture(L, r, w, pool, tpl, { n: i % 2 ? n : 3, v: 0 }));
  list.forEach((w, i) => G.sentencePicture(L, r, w, pool, tpl, { n, v: 1 }));
  if (listen) list.forEach((w, i) => G.sentenceListen(L, r, w, pool, tpl, { n: 3 + (i % 2), v: i % 2 }));
}
/** Letter recognition drill: same-shape, 🔊 name (2 choices, 4 choices, look-alikes). */
function letterDrill(L, r, letters, unitLetters) {
  letters.forEach((l, i) => G.letterSame(L, r, l, { v: i % 2 }));
  letters.forEach((l) => G.letterName(L, r, l, unitLetters, { n: 2, v: 0 }));
  letters.forEach((l) => G.letterName(L, r, l, unitLetters, { n: 4, v: 1 }));
  letters.forEach((l) => G.letterName(L, r, l, unitLetters, { n: 4, v: 2, confusable: true }));
}
/** Alphabet-order drill over a consecutive range; windows of `len` with one blank. */
function orderDrill(L, r, range, { len = 4, count = 6, difficulty = 2 } = {}) {
  const wins = [];
  for (let s = 0; s + len <= range.length; s++) for (let b = 0; b < len; b++) wins.push([s, b]);
  const chosen = shuffle(r, wins).slice(0, count);
  chosen.forEach(([s, b], i) => G.alphabetOrder(L, r, range.slice(s, s + len), b, { v: i % 2, difficulty }));
}
/** Letter-sound drill: 🐻 + 🔊 bear → 'b'; 'b' → which picture. */
const wordsFor = (l) => words(...V.INITIAL_WORDS[l]);
const ALL_INITIAL = V.LOWER.flatMap((l) => wordsFor(l));
function soundDrill(L, r, letters) {
  const lessonWords = [];
  letters.forEach((l) => {
    if (l === 'x') {
      const xs = words(...V.FINAL_X_WORDS);
      xs.forEach((w) => G.finalSound(L, r, w));
      xs.forEach((w, i) => G.listenPicture(L, r, w, ALL_INITIAL, { n: 3, v: i % 3 }));
      return;
    }
    const ws = wordsFor(l);
    lessonWords.push(...ws);
    G.initialSound(L, r, ws[0], letters, { v: 0, caption: true });
    ws.slice(0, 2).forEach((w) => G.initialSound(L, r, w, letters, { v: 1 }));
    G.initialSound(L, r, ws[ws.length - 1], letters, { v: 0, confusable: true });
    G.letterPicture(L, r, l, ws[0], ALL_INITIAL);
    G.letterPicture(L, r, l, ws[1] || ws[0], ALL_INITIAL, { listenOnly: true });
  });
  shuffle(r, lessonWords).slice(0, 6).forEach((w, i) => G.listenPicture(L, r, w, lessonWords, { n: 3, v: i % 3 }));
}
/** Number drill over a range. */
function numberDrill(L, r, nums, range) {
  nums.forEach((k, i) => G.listenNumber(L, r, k, range, { n: 2 + (i % 2), v: 0 }));
  nums.forEach((k) => G.listenNumber(L, r, k, range, { n: 4, v: 1, difficulty: 2 }));
  nums.forEach((k, i) => G.countWord(L, r, k, range, { v: i % 2 }));
  nums.forEach((k, i) => G.digitWord(L, r, k, range, { v: i % 2 }));
  nums.forEach((k) => G.readNumber(L, r, k, range));
}
/** Color drill. */
function colorDrill(L, r, list, pool) {
  list.forEach((c, i) => G.listenColor(L, r, c, pool, { n: 2 + (i % 2), v: 0, shape: 'circle' }));
  list.forEach((c, i) => G.listenColor(L, r, c, pool, { n: 4, v: 1, shape: cyc(['square', 'star', 'heart'], i) }));
  list.forEach((c, i) => G.colorWord(L, r, c, pool, { v: i % 2, shape: cyc(['circle', 'square', 'star'], i) }));
  list.forEach((c, i) => G.colorMeaning(L, r, c, pool, { v: i % 2 }));
  list.forEach((c, i) => G.readColor(L, r, c, pool, { shape: cyc(['square', 'circle'], i) }));
}
/** Greeting drill. */
const GREET_POOL = V.PHRASES.filter((p) => ['hello', 'bye', 'morning', 'night', 'thanks', 'sorry'].includes(p.group));
const REPLY = { hello: null, bye: null, morning: null, afternoon: null, night: null, thanks: "You're welcome.", sorry: "That's OK.", nice: 'Nice to meet you, too.' };
const replyOf = (p) => (REPLY[p.group] ? phrase(REPLY[p.group]) : p);
function dialogWrongs(p) {
  const ok = new Set([p.group, ...(p.replies || [])]);
  return V.PHRASES.filter((x) => !ok.has(x.group) && !['welcome', 'ok'].includes(x.group) || (p.group !== 'thanks' && p.group !== 'sorry' && ['welcome', 'ok'].includes(x.group) && false));
}
function greetingDrill(L, r, list, { situations = true, reading = true } = {}) {
  const pool = [...GREET_POOL, ...list.filter((p) => !GREET_POOL.includes(p))];
  const picPool = V.PHRASES.filter((p) => p.emoji);
  list.forEach((p, i) => G.wordMeaning(L, r, p, pool, { v: 0, n: 2 + (i % 2), difficulty: 1 }));
  list.forEach((p, i) => G.wordMeaning(L, r, p, pool, { v: 1, n: 4 }));
  list.filter((p) => p.emoji).forEach((p, i) => { G.listenPicture(L, r, p, picPool, { n: 3, v: 0 }); G.listenPicture(L, r, p, picPool, { n: 4, v: 1 }); });
  list.filter(p => p.replies.length).forEach((p, i) => { const a = replyOf(p); G.dialog(L, r, p.en, { en: a.en, ko: a.ko }, dialogWrongs(p).map((x) => ({ en: x.en, ko: x.ko })), { n: 3, v: 0 }); });
  list.filter(p => p.replies.length).forEach((p, i) => { const a = replyOf(p); G.dialog(L, r, p.en, { en: a.en, ko: a.ko }, dialogWrongs(p).map((x) => ({ en: x.en, ko: x.ko })), { n: 4, v: 1, difficulty: 3 }); });
  if (situations) V.SITUATIONS.filter((s) => list.some((p) => p.group === s.group)).forEach((s) => G.situation(L, r, s, list.find((p) => p.group === s.group), pool));
  if (reading) list.forEach((p, i) => G.listenWord(L, r, p, pool, { v: i % 2 }));
}

// ====================================================== curriculum spec ====
const U = (title, description, lessons, reviewGoal) => ({ title, description, lessons, reviewGoal });
const Ls = (title, goal, build) => ({ title, goal, build });
const vowelUnit = (v, sample) => U(`짧은 ${v} 소리 Short ${v}`, `${sample} 같은 낱말에서 나는 짧은 ${v} 소리를 배워요.`, [
  Ls(`${v} 소리 낱말 배우기`, `짧은 ${v} 소리가 나는 낱말을 듣고 그림과 뜻을 고를 수 있어요.`, (L, r) => {
    const ws = words(...V.SHORT_VOWEL[v]);
    vocabDrill(L, r, ws, ws, { reading: false });
  }),
  Ls('빈칸에 글자 넣기', `c _ t처럼 빠진 글자를 듣고 채울 수 있어요.`, (L, r) => {
    const ws = words(...V.SHORT_VOWEL[v]);
    const ok = ws.filter((w) => V.MISSING_OK(w.en));
    ok.forEach((w, i) => G.missingLetter(L, r, w, { slot: 'vowel', v: i % 2 }));
    ok.forEach((w, i) => G.missingLetter(L, r, w, { slot: i % 2 ? 'first' : 'last', v: (i + 1) % 2 }));
    ws.slice(0, 4).forEach((w, i) => G.initialSound(L, r, w, [w.en[0]], { v: i % 2, confusable: true, difficulty: 2 }));
    ok.slice(0, 4).forEach((w, i) => G.missingLetter(L, r, w, { slot: 'vowel', v: 1 - (i % 2), difficulty: 3 }));
  }),
  Ls('낱말 읽어 보기', `짧은 ${v} 소리 낱말을 읽고 알맞은 그림과 문장을 고를 수 있어요.`, (L, r) => {
    const ws = words(...V.SHORT_VOWEL[v]);
    ws.forEach((w, i) => G.listenWord(L, r, w, ws, { v: i % 2, n: 3 + (i % 2), difficulty: 2 + (i % 2) }));
    ws.forEach((w, i) => G.wordMeaning(L, r, w, ws, { listen: false }));
    const sent = ws.filter((w) => !w.noSentence && w.cat !== 'family');
    sent.forEach((w, i) => G.sentencePicture(L, r, w, sent, T.itIs, { n: 3, v: i % 2 }));
    sent.slice(0, 5).forEach((w, i) => G.sentenceListen(L, r, w, sent, T.itIs, { n: 4, v: i % 2 }));
  }),
], `짧은 ${v} 소리 낱말을 듣고, 읽고, 빈칸을 채울 수 있어요.`);

const SEMESTERS = [
  // ------------------------------------------------------------ 1학년 1학기 ----
  { grade: 1, semester: 1, units: [
    U('안녕! Hello!', '만났을 때, 헤어질 때, 고마울 때 하는 영어 인사를 배워요.', [
      Ls('만나고 헤어지기 Hello! Bye!', 'Hello, Hi, Bye를 듣고 알맞은 뜻과 대답을 고를 수 있어요.', (L, r) => {
        greetingDrill(L, r, phrases('Hello!', 'Hi!', 'Bye!', 'Good-bye!', 'See you!'));
      }),
      Ls('아침과 밤 인사 Good morning!', 'Good morning, Good afternoon, Good night을 알맞게 쓸 수 있어요.', (L, r) => {
        greetingDrill(L, r, phrases('Good morning.', 'Good afternoon.', 'Good night.'));
        phrases('Hello!', 'Bye!').forEach((p) => G.dialog(L, r, p.en, { en: p.en, ko: p.ko }, dialogWrongs(p).map((x) => ({ en: x.en, ko: x.ko })), { n: 3, v: 0 }));
      }),
      Ls('고마워, 미안해 Thank you! Sorry!', 'Thank you, Sorry와 그 대답을 듣고 고를 수 있어요.', (L, r) => {
        greetingDrill(L, r, phrases('Thank you.', "You're welcome.", 'Sorry.', "That's OK.", 'Nice to meet you.'));
      }),
    ], '배운 인사말을 듣고 알맞은 뜻과 대답을 고를 수 있어요.'),
    U('알파벳 A~G', '큰 글자(대문자) A부터 G까지 이름을 듣고 찾아요.', [
      Ls('A B C D', 'A, B, C, D의 이름을 듣고 글자를 찾을 수 있어요.', (L, r) => { letterDrill(L, r, ['A', 'B', 'C', 'D'], ['A', 'B', 'C', 'D', 'E', 'F', 'G']); orderDrill(L, r, ['A', 'B', 'C', 'D'], { len: 3, count: 3 }); }),
      Ls('E F G', 'E, F, G의 이름을 듣고 글자를 찾을 수 있어요.', (L, r) => { letterDrill(L, r, ['E', 'F', 'G'], ['A', 'B', 'C', 'D', 'E', 'F', 'G']); ['A', 'B', 'C', 'D'].forEach((l) => G.letterName(L, r, l, ['E', 'F', 'G'], { n: 4, v: 1 })); orderDrill(L, r, ['D', 'E', 'F', 'G'], { len: 3, count: 3 }); }),
      Ls('A부터 G까지 순서대로', 'A부터 G까지 순서를 알고 빈칸의 글자를 찾을 수 있어요.', (L, r) => { const R = ['A', 'B', 'C', 'D', 'E', 'F', 'G']; orderDrill(L, r, R, { len: 4, count: 10 }); R.forEach((l, i) => G.letterName(L, r, l, R, { n: 4, v: i % 3, confusable: i % 2 === 0 })); R.slice(0, 4).forEach((l, i) => G.letterSame(L, r, l, { v: 1 })); }),
    ], 'A부터 G까지 글자 이름을 듣고 찾고, 순서를 말할 수 있어요.'),
    U('알파벳 H~N', '큰 글자 H부터 N까지 이름을 듣고 찾아요.', [
      Ls('H I J K', 'H, I, J, K의 이름을 듣고 글자를 찾을 수 있어요.', (L, r) => { letterDrill(L, r, ['H', 'I', 'J', 'K'], ['H', 'I', 'J', 'K', 'L', 'M', 'N']); orderDrill(L, r, ['G', 'H', 'I', 'J', 'K'], { len: 3, count: 3 }); }),
      Ls('L M N', 'L, M, N의 이름을 듣고 글자를 찾을 수 있어요.', (L, r) => { letterDrill(L, r, ['L', 'M', 'N'], ['H', 'I', 'J', 'K', 'L', 'M', 'N']); ['H', 'I', 'J', 'K'].forEach((l) => G.letterName(L, r, l, ['L', 'M', 'N'], { n: 4, v: 1 })); orderDrill(L, r, ['K', 'L', 'M', 'N'], { len: 3, count: 3 }); }),
      Ls('H부터 N까지 순서대로', 'A부터 N까지 순서를 알고 빈칸의 글자를 찾을 수 있어요.', (L, r) => { const R = ['H', 'I', 'J', 'K', 'L', 'M', 'N']; orderDrill(L, r, V.UPPER.slice(0, 14), { len: 4, count: 10 }); R.forEach((l, i) => G.letterName(L, r, l, R, { n: 4, v: i % 3, confusable: i % 2 === 0 })); R.slice(0, 4).forEach((l) => G.letterSame(L, r, l, { v: 1 })); }),
    ], 'H부터 N까지 글자 이름을 듣고 찾고, 순서를 말할 수 있어요.'),
    U('알파벳 O~U', '큰 글자 O부터 U까지 이름을 듣고 찾아요.', [
      Ls('O P Q R', 'O, P, Q, R의 이름을 듣고 글자를 찾을 수 있어요.', (L, r) => { letterDrill(L, r, ['O', 'P', 'Q', 'R'], ['O', 'P', 'Q', 'R', 'S', 'T', 'U']); orderDrill(L, r, ['N', 'O', 'P', 'Q', 'R'], { len: 3, count: 3 }); }),
      Ls('S T U', 'S, T, U의 이름을 듣고 글자를 찾을 수 있어요.', (L, r) => { letterDrill(L, r, ['S', 'T', 'U'], ['O', 'P', 'Q', 'R', 'S', 'T', 'U']); ['O', 'P', 'Q', 'R'].forEach((l) => G.letterName(L, r, l, ['S', 'T', 'U'], { n: 4, v: 1 })); orderDrill(L, r, ['R', 'S', 'T', 'U'], { len: 3, count: 3 }); }),
      Ls('O부터 U까지 순서대로', 'A부터 U까지 순서를 알고 빈칸의 글자를 찾을 수 있어요.', (L, r) => { const R = ['O', 'P', 'Q', 'R', 'S', 'T', 'U']; orderDrill(L, r, V.UPPER.slice(0, 21), { len: 4, count: 10 }); R.forEach((l, i) => G.letterName(L, r, l, R, { n: 4, v: i % 3, confusable: i % 2 === 0 })); R.slice(0, 4).forEach((l) => G.letterSame(L, r, l, { v: 1 })); }),
    ], 'O부터 U까지 글자 이름을 듣고 찾고, 순서를 말할 수 있어요.'),
    U('알파벳 V~Z', '큰 글자 V부터 Z까지 이름을 듣고 찾고, A부터 Z까지 순서를 익혀요.', [
      Ls('V W X', 'V, W, X의 이름을 듣고 글자를 찾을 수 있어요.', (L, r) => { letterDrill(L, r, ['V', 'W', 'X'], ['V', 'W', 'X', 'Y', 'Z']); ['S', 'T', 'U'].forEach((l) => G.letterName(L, r, l, ['V', 'W', 'X'], { n: 4, v: 1 })); orderDrill(L, r, ['U', 'V', 'W', 'X'], { len: 3, count: 4 }); }),
      Ls('Y Z', 'Y, Z의 이름을 듣고 글자를 찾을 수 있어요.', (L, r) => { letterDrill(L, r, ['Y', 'Z'], ['V', 'W', 'X', 'Y', 'Z']); ['V', 'W', 'X'].forEach((l) => { G.letterName(L, r, l, ['Y', 'Z'], { n: 4, v: 1 }); G.letterName(L, r, l, ['Y', 'Z'], { n: 4, v: 2, confusable: true }); }); orderDrill(L, r, ['V', 'W', 'X', 'Y', 'Z'], { len: 3, count: 6 }); }),
      Ls('A부터 Z까지 알파벳 순서', 'A부터 Z까지 알파벳 순서를 알고 어떤 글자든 찾을 수 있어요.', (L, r) => { orderDrill(L, r, V.UPPER, { len: 4, count: 14, difficulty: 3 }); shuffle(r, V.UPPER).slice(0, 10).forEach((l, i) => G.letterName(L, r, l, V.UPPER, { n: 4, v: i % 3, confusable: true })); }),
    ], 'A부터 Z까지 모든 대문자 이름을 듣고 찾을 수 있어요.'),
    U('색깔 Colors', 'red, blue, yellow… 색깔 이름을 영어로 배워요.', [
      Ls('red blue yellow green', 'red, blue, yellow, green을 듣고 색깔을 고를 수 있어요.', (L, r) => colorDrill(L, r, colors('red', 'blue', 'yellow', 'green'), V.COLORS)),
      Ls('orange pink purple', 'orange, pink, purple을 듣고 색깔을 고를 수 있어요.', (L, r) => { colorDrill(L, r, colors('orange', 'pink', 'purple'), V.COLORS); colors('red', 'blue', 'yellow', 'green').forEach((c, i) => G.listenColor(L, r, c, V.COLORS, { n: 4, v: 1, shape: 'heart' })); }),
      Ls('black white brown', 'black, white, brown을 배우고 열 가지 색깔을 모두 고를 수 있어요.', (L, r) => { colorDrill(L, r, colors('black', 'white', 'brown'), V.COLORS); colors('pink', 'purple', 'orange', 'green').forEach((c, i) => G.colorWord(L, r, c, V.COLORS, { v: i % 2, shape: 'heart', difficulty: 3 })); }),
    ], '열 가지 색깔 이름을 듣고, 읽고, 고를 수 있어요.'),
    U('숫자 1~10 Numbers', 'one부터 ten까지 영어로 수를 세어요.', [
      Ls('one two three four five', '1부터 5까지 영어 숫자를 듣고 고를 수 있어요.', (L, r) => numberDrill(L, r, [1, 2, 3, 4, 5], [1, 5])),
      Ls('six seven eight nine ten', '6부터 10까지 영어 숫자를 듣고 고를 수 있어요.', (L, r) => numberDrill(L, r, [6, 7, 8, 9, 10], [6, 10])),
      Ls('one부터 ten까지 섞어서', '1부터 10까지 영어 숫자를 자유롭게 고를 수 있어요.', (L, r) => { const ns = shuffle(r, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); ns.forEach((k, i) => G.listenNumber(L, r, k, [1, 10], { n: 4, v: i % 2, difficulty: 2 })); ns.forEach((k, i) => G.countWord(L, r, k, [1, 10], { v: i % 2, emoji: cyc(V.NUMBER_EMOJI, i + 5) })); ns.slice(0, 5).forEach((k) => G.readNumber(L, r, k, [1, 10])); }),
    ], '1부터 10까지 영어 숫자를 듣고, 세고, 읽을 수 있어요.'),
  ] },
  // ------------------------------------------------------------ 1학년 2학기 ----
  { grade: 1, semester: 2, units: [
    U('소문자 a~m', '작은 글자(소문자) a부터 m까지 이름을 듣고 찾아요.', [
      Ls('a b c d', '소문자 a, b, c, d를 듣고 찾을 수 있어요.', (L, r) => { letterDrill(L, r, ['a', 'b', 'c', 'd'], V.LOWER.slice(0, 13)); orderDrill(L, r, ['a', 'b', 'c', 'd', 'e'], { len: 3, count: 3 }); }),
      Ls('e f g h', '소문자 e, f, g, h를 듣고 찾을 수 있어요.', (L, r) => { letterDrill(L, r, ['e', 'f', 'g', 'h'], V.LOWER.slice(0, 13)); orderDrill(L, r, ['d', 'e', 'f', 'g', 'h', 'i'], { len: 3, count: 3 }); }),
      Ls('i j k l m', '소문자 i, j, k, l, m을 듣고 찾을 수 있어요.', (L, r) => { letterDrill(L, r, ['i', 'j', 'k', 'l', 'm'], V.LOWER.slice(0, 13)); orderDrill(L, r, V.LOWER.slice(0, 13), { len: 4, count: 5 }); }),
    ], '소문자 a부터 m까지 듣고 찾고 순서대로 놓을 수 있어요.'),
    U('소문자 n~z', '작은 글자(소문자) n부터 z까지 이름을 듣고 찾아요.', [
      Ls('n o p q', '소문자 n, o, p, q를 듣고 찾을 수 있어요.', (L, r) => { letterDrill(L, r, ['n', 'o', 'p', 'q'], V.LOWER.slice(13)); orderDrill(L, r, ['m', 'n', 'o', 'p', 'q', 'r'], { len: 3, count: 3 }); }),
      Ls('r s t u', '소문자 r, s, t, u를 듣고 찾을 수 있어요.', (L, r) => { letterDrill(L, r, ['r', 's', 't', 'u'], V.LOWER.slice(13)); orderDrill(L, r, ['q', 'r', 's', 't', 'u', 'v'], { len: 3, count: 3 }); }),
      Ls('v w x y z', '소문자 v, w, x, y, z를 듣고 찾을 수 있어요.', (L, r) => { letterDrill(L, r, ['v', 'w', 'x', 'y', 'z'], V.LOWER.slice(13)); orderDrill(L, r, V.LOWER, { len: 4, count: 6, difficulty: 3 }); }),
    ], '소문자 n부터 z까지 듣고 찾고 순서대로 놓을 수 있어요.'),
    U('대문자와 소문자 Big & Small', '큰 글자와 작은 글자를 짝지어요. A-a, B-b…', [
      Ls('A~M 짝 찾기', 'A부터 M까지 대문자와 소문자 짝을 찾을 수 있어요.', (L, r) => { V.UPPER.slice(0, 13).forEach((l, i) => { G.letterCase(L, r, l, { v: i % 2, n: 3 + (i % 2) }); G.letterCase(L, r, l.toLowerCase(), { v: i % 2, n: 3 + ((i + 1) % 2) }); }); }),
      Ls('N~Z 짝 찾기', 'N부터 Z까지 대문자와 소문자 짝을 찾을 수 있어요.', (L, r) => { V.UPPER.slice(13).forEach((l, i) => { G.letterCase(L, r, l, { v: i % 2, n: 3 + (i % 2) }); G.letterCase(L, r, l.toLowerCase(), { v: i % 2, n: 3 + ((i + 1) % 2) }); }); }),
      Ls('알파벳 순서 A~Z', '대문자와 소문자 알파벳 순서를 알고 빈칸을 채울 수 있어요.', (L, r) => { orderDrill(L, r, V.UPPER, { len: 4, count: 8, difficulty: 2 }); orderDrill(L, r, V.LOWER, { len: 4, count: 8, difficulty: 3 }); shuffle(r, V.UPPER).slice(0, 8).forEach((l, i) => G.letterCase(L, r, i % 2 ? l : l.toLowerCase(), { v: 1, difficulty: 3 })); }),
    ], '대문자·소문자 짝과 알파벳 순서를 모두 알 수 있어요.'),
    U('글자 소리 a~m', 'apple의 a, bear의 b… 글자가 내는 첫소리를 배워요.', [
      Ls('a b c d 소리', 'apple, bear, cat, dog의 첫소리 글자를 찾을 수 있어요.', (L, r) => soundDrill(L, r, ['a', 'b', 'c', 'd'])),
      Ls('e f g h 소리', 'egg, fish, goat, hat의 첫소리 글자를 찾을 수 있어요.', (L, r) => soundDrill(L, r, ['e', 'f', 'g', 'h'])),
      Ls('i j k l m 소리', 'ice cream, juice, kite, lion, moon의 첫소리 글자를 찾을 수 있어요.', (L, r) => soundDrill(L, r, ['i', 'j', 'k', 'l', 'm'])),
    ], 'a부터 m까지 첫소리 글자를 듣고 찾을 수 있어요.'),
    U('글자 소리 n~z', 'nose의 n, pig의 p… 글자가 내는 첫소리를 배워요.', [
      Ls('n o p q 소리', 'nose, octopus, pig, queen의 첫소리 글자를 찾을 수 있어요.', (L, r) => soundDrill(L, r, ['n', 'o', 'p', 'q'])),
      Ls('r s t u 소리', 'rabbit, sun, tiger, umbrella의 첫소리 글자를 찾을 수 있어요.', (L, r) => soundDrill(L, r, ['r', 's', 't', 'u'])),
      Ls('v w x y z 소리', 'van, watch, fox(x로 끝나요), yo-yo, zebra의 소리 글자를 찾을 수 있어요.', (L, r) => soundDrill(L, r, ['v', 'w', 'x', 'y', 'z'])),
    ], 'n부터 z까지 첫소리 글자를 듣고 찾을 수 있어요.'),
    U('동물 Animals', 'dog, cat, lion… 동물 이름을 영어로 배워요.', [
      Ls('dog cat pig cow rabbit duck', '집과 농장의 동물 이름을 듣고 그림을 고를 수 있어요.', (L, r) => { const ws = words('dog', 'cat', 'pig', 'cow', 'rabbit', 'duck'); vocabDrill(L, r, ws, ws, { reading: false }); }),
      Ls('lion tiger monkey bear elephant zebra', '동물원 동물 이름을 듣고 그림을 고를 수 있어요.', (L, r) => { const ws = words('lion', 'tiger', 'monkey', 'bear', 'elephant', 'zebra'); vocabDrill(L, r, ws, ws, { reading: false }); }),
      Ls('bird fish frog horse + 섞어서', '여러 동물 이름을 듣고, 읽고, 문장에서 고를 수 있어요.', (L, r) => { const nw = words('bird', 'fish', 'frog', 'horse'); const all = words('dog', 'cat', 'pig', 'cow', 'rabbit', 'duck', 'lion', 'tiger', 'monkey', 'bear', 'elephant', 'zebra', ...nw.map((w) => w.en)); vocabDrill(L, r, nw, all, { reading: true }); shuffle(r, all).slice(0, 6).forEach((w, i) => G.listenWord(L, r, w, all, { v: i % 2 })); shuffle(r, all).slice(0, 4).forEach((w, i) => G.sentencePicture(L, r, w, all, T.itIs, { n: 2, v: i % 2 })); }),
    ], '열여섯 가지 동물 이름을 듣고, 읽고, 고를 수 있어요.'),
    U('과일과 음식 Fruits & Food', 'apple, banana, milk, pizza… 과일과 음식 이름을 배워요.', [
      Ls('apple banana grapes strawberry orange watermelon', '과일 이름을 듣고 그림을 고를 수 있어요.', (L, r) => { const ws = words('apple', 'banana', 'grapes', 'strawberry', 'orange', 'watermelon'); vocabDrill(L, r, ws, ws, { reading: false }); }),
      Ls('milk bread egg pizza cake juice', '음식 이름을 듣고 그림을 고를 수 있어요.', (L, r) => { const ws = words('milk', 'bread', 'egg', 'pizza', 'cake', 'juice'); vocabDrill(L, r, ws, ws, { reading: false }); }),
      Ls('lemon peach cookie rice + 섞어서', '과일과 음식 이름을 듣고, 읽고, 고를 수 있어요.', (L, r) => { const nw = words('lemon', 'peach', 'cookie', 'rice', 'hamburger', 'ice cream'); const all = words('apple', 'banana', 'grapes', 'strawberry', 'orange', 'watermelon', 'milk', 'bread', 'egg', 'pizza', 'cake', 'juice', ...nw.map((w) => w.en)); vocabDrill(L, r, nw, all, { reading: true }); shuffle(r, all).slice(0, 6).forEach((w, i) => G.listenWord(L, r, w, all, { v: i % 2 })); }),
    ], '열여덟 가지 과일·음식 이름을 듣고, 읽고, 고를 수 있어요.'),
  ] },
  // ------------------------------------------------------------ 2학년 1학기 ----
  { grade: 2, semester: 1, units: [
    vowelUnit('a', 'cat, hat, bat'),
    vowelUnit('e', 'bed, pen, hen'),
    vowelUnit('i', 'pig, six, pin'),
    vowelUnit('o', 'dog, box, fox'),
    vowelUnit('u', 'sun, bus, cup'),
    U('우리 몸 Body', 'eyes, nose, mouth… 몸의 이름을 영어로 배워요.', [
      Ls('eyes nose mouth ear tooth', '얼굴 부분의 이름을 듣고 그림을 고를 수 있어요.', (L, r) => { const ws = words('eyes', 'nose', 'mouth', 'ear', 'tooth'); vocabDrill(L, r, ws, ws); }),
      Ls('hand foot arm leg tongue', '몸 부분의 이름을 듣고 그림을 고를 수 있어요.', (L, r) => { const ws = words('hand', 'foot', 'arm', 'leg', 'tongue'); vocabDrill(L, r, ws, ws); }),
      Ls('Touch your nose! 문장', '"Touch your nose." 같은 말을 듣고 몸 부분을 고를 수 있어요.', (L, r) => { const all = V.inCat('body'); sentenceDrill(L, r, all, all, T.touch); all.slice(0, 5).forEach((w, i) => G.sentencePicture(L, r, w, all, T.iHave, { n: 3, v: i % 2 })); }),
    ], '몸 부분의 이름을 듣고, 읽고, 문장에서 고를 수 있어요.'),
    U('우리 가족 Family', 'mom, dad, sister… 가족을 영어로 불러요.', [
      Ls('mom dad baby', 'mom, dad, baby를 듣고 그림을 고를 수 있어요.', (L, r) => { const ws = words('mom', 'dad', 'baby'); const all = V.inCat('family'); vocabDrill(L, r, ws, all); ws.forEach((w, i) => G.sentencePicture(L, r, w, all, T.thisIsMy, { n: 3, v: i % 2 })); }),
      Ls('sister brother grandma grandpa', 'sister, brother, grandma, grandpa를 듣고 그림을 고를 수 있어요.', (L, r) => { const ws = words('sister', 'brother', 'grandma', 'grandpa'); vocabDrill(L, r, ws, V.inCat('family')); }),
      Ls('This is my mom. 문장', '"This is my mom." 같은 말을 듣고 가족을 고를 수 있어요.', (L, r) => { const all = V.inCat('family'); sentenceDrill(L, r, all, all, T.thisIsMy); all.forEach((w, i) => { const s = T.thisIsMy(w); G.dialog(L, r, 'Who is this?', { en: s.en, ko: s.ko }, all.filter((x) => x !== w).map((x) => T.thisIsMy(x)), { n: 3 + (i % 2), v: i % 2, visual: G.bigEmoji(w.emoji) }); }); }),
    ], '가족을 영어로 부르고 "This is my ___." 문장을 고를 수 있어요.'),
    U('숫자 11~20 Numbers', 'eleven부터 twenty까지 영어로 수를 세어요.', [
      Ls('eleven ~ fifteen', '11부터 15까지 영어 숫자를 듣고 고를 수 있어요.', (L, r) => numberDrill(L, r, [11, 12, 13, 14, 15], [11, 15])),
      Ls('sixteen ~ twenty', '16부터 20까지 영어 숫자를 듣고 고를 수 있어요.', (L, r) => numberDrill(L, r, [16, 17, 18, 19, 20], [16, 20])),
      Ls('one부터 twenty까지 섞어서', '1부터 20까지 영어 숫자를 자유롭게 고를 수 있어요.', (L, r) => { const ns = shuffle(r, Array.from({ length: 20 }, (_, i) => i + 1)).slice(0, 12); ns.forEach((k, i) => G.listenNumber(L, r, k, [1, 20], { n: 4, v: i % 2, difficulty: 2 })); ns.forEach((k, i) => G.countWord(L, r, k, [1, 20], { v: i % 2, emoji: cyc(V.NUMBER_EMOJI, i + 3), difficulty: 3 })); ns.slice(0, 6).forEach((k) => G.digitWord(L, r, k, [1, 20])); }),
    ], '1부터 20까지 영어 숫자를 듣고, 세고, 읽을 수 있어요.'),
  ] },
  // ------------------------------------------------------------ 2학년 2학기 ----
  { grade: 2, semester: 2, units: [
    U('우리 교실 My Classroom', '교실 물건 이름과 "What\'s this?" 묻고 답하기를 배워요.', [
      Ls('book pencil bag ruler crayon', '학용품 이름을 듣고, 읽고, 고를 수 있어요.', (L, r) => { const ws = words('book', 'pencil', 'bag', 'ruler', 'crayon'); vocabDrill(L, r, ws, V.inCat('classroom')); }),
      Ls('chair clock door scissors notebook', '교실 물건 이름을 듣고, 읽고, 고를 수 있어요.', (L, r) => { const ws = words('chair', 'clock', 'door', 'scissors', 'notebook'); vocabDrill(L, r, ws, V.inCat('classroom')); }),
      Ls("What's this? It's a book.", '"What\'s this?" 질문에 "It\'s a book." 하고 답할 수 있어요.', (L, r) => { const all = V.inCat('classroom').filter((w) => !w.noSentence); const D = V.DIALOGS.whatsThis; all.forEach((w, i) => G.dialog(L, r, D.q, { en: D.a(w), ko: D.aKo(w) }, all.filter((x) => x !== w).map((x) => ({ en: D.a(x), ko: D.aKo(x) })), { n: 3 + (i % 2), v: i % 2, visual: G.bigEmoji(w.emoji) })); all.slice(0, 8).forEach((w, i) => G.sentencePicture(L, r, w, all, T.itsA, { n: 4, v: i % 2 })); }),
    ], '교실 물건 이름을 알고 "What\'s this?"에 답할 수 있어요.'),
    U('기분 Feelings', 'happy, sad, angry… 기분을 영어로 말해요.', [
      Ls('happy sad angry sleepy', 'happy, sad, angry, sleepy를 듣고 표정을 고를 수 있어요.', (L, r) => { const ws = words('happy', 'sad', 'angry', 'sleepy'); vocabDrill(L, r, ws, V.inCat('feeling')); ws.forEach((w, i) => G.sentencePicture(L, r, w, ws, T.iAm, { n: 3, v: i % 2 })); }),
      Ls("scared sick surprised + I'm happy.", '여러 기분을 알고 "I\'m happy." 문장을 고를 수 있어요.', (L, r) => { const ws = words('scared', 'sick', 'surprised', 'hot', 'cold'); const all = V.inCat('feeling'); vocabDrill(L, r, ws, all, { reading: false }); sentenceDrill(L, r, all.slice(0, 6), all, T.iAm, { n: 4 }); }),
      Ls('How are you? 대화', '"How are you?" 질문에 기분을 답할 수 있어요.', (L, r) => { const all = V.inCat('feeling'); const D = V.DIALOGS.howAreYou; all.forEach((w, i) => G.dialog(L, r, D.q, { en: D.a(w), ko: D.aKo(w) }, all.filter((x) => x !== w).map((x) => ({ en: D.a(x), ko: D.aKo(x) })), { n: 3 + (i % 2), v: i % 2, visual: G.bigEmoji(w.emoji) })); all.forEach((w, i) => G.sentenceListen(L, r, w, all, T.iAm, { n: 4, v: i % 2 })); }),
    ], '기분을 영어로 말하고 "How are you?"에 답할 수 있어요.'),
    U('날씨 Weather', 'sunny, rainy, cloudy, snowy와 "How\'s the weather?"를 배워요.', [
      Ls('sunny rainy cloudy snowy', '날씨 낱말을 듣고 그림을 고를 수 있어요.', (L, r) => { const ws = V.inCat('weather'); vocabDrill(L, r, ws, ws); ws.forEach((w, i) => G.listenPicture(L, r, w, ws, { n: 3, v: 2, difficulty: 1 })); }),
      Ls("It's sunny. 문장", '"It\'s sunny." 같은 날씨 문장을 듣고 읽을 수 있어요.', (L, r) => { const ws = V.inCat('weather'); sentenceDrill(L, r, ws, ws, T.weather); ws.forEach((w) => G.wordMeaning(L, r, w, ws, { listen: false })); ws.forEach((w, i) => G.listenWord(L, r, w, ws, { v: i % 2, difficulty: 2 })); }),
      Ls("How's the weather? 대화", '"How\'s the weather?" 질문에 날씨를 답할 수 있어요.', (L, r) => { const ws = V.inCat('weather'); const D = V.DIALOGS.weather; ws.forEach((w, i) => { G.dialog(L, r, D.q, { en: D.a(w), ko: D.aKo(w) }, ws.filter((x) => x !== w).map((x) => ({ en: D.a(x), ko: D.aKo(x) })), { n: 3, v: 0, visual: G.bigEmoji(w.emoji) }); G.dialog(L, r, D.q, { en: D.a(w), ko: D.aKo(w) }, ws.filter((x) => x !== w).map((x) => ({ en: D.a(x), ko: D.aKo(x) })), { n: 4, v: 1, visual: G.bigEmoji(w.emoji), difficulty: 3 }); }); ws.forEach((w, i) => G.sentenceListen(L, r, w, ws, T.weather, { n: 4, v: i % 2 })); ws.forEach((w, i) => G.sentencePicture(L, r, w, ws, T.weather, { n: 2, v: i % 2, difficulty: 2 })); }),
    ], '날씨를 영어로 말하고 "How\'s the weather?"에 답할 수 있어요.'),
    U('할 수 있어요 I can!', 'run, swim, dance… "I can swim."을 말해요.', [
      Ls('run swim dance sing', 'run, swim, dance, sing을 듣고 그림을 고를 수 있어요.', (L, r) => { const ws = words('run', 'swim', 'dance', 'sing'); vocabDrill(L, r, ws, V.inCat('action')); ws.forEach((w, i) => G.sentencePicture(L, r, w, ws, T.iCan, { n: 3, v: i % 2 })); }),
      Ls('climb ski skate walk ride a bike + I can swim.', '여러 동작을 알고 "I can ___." 문장을 고를 수 있어요.', (L, r) => { const ws = words('climb', 'ski', 'skate', 'walk', 'ride a bike'); const all = V.inCat('action'); vocabDrill(L, r, ws, all, { reading: false }); sentenceDrill(L, r, all.slice(0, 6), all, T.iCan, { n: 4 }); }),
      Ls('Can you swim? Yes, I can.', '"Can you swim?" 질문에 "Yes, I can." / "No, I can\'t."로 답할 수 있어요.', (L, r) => {
        const all = V.inCat('action'); const D = V.DIALOGS.canYou;
        const YES = { en: 'Yes, I can.', ko: '응, 할 수 있어.' }, NO = { en: "No, I can't.", ko: '아니, 못 해.' };
        const EXTRA = [{ en: 'Yes, I do.', ko: '응, 좋아해.' }, { en: "No, I don't.", ko: '아니, 안 좋아해.' }];
        all.forEach((w, i) => {
          G.dialog(L, r, D.q(w), YES, [NO, ...EXTRA], { n: 2 + (i % 2), v: 0, visual: G.emojiRow(w.emoji, '⭕') });
          G.dialog(L, r, D.q(w), NO, [YES, ...EXTRA], { n: 2 + ((i + 1) % 2), v: 1, visual: G.emojiRow(w.emoji, '❌') });
        });
        all.slice(0, 6).forEach((w, i) => { const o = all[(i + 3) % all.length]; G.pickSentence(L, r, { prompt: '그림에 알맞은 문장을 골라 보세요.', visual: G.emojiRow(w.emoji, i % 2 ? '❌' : '⭕'), correct: i % 2 ? T.iCant(w) : T.iCan(w), wrongs: [i % 2 ? T.iCan(w) : T.iCant(w), T.iCan(o), T.iCant(o)], difficulty: 3 }); });
      }),
    ], '"I can ___."을 말하고 "Can you ___?"에 답할 수 있어요.'),
    U('좋아해요 I like!', '"I like apples." "Do you like ___?" 묻고 답해요.', [
      Ls('I like apples. 과일', '"I like ___." 문장을 과일 그림과 짝지을 수 있어요.', (L, r) => { const ws = words('apple', 'banana', 'grapes', 'strawberry', 'orange', 'watermelon', 'peach'); ws.forEach((w, i) => G.sentencePicture(L, r, w, ws, T.iLike, { n: 3, v: 0, visual: G.emojiRow('👍', w.emoji) })); ws.forEach((w, i) => G.sentencePicture(L, r, w, ws, T.iLike, { n: 4, v: 1, visual: G.emojiRow('👍', w.emoji) })); ws.forEach((w, i) => G.sentenceListen(L, r, w, ws, T.iLike, { n: 3 + (i % 2), v: i % 2 })); }),
      Ls("I like pizza. / I don't like pizza.", '"I like ___."과 "I don\'t like ___."을 구별할 수 있어요.', (L, r) => { const ws = words('milk', 'bread', 'egg', 'pizza', 'cake', 'juice', 'cookie', 'ice cream'); ws.forEach((w, i) => G.sentencePicture(L, r, w, ws, T.iLike, { n: 3 + (i % 2), v: i % 2, visual: G.emojiRow('👍', w.emoji) })); ws.forEach((w, i) => { const o = ws[(i + 3) % ws.length]; const like = i % 2 === 0; G.pickSentence(L, r, { prompt: cyc(G.P.sentencePicture, i % 2), visual: G.emojiRow(like ? '👍' : '👎', w.emoji), correct: like ? T.iLike(w) : T.iDontLike(w), wrongs: [like ? T.iDontLike(w) : T.iLike(w), T.iLike(o), T.iDontLike(o)], difficulty: 3 }); }); ws.slice(0, 4).forEach((w, i) => G.sentenceListen(L, r, w, ws, T.iLike, { n: 4, v: i % 2 })); }),
      Ls('Do you like apples? Yes, I do.', '"Do you like ___?" 질문에 "Yes, I do." / "No, I don\'t."로 답할 수 있어요.', (L, r) => {
        const ws = words('apple', 'banana', 'grapes', 'strawberry', 'milk', 'pizza', 'cake', 'egg', 'cookie'); const D = V.DIALOGS.doYouLike;
        const YES = { en: 'Yes, I do.', ko: '응, 좋아해.' }, NO = { en: "No, I don't.", ko: '아니, 안 좋아해.' };
        const EXTRA = [{ en: 'Yes, I can.', ko: '응, 할 수 있어.' }, { en: "No, I can't.", ko: '아니, 못 해.' }];
        ws.forEach((w, i) => {
          G.dialog(L, r, D.q(w), YES, [NO, ...EXTRA], { n: 2 + (i % 2), v: 0, visual: G.emojiRow(w.emoji, '⭕') });
          G.dialog(L, r, D.q(w), NO, [YES, ...EXTRA], { n: 2 + ((i + 1) % 2), v: 1, visual: G.emojiRow(w.emoji, '❌') });
        });
        ws.slice(0, 4).forEach((w, i) => G.sentenceListen(L, r, w, ws, T.iLike, { n: 4, v: i % 2 }));
      }),
    ], '"I like ___."을 말하고 "Do you like ___?"에 답할 수 있어요.'),
    U('요일 Days of the Week', 'Monday부터 Sunday까지 요일을 영어로 배워요.', [
      Ls('Monday Tuesday Wednesday', 'Monday, Tuesday, Wednesday를 듣고 뜻을 고를 수 있어요.', (L, r) => { const ds = V.DAYS.slice(0, 3); ds.forEach((d, i) => G.dayMeaning(L, r, d, { v: 0 })); ds.forEach((d) => G.dayMeaning(L, r, d, { v: 1 })); ds.forEach((d, i) => G.dayListen(L, r, d, { v: i % 2 })); ds.forEach((d, i) => G.dayListen(L, r, d, { v: (i + 1) % 2 })); ds.forEach((d) => G.dayWord(L, r, d)); [0, 1, 2].forEach((b) => G.dayOrder(L, r, 0, 3, b, { difficulty: 2 })); [0, 1, 2].forEach((b) => G.dayOrder(L, r, 0, 4, b)); }),
      Ls('Thursday Friday Saturday Sunday', 'Thursday, Friday, Saturday, Sunday를 듣고 뜻을 고를 수 있어요.', (L, r) => { const ds = V.DAYS.slice(3); ds.forEach((d) => G.dayMeaning(L, r, d, { v: 0 })); ds.forEach((d) => G.dayMeaning(L, r, d, { v: 1 })); ds.forEach((d, i) => G.dayListen(L, r, d, { v: i % 2 })); ds.forEach((d, i) => G.dayListen(L, r, d, { v: (i + 1) % 2 })); ds.forEach((d) => G.dayWord(L, r, d)); [0, 1, 2, 3].forEach((b) => G.dayOrder(L, r, 3, 4, b)); }),
      Ls('요일 순서와 What day is it?', '요일 순서를 알고 "What day is it today?"에 답할 수 있어요.', (L, r) => { const D = V.DIALOGS.whatDay; for (let s = 0; s < 7; s++) G.dayOrder(L, r, s, 4, (s * 3) % 4); V.DAYS.forEach((d, i) => G.dialog(L, r, D.q, { en: D.a(d), ko: D.aKo(d) }, V.DAYS.filter((x) => x !== d).map((x) => ({ en: D.a(x), ko: D.aKo(x) })), { n: 3 + (i % 2), v: i % 2, visual: { kind: 'text', text: d.ko, size: 'xl' } })); V.DAYS.forEach((d) => G.dayMeaning(L, r, d, { listen: false })); }),
    ], '일곱 요일을 영어로 듣고, 읽고, 순서대로 말할 수 있어요.'),
    U('옷 Clothes', 'hat, shirt, pants… 옷 이름을 영어로 배워요.', [
      Ls('hat shirt pants shoes socks', '옷 이름을 듣고, 읽고, 고를 수 있어요.', (L, r) => { const ws = words('hat', 'shirt', 'pants', 'shoes', 'socks'); vocabDrill(L, r, ws, V.inCat('clothes').filter((w) => w.en !== 'cap')); }),
      Ls('dress coat gloves scarf boots', '옷 이름을 듣고, 읽고, 고를 수 있어요.', (L, r) => { const ws = words('dress', 'coat', 'gloves', 'scarf', 'boots'); vocabDrill(L, r, ws, V.inCat('clothes').filter((w) => w.en !== 'cap')); }),
      Ls('This is my hat. 문장', '"This is my hat." "I have a hat." 문장을 그림과 짝지을 수 있어요.', (L, r) => { const all = V.inCat('clothes').filter((w) => w.en !== 'cap'); sentenceDrill(L, r, all.slice(0, 6), all, T.myClothes); all.slice(4).forEach((w, i) => G.sentencePicture(L, r, w, all, T.iHave, { n: 4, v: i % 2 })); all.slice(4).forEach((w, i) => G.sentenceListen(L, r, w, all, T.iHave, { n: 4, v: i % 2 })); }),
    ], '옷 이름을 알고 "This is my ___." 문장을 고를 수 있어요.'),
    U('자주 보는 낱말 Sight Words', 'I, a, the, is, it, you, can, see, like, and — 자주 나오는 낱말을 읽어요.', [
      Ls('I a the is it', 'I, a, the, is, it을 듣고 읽을 수 있어요.', (L, r) => { const ws = V.SIGHT.filter((s) => ['I', 'a', 'the', 'is', 'it'].includes(s.en)); ws.forEach((s) => G.sightListen(L, r, s, V.SIGHT, { v: 0 })); ws.forEach((s) => G.sightListen(L, r, s, V.SIGHT, { v: 1, difficulty: 3 })); ws.filter((s) => s.ko).forEach((s) => G.sightMeaning(L, r, s, V.SIGHT)); const ss = V.SIGHT_SENTENCES.filter((s) => ['I', 'a', 'is', 'It'].includes(s.answer)); ss.forEach((s, i) => G.missingWord(L, r, s, { v: 0, listen: true })); ss.forEach((s, i) => G.missingWord(L, r, s, { v: 1, listen: false })); }),
      Ls('you can see like and', 'you, can, see, like, and를 듣고 읽을 수 있어요.', (L, r) => { const ws = V.SIGHT.filter((s) => ['you', 'can', 'see', 'like', 'and'].includes(s.en)); ws.forEach((s) => G.sightListen(L, r, s, V.SIGHT, { v: 0 })); ws.forEach((s) => G.sightListen(L, r, s, V.SIGHT, { v: 1, difficulty: 3 })); ws.forEach((s) => G.sightMeaning(L, r, s, V.SIGHT)); const ss = V.SIGHT_SENTENCES.filter((s) => ['you', 'can', 'see', 'like', 'and'].includes(s.answer)); ss.forEach((s) => G.missingWord(L, r, s, { v: 0, listen: true })); ss.forEach((s) => G.missingWord(L, r, s, { v: 1, listen: false })); }),
      Ls('문장 완성하기', '자주 보는 낱말로 문장의 빈칸을 채울 수 있어요.', (L, r) => { const ss = V.SIGHT_SENTENCES; ss.forEach((s) => G.missingWord(L, r, s, { v: 0, listen: true })); ss.forEach((s) => G.missingWord(L, r, s, { v: 1, listen: false })); shuffle(r, V.SIGHT).slice(0, 5).forEach((s) => G.sightListen(L, r, s, V.SIGHT, { v: 1 })); }),
    ], '자주 보는 열 개의 낱말을 읽고 문장을 완성할 수 있어요.'),
  ] },
];

// ============================================================== build =====
const HARD_TYPES = new Set(['listen-word', 'sentence-picture', 'missing-word', 'dialog', 'alphabet-order']);

export function buildEnglish() {
  const units = [], lessons = [], questions = [];
  let unitOrder = 0, lessonOrder = 0;
  for (const sem of SEMESTERS) {
    const key = `e${sem.grade}${sem.semester}`;
    sem.units.forEach((u, ui) => {
      const unitId = `${key}-u${ui + 1}`;
      units.push({ id: unitId, subject: 'english', grade: sem.grade, semester: sem.semester, unitNo: ui + 1, title: u.title, description: u.description, order: ++unitOrder });
      const built = [];
      u.lessons.forEach((ls, li) => {
        const lessonId = `${unitId}-l${li + 1}`;
        lessons.push({ id: lessonId, unitId, subject: 'english', grade: sem.grade, semester: sem.semester, lessonNo: li + 1, title: ls.title, goal: ls.goal, order: ++lessonOrder, requiredCorrect: 8 });
        const L = lessonBuilder(lessonId, 'english');
        ls.build(L, rng(seedOf(lessonId)));
        // A new deterministic pass varies choices/examples for short lessons.
        for (let pass = 1; L.count < 20 && pass <= 8; pass++) ls.build(L, rng(seedOf(`${lessonId}/${pass}`)));
        if (L.count < 20) throw Error(`${lessonId}: only ${L.count} questions`);
        questions.push(...L.questions);
        built.push(ls);
      });
      // review lesson: regenerate every lesson with a review seed, then interleave.
      const reviewId = `${unitId}-l${u.lessons.length + 1}`;
      const reviewTitle = `${u.title.replace(/\s+[A-Za-z'!?&~.]+(\s+[A-Za-z'!?&~.]+)*$/, '').trim() || u.title} 복습`;
      lessons.push({ id: reviewId, unitId, subject: 'english', grade: sem.grade, semester: sem.semester, lessonNo: u.lessons.length + 1, title: reviewTitle, goal: u.reviewGoal, order: ++lessonOrder, requiredCorrect: 10, isReview: true });
      const rr = rng(seedOf(reviewId));
      const pools = built.map((ls, li) => { const tmp = lessonBuilder(`${reviewId}-tmp${li}`, 'english'); ls.build(tmp, rng(seedOf(`${reviewId}/${li}`))); return shuffle(rr, tmp.questions); });
      const R = lessonBuilder(reviewId, 'english');
      let k = 0;
      while (R.count < REVIEW_SIZE && pools.some((p) => p.length)) {
        const p = pools[k % pools.length]; k++;
        const q = p.pop(); if (!q) continue;
        const { id, lessonId, ...rest } = q;
        if (HARD_TYPES.has(rest.type) || (rest.type === 'word-meaning' && !rest.listen)) rest.difficulty = Math.min(5, rest.difficulty + 1);
        R.add(rest);
      }
      questions.push(...R.questions);
    });
  }
  return { units, lessons, questions };
}
