// Question builders for the English generator. Every builder takes (L, r, …) where
// L = lessonBuilder from ../lib.mjs and r = deterministic rng. Builders return L.add(...)'s result.
import { makeChoices, shuffle, sample, pick, randInt, nearNumbers } from '../lib.mjs';
import * as V from './vocab.mjs';

export const en = (text) => ({ text, lang: 'en-US' });
export const ko = (text) => ({ text, lang: 'ko-KR' });
/** TTS carrier for a letter name: 'B. B.' reads better than 'B'. */
export const say = (letter) => { const U = letter.toUpperCase(); return `${U}. ${U}.`; };
export const cyc = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];

// --------------------------------------------------------------- prompts ----
export const P = {
  listenPicture: ['잘 듣고 알맞은 그림을 골라 보세요.', '무엇을 말했을까요? 그림을 골라 보세요.', '들리는 낱말의 그림을 찾아보세요.'],
  pictureWord: ['그림에 알맞은 낱말을 골라 보세요.', '이 그림은 영어로 무엇일까요?'],
  wordMeaning: ['이 낱말은 무슨 뜻일까요?', '잘 듣고 뜻을 골라 보세요.'],
  wordMeaningRead: ['이 낱말을 읽고 뜻을 골라 보세요.'],
  listenWord: ['잘 듣고 알맞은 낱말을 골라 보세요.', '들리는 낱말을 찾아보세요.'],
  letterName: ['잘 듣고 알맞은 글자를 골라 보세요.', '어떤 글자를 말했을까요?', '들리는 알파벳을 찾아보세요.'],
  letterSame: ['위와 똑같은 글자를 찾아보세요.', '같은 모양의 글자를 골라 보세요.'],
  toLower: ['이 글자의 작은 글자(소문자)를 골라 보세요.', '짝이 되는 소문자를 찾아보세요.'],
  toUpper: ['이 글자의 큰 글자(대문자)를 골라 보세요.', '짝이 되는 대문자를 찾아보세요.'],
  order: ['빈칸에 들어갈 알파벳을 골라 보세요.', '알파벳 순서대로! 빈칸에 무엇이 올까요?'],
  initial: ['이 낱말은 어떤 글자로 시작할까요?', '첫소리 글자를 골라 보세요.'],
  final: ['이 낱말은 어떤 글자로 끝날까요?'],
  missing: ['빈칸에 들어갈 글자를 골라 보세요.', '낱말을 완성해 보세요. 빈칸에 무엇이 올까요?'],
  sentencePicture: ['그림에 알맞은 문장을 골라 보세요.', '그림을 보고 알맞은 말을 골라 보세요.'],
  sentenceListen: ['잘 듣고 알맞은 그림을 골라 보세요.', '무슨 뜻일까요? 그림을 골라 보세요.'],
  dialog: ['잘 듣고 알맞은 대답을 골라 보세요.', '친구가 이렇게 말했어요. 뭐라고 대답할까요?'],
  countWord: ['모두 몇 개일까요? 영어로 골라 보세요.', '세어 보고 영어 숫자를 골라 보세요.'],
  listenNumber: ['잘 듣고 알맞은 숫자를 골라 보세요.', '어떤 숫자를 말했을까요?'],
  digitWord: ['이 숫자를 영어로 골라 보세요.', '이 숫자는 영어로 무엇일까요?'],
  readNumber: ['낱말을 읽고 알맞은 수를 골라 보세요.'],
  colorWord: ['이 색깔은 영어로 무엇일까요?', '색깔에 알맞은 낱말을 골라 보세요.'],
  listenColor: ['잘 듣고 알맞은 색깔을 골라 보세요.', '어떤 색깔을 말했을까요?'],
  readColor: ['낱말을 읽고 알맞은 색깔을 골라 보세요.'],
  missingWord: ['빈칸에 들어갈 낱말을 골라 보세요.', '문장을 완성해 보세요.'],
  dayMeaning: ['이 요일은 무슨 뜻일까요?', '잘 듣고 알맞은 요일을 골라 보세요.'],
  dayWord: ['이 요일을 영어로 골라 보세요.'],
  dayOrder: ['요일 순서대로! 빈칸에 무엇이 올까요?'],
};
const H = {
  listen: '🔊 버튼을 눌러 다시 들어 보세요.',
  tap: '낱말을 눌러 소리를 들어 보세요.',
  letter: '글자 모양을 천천히 비교해 보세요.',
  order: '알파벳 노래를 떠올려 보세요. A, B, C, D…',
  initial: '낱말의 첫소리를 잘 들어 보세요.',
  missing: '낱말을 듣고 소리를 잘 생각해 보세요.',
  sentence: '문장을 눌러 들어 보세요.',
  dialog: '질문을 다시 들어 보세요.',
  count: '하나씩 세어 보세요.',
  color: '색깔을 잘 보세요.',
};

