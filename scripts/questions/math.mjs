import * as M from './math/common.mjs';

// New lesson IDs keep completed counting lessons separate from arithmetic progress.
const STAGES = [
  ['한 자리 덧셈과 뺄셈', ['덧셈', '뺄셈', '덧셈과 뺄셈 복습']],
  ['10보다 큰 합', ['덧셈 기본', '덧셈 연습', '덧셈 복습']],
  ['10을 넘나드는 뺄셈', ['뺄셈 기본', '뺄셈 연습', '뺄셈 복습']],
  ['구구단 2~3단', ['2단', '3단', '2~3단 복습']],
  ['구구단 4~5단', ['4단', '5단', '4~5단 복습']],
  ...[6, 7, 8, 9].map(n => [`구구단 ${n}단`, [`${n}단 기본`, `${n}단 연습`, `${n}단 복습`]]),
];

function pairs(stage, lesson) {
  const out = [];
  for (let a = 1; a <= 18; a++) for (let b = 1; b <= 9; b++) {
    if (stage === 0 && a <= 9) {
      if (lesson !== 1 && a + b < 10) out.push([a, '+', b]);
      if (lesson !== 0 && a - b > 0) out.push([a, '-', b]);
    }
    if (stage === 1 && a <= 9 && a + b > 10) out.push([a, '+', b]);
    if (stage === 2 && a > 10 && a - b > 0 && a - b < 10) out.push([a, '-', b]);
    const tables = stage === 3 ? [2, 3] : stage === 4 ? [4, 5] : [stage + 1];
    if (stage >= 3 && tables.includes(a) && (tables.length === 1 || lesson === 2 || a === tables[lesson])) out.push([a, '×', b]);
  }
  return out;
}

export function buildMath() {
  const units = [], lessons = [], questions = [];
  STAGES.forEach(([title, names], stage) => {
    const grade = stage < 5 ? 1 : 2, semester = [0, 1, 2, 5, 6].includes(stage) ? 1 : 2;
    const unitId = `m${grade}${semester}-u${101 + stage}`;
    units.push({ id: unitId, subject: 'math', grade, semester, unitNo: stage + 1, title: `${stage}단계 · ${title}`, order: stage + 1 });
    names.forEach((name, li) => {
      const id = `${unitId}-l${li + 1}`, review = li === 2;
      lessons.push({ id, unitId, subject: 'math', grade, semester, lessonNo: li + 1, title: `${stage}단계 · ${name}`, goal: `${name} 문제를 풀 수 있어요.`, order: lessons.length + 1, requiredCorrect: review ? 10 : 8, ...(review ? { isReview: true } : {}) });
      const ctx = M.makeCtx(id);
      // Nine facts in a single multiplication table: result entry, result choice, and missing factor.
      const variants = pairs(stage, li).flatMap(pair => [0, 1, 2].map(mode => ({ pair, mode })));
      for (const { pair: [a, op, b], mode } of M.shuffle(ctx.r, variants).slice(0, 24)) {
        const result = op === '+' ? a + b : op === '-' ? a - b : a * b;
        const expr = mode === 2 ? `${a} ${op} □ = ${result}` : `${a} ${op} ${b} = □`;
        const answer = mode === 2 ? b : result;
        const data = { type: 'equation', prompt: '빈칸에 알맞은 수를 써 보세요.', speak: M.speakExpr(expr), visual: M.V.text(expr), hint: op === '×' ? `${a}씩 더하는 구구단을 떠올려 보세요.` : '수를 모으거나 빼며 계산해 보세요.', explain: `${a} ${op} ${b} = ${result}`, difficulty: mode + 1 };
        if (mode === 1) M.addChoice(ctx, { ...data, correct: answer, distractors: M.nearNumbers(ctx.r, answer), toChoice: M.asText });
        else M.addNum(ctx, { ...data, answer });
      }
      if (ctx.L.count !== 24) throw Error(`${id}: expected 24 questions, got ${ctx.L.count}`);
      questions.push(...ctx.L.questions);
    });
  });
  return { units, lessons, questions };
}
