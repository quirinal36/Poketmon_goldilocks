// Small shared helpers. Keep dependency-free.

/** 받침 여부 (한글 마지막 글자 기준; 숫자/영문도 대략 처리). */
export function hasBatchim(word: string): boolean {
  const s = word.trim();
  if (!s) return false;
  const ch = s[s.length - 1];
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
  // digits: 0영 1일 2이 3삼 4사 5오 6육 7칠 8팔 9구
  if (/[0-9]/.test(ch)) return '013678'.includes(ch);
  // English letters read as Korean names roughly: l,m,n,r end with 받침-like sound
  if (/[a-zA-Z]/.test(ch)) return /[lmnrLMNR]/.test(ch);
  return false;
}

/** 받침이 'ㄹ'인지 (으로/로 구분용). */
function isRieulBatchim(word: string): boolean {
  const s = word.trim();
  const code = s.charCodeAt(s.length - 1);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 === 8;
  return /[178lL]$/.test(s);
}

export type JosaPair = '이/가' | '을/를' | '은/는' | '와/과' | '으로/로' | '이에요/예요' | '아/야' | '이라고/라고';

/** josa('피카츄', '이/가') → '피카츄가', josa('꼬부기','을/를') → '꼬부기를'. */
export function josa(word: string, pair: JosaPair): string {
  const b = hasBatchim(word);
  switch (pair) {
    case '이/가': return word + (b ? '이' : '가');
    case '을/를': return word + (b ? '을' : '를');
    case '은/는': return word + (b ? '은' : '는');
    case '와/과': return word + (b ? '과' : '와');
    case '으로/로': return word + (b && !isRieulBatchim(word) ? '으로' : '로');
    case '이에요/예요': return word + (b ? '이에요' : '예요');
    case '아/야': return word + (b ? '아' : '야');
    case '이라고/라고': return word + (b ? '이라고' : '라고');
  }
}

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Local date as YYYY-MM-DD. */
export function todayStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function uid(prefix = ''): string {
  const r = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
    ? globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    : Math.random().toString(36).slice(2, 14);
  return prefix + r;
}

/** Create an element with classes/attrs/children. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, any> = {},
  ...children: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    e.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return e;
}

/** Mulberry32 seeded PRNG. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(arr: T[], rand: () => number = Math.random): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function weightedPick<T>(items: T[], weight: (t: T) => number, rand: () => number = Math.random): T {
  const ws = items.map((i) => Math.max(0, weight(i)));
  const total = ws.reduce((s, w) => s + w, 0);
  if (total <= 0) return items[Math.floor(rand() * items.length)];
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
}

/** Resolve a path under public/ relative to the page (works on Vercel & Lounge sub-paths). */
export function asset(path: string): string {
  return new URL(path.replace(/^\//, ''), document.baseURI).toString();
}