// ----------------------------------------------------------- distractors ----
/** Pick n distractors from pool that are clearly different from item and from each other. */
export function others(r, item, pool, n, { koMode = false } = {}) {
  const keys = new Set([item.en, item.ko, item.emoji, item.group && `g:${item.group}`].filter(Boolean));
  if (koMode) for (const a of item.avoidKo || []) keys.add(`g:${a}`);
  const out = [];
  for (const x of shuffle(r, pool)) {
    if (out.length >= n) break;
    if (x === item) continue;
    const xk = [x.en, x.ko, x.emoji, x.group && `g:${x.group}`].filter(Boolean);
    if (xk.some((k) => keys.has(k))) continue;
    if (koMode && (x.avoidKo || []).some((g) => g === item.group)) continue;
    xk.forEach((k) => keys.add(k));
    out.push(x);
  }
  return out;
}
const diffByChoices = (n, base = 1) => (n <= 3 ? base : base + 1);
const explainWord = (w) => `${w.en} = ${w.ko}`;

// ------------------------------------------------------------ vocabulary ----
/** 🔊 word → pick picture. */
export function listenPicture(L, r, w, pool, { n = 4, v = 0, difficulty, prompt } = {}) {
  const { choices, answer } = makeChoices(r, w, others(r, w, pool, n - 1), (x) => ({ emoji: x.emoji }), n);
  return L.add({ type: 'listen-picture', prompt: prompt || cyc(P.listenPicture, v), listen: en(w.en), answerMode: 'choice', choices, answer,
    hint: H.listen, explain: explainWord(w), difficulty: difficulty ?? diffByChoices(choices.length) });
}
/** picture → pick English word (each choice speakable). */
export function pictureWord(L, r, w, pool, { n = 4, v = 0, difficulty = 2 } = {}) {
  const { choices, answer } = makeChoices(r, w, others(r, w, pool, n - 1), (x) => ({ text: x.en, speak: en(x.en) }), n);
  return L.add({ type: 'picture-word', prompt: cyc(P.pictureWord, v), visual: { kind: 'emoji', emoji: w.emoji, size: 'xl' }, answerMode: 'choice', choices, answer,
    hint: H.tap, explain: explainWord(w), difficulty });
}
/** English word (text + 🔊) → pick Korean meaning. listen:false = reading only (harder). */
export function wordMeaning(L, r, w, pool, { n = 4, v = 0, listen = true, difficulty } = {}) {
  const { choices, answer } = makeChoices(r, w, others(r, w, pool, n - 1, { koMode: true }), (x) => ({ text: x.ko, speak: ko(x.ko) }), n);
  const q = { type: 'word-meaning', prompt: listen ? cyc(P.wordMeaning, v) : P.wordMeaningRead[0], visual: { kind: 'text', text: w.en, lang: 'en-US', size: 'xl' },
    answerMode: 'choice', choices, answer, hint: listen ? H.listen : H.tap, explain: explainWord(w), difficulty: difficulty ?? (listen ? 2 : 3) };
  if (listen) q.listen = en(w.en);
  return L.add(q);
}
/** 🔊 word → pick the written word (reading). */
export function listenWord(L, r, w, pool, { n = 4, v = 0, difficulty = 3 } = {}) {
  const { choices, answer } = makeChoices(r, w, others(r, w, pool, n - 1), (x) => ({ text: x.en, speak: en(x.en) }), n);
  return L.add({ type: 'listen-word', prompt: cyc(P.listenWord, v), listen: en(w.en), answerMode: 'choice', choices, answer,
    hint: H.tap, explain: explainWord(w), difficulty });
}

