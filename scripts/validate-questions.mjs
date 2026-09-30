// Validates curriculum + questions against docs/DESIGN.md §5 and src/core/types.ts.
// Returns { errors: string[], warnings: string[] }.

const VISUAL_KINDS = new Set(['text', 'emoji', 'count', 'groups', 'compare', 'clock', 'shapes', 'pattern', 'blocks', 'numberline', 'lengths', 'ruler', 'table', 'bargraph', 'balance', 'containers', 'areas', 'calendar', 'grid', 'row']);
const SHAPES = new Set(['circle', 'triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'semicircle', 'oval', 'star', 'heart', 'diamond', 'box', 'can', 'ball', 'cube', 'cone']);
const LANGS = new Set(['ko-KR', 'en-US']);

function checkVisual(v, where, errors) {
  if (!v || typeof v !== 'object') { errors.push(`${where}: visual not object`); return; }
  if (!VISUAL_KINDS.has(v.kind)) { errors.push(`${where}: unknown visual kind ${v.kind}`); return; }
  switch (v.kind) {
    case 'count': if (!(v.count >= 0 && v.count <= 30)) errors.push(`${where}: count out of range ${v.count}`); if (!v.emoji) errors.push(`${where}: count needs emoji`); break;
    case 'clock': if (!(v.hour >= 1 && v.hour <= 12) || !(v.minute >= 0 && v.minute < 60)) errors.push(`${where}: bad clock ${v.hour}:${v.minute}`); break;
    case 'shapes': for (const s of v.items || []) if (!SHAPES.has(s.shape)) errors.push(`${where}: unknown shape ${s.shape}`); break;
    case 'groups': if (!Array.isArray(v.groups) || !v.groups.length) errors.push(`${where}: groups empty`); break;
    case 'pattern': if (!Array.isArray(v.items) || !v.items.length) errors.push(`${where}: pattern empty`); break;
    case 'row': for (const [i, it] of (v.items || []).entries()) checkVisual(it, `${where}.row[${i}]`, errors); break;
    case 'text': if (typeof v.text !== 'string' || !v.text) errors.push(`${where}: text empty`); if (v.lang && !LANGS.has(v.lang)) errors.push(`${where}: bad lang`); break;
    case 'bargraph': if (!v.labels || v.labels.length !== v.values?.length) errors.push(`${where}: bargraph labels/values mismatch`); break;
  }
}

export function validate({ units, lessons, questions }) {
  const errors = [], warnings = [];
  const unitIds = new Set();
  for (const u of units) {
    if (unitIds.has(u.id)) errors.push(`dup unit ${u.id}`); unitIds.add(u.id);
    if (!/^[me][12][12]-u\d+$/.test(u.id)) errors.push(`bad unit id ${u.id}`);
  }
  const lessonIds = new Set();
  const orders = { math: new Set(), english: new Set() };
  for (const l of lessons) {
    if (lessonIds.has(l.id)) errors.push(`dup lesson ${l.id}`); lessonIds.add(l.id);
    if (!unitIds.has(l.unitId)) errors.push(`lesson ${l.id} unknown unit ${l.unitId}`);
    if (!l.id.startsWith(l.unitId + '-l')) errors.push(`lesson id ${l.id} must start with ${l.unitId}-l`);
    if (orders[l.subject]?.has(l.order)) errors.push(`dup order ${l.subject} ${l.order}`); orders[l.subject]?.add(l.order);
    if (!l.title || !l.goal) errors.push(`lesson ${l.id} missing title/goal`);
    if (!(l.requiredCorrect >= 3)) errors.push(`lesson ${l.id} requiredCorrect`);
  }
  for (const s of ['math', 'english']) {
    const os = [...orders[s]].sort((a, b) => a - b);
    os.forEach((o, i) => { if (o !== i + 1) errors.push(`${s} lesson order not contiguous at ${o}`); });
  }
  const qIds = new Set();
  const perLesson = new Map();
  for (const q of questions) {
    const w = q.id;
    if (qIds.has(q.id)) errors.push(`dup question ${q.id}`); qIds.add(q.id);
    if (!lessonIds.has(q.lessonId)) errors.push(`${w}: unknown lesson ${q.lessonId}`);
    if (!q.id.startsWith(q.lessonId + '-')) errors.push(`${w}: id must start with lessonId`);
    perLesson.set(q.lessonId, (perLesson.get(q.lessonId) || 0) + 1);
    if (!q.prompt || typeof q.prompt !== 'string') errors.push(`${w}: missing prompt`);
    else if ([...q.prompt].length > 40) warnings.push(`${w}: prompt long (${[...q.prompt].length})`);
    if (![1, 2, 3, 4, 5].includes(q.difficulty)) errors.push(`${w}: difficulty`);
    if (q.visual) checkVisual(q.visual, w, errors);
    if (q.listen && (!q.listen.text || !LANGS.has(q.listen.lang))) errors.push(`${w}: bad listen`);
    if (q.speak && (!Array.isArray(q.speak) || q.speak.some((s) => !s.text || !LANGS.has(s.lang)))) errors.push(`${w}: bad speak`);
    if (q.answerMode === 'choice') {
      const cs = q.choices || [];
      if (cs.length < 2 || cs.length > 4) errors.push(`${w}: need 2-4 choices`);
      const ids = cs.map((c) => c.id);
      if (new Set(ids).size !== ids.length) errors.push(`${w}: dup choice ids`);
      if (!ids.includes(q.answer)) errors.push(`${w}: answer ${q.answer} not in choices`);
      const labels = cs.map((c) => JSON.stringify([c.text, c.emoji, c.visual]));
      if (new Set(labels).size !== labels.length) errors.push(`${w}: duplicate choice content`);
      for (const c of cs) {
        if (!['a', 'b', 'c', 'd'].includes(c.id)) errors.push(`${w}: bad choice id ${c.id}`);
        if (!c.text && !c.emoji && !c.visual) errors.push(`${w}: empty choice`);
        if (c.visual) checkVisual(c.visual, `${w}.choice`, errors);
      }
    } else if (q.answerMode === 'numpad') {
      if (!/^\d{1,4}$/.test(q.answer)) errors.push(`${w}: numpad answer must be 0-9999 integer string, got ${q.answer}`);
      if (q.choices) warnings.push(`${w}: numpad with choices`);
    } else errors.push(`${w}: bad answerMode ${q.answerMode}`);
  }
  for (const l of lessons) {
    const n = perLesson.get(l.id) || 0;
    if (n === 0) errors.push(`lesson ${l.id} has no questions`);
    else if (n < 20) errors.push(`lesson ${l.id} has only ${n} questions`);
  }
  return { errors, warnings };
}
