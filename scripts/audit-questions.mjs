// Independent audit: read generated JSON, solve from the visible material, never import question builders.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { WORDS, PHRASES, SIGHT, DAYS, COLORS, NUMBER_WORDS, SITUATIONS, SIGHT_SENTENCES } from './questions/english/vocab.mjs';
import { validate } from './validate-questions.mjs';
const cur = JSON.parse(readFileSync('public/data/curriculum.json'));
const qs = readdirSync('public/data/questions').filter(f => f.endsWith('.json')).flatMap(f => JSON.parse(readFileSync(`public/data/questions/${f}`)));
const { errors, warnings } = validate({ ...cur, questions: qs });
assert.deepEqual(errors, []); assert.deepEqual(warnings, []);
const textOf = v => v?.kind === 'text' ? v.text : v?.kind === 'row' ? v.items.map(textOf).filter(Boolean).join(' ') : '';
const choiceValue = c => c.text ?? c.emoji;
const natural = ['영', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
const tens = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
const digits = '영일이삼사오육칠팔구';
function readNumber(word) {
  if (/^\d+$/.test(word)) return Number(word);
  for (let i = 0; i < 100; i++) if ((i < 10 ? natural[i] : tens[Math.floor(i / 10)] + (i % 10 ? natural[i % 10] : '')) === word) return i;
  let result = 0, pending = 0;
  for (const c of word) {
    if ('천백십'.includes(c)) { result += (pending || 1) * ({ 천: 1000, 백: 100, 십: 10 })[c]; pending = 0; }
    else { assert(digits.includes(c), `Unknown numeral ${word}`); pending = digits.indexOf(c); }
  }
  return result + pending;
}
function arithmetic(expression) {
  const terms = expression.trim().split(/\s+/);
  let v = Number(terms[0]); assert(Number.isFinite(v));
  for (let i = 1; i < terms.length; i += 2) {
    const n = Number(terms[i + 1]); assert(Number.isFinite(n));
    if (terms[i] === '+') v += n; else if (terms[i] === '-') v -= n; else { assert.equal(terms[i], '×'); v *= n; }
  }
  return v;
}
function solve(q) {
  const v = q.visual, t = textOf(v);
  switch (q.type) {
    case 'count': return v.count;
    case 'read': return q.answerMode === 'numpad' ? readNumber(t) : Number(t);
    case 'neighbor': return Number(t) + (q.prompt.includes('앞') ? -1 : 1);
    case 'compare': return q.prompt.includes('작은') ? Math.min(v.left.number, v.right.number) : Math.max(v.left.number, v.right.number);
    case 'shape': return { box: '상자 모양', can: '둥근기둥 모양', ball: '공 모양', square: '네모 모양', triangle: q.choices.some(c => c.text === '삼각형') ? '삼각형' : '세모 모양', rectangle: '사각형', circle: q.choices.some(c => c.text === '원') ? '원' : '동그라미 모양' }[v.items[0].shape];
    case 'add': case 'sub': case 'blank': case 'equation': {
      const [left, right] = t.split(' = ');
      if (right === '□') return arithmetic(left);
      for (let i = 0; i <= 9999; i++) if (arithmetic(left.replace('□', String(i))) === Number(right)) return i;
      throw Error('No equation solution');
    }
    case 'story': return v.kind === 'groups' ? v.groups.reduce((s, g) => s + g.count - (g.crossed || 0), 0) : arithmetic(t);
    case 'length': return v.items.reduce((a, b) => a.length > b.length ? a : b).label;
    case 'weight': return v[v.heavier].emoji;
    case 'area': return v.items.reduce((a, b) => a.w * a.h > b.w * b.h ? a : b).label;
    case 'capacity': return v.items.reduce((a, b) => a.level > b.level ? a : b).label;
    case 'place-value': return (v.thousands || 0) * 1000 + (v.hundreds || 0) * 100 + v.tens * 10 + v.ones;
    case 'sequence': {
      const points = v.items.map((x, i) => x === null ? null : [i, Number(x)]).filter(Boolean);
      const step = (points[1][1] - points[0][1]) / (points[1][0] - points[0][0]);
      assert(points.every(([i, n]) => n === points[0][1] + (i - points[0][0]) * step));
      return points[0][1] + (v.items.indexOf(null) - points[0][0]) * step;
    }
    case 'pattern': {
      const candidates = [];
      for (let period = 1; period <= 3; period++) {
        const slots = new Map(); let valid = true;
        v.items.forEach((x, i) => { if (x === null) return; if (slots.has(i % period) && slots.get(i % period) !== x) valid = false; slots.set(i % period, x); });
        if (valid) candidates.push(slots.get(v.items.indexOf(null) % period));
      }
      assert.equal(new Set(candidates).size, 1); return candidates[0];
    }
    case 'clock': return `${v.hour}시${v.minute ? ` ${v.minute}분` : ''}`;
    case 'vertices': return { circle: 0, triangle: 3, rectangle: 4 }[v.items[0].shape];
    case 'ruler': return v.lengthCm;
    case 'lengthDiff': return Math.abs(v.items[0].length - v.items[1].length);
    case 'lengthSum': return v.items[0].length + v.items[1].length;
    case 'classifyColor': return v.items.filter(i => i.color === '#e04040').length;
    case 'classify': return v.items.filter(i => i.shape === 'circle').length;
    case 'table': return v.rows.find(row => row[0] === '사과')[1];
    case 'tableSum': return v.rows.reduce((s, row) => s + row[1], 0);
    case 'multiply-groups': return v.groups.reduce((s, g) => s + g.count, 0);
    case 'meters': { const [a, b] = t.match(/\d+/g).map(Number); return a * 100 + b; }
    case 'hours': { const [a, b] = t.match(/\d+/g).map(Number); return a * 60 + b; }
    case 'weeks': { const [a, b] = t.match(/\d+/g).map(Number); return a * 7 + b; }
    case 'elapsed': return v.minute + Number(q.prompt.match(/^\d+/)[0]);
    case 'calendar': return [31, (v.year % 4 === 0 && (v.year % 100 !== 0 || v.year % 400 === 0)) ? 29 : 28,31,30,31,30,31,31,30,31,30,31][v.month - 1];
    case 'graph': return v.values[v.labels.indexOf('사과')];
    case 'graphMax': return v.labels[v.values.indexOf(Math.max(...v.values))];
    case 'graphDiff': return Math.abs(v.values[0] - v.values[1]);
    case 'gridAdd': return v.rows[0][2] + v.rows[1][0];
    case 'gridMul': return v.rows[0][2] * v.rows[1][0];
    default: throw Error(`Unsupported math type ${q.type}`);
  }
}
const math = qs.filter(q => q.subject === 'math'), english = qs.filter(q => q.subject === 'english');
for (const q of math) {
  try {
    const expected = solve(q);
    const answer = q.answerMode === 'choice' ? choiceValue(q.choices.find(c => c.id === q.answer)) : q.answer;
    assert.equal(q.type === 'read' && q.answerMode === 'choice' ? readNumber(answer) : String(answer), q.type === 'read' && q.answerMode === 'choice' ? expected : String(expected));
    if (q.answerMode === 'numpad') assert(Number(answer) <= ({ m11: 50, m12: 100, m21: 999, m22: 9999 })[q.id.slice(0, 3)]);
    if (q.choices) assert.equal(q.choices.filter(c => String(q.type === 'read' ? readNumber(c.text) : choiceValue(c)) === String(expected)).length, 1);
  } catch (e) { throw Error(`${q.id}: ${e.message}`); }
}
// Vocabulary data is shared; answer selection and sentence parsing are independent of builders.
const lexicon = [...WORDS, ...PHRASES, ...SIGHT, ...DAYS, ...COLORS];
const norm = s => String(s || '').toLowerCase().replace(/[.!?]/g, '').trim();
const word = s => lexicon.find(w => norm(w.en) === norm(s));
const emojiOf = v => v?.kind === 'emoji' ? [v.emoji] : v?.kind === 'row' ? v.items.flatMap(emojiOf) : [];
function sentenceMatches(text, emojis) {
  const s = norm(text);
  if (emojis.some(e => ['⭕', '👍'].includes(e)) && /can't|don't/.test(s)) return false;
  if (emojis.some(e => ['❌', '👎'].includes(e)) && !/can't|don't/.test(s)) return false;
  const matches = WORDS.filter(w => [w.en, w.like, w.en + 's', w.en + 'es'].filter(Boolean).some(form => s.endsWith(' ' + form.toLowerCase()) || s === form.toLowerCase()));
  return matches.some(w => emojis.includes(w.emoji));
}
function englishMatch(q, c) {
  const v = q.visual, t = textOf(v), heard = q.listen?.text, label = c.text;
  switch(q.type) {
    case 'word-meaning': return lexicon.some(w => norm(w.en) === norm(heard || t) && w.ko === label);
    case 'listen-picture': return word(heard)?.emoji === c.emoji;
    case 'picture-word': return word(label)?.emoji === v.emoji;
    case 'listen-word': return norm(heard || DAYS.find(d => d.ko === t)?.en) === norm(label);
    case 'letter-same': return t === label;
    case 'letter-case': return t.toLowerCase() === label.toLowerCase() && t !== label;
    case 'letter-name': return heard[0].toLowerCase() === label.toLowerCase();
    case 'initial-sound': return heard[0].toLowerCase() === label.toLowerCase();
    case 'final-sound': return heard.at(-1).toLowerCase() === label.toLowerCase();
    case 'letter-picture': return c.speak.text[0].toLowerCase() === (heard || t)[0].toLowerCase();
    case 'missing-letter': return t.replaceAll(' ', '').replace('_', label) === heard;
    case 'missing-word': return t.replace('___', label) === (heard || SIGHT_SENTENCES.find(s => s.text === t)?.full);
    case 'alphabet-order': {
      const i = v.items.findIndex(x => x !== null), missing = v.items.indexOf(null), source = v.items[i];
      const day = DAYS.findIndex(d => d.en === source);
      return label === (day < 0 ? String.fromCharCode(source.charCodeAt(0) + missing - i) : DAYS[(day + missing - i + 7) % 7].en);
    }
    case 'color-word': return v?.kind === 'shapes' ? COLORS.find(x => x.hex === v.items[0].color)?.en === label : COLORS.find(x => x.en === (heard || t))?.hex === c.visual.items[0].color;
    case 'number-word': {
      const number = x => /^\d+$/.test(String(x)) ? Number(x) : NUMBER_WORDS.indexOf(x);
      return number(v?.count ?? heard ?? t) === number(c.visual?.count ?? label);
    }
    case 'sentence-picture': return c.emoji ? sentenceMatches(heard || t, [c.emoji]) : sentenceMatches(label, emojiOf(v));
    case 'dialog': {
      const situation = SITUATIONS.find(s => s.prompt === q.prompt);
      if (situation) return PHRASES.find(p => p.en === label)?.group === situation.group;
      const phrase = PHRASES.find(p => p.en === heard);
      if (phrase) return phrase.replies.includes(PHRASES.find(p => p.en === label)?.group);
      if (/^(Can you|Do you)/.test(heard)) {
        const yes = emojiOf(v).includes('⭕'), can = heard.startsWith('Can');
        return label === (yes ? `Yes, I ${can ? 'can' : 'do'}.` : `No, I ${can ? "can't" : "don't"}.`);
      }
      if (heard === 'What day is it today?') return norm(label) === norm(`It's ${DAYS.find(d => d.ko === t)?.en}.`);
      return sentenceMatches(label, emojiOf(v));
    }
    default: throw Error(`Unsupported English type ${q.type}`);
  }
}
for (const q of english) {
  assert.deepEqual(q.choices.filter(c => englishMatch(q, c)).map(c => c.id), [q.answer], `${q.id}: English answer/uniqueness`);
}

for (const q of english) {
  for (const c of q.choices || []) {
    if (/[A-Za-z]/.test(c.text || '')) assert(c.speak?.lang === 'en-US' && c.speak.text, `${q.id}: missing English choice speech`);
  }
  const labels = (q.choices || []).map(c => c.text?.toLowerCase());
  for (const group of [['hi', 'hello'], ['bye', 'goodbye'], ['mom', 'mother'], ['dad', 'father']]) assert(labels.filter(x => group.includes(x)).length <= 1, `${q.id}: synonym distractors`);
  if (q.type === 'letter-case') {
    const source = textOf(q.visual).toLowerCase(); const answer = q.choices.find(c => c.id === q.answer).text.toLowerCase(); assert.equal(source, answer, q.id);
  }
}
// Named introductory lessons must actually teach their stated constraints.
for (const q of math) {
  const t = textOf(q.visual), ns = (t.match(/\d+/g) || []).map(Number);
  if (/^m12-u2-l[12]-/.test(q.id)) assert(ns.every(n => n % 10 === 0), `${q.id}: tens lesson`);
  if (q.lessonId === 'm11-u3-l5') assert(ns.includes(0), `${q.id}: zero lesson`);
  if (q.lessonId === 'm12-u1-l1') assert(Number(q.answer) >= 60 && Number(q.answer) <= 100, `${q.id}: 60–100 lesson`);
  if (q.lessonId === 'm21-u3-l1') assert(ns[0]%10 + ns[1]%10 >= 10, `${q.id}: carrying lesson`);
  if (q.lessonId === 'm21-u3-l2') assert(ns[0]%10 < ns[1]%10, `${q.id}: borrowing lesson`);
}
const counts = cur.lessons.map(l => qs.filter(q => q.lessonId === l.id).length);
console.log(`OK: ${math.length} math answers independently solved; ${english.length} English answers/uniqueness and speech checked; ${cur.lessons.length} lessons, minimum ${Math.min(...counts)} questions.`);
if (process.argv.includes('--samples')) {
  const samples = [];
  for (const subject of [math, english]) for (const key of [...new Set(subject.map(q => q.id.slice(0, 3)))]) {
    const bank = subject.filter(q => q.id.startsWith(key));
    for (let i = 0; i < 30; i++) samples.push(bank[Math.floor(i * bank.length / 30)]);
  }
  writeFileSync('/tmp/my-game-review-samples.json', JSON.stringify(samples, null, 2));
  console.log('240 stratified samples: /tmp/my-game-review-samples.json');
}