// ------------------------------------------------------------- sentences ----
/** Sentence templates: fn(w) → { en, ko }. */
export const T = {
  itIs: (w) => ({ en: w.plural ? `They are ${w.en}.` : `It is ${V.article(w)}${w.en}.`, ko: `이것은 ${w.ko}${V.iEyo(w.ko)}.` }),
  itsA: (w) => ({ en: w.plural ? `They're ${w.en}.` : `It's ${V.article(w)}${w.en}.`, ko: `이것은 ${w.ko}${V.iEyo(w.ko)}.` }),
  iLike: (w) => ({ en: `I like ${V.likeForm(w)}.`, ko: `나는 ${w.ko}${V.eulReul(w.ko)} 좋아해요.` }),
  iDontLike: (w) => ({ en: `I don't like ${V.likeForm(w)}.`, ko: `나는 ${w.ko}${V.eulReul(w.ko)} 안 좋아해요.` }),
  iAm: (w) => ({ en: `I'm ${w.en}.`, ko: `나는 ${w.ko}` }),
  weather: (w) => ({ en: `It's ${w.en}.`, ko: `날씨가 ${w.ko}` }),
  iCan: (w) => ({ en: `I can ${w.en}.`, ko: `나는 ${w.koCan}.` }),
  iCant: (w) => ({ en: `I can't ${w.en}.`, ko: `나는 ${w.koCan.replace('수 있어요', '수 없어요')}.` }),
  thisIsMy: (w) => ({ en: `This is my ${w.en}.`, ko: `우리 ${w.ko}${V.iEyo(w.ko)}.` }),
  myClothes: (w) => ({ en: w.plural ? `These are my ${w.en}.` : `This is my ${w.en}.`, ko: `내 ${w.ko}${V.iEyo(w.ko)}.` }),
  touch: (w) => ({ en: `Touch your ${w.en}.`, ko: `${w.ko}${V.eulReul(w.ko)} 만져 보세요.` }),
  iHave: (w) => ({ en: w.plural ? `I have ${w.en}.` : `I have ${V.article(w)}${w.en}.`, ko: `나는 ${w.ko}${V.iGa(w.ko)} 있어요.` }),
};
/** picture → pick the matching sentence (choices speakable). */
export function sentencePicture(L, r, w, pool, tpl, { n = 4, v = 0, difficulty, visual } = {}) {
  const ds = others(r, w, pool.filter((x) => !x.noSentence), n - 1);
  const { choices, answer } = makeChoices(r, w, ds, (x) => { const s = tpl(x); return { text: s.en, speak: en(s.en) }; }, n);
  const s = tpl(w);
  return L.add({ type: 'sentence-picture', prompt: cyc(P.sentencePicture, v), visual: visual || { kind: 'emoji', emoji: w.emoji, size: 'xl' },
    answerMode: 'choice', choices, answer, hint: H.sentence, explain: `${s.en} ${s.ko}`, difficulty: difficulty ?? diffByChoices(choices.length, 2) });
}
/** 🔊 sentence → pick picture. */
export function sentenceListen(L, r, w, pool, tpl, { n = 4, v = 0, difficulty } = {}) {
  const { choices, answer } = makeChoices(r, w, others(r, w, pool, n - 1), (x) => ({ emoji: x.emoji }), n);
  const s = tpl(w);
  return L.add({ type: 'sentence-picture', prompt: cyc(P.sentenceListen, v), listen: en(s.en), answerMode: 'choice', choices, answer,
    hint: H.listen, explain: `${s.en} ${s.ko}`, difficulty: difficulty ?? diffByChoices(choices.length) });
}
/**
 * 🔊 question → pick the answer sentence. answers = [{ en, ko, w? }] (first = correct); visual optional.
 */
export function dialog(L, r, q, correct, wrongs, { n = 4, v = 0, difficulty, visual, qKo } = {}) {
  const key = (a) => a.en;
  const ds = []; const seen = new Set([key(correct)]);
  for (const d of shuffle(r, wrongs)) { if (ds.length >= n - 1) break; if (seen.has(key(d))) continue; seen.add(key(d)); ds.push(d); }
  const { choices, answer } = makeChoices(r, correct, ds, (a) => ({ text: a.en, speak: en(a.en) }), n);
  return L.add({ type: 'dialog', prompt: cyc(P.dialog, v), listen: en(q), visual, answerMode: 'choice', choices, answer,
    hint: H.dialog, explain: `${q} → ${correct.en} (${correct.ko})`, difficulty: difficulty ?? diffByChoices(choices.length, 2) });
}
/** Korean situation prompt → pick the English phrase. */
export function situation(L, r, sit, correct, pool, { n = 4, difficulty = 2 } = {}) {
  const ds = others(r, correct, pool, n - 1);
  const { choices, answer } = makeChoices(r, correct, ds, (p) => ({ text: p.en, speak: en(p.en) }), n);
  return L.add({ type: 'dialog', prompt: sit.prompt, answerMode: 'choice', choices, answer,
    hint: H.tap, explain: `${correct.en} = ${correct.ko}`, difficulty });
}

