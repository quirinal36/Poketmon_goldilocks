import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
const raw = JSON.parse(readFileSync('public/data/pokemon.json'));
const species = Array.isArray(raw) ? raw : raw.species;
const atlas = JSON.parse(readFileSync('public/assets/pokemon/atlas.json'));
assert.equal(species.length, 251); assert.equal(new Set(species.map(s => s.id)).size, 251);
const byId = new Map(species.map(s => [s.id, s]));
const habitats = new Set(['grassland','urban','forest','mountain','rough-terrain','cave','waters-edge','sea']);
for (let id = 1; id <= 251; id++) {
  const s = byId.get(id); assert(s && s.name && s.types.length && s.types.length <= 2, `species ${id}`);
  for (const evo of s.evolvesTo) assert.equal(byId.get(evo.id)?.evolvesFrom, id, `evolution ${id}->${evo.id}`);
  if (s.evolvesFrom) assert(byId.get(s.evolvesFrom)?.evolvesTo.some(e => e.id === id));
  if (s.obtainable === 'wild') assert(s.tier < 9 && s.habitats.some(h => habitats.has(h)), `unreachable wild ${id}`);
  if (s.obtainable === 'evolve') assert(s.evolvesFrom, `unreachable evolution ${id}`);
  if (s.obtainable === 'event') assert(s.tier === 9 || s.isLegendary, `event ${id}`);
}
for (const [id, name, type] of [[1,'이상해씨','풀'],[25,'피카츄','전기'],[95,'롱스톤','바위'],[152,'치코리타','풀'],[251,'세레비','에스퍼']]) {
  assert.equal(byId.get(id).name, name); assert(byId.get(id).types.includes(type));
}
for (const part of ['front','back','icons']) {
  const { cell, cols, url } = atlas[part];
  const { data, info } = await sharp(`public/${url}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert(info.width >= cols * cell && info.height >= Math.ceil(251 / cols) * cell);
  for (let id = 1; id <= 251; id++) {
    const x = (id - 1) % cols * cell, y = Math.floor((id - 1) / cols) * cell; let occupied = 0, transparent = 0;
    for (let dy = 0; dy < cell; dy++) for (let dx = 0; dx < cell; dx++) {
      const i = ((y + dy) * info.width + x + dx) * 4;
      if (data[i + 3] > 0) occupied++; else transparent++;
    }
    assert(occupied > 5, `${part} empty ${id}`); assert(transparent > cell, `${part} opaque background ${id}`);
  }
}
console.log('OK: 251 species, reciprocal evolution, acquisition paths, 753 nonempty transparent atlas cells');
