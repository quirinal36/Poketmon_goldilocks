// Pure BFS pathfinding on a 4-connected tile grid (tap-to-walk).
import type { Dir } from '../core/types';

export const DELTA: Record<Dir, readonly [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
export const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
export const DIR_ORDER: readonly Dir[] = ['up', 'right', 'down', 'left'];

export interface Pt { x: number; y: number }
export type Passable = (x: number, y: number) => boolean;

/** Direction from a to b (dominant axis; 'down' if equal). */
export function dirTo(a: Pt, b: Pt): Dir {
  const dx = b.x - a.x, dy = b.y - a.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  if (dy < 0) return 'up';
  return 'down';
}

/**
 * BFS from `from` to any of `targets`. Returns the list of directions to the nearest reachable
 * target (empty array if already there), or null if none is reachable within maxSteps.
 */
export function findPathToAny(passable: Passable, from: Pt, targets: Pt[], maxSteps = 40, maxNodes = 4000): Dir[] | null {
  if (!targets.length) return null;
  const key = (x: number, y: number) => `${x},${y}`;
  const targetSet = new Set(targets.map((t) => key(t.x, t.y)));
  if (targetSet.has(key(from.x, from.y))) return [];
  const prev = new Map<string, { k: string; d: Dir }>();
  const dist = new Map<string, number>();
  const q: Pt[] = [from];
  dist.set(key(from.x, from.y), 0);
  let visited = 0;
  while (q.length) {
    const cur = q.shift()!;
    const ck = key(cur.x, cur.y);
    const cd = dist.get(ck)!;
    if (cd >= maxSteps) continue;
    for (const d of DIR_ORDER) {
      const nx = cur.x + DELTA[d][0], ny = cur.y + DELTA[d][1];
      const nk = key(nx, ny);
      if (dist.has(nk)) continue;
      if (!targetSet.has(nk) && !passable(nx, ny)) continue;
      if (targetSet.has(nk) && !passable(nx, ny)) continue;
      dist.set(nk, cd + 1);
      prev.set(nk, { k: ck, d });
      if (targetSet.has(nk)) {
        const path: Dir[] = [];
        let k = nk;
        while (k !== key(from.x, from.y)) { const p = prev.get(k)!; path.push(p.d); k = p.k; }
        return path.reverse();
      }
      q.push({ x: nx, y: ny });
      if (++visited > maxNodes) return null;
    }
  }
  return null;
}

export function findPath(passable: Passable, from: Pt, to: Pt, maxSteps = 40, maxNodes = 4000): Dir[] | null {
  return findPathToAny(passable, from, [to], maxSteps, maxNodes);
}