// --------------------------------------------------------------- letters ----
const letterChoice = (l) => ({ text: l, speak: en(say(l)) });
function letterDistractors(r, letter, prefer, all, n, conf) {
  const out = []; const seen = new Set([letter]);
  const take = (arr) => { for (const l of shuffle(r, arr)) { if (out.length >= n) break; if (seen.has(l)) continue; seen.add(l); out.push(l); } };
  if (conf) take(conf[letter] || []);
  take(prefer); take(all);
  return out;
}
/** 🔊 'B. B.' → pick letter. prefer = lesson letters (distractors first from here). confusable = look-alike distractors. */
export function letterName(L, r, letter, prefer, { n = 4, v = 0, confusable = false, difficulty } = {}) {
  const isUpper = letter === letter.toUpperCase();
  const all = isUpper ? V.UPPER : V.LOWER;
  const ds = letterDistractors(r, letter, prefer, all, n - 1, confusable ? (isUpper ? V.CONFUSE_UPPER : V.CONFUSE_LOWER) : null);
  const { choices, answer } = makeChoices(r, letter, ds, letterChoice, n);
  return L.add({ type: 'letter-name', prompt: cyc(P.letterName, v), listen: en(say(letter)), answerMode: 'choice', choices, answer,
    hint: H.listen, explain: `정답은 ${letter}!`, difficulty: difficulty ?? (confusable ? 3 : diffByChoices(choices.length)) });
}
/** Big letter shown → find the same letter among look-alikes. */
export function letterSame(L, r, letter, { v = 0, difficulty = 1 } = {}) {
  const isUpper = letter === letter.toUpperCase();
  const conf = (isUpper ? V.CONFUSE_UPPER : V.CONFUSE_LOWER)[letter] || [];
  const ds = letterDistractors(r, letter, conf, isUpper ? V.UPPER : V.LOWER, 3, null);
  const { choices, answer } = makeChoices(r, letter, ds, letterChoice, 4);
  return L.add({ type: 'letter-same', prompt: cyc(P.letterSame, v), visual: { kind: 'text', text: letter, lang: 'en-US', size: 'xl' },
    answerMode: 'choice', choices, answer, hint: H.letter, explain: `이 글자는 ${letter}!`, difficulty });
}
/** Upper → lower (or lower → upper). */
export function letterCase(L, r, letter, { v = 0, n = 4, difficulty = 2 } = {}) {
  const isUpper = letter === letter.toUpperCase();
  const target = isUpper ? letter.toLowerCase() : letter.toUpperCase();
  const conf = (isUpper ? V.CONFUSE_LOWER : V.CONFUSE_UPPER)[target] || [];
  const ds = letterDistractors(r, target, conf, isUpper ? V.LOWER : V.UPPER, n - 1, null);
  const { choices, answer } = makeChoices(r, target, ds, letterChoice, n);
  return L.add({ type: 'letter-case', prompt: cyc(isUpper ? P.toLower : P.toUpper, v), listen: en(say(letter)),
    visual: { kind: 'text', text: letter, lang: 'en-US', size: 'xl' }, answerMode: 'choice', choices, answer,
    hint: H.letter, explain: `${letter.toUpperCase()}${letter.toLowerCase()} — 큰 ${letter.toUpperCase()}, 작은 ${letter.toLowerCase()}!`, difficulty });
}
/** Alphabet order: seq = consecutive letters, blank = index to hide. */
export function alphabetOrder(L, r, seq, blank, { v = 0, difficulty = 2 } = {}) {
  const missing = seq[blank];
  const isUpper = missing === missing.toUpperCase();
  const alpha = isUpper ? V.UPPER : V.LOWER;
  const i = alpha.indexOf(missing);
  const near = [i - 3, i - 2, i + 2, i + 3, i - 1, i + 1, i - 4, i + 4].map((k) => alpha[(k + 26) % 26]).filter((l) => !seq.includes(l));
  const ds = letterDistractors(r, missing, near.slice(0, 5), alpha.filter((l) => !seq.includes(l)), 3, null);
  const { choices, answer } = makeChoices(r, missing, ds, letterChoice, 4);
  return L.add({ type: 'alphabet-order', prompt: cyc(P.order, v), visual: { kind: 'pattern', items: seq.map((l, k) => (k === blank ? null : l)) },
    speak: [ko(cyc(P.order, v)), en(seq.filter((_, k) => k !== blank).map((l) => `${l.toUpperCase()}.`).join(' '))],
    answerMode: 'choice', choices, answer, hint: H.order, explain: `${seq.join(' ')} — 빈칸은 ${missing}!`, difficulty });
}

