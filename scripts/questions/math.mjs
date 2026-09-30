import * as M from './math/common.mjs';

// Each unit lists its teaching sequence; the final lesson mixes the unit's skills.
const SEMESTERS = [
  [1, 1, [
    ['9까지의 수', ['1부터 5까지 세기', '6부터 9까지 세기', '수 읽기', '수 쓰기', '수의 순서', '수의 크기'], ['count5', 'count69', 'read9', 'write9', 'next9', 'compare9']],
    ['여러 가지 모양', ['상자 모양', '둥근기둥 모양', '공 모양', '모양 찾기'], ['solid-box', 'solid-can', 'solid-ball', 'solid']],
    ['덧셈과 뺄셈', ['모으기', '가르기', '덧셈', '뺄셈', '0이 있는 계산', '빈칸 찾기', '덧셈과 뺄셈 이야기'], ['add9', 'sub9', 'add9', 'sub9', 'zero9', 'blank9', 'story9']],
    ['비교하기', ['길이 비교', '무게 비교', '넓이 비교', '담을 수 있는 양'], ['length', 'weight', 'area', 'capacity']],
    ['50까지의 수', ['십과 일', '50까지 읽기', '50까지 쓰기', '뛰어 세기', '수 비교'], ['blocks50', 'read50', 'write50', 'skip50', 'compare50']],
  ]],
  [1, 2, [
    ['100까지의 수', ['60부터 100까지', '십과 일', '수 읽기', '수 쓰기', '수 비교', '수의 순서'], ['blocks60100', 'blocks100', 'read100', 'write100', 'compare100', 'next100']],
    ['덧셈과 뺄셈 (1)', ['십 단위 덧셈', '십 단위 뺄셈', '두 자리 덧셈', '두 자리 뺄셈', '빈칸 찾기', '계산 이야기'], ['addTens', 'subTens', 'add100easy', 'sub100easy', 'blank100easy', 'story100easy']],
    ['여러 가지 모양', ['네모 모양', '세모 모양', '동그라미 모양', '모양 구별', '모양 규칙'], ['flat-square', 'flat-triangle', 'flat-circle', 'flat', 'pattern']],
    ['덧셈과 뺄셈 (2)', ['10 만들기', '10에서 빼기', '세 수 더하기', '세 수 빼기', '10을 이용한 덧셈', '빈칸 찾기'], ['ten', 'tenSub', 'threeAdd', 'threeSub', 'ten', 'blank10']],
    ['시계 보기와 규칙 찾기', ['몇 시', '몇 시 30분', '시계 읽기', '모양 규칙', '수의 규칙', '뛰어 세기'], ['clock0', 'clock30', 'clock30', 'pattern', 'skip100', 'skip100']],
    ['덧셈과 뺄셈 (3)', ['받아올림 덧셈', '받아내림 뺄셈', '덧셈 연습', '뺄셈 연습', '빈칸 찾기'], ['add20', 'sub20', 'add20', 'sub20', 'blank20']],
  ]],
  [2, 1, [
    ['세 자리 수', ['백 알아보기', '백 십 일', '세 자리 수 읽기', '세 자리 수 비교', '뛰어 세기'], ['blocks999', 'blocks999', 'read999', 'compare999', 'skip999']],
    ['여러 가지 도형', ['삼각형', '사각형', '원', '꼭짓점과 변'], ['polygon-triangle', 'polygon-rectangle', 'polygon-circle', 'vertices']],
    ['덧셈과 뺄셈', ['받아올림', '받아내림', '두 자리 수 계산', '빈칸 찾기', '계산 이야기', '세 수 계산'], ['add100carry', 'sub100borrow', 'add100', 'blank100', 'story100', 'threeAdd']],
    ['길이 재기', ['길이 비교', '자 읽기', '센티미터', '길이의 차이'], ['length', 'ruler', 'ruler', 'lengthDiff']],
    ['분류하기', ['모양별 분류', '색깔별 분류', '분류한 수 세기', '표로 정리'], ['classify', 'classifyColor', 'classify', 'table']],
    ['곱셈', ['같은 수 더하기', '묶어 세기', '몇 배', '곱셈식', '곱셈 연습'], ['groupsMul', 'groupsMul', 'groupsMul', 'mul', 'mul']],
  ]],
  [2, 2, [
    ['네 자리 수', ['천 알아보기', '천 백 십 일', '네 자리 수 읽기', '네 자리 수 쓰기', '수의 크기', '뛰어 세기'], ['blocks9999', 'blocks9999', 'read9999', 'write9999', 'compare9999', 'skip9999']],
    ['곱셈구구', ['2단과 5단', '3단과 6단', '4단과 8단', '7단과 9단', '1단과 0', '구구 연습', '빈칸 구구'], ['mul25', 'mul36', 'mul48', 'mul79', 'mul01', 'mul', 'blankMul']],
    ['길이 재기', ['미터와 센티미터', '길이의 합', '길이의 차이', '자로 재기', '길이 비교', '단위 바꾸기'], ['meters', 'lengthSum', 'lengthDiff', 'ruler', 'length', 'meters']],
    ['시각과 시간', ['5분 단위 읽기', '1분 단위 읽기', '시간과 분', '지난 시간', '하루와 일주일', '달력 보기'], ['clock5', 'clock1', 'hours', 'elapsed', 'weeks', 'calendar']],
    ['표와 그래프', ['표 읽기', '표의 합계', '그래프 읽기', '가장 많은 것', '자료 비교'], ['table', 'tableSum', 'graph', 'graphMax', 'graphDiff']],
    ['규칙 찾기', ['모양 규칙', '수 규칙', '덧셈표', '곱셈표', '뛰어 세기'], ['pattern', 'skip9999', 'gridAdd', 'gridMul', 'skip9999']],
  ]],
];

