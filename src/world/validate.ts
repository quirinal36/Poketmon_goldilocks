import type { MapDef, MapId, Script, TrainerDef } from '../core/types';
import { DEFAULT_LEGEND } from '../maps/legend';
import { STRUCTURES, TILE_INFO } from '../art';
import { buildMap, terrainBlocked } from './mapdata';

export function validateMaps(maps: Record<MapId, MapDef>, scripts: Record<string, Script>, trainers: Record<string, TrainerDef>): string[] {
  const errors: string[] = [];
  const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
  for (const map of Object.values(maps)) {
    const fail = (message: string) => errors.push(`${map.id}: ${message}`);
    const inside = (x: number, y: number) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < map.width && y < map.height;
    if (map.tiles.length !== map.height) fail('row count');
    const legend = { ...DEFAULT_LEGEND, ...map.legend };
    map.tiles.forEach((row, y) => {
      if (row.length !== map.width) fail(`row ${y}: width ${row.length}, expected ${map.width}`);
      [...row].forEach((c, x) => { if (!TILE_INFO[legend[c]]) fail(`unknown tile ${c} at ${x},${y}`); });
    });
    const runtime = buildMap(map);
    for (const warp of map.warps) {
      if (!inside(warp.x, warp.y) || terrainBlocked(runtime, warp.x, warp.y)) fail(`warp blocked at ${warp.x},${warp.y}`);
      const dest = maps[warp.to];
      if (!dest || terrainBlocked(buildMap(dest), warp.tx, warp.ty)) fail(`warp destination ${warp.to}:${warp.tx},${warp.ty} blocked`);
      if (!dest?.warps.some(back => back.to === map.id)) fail(`warp ${warp.to} has no return`);
    }
    for (const exit of map.exits || []) {
      const dest = maps[exit.to];
      const vertical = exit.dir === 'up' || exit.dir === 'down';
      const from = exit.from || 0, range = exit.toRange ?? (vertical ? map.width : map.height);
      const pair = dest?.exits?.find(e => e.dir === opposite[exit.dir] && e.to === map.id && e.offset === -exit.offset && (e.from || 0) === from + exit.offset && (e.toRange ?? range) === range);
      if (!pair) fail(`unpaired exit ${exit.dir} -> ${exit.to}`);
      for (let c = from; c < from + range; c++) {
        const x = vertical ? c : exit.dir === 'left' ? 0 : map.width - 1;
        const y = vertical ? exit.dir === 'up' ? 0 : map.height - 1 : c;
        const tx = vertical ? c + exit.offset : exit.dir === 'left' ? (dest?.width || 0) - 1 : 0;
        const ty = vertical ? exit.dir === 'up' ? (dest?.height || 0) - 1 : 0 : c + exit.offset;
        if (terrainBlocked(runtime, x, y) || !dest || terrainBlocked(buildMap(dest), tx, ty)) fail(`exit blocked at ${x},${y} -> ${exit.to}:${tx},${ty}`);
      }
    }
    // All entrances and exits must share a walkable component; NPC story gates are checked in E2E.
    const entrances = map.warps.map(w => [w.x, w.y]);
    for (const exit of map.exits || []) {
      const c = exit.from || 0;
      entrances.push(exit.dir === 'up' ? [c, 0] : exit.dir === 'down' ? [c, map.height - 1] : exit.dir === 'left' ? [0, c] : [map.width - 1, c]);
    }
    if (entrances.length) {
      const queue = [entrances[0]], visited = new Set([entrances[0].join(',')]);
      for (let i = 0; i < queue.length; i++) {
        const [x,y] = queue[i];
        for (const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
          const key = `${nx},${ny}`;
          if (inside(nx,ny) && !terrainBlocked(runtime,nx,ny) && !visited.has(key)) { visited.add(key); queue.push([nx,ny]); }
        }
      }
      for (const point of entrances) if (!visited.has(point.join(','))) fail(`unreachable entrance ${point}`);
    }
    const occupied = new Set<string>();
    for (const n of map.npcs) {
      if (!inside(n.x, n.y) || terrainBlocked(runtime, n.x, n.y)) fail(`NPC ${n.id} blocked at ${n.x},${n.y}`);
      const key = `${n.x},${n.y}`; if (occupied.has(key)) fail(`NPC overlap at ${key}`); occupied.add(key);
      if (n.trainer && !trainers[n.trainer]) fail(`unknown trainer ${n.trainer}`);
    }
    for (const object of [...(map.signs || []), ...(map.objects || []), ...(map.items || [])]) if (!inside(object.x, object.y)) fail(`object out of bounds ${object.x},${object.y}`);
    const ids = [map.onEnter, ...map.npcs.map(n => n.script), ...(map.objects || []).map(o => o.script), ...(map.triggers || []).map(t => t.script)];
    for (const id of ids) if (id && !scripts[id]) fail(`unknown script ${id}`);
    for (const s of map.structures || []) {
      const def = STRUCTURES[s.kind];
      if (!inside(s.x, s.y) || !inside(s.x + def.w - 1, s.y + def.h - 1)) fail(`structure ${s.kind} outside map`);
      if (!def.door) continue;
      const x = s.x + def.door.x, y = s.y + def.door.y;
      if (!map.warps.some(w => w.x === x && w.y === y) && !map.objects?.some(o => o.x === x && o.y === y)) fail(`door without warp or interaction ${s.kind} at ${x},${y}`);
    }
  }
  return errors;
}