// ---------------------------------------------------------------- phonics ----
/** picture + 🔊 word → which letter does it start with? */
export function initialSound(L, r, w, lessonLetters, { v = 0, caption = false, confusable = false, difficulty } = {}) {
  const first = w.en[0].toLowerCase();
  const ds = letterDistractors(r, first, lessonLetters, V.LOWER, 3, confusable ? V.CONFUSE_LOWER : null);
  const { choices, answer } = makeChoices(r, first, ds, letterChoice, 4);
  const visual = { kind: 'emoji', emoji: w.emoji, size: 'xl' };
  if (caption) visual.caption = w.en;
  return L.add({ type: 'initial-sound', prompt: cyc(P.initial, v), listen: en(w.en), visual, answerMode: 'choice', choices, answer,
    hint: H.initial, explain: `${w.en}의 첫 글자는 ${first}!`, difficulty: difficulty ?? (caption ? 1 : confusable ? 3 : 2) });
}
/** picture + 🔊 word → which letter does it END with? (x) */
export function finalSound(L, r, w, { difficulty = 2 } = {}) {
  const last = w.en[w.en.length - 1];
  const ds = letterDistractors(r, last, ['s', 'k', 't', 'n', 'z'], V.LOWER, 3, null);
  const { choices, answer } = makeChoices(r, last, ds, letterChoice, 4);
  return L.add({ type: 'final-sound', prompt: P.final[0], listen: en(w.en), visual: { kind: 'emoji', emoji: w.emoji, size: 'xl', caption: w.en },
    answerMode: 'choice', choices, answer, hint: '낱말의 마지막 소리를 잘 들어 보세요.', explain: `${w.en}의 마지막 글자는 ${last}!`, difficulty });
}
/** letter (shown or 🔊) → pick the picture whose word starts with it (choices speakable). */
export function letterPicture(L, r, letter, correctWord, otherWords, { n = 4, listenOnly = false, difficulty } = {}) {
  const ds = others(r, correctWord, otherWords.filter((x) => x.en[0].toLowerCase() !== letter.toLowerCase()), n - 1);
  const { choices, answer } = makeChoices(r, correctWord, ds, (x) => ({ emoji: x.emoji, speak: en(x.en) }), n);
  const prompt = listenOnly ? '잘 듣고 이 글자로 시작하는 낱말을 골라 보세요.' : `${letter}로 시작하는 낱말을 골라 보세요.`;
  const q = { type: 'letter-picture', prompt, speak: [ko(listenOnly ? prompt : '이 글자로 시작하는 낱말을 골라 보세요.'), en(say(letter))],
    answerMode: 'choice', choices, answer, hint: '그림을 눌러 낱말을 들어 보세요.', explain: `${correctWord.en}의 첫 글자는 ${letter}예요.`,
    difficulty: difficulty ?? (listenOnly ? 3 : 2) };
  if (listenOnly) q.listen = en(say(letter)); else q.visual = { kind: 'text', text: letter, lang: 'en-US', size: 'xl' };
  return L.add(q);
}
/** c _ t + 🐱 + 🔊 → pick the missing letter. slot: 'vowel' | 'first' | 'last'. */
export function missingLetter(L, r, w, { slot = 'vowel', v = 0, difficulty } = {}) {
  const word = w.en;
  let idx;
  if (slot === 'vowel') idx = word.search(/[aeiou]/);
  else if (slot === 'first') idx = 0;
  else idx = word.length - 1;
  const missing = word[idx];
  const shown = word.split('').map((c, i) => (i === idx ? '_' : c)).join(' ');
  let pool;
  if (slot === 'vowel') pool = ['a', 'e', 'i', 'o', 'u'];
  else pool = 'bcdfghklmnprstvwz'.split('').filter((c) => c !== missing);
  const ds = letterDistractors(r, missing, pool, pool, 3, null);
  const { choices, answer } = makeChoices(r, missing, ds, letterChoice, 4);
  return L.add({ type: 'missing-letter', prompt: cyc(P.missing, v), listen: en(word),
    visual: { kind: 'row', items: [{ kind: 'emoji', emoji: w.emoji, size: 'lg' }, { kind: 'text', text: shown, lang: 'en-US', size: 'xl' }] },
    answerMode: 'choice', choices, answer, hint: H.missing, explain: `${word.split('').join(', ')} — ${word}! (${w.ko})`,
    difficulty: difficulty ?? (slot === 'vowel' ? 2 : 3) });
}