function generate(ctx, skill, d) {
  const r = ctx.r, int = (a, b) => M.randInt(r, a, b), pick = a => M.pick(r, a);
  const n = int(1, 9), b = int(1, 9);
  const num = (type, prompt, visual, answer, hint = '그림과 수를 차근차근 살펴보세요.') => M.addNum(ctx, { type, prompt, visual, answer, hint, explain: `정답은 ${answer}입니다.`, difficulty: d });
  const choice = (type, prompt, visual, correct, distractors, toChoice = M.asText) => M.addChoice(ctx, { type, prompt, visual, correct, distractors, toChoice, hint: '다른 점을 하나씩 살펴보세요.', explain: typeof correct === 'string' ? `정답은 ${correct}입니다.` : '그림의 모양과 수를 확인해 보세요.', difficulty: d });
  if (skill === 'blocks60100') { const v = int(60,100); return num('place-value', '블록이 나타내는 수를 써 보세요.', M.V.blocks({ hundreds: Math.floor(v/100), tens: Math.floor(v/10)%10, ones: v%10 }), v); }
  if (skill === 'zero9') return M.qArith(ctx,d,{op: pick(['+', '-']), a:[0,9], b:[0,0], max:9, pic:true});
  if (skill === 'addTens' || skill === 'subTens') { const plus = skill === 'addTens'; if (plus ? n+b > 10 : n < b) return; return num('equation', '빈칸에 알맞은 수를 써 보세요.', M.V.text(`${n*10} ${plus ? '+' : '-'} ${b*10} = □`), (plus ? n+b : n-b)*10); }
  if (skill === 'count69') return M.qCount(ctx, d, 6, 9);
  const [_, kind, limitText] = skill.match(/^(count|read|write|next|compare|blocks|skip)(\d+)$/) || [];
  if (kind) {
    const max = Number(limitText), lo = max > 100 ? Math.floor(max / 10) + 1 : 1;
    if (kind === 'count') return M.qCount(ctx, d, 1, max);
    if (kind === 'read') return M.qRead(ctx, d, lo, max, { native: max < 100 });
    if (kind === 'write') {
      const v = int(lo, max), word = max < 100 && r() < .5 ? M.native(v) : M.sino(v);
      return num('read', '글로 쓴 수를 숫자로 써 보세요.', M.V.row([M.V.text(word), { kind: 'emoji', emoji: M.obj(r).e }]), v);
    }
    if (kind === 'next') { const v = int(2, max - 1), before = r() < .5; return num('neighbor', before ? '바로 앞의 수를 써 보세요.' : '바로 다음 수를 써 보세요.', M.V.row([M.V.text(String(v)), { kind: 'emoji', emoji: M.obj(r).e }]), before ? v - 1 : v + 1); }
    if (kind === 'compare') return M.qCompare(ctx, d, lo, max, pick(['bigger', 'smaller']));
    if (kind === 'blocks') {
      const v = int(lo, max);
      return num('place-value', '블록이 나타내는 수를 써 보세요.', M.V.blocks({ thousands: Math.floor(v / 1000), hundreds: Math.floor(v / 100) % 10, tens: Math.floor(v / 10) % 10, ones: v % 10 }), v);
    }
    const step = pick(max < 100 ? [1, 2, 5] : max < 1000 ? [2, 5, 10] : [10, 100]);
    const start = int(1, max - 4 * step), blank = int(0, 4);
    return num('sequence', '빈칸에 알맞은 수를 써 보세요.', M.V.pattern(Array.from({ length: 5 }, (_, i) => i === blank ? null : String(start + i * step))), start + blank * step, `${step}씩 커지는 규칙이에요.`);
  }
  if (/^(add|sub|blank|story)\d+/.test(skill)) {
    const [, mode, maxText] = skill.match(/^(add|sub|blank|story)(\d+)/), max = Number(maxText);
    const op = mode === 'sub' ? '-' : mode === 'add' ? '+' : pick(['+', '-']);
    const args = { op, a: [0, max - 1], b: [0, max - 1], max, pic: max <= 20,
      cond: skill.endsWith('easy') ? (x, y) => op === '+' ? x % 10 + y % 10 < 10 : x % 10 >= y % 10 : undefined };
    if (skill === 'add20') Object.assign(args, { a: [1, 9], b: [1, 9], cond: (x, y) => x + y >= 10 });
    if (skill === 'sub20') Object.assign(args, { a: [10, 18], b: [1, 9], cond: (x, y) => x % 10 < y });
    if (skill.endsWith('carry')) args.cond = (x,y) => x%10+y%10 >= 10;
    if (skill.endsWith('borrow')) args.cond = (x,y) => x%10 < y%10;
    return (mode === 'blank' ? M.qBlank : mode === 'story' ? M.qStory : M.qArith)(ctx, d, args);
  }
  if (skill.startsWith('clock')) {
    const mins = { clock0: [0], clock30: [0, 30], clock5: Array.from({ length: 12 }, (_, i) => i * 5), clock1: Array.from({ length: 60 }, (_, i) => i) }[skill];
    return M.qClock(ctx, d, mins, 'read');
  }
  if (skill === 'ten' || skill === 'tenSub') return num('equation', '빈칸에 알맞은 수를 써 보세요.', M.V.row([M.V.text(skill === 'ten' ? `${n} + □ = 10` : `10 - ${n} = □`), { kind: 'count', emoji: M.obj(r).e, count: n }]), 10 - n);
  if (skill === 'threeAdd' || skill === 'threeSub') {
    const c = int(0, 9), plus = skill === 'threeAdd', a = plus ? n : n + b + c;
    if (n+b+c > 20) return;
    return num('equation', '차례대로 계산해 보세요.', M.V.text(`${a} ${plus ? '+' : '-'} ${b} ${plus ? '+' : '-'} ${c} = □`), plus ? a + b + c : n);
  }
  if (skill.startsWith('mul') || skill === 'blankMul' || skill === 'groupsMul') {
    const a = pick(({ mul25: [2, 5], mul36: [3, 6], mul48: [4, 8], mul79: [7, 9], mul01: [0, 1] })[skill] || [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    if (skill === 'blankMul') return M.qBlank(ctx, d, { op: '×', a: [1, 9], b: [1, 9], max: 81 });
    if (skill === 'groupsMul') { const emoji = M.obj(r).e, groups = Array.from({ length: int(2, 5) }, () => ({ emoji, count: n })); return num('multiply-groups', '그림은 모두 몇 개일까요?', M.V.groups(groups, '+'), groups.length * n); }
    return num('equation', '곱셈을 해 보세요.', M.V.text(r() < .5 ? `${a} × ${b} = □` : `${b} × ${a} = □`), a * b);
  }
  if (['solid', 'flat', 'polygon', 'vertices', 'classify', 'classifyColor'].includes(skill.split('-')[0])) {
    const shapes = skill.startsWith('solid') ? [['box', '상자 모양'], ['can', '둥근기둥 모양'], ['ball', '공 모양']] : skill.startsWith('flat') ? [['square', '네모 모양'], ['triangle', '세모 모양'], ['circle', '동그라미 모양']] : [['triangle', '삼각형'], ['rectangle', '사각형'], ['circle', '원']];
    const s = shapes.find(s => s[0] === skill.split('-')[1]) || pick(shapes), color = pick(['#e04040', '#4878e8', '#40b058', '#f8d848']);
    if (skill === 'classifyColor') {
      const items = Array.from({ length: int(4, 9) }, () => ({ shape: 'circle', color: pick(['#e04040', '#4878e8', '#40b058']) }));
      return num('classifyColor', '빨간 동그라미는 몇 개일까요?', M.V.shapes(items), items.filter(i => i.color === '#e04040').length);
    }
    if (skill === 'classify') {
      const items = Array.from({ length: int(4, 9) }, () => ({ shape: pick(['circle', 'triangle', 'square']), color }));
      return num('classify', '동그라미는 모두 몇 개일까요?', M.V.shapes(items), items.filter(i => i.shape === 'circle').length);
    }
    if (skill === 'vertices') return num('vertices', '꼭짓점은 몇 개일까요?', M.V.shapes([{ shape: s[0], color, size: int(40, 90) }]), { triangle: 3, rectangle: 4, circle: 0 }[s[0]]);
    return choice('shape', '그림은 어떤 모양일까요?', M.V.shapes([{ shape: s[0], color, size: int(40, 90) }]), s[1], shapes.filter(v => v !== s).map(v => v[1]));
  }
  if (skill === 'pattern') {
    const pool = M.sample(r, ['⭐', '🌸', '🍎', '🔵', '🟩', '🦋'], 3), len = int(2, 3), blank = int(2, 6);
    return choice('pattern', '빈칸에 들어갈 그림을 골라 보세요.', M.V.pattern(Array.from({ length: 7 }, (_, i) => i === blank ? null : pool[i % len])), pool[blank % len], pool.filter(x => x !== pool[blank % len]), M.asEmoji);
  }
  if (skill === 'weight') {
    const a = M.obj(r), bb = M.obj(r); if (a.e === bb.e) return;
    const heavier = pick(['left', 'right']);
    return choice('weight', '더 무거운 것을 골라 보세요.', { kind: 'balance', left: { emoji: a.e }, right: { emoji: bb.e }, heavier }, heavier === 'left' ? a.e : bb.e, [heavier === 'left' ? bb.e : a.e], M.asEmoji);
  }
  if (skill === 'capacity') {
    if (n === b) return;
    return choice('capacity', '물이 더 많은 컵을 골라 보세요.', { kind: 'containers', items: [{ label: '가', shape: 'cup', level: n / 10 }, { label: '나', shape: 'cup', level: b / 10 }] }, n > b ? '가' : '나', [n > b ? '나' : '가']);
  }
  if (skill === 'area') {
    const a = int(2, 6), c = int(2, 6); if (a * n === b * c) return;
    return choice('area', '더 넓은 것을 골라 보세요.', { kind: 'areas', items: [{ label: '가', w: a, h: n }, { label: '나', w: b, h: c }] }, a * n > b * c ? '가' : '나', [a * n > b * c ? '나' : '가']);
  }
  if (skill === 'ruler') return num('ruler', '길이는 몇 cm일까요?', { kind: 'ruler', lengthCm: n, startCm: int(0, 3), object: pick(['pencil', 'crayon', 'ribbon', 'key', 'leaf']) }, n);
  if (skill.startsWith('length')) {
    if (n === b) return;
    const visual = { kind: 'lengths', items: [{ label: '가', length: n }, { label: '나', length: b }], unit: 'cm', showGrid: true };
    if (skill === 'length') return choice('length', '더 긴 것을 골라 보세요.', visual, n > b ? '가' : '나', [n > b ? '나' : '가']);
    return num(skill, skill === 'lengthSum' ? '두 길이의 합은 몇 cm일까요?' : '두 길이의 차이는 몇 cm일까요?', visual, skill === 'lengthSum' ? n + b : Math.abs(n - b));
  }
  if (skill === 'meters') return num('meters', '센티미터로 바꾸어 보세요.', M.V.text(`${n}m ${b * 10}cm = □cm`), n * 100 + b * 10);
  if (skill === 'hours') return num('hours', '모두 몇 분일까요?', M.V.text(`${n}시간 ${b * 5}분`), n * 60 + b * 5);
  if (skill === 'weeks') return num('weeks', '모두 며칠일까요?', M.V.text(`${n}주일 ${b % 7}일`), n * 7 + b % 7);
  if (skill === 'elapsed') {
    const minute = int(0, 30), delta = int(1, 29);
    return num('elapsed', `${delta}분 뒤에는 ${n}시 몇 분일까요?`, M.V.clock(n, minute), minute + delta);
  }
  if (skill === 'calendar') {
    const year = int(2024, 2032), month = int(1, 12);
    return num('calendar', '이 달은 며칠까지 있을까요?', { kind: 'calendar', year, month }, new Date(Date.UTC(year, month, 0)).getUTCDate());
  }
  if (skill.startsWith('grid')) {
    const mul = skill === 'gridMul';
    return num(skill, '표의 빈칸에 알맞은 수를 써 보세요.', M.V.grid([[mul ? '×' : '+', b, b + 1], [n, mul ? n * b : n + b, null]], true), mul ? n * (b + 1) : n + b + 1);
  }
  const vals = [n, b, int(1, 9)], labels = ['사과', '딸기', '귤'];
  const visual = skill.startsWith('table') ? { kind: 'table', headers: ['과일', '개수'], rows: labels.map((x, i) => [x, vals[i]]) } : { kind: 'bargraph', labels, values: vals, max: 10, unitLabel: '개' };
  if (skill === 'graphMax') {
    const max = Math.max(...vals); if (vals.filter(x => x === max).length > 1) return;
    return choice(skill, '가장 많은 과일을 골라 보세요.', visual, labels[vals.indexOf(max)], labels.filter((_, i) => vals[i] !== max));
  }
  return num(skill, skill === 'tableSum' ? '과일은 모두 몇 개일까요?' : skill === 'graphDiff' ? '사과와 딸기의 개수 차이는 얼마일까요?' : '사과는 몇 개일까요?', visual, skill === 'tableSum' ? vals.reduce((a, b) => a + b) : skill === 'graphDiff' ? Math.abs(n - b) : n);
}

export function buildMath() {
  const units = [], lessons = [], questions = []; let order = 0;
  for (const [grade, semester, defs] of SEMESTERS) defs.forEach(([title, titles, skills], ui) => {
    const unitId = `m${grade}${semester}-u${ui + 1}`;
    units.push({ id: unitId, subject: 'math', grade, semester, unitNo: ui + 1, title, order: units.length + 1 });
    [...titles, `${title} 복습`].forEach((name, li) => {
      const id = `${unitId}-l${li + 1}`, review = li === titles.length;
      lessons.push({ id, unitId, subject: 'math', grade, semester, lessonNo: li + 1, title: name, goal: `${name} 문제를 풀 수 있어요.`, order: ++order, requiredCorrect: review ? 10 : 8, ...(review ? { isReview: true } : {}) });
      const ctx = M.makeCtx(id);
      for (let attempt = 0; ctx.L.count < 24 && attempt < 10000; attempt++) generate(ctx, review ? skills[attempt % skills.length] : skills[li], review ? 2 + attempt % 3 : 1 + attempt % 3);
      if (ctx.L.count < 24) throw Error(`${id}: only ${ctx.L.count}`);
      questions.push(...ctx.L.questions);
    });
  });
  return { units, lessons, questions };
}
