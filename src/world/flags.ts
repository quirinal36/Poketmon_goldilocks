// FlagExpr evaluation: 'flag' | '!flag' | 'a&b' | 'a|b' | '!a&b|c'  ('&' binds tighter than '|').
// A flag is true when its value is truthy (true, non-zero number, non-empty string).
import type { FlagExpr } from '../core/types';

export type FlagMap = Record<string, boolean | number | string>;

export function flagTruthy(v: boolean | number | string | undefined): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === 'string') return v !== '' && v !== '0' && v !== 'false';
  return !!v;
}

export function evalFlag(expr: FlagExpr | undefined | null, flags: FlagMap): boolean {
  if (expr === undefined || expr === null) return true;
  const s = String(expr).trim();
  if (!s) return true;
  return s.split('|').some((orPart) =>
    orPart.split('&').every((term) => {
      let t = term.trim();
      if (!t) return true;
      let neg = false;
      while (t.startsWith('!')) { neg = !neg; t = t.slice(1).trim(); }
      let v: boolean;
      const m = /^([^<>=!]+)(>=|<=|=|>|<)(.+)$/.exec(t);
      if (m) {
        const a = flags[m[1].trim()];
        const b = m[3].trim();
        const an = typeof a === 'number' ? a : parseFloat(String(a));
        const bn = parseFloat(b);
        if (m[2] === '=') v = String(a) === b;
        else if (!Number.isFinite(an) || !Number.isFinite(bn)) v = false;
        else v = m[2] === '>' ? an > bn : m[2] === '<' ? an < bn : m[2] === '>=' ? an >= bn : an <= bn;
      } else {
        v = flagTruthy(flags[t]);
      }
      return neg ? !v : v;
    }),
  );
}