// ---------------------------------------------------------------- numbers ----
const numChoice = (k) => ({ text: V.NUMBER_WORDS[k], speak: en(V.NUMBER_WORDS[k]) });
const numExplain = (k) => `${k}${V.eunNeun(String(k))} 영어로 ${V.NUMBER_WORDS[k]}!`;
/** count visual → English number word. */
export function countWord(L, r, k, range, { v = 0, emoji, difficulty = 2 } = {}) {
  const ds = nearNumbers(r, k, 3, { min: range[0], max: range[1], spread: 3 });
  const { choices, answer } = makeChoices(r, k, ds, numChoice, 4);
  const layout = k > 10 ? 'grid' : k > 5 ? 'grid' : 'row';
  return L.add({ type: 'number-word', prompt: cyc(P.countWord, v), visual: { kind: 'count', emoji: emoji || cyc(V.NUMBER_EMOJI, k), count: k, layout },
    answerMode: 'choice', choices, answer, hint: H.count, explain: numExplain(k), difficulty });
}
/** 🔊 'five' → pick the digit. */
export function listenNumber(L, r, k, range, { v = 0, n = 4, difficulty = 1 } = {}) {
  const ds = nearNumbers(r, k, n - 1, { min: range[0], max: range[1], spread: 3 });
  const { choices, answer } = makeChoices(r, k, ds, (x) => ({ text: String(x) }), n);
  return L.add({ type: 'number-word', prompt: cyc(P.listenNumber, v), listen: en(V.NUMBER_WORDS[k]), answerMode: 'choice', choices, answer,
    hint: H.listen, explain: numExplain(k), difficulty });
}
/** digit shown → English number word. */
export function digitWord(L, r, k, range, { v = 0, difficulty = 2 } = {}) {
  const ds = nearNumbers(r, k, 3, { min: range[0], max: range[1], spread: 3 });
  const { choices, answer } = makeChoices(r, k, ds, numChoice, 4);
  return L.add({ type: 'number-word', prompt: cyc(P.digitWord, v), visual: { kind: 'text', text: String(k), size: 'xl' },
    answerMode: 'choice', choices, answer, hint: H.tap, explain: numExplain(k), difficulty });
}
/** number word shown (no audio) → pick the count picture. */
export function readNumber(L, r, k, range, { emoji, difficulty = 3 } = {}) {
  const ds = nearNumbers(r, k, 3, { min: range[0], max: range[1], spread: 2 });
  const e = emoji || cyc(V.NUMBER_EMOJI, k + 3);
  const { choices, answer } = makeChoices(r, k, ds, (x) => ({ visual: { kind: 'count', emoji: e, count: x, layout: x > 5 ? 'grid' : 'row' } }), 4);
  return L.add({ type: 'number-word', prompt: P.readNumber[0], visual: { kind: 'text', text: V.NUMBER_WORDS[k], lang: 'en-US', size: 'xl' },
    answerMode: 'choice', choices, answer, hint: H.count, explain: numExplain(k), difficulty });
}

// ----------------------------------------------------------------- colors ----
const shapeOf = (c, shape) => ({ kind: 'shapes', items: [{ shape, color: c.hex }] });
const colorExplain = (c) => `${c.ko}${V.eunNeun(c.ko)} 영어로 ${c.en}!`;
/** colored shape → English word. */
export function colorWord(L, r, c, pool, { v = 0, shape = 'circle', n = 4, difficulty = 2 } = {}) {
  const { choices, answer } = makeChoices(r, c, others(r, c, pool, n - 1), (x) => ({ text: x.en, speak: en(x.en) }), n);
  return L.add({ type: 'color-word', prompt: cyc(P.colorWord, v), visual: shapeOf(c, shape), answerMode: 'choice', choices, answer,
    hint: H.tap, explain: colorExplain(c), difficulty });
}
/** 🔊 'red' → pick the colored shape. */
export function listenColor(L, r, c, pool, { v = 0, shape = 'circle', n = 4, difficulty } = {}) {
  const { choices, answer } = makeChoices(r, c, others(r, c, pool, n - 1), (x) => ({ visual: shapeOf(x, shape) }), n);
  return L.add({ type: 'color-word', prompt: cyc(P.listenColor, v), listen: en(c.en), answerMode: 'choice', choices, answer,
    hint: H.listen, explain: colorExplain(c), difficulty: difficulty ?? diffByChoices(choices.length) });
}
/** 🔊 'red' + text → Korean meaning. */
export function colorMeaning(L, r, c, pool, { v = 0, difficulty = 2 } = {}) {
  const { choices, answer } = makeChoices(r, c, others(r, c, pool, 3, { koMode: true }), (x) => ({ text: x.ko, speak: ko(x.ko) }), 4);
  return L.add({ type: 'word-meaning', prompt: cyc(P.wordMeaning, v), listen: en(c.en), visual: { kind: 'text', text: c.en, lang: 'en-US', size: 'xl' },
    answerMode: 'choice', choices, answer, hint: H.listen, explain: colorExplain(c), difficulty });
}
/** written color word (no audio) → colored shape. */
export function readColor(L, r, c, pool, { shape = 'square', difficulty = 3 } = {}) {
  const { choices, answer } = makeChoices(r, c, others(r, c, pool, 3), (x) => ({ visual: shapeOf(x, shape) }), 4);
  return L.add({ type: 'color-word', prompt: P.readColor[0], visual: { kind: 'text', text: c.en, lang: 'en-US', size: 'xl' }, answerMode: 'choice', choices, answer,
    hint: H.color, explain: colorExplain(c), difficulty });
}

// ------------------------------------------------------------------- days ----
const dayChoice = (d) => ({ text: d.en, speak: en(d.en) });
export function dayMeaning(L, r, d, { v = 0, listen = true, difficulty } = {}) {
  const { choices, answer } = makeChoices(r, d, others(r, d, V.DAYS, 3), (x) => ({ text: x.ko, speak: ko(x.ko) }), 4);
  const q = { type: 'word-meaning', prompt: listen ? cyc(P.dayMeaning, v) : P.wordMeaningRead[0], visual: { kind: 'text', text: d.en, lang: 'en-US', size: 'lg' },
    answerMode: 'choice', choices, answer, hint: H.listen, explain: `${d.ko}${V.eunNeun(d.ko)} 영어로 ${d.en}!`, difficulty: difficulty ?? (listen ? 2 : 3) };
  if (listen) q.listen = en(d.en);
  return L.add(q);
}
export function dayWord(L, r, d, { difficulty = 2 } = {}) {
  const { choices, answer } = makeChoices(r, d, others(r, d, V.DAYS, 3), dayChoice, 4);
  return L.add({ type: 'listen-word', prompt: P.dayWord[0], visual: { kind: 'text', text: d.ko, size: 'xl' }, answerMode: 'choice', choices, answer,
    hint: H.tap, explain: `${d.ko}${V.eunNeun(d.ko)} 영어로 ${d.en}!`, difficulty });
}
export function dayListen(L, r, d, { v = 0, difficulty = 2 } = {}) {
  const { choices, answer } = makeChoices(r, d, others(r, d, V.DAYS, 3), dayChoice, 4);
  return L.add({ type: 'listen-word', prompt: cyc(P.listenWord, v), listen: en(d.en), answerMode: 'choice', choices, answer,
    hint: H.tap, explain: `${d.ko}${V.eunNeun(d.ko)} 영어로 ${d.en}!`, difficulty });
}
export function dayOrder(L, r, start, len, blank, { difficulty = 3 } = {}) {
  const seq = Array.from({ length: len }, (_, i) => V.DAYS[(start + i) % 7]);
  const missing = seq[blank];
  const ds = others(r, missing, V.DAYS.filter((d) => !seq.includes(d)), 3);
  const { choices, answer } = makeChoices(r, missing, ds, dayChoice, 4);
  return L.add({ type: 'alphabet-order', prompt: P.dayOrder[0], visual: { kind: 'pattern', items: seq.map((d, i) => (i === blank ? null : d.en)) },
    speak: [ko(P.dayOrder[0]), en(seq.filter((_, i) => i !== blank).map((d) => d.en).join(', '))],
    answerMode: 'choice', choices, answer, hint: '월, 화, 수, 목, 금, 토, 일!', explain: `${seq.map((d) => d.en).join(', ')} — 빈칸은 ${missing.en}(${missing.ko})!`, difficulty });
}

// ------------------------------------------------------------ sight words ----
/** "I ___ apples." + picture → pick the missing sight word. listen = full sentence audio (easier). */
export function missingWord(L, r, s, { v = 0, listen = true, n = 4, difficulty } = {}) {
  const ds = sample(r, s.wrong, n - 1);
  const { choices, answer } = makeChoices(r, s.answer, ds, (x) => ({ text: x, speak: en(x) }), n);
  const items = s.emoji.map((e) => ({ kind: 'emoji', emoji: e, size: 'lg' }));
  const q = { type: 'missing-word', prompt: cyc(P.missingWord, v),
    visual: { kind: 'row', items: [...items, { kind: 'text', text: s.text, lang: 'en-US', size: 'lg' }] },
    answerMode: 'choice', choices, answer, hint: listen ? H.listen : H.tap, explain: `${s.full} ${s.ko}`, difficulty: difficulty ?? (listen ? 2 : 3) };
  if (listen) q.listen = en(s.full);
  return L.add(q);
}
/** 🔊 sight word → pick the written word among other sight words. */
export function sightListen(L, r, s, pool, { v = 0, difficulty = 2 } = {}) {
  const { choices, answer } = makeChoices(r, s, others(r, s, pool, 3), (x) => ({ text: x.en, speak: en(x.en) }), 4);
  return L.add({ type: 'listen-word', prompt: cyc(P.listenWord, v), listen: en(s.en), answerMode: 'choice', choices, answer,
    hint: H.tap, explain: s.ko ? `${s.en} = ${s.ko}` : `${s.en}!`, difficulty });
}
/** sight word text → Korean meaning (only for words with a ko gloss). */
export function sightMeaning(L, r, s, pool, { difficulty = 3 } = {}) {
  const p = pool.filter((x) => x.ko);
  const { choices, answer } = makeChoices(r, s, others(r, s, p, 3), (x) => ({ text: x.ko, speak: ko(x.ko) }), 4);
  return L.add({ type: 'word-meaning', prompt: P.wordMeaning[0], listen: en(s.en), visual: { kind: 'text', text: s.en, lang: 'en-US', size: 'xl' },
    answerMode: 'choice', choices, answer, hint: H.listen, explain: `${s.en} = ${s.ko}`, difficulty });
}

// ---------------------------------------------------------------- generic ----
/** Generic choice question with speakable English text choices. correct/wrongs = { en, ko }. */
export function pickSentence(L, r, { type = 'sentence-picture', prompt, visual, listen, correct, wrongs, n = 4, difficulty = 3, hint = H.sentence, explain }) {
  const ds = []; const seen = new Set([correct.en]);
  for (const d of shuffle(r, wrongs)) { if (ds.length >= n - 1) break; if (seen.has(d.en)) continue; seen.add(d.en); ds.push(d); }
  const { choices, answer } = makeChoices(r, correct, ds, (a) => ({ text: a.en, speak: en(a.en) }), n);
  const q = { type, prompt, visual, answerMode: 'choice', choices, answer, hint, explain: explain || `${correct.en} ${correct.ko}`, difficulty };
  if (listen) q.listen = en(listen);
  return L.add(q);
}
/** Visual helpers. */
export const emojiRow = (...emojis) => ({ kind: 'row', items: emojis.map((e) => ({ kind: 'emoji', emoji: e, size: 'lg' })) });
export const bigEmoji = (e) => ({ kind: 'emoji', emoji: e, size: 'xl' });
