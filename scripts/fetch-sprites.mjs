// Korean Pokémon wiki (pokemon.fandom.com/ko) sprites → public/assets/pokemon/{front,back,icons}.png + atlas.json
// Usage: node scripts/fetch-sprites.mjs [--refresh]
//   --refresh   ignore the cached URL map and cached downloads in .cache/sprites/
//
// Sources (per id NNN = 3-digit national dex number):
//   front  파일:도트_2금_NNN.png         (Gold front sprite, 56×56)
//   back   파일:도트_뒷_2세대_NNN.png     (Gen-2 back sprite, 56×56)
//   icon   파일:NNN박스아이콘.png         (box icon, 32×32; alternatives searched via list=allimages)
// Fallback when the wiki has no file: PokeAPI/sprites on GitHub (generation-ii/gold, generation-vii/icons).
// Processing: border-connected white → transparent (flood fill; interior white such as eyes is kept), trim,
//   center + bottom-align in 56×56 (front/back) or center in 32×32 (icons, first frame if two are stacked),
//   pack 16 columns × 16 rows (index = id-1), PNG compression 9 (palette only when it is lossless).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const REFRESH = args.includes('--refresh');
const CACHE = resolve(root, '.cache/sprites');
const OUT_DIR = resolve(root, 'public/assets/pokemon');
const DOC = resolve(root, 'docs/POKEMON_DATA.md');
const MAX_ID = 251;
const COLS = 16;
const ROWS = Math.ceil(MAX_ID / COLS);
const CONCURRENCY = 4;
const WIKI_API = 'https://pokemon.fandom.com/ko/api.php';
const GH = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/130 Safari/537.36',
  Referer: 'https://pokemon.fandom.com/',
  Accept: 'image/png',
};
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const nnn = (id) => String(id).padStart(3, '0');

const KINDS = {
  front: { title: (id) => `파일:도트_2금_${nnn(id)}.png`, cell: 56, align: 'bottom', fallback: (id) => `${GH}/generation-ii/gold/${id}.png`, file: 'front.png' },
  back: { title: (id) => `파일:도트_뒷_2세대_${nnn(id)}.png`, cell: 56, align: 'bottom', fallback: (id) => `${GH}/generation-ii/gold/back/${id}.png`, file: 'back.png' },
  icon: { title: (id) => `파일:${nnn(id)}박스아이콘.png`, cell: 32, align: 'center', fallback: (id) => `${GH}/generation-vii/icons/${id}.png`, file: 'icons.png' },
};

// ----------------------------------------------------------------- utils ----
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }));
  return out;
}
function readJson(file, fallback) {
  try { return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback; } catch { return fallback; }
}
const isPng = (buf) => buf.length > 8 && buf.subarray(0, 8).equals(PNG_SIG);

async function wikiApi(params, attempt = 0) {
  const url = `${WIKI_API}?${new URLSearchParams({ action: 'query', format: 'json', ...params })}`;
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error.info ?? 'api error');
    return json;
  } catch (e) {
    if (attempt >= 4) throw new Error(`wiki api failed: ${e.message}`);
    await sleep(800 * 2 ** attempt);
    return wikiApi(params, attempt + 1);
  }
}

// ------------------------------------------------------- 1. resolve URLs ----
mkdirSync(CACHE, { recursive: true });
const URL_CACHE = resolve(CACHE, 'urls.json');
/** title → { url, width, height } | null (null = file does not exist on the wiki) */
const urls = REFRESH ? {} : readJson(URL_CACHE, {});
const wanted = [];
for (const kind of Object.keys(KINDS)) for (let id = 1; id <= MAX_ID; id++) wanted.push(KINDS[kind].title(id));
const todo = wanted.filter((t) => !(t in urls));
if (todo.length) {
  console.log(`Resolving ${todo.length} file URLs on pokemon.fandom.com/ko (batches of 50) …`);
  for (let i = 0; i < todo.length; i += 50) {
    const batch = todo.slice(i, i + 50);
    const json = await wikiApi({ prop: 'imageinfo', iiprop: 'url|size', titles: batch.join('|') });
    const norm = new Map((json.query?.normalized ?? []).map((n) => [n.from, n.to]));
    const pages = new Map(Object.values(json.query?.pages ?? {}).map((p) => [p.title, p]));
    for (const title of batch) {
      // A file can be "missing" (no description page) yet "known" with imageinfo (e.g. 234, 237) → use imageinfo whenever present.
      const page = pages.get(norm.get(title) ?? title);
      const info = page?.imageinfo?.[0]?.url ? page.imageinfo[0] : null;
      urls[title] = info ? { url: info.url, width: info.width, height: info.height } : null;
    }
    writeFileSync(URL_CACHE, JSON.stringify(urls, null, 1));
    await sleep(250);
  }
}

// Alternative icon names for ids whose plain 'NNN박스아이콘.png' is missing (e.g. 안농 → 201A박스아이콘.png).
const ALT_CACHE = resolve(CACHE, 'icon-alternatives.json');
const altIcons = REFRESH ? {} : readJson(ALT_CACHE, {});
for (let id = 1; id <= MAX_ID; id++) {
  const title = KINDS.icon.title(id);
  if (urls[title] || id in altIcons) continue;
  const json = await wikiApi({ list: 'allimages', aiprefix: nnn(id), ailimit: '500', aiprop: 'url|dimensions' });
  const names = (json.query?.allimages ?? []).filter((a) => /^\d{3}.*박스아이콘\.png$/i.test(a.name));
  const pick = (re) => names.filter((a) => re.test(a.name)).sort((a, b) => a.name.localeCompare(b.name, 'en'))[0];
  const alt = pick(new RegExp(`^${nnn(id)}(새)?박스아이콘\\.png$`)) ?? pick(new RegExp(`^${nnn(id)}[A-Za-z!?]{1,2}(새)?박스아이콘\\.png$`)) ?? pick(/./);
  altIcons[id] = alt ? { title: `파일:${alt.name}`, url: alt.url, width: alt.width, height: alt.height } : null;
  console.log(`  icon ${nnn(id)} missing → ${alt ? alt.name : 'no alternative on wiki'}`);
  writeFileSync(ALT_CACHE, JSON.stringify(altIcons, null, 1));
  await sleep(250);
}

// ------------------------------------------------------- 2. download ----
async function download(url, attempt = 0) {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30000) });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (!isPng(buf)) throw new Error(`not a PNG (${res.headers.get('content-type')})`);
    return buf;
  } catch (e) {
    if (attempt >= 3) { console.warn(`  download failed ${url}: ${e.message}`); return null; }
    await sleep(700 * 2 ** attempt);
    return download(url, attempt + 1);
  }
}
const SOURCES_CACHE = resolve(CACHE, 'sources.json');
/** kind → id → { source: 'wiki'|'github', title? } */
const sources = REFRESH ? {} : readJson(SOURCES_CACHE, {});
const jobs = [];
for (const kind of Object.keys(KINDS)) {
  mkdirSync(resolve(CACHE, kind), { recursive: true });
  sources[kind] ??= {};
  for (let id = 1; id <= MAX_ID; id++) jobs.push({ kind, id });
}
console.log(`Downloading ${jobs.length} sprites (≤${CONCURRENCY} concurrent, cache: ${CACHE}) …`);
let nDone = 0;
await pool(jobs, CONCURRENCY, async ({ kind, id }) => {
  const file = resolve(CACHE, kind, `${nnn(id)}.png`);
  if (!REFRESH && existsSync(file) && isPng(readFileSync(file)) && sources[kind][id]) return;
  const K = KINDS[kind];
  let title = K.title(id);
  let entry = urls[title];
  if (!entry && kind === 'icon' && altIcons[id]) { entry = altIcons[id]; title = altIcons[id].title; }
  let buf = null, source = null;
  if (entry) {
    buf = await download(entry.url + (entry.url.includes('?') ? '&' : '?') + 'format=original');
    if (buf) source = { source: 'wiki', title: title.replace(/^파일:/, '') };
    await sleep(120);
  }
  if (!buf) {
    buf = await download(K.fallback(id));
    if (buf) source = { source: 'github', title: K.fallback(id) };
  }
  if (buf) { writeFileSync(file, buf); sources[kind][id] = source; }
  else { sources[kind][id] = null; console.warn(`  MISSING ${kind} ${nnn(id)}`); }
  if (++nDone % 100 === 0) { console.log(`  ${nDone}/${jobs.length}`); writeFileSync(SOURCES_CACHE, JSON.stringify(sources, null, 1)); }
});
writeFileSync(SOURCES_CACHE, JSON.stringify(sources, null, 1));

// -------------------------------------------------------- 3. process ----
/** Make every white/transparent pixel connected to the border transparent (4-neighbour flood fill). */
function clearBackground(data, w, h) {
  const isBg = (i) => data[i * 4 + 3] < 16 || (data[i * 4] >= 240 && data[i * 4 + 1] >= 240 && data[i * 4 + 2] >= 240);
  const seen = new Uint8Array(w * h);
  const stack = [];
  const push = (i) => { if (!seen[i] && isBg(i)) { seen[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (stack.length) {
    const i = stack.pop();
    data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = data[i * 4 + 3] = 0;
    const x = i % w, y = (i - x) / w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }
}
const notes = { scaled: [], blank: [], stacked: [] };
/** → { data, width, height } trimmed RGBA sprite, or null when the image is empty. */
async function processSprite(file, kind, id) {
  let img = sharp(file).ensureAlpha();
  let { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  let { width: w, height: h } = info;
  if (kind === 'icon' && h >= 2 * w) {      // two stacked animation frames → keep the first
    h = Math.floor(h / 2);
    data = Buffer.from(data.subarray(0, w * h * 4));
    notes.stacked.push(id);
  }
  clearBackground(data, w, h);
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (data[(y * w + x) * 4 + 3] > 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0) { notes.blank.push(`${kind}:${id}`); return null; }
  let sprite = sharp(data, { raw: { width: w, height: h, channels: 4 } }).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 });
  const cell = KINDS[kind].cell;
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
  if (bw > cell || bh > cell) {               // oversized source (e.g. 2× upscaled file) → integer nearest downscale
    const k = Math.max(Math.ceil(bw / cell), Math.ceil(bh / cell));
    sprite = sprite.resize({ width: Math.ceil(bw / k), height: Math.ceil(bh / k), kernel: 'nearest', fit: 'fill' });
    notes.scaled.push(`${kind}:${id}(${bw}×${bh}/${k})`);
  }
  const out = await sprite.raw().toBuffer({ resolveWithObject: true });
  return { data: out.data, width: out.info.width, height: out.info.height };
}

/** Encode a raw RGBA image as an optimized PNG; palette only when the round trip is pixel-identical. */
async function encodePng(raw, width, height) {
  const base = () => sharp(raw, { raw: { width, height, channels: 4 } });
  const lossless = await base().png({ compressionLevel: 9, adaptiveFiltering: true, palette: false }).toBuffer();
  const pal = await base().png({ compressionLevel: 9, palette: true, quality: 100, effort: 10, dither: 0 }).toBuffer();
  const back = await sharp(pal).ensureAlpha().raw().toBuffer();
  let same = back.length === raw.length;
  for (let i = 0; same && i < raw.length; i += 4) {
    if (raw[i + 3] !== back[i + 3]) same = false;
    else if (raw[i + 3] !== 0 && (raw[i] !== back[i] || raw[i + 1] !== back[i + 1] || raw[i + 2] !== back[i + 2])) same = false;
  }
  return same && pal.length < lossless.length ? { buf: pal, palette: true } : { buf: lossless, palette: false };
}

mkdirSync(OUT_DIR, { recursive: true });
const report = {};
for (const kind of Object.keys(KINDS)) {
  const K = KINDS[kind];
  const size = K.cell * COLS;
  const sizeY = K.cell * ROWS;
  const layers = [];
  const missing = [];
  for (let id = 1; id <= MAX_ID; id++) {
    const file = resolve(CACHE, kind, `${nnn(id)}.png`);
    if (!existsSync(file)) { missing.push(id); continue; }
    const sp = await processSprite(file, kind, id);
    if (!sp) { missing.push(id); continue; }
    const cx = ((id - 1) % COLS) * K.cell, cy = Math.floor((id - 1) / COLS) * K.cell;
    const left = cx + Math.floor((K.cell - sp.width) / 2);
    const top = cy + (K.align === 'bottom' ? K.cell - sp.height : Math.floor((K.cell - sp.height) / 2));
    layers.push({ input: sp.data, raw: { width: sp.width, height: sp.height, channels: 4 }, left, top });
  }
  const atlasRaw = await sharp({ create: { width: size, height: sizeY, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers).raw().toBuffer();
  const { buf, palette } = await encodePng(atlasRaw, size, sizeY);
  writeFileSync(resolve(OUT_DIR, K.file), buf);
  const fallback = Object.entries(sources[kind]).filter(([, s]) => s?.source === 'github').map(([id]) => Number(id));
  const alt = Object.entries(sources[kind]).filter(([id, s]) => s?.source === 'wiki' && s.title !== K.title(Number(id)).replace(/^파일:/, '')).map(([id, s]) => `${id}→${s.title}`);
  report[kind] = { ok: MAX_ID - missing.length, missing, fallback, alt, palette, bytes: buf.length, size: `${size}×${sizeY}` };
  console.log(`${K.file}: ${MAX_ID - missing.length}/${MAX_ID} sprites, ${size}×${sizeY}, ${(buf.length / 1024).toFixed(1)} KB${palette ? ' (palette)' : ''}` +
    (missing.length ? `, MISSING: ${missing.join(', ')}` : '') + (fallback.length ? `, github fallback: ${fallback.join(', ')}` : '') + (alt.length ? `, alt titles: ${alt.join(', ')}` : ''));
}
if (notes.stacked.length) console.log(`icons with 2 stacked frames (first used): ${notes.stacked.join(', ')}`);
if (notes.scaled.length) console.log(`downscaled oversized sources: ${notes.scaled.join(', ')}`);
if (notes.blank.length) console.log(`blank after background removal: ${notes.blank.join(', ')}`);

const atlas = {
  front: { url: 'assets/pokemon/front.png', cell: 56, cols: COLS },
  back: { url: 'assets/pokemon/back.png', cell: 56, cols: COLS },
  icons: { url: 'assets/pokemon/icons.png', cell: 32, cols: COLS },
  count: MAX_ID,
};
writeFileSync(resolve(OUT_DIR, 'atlas.json'), JSON.stringify(atlas, null, 2) + '\n');
console.log(`wrote ${resolve(OUT_DIR, 'atlas.json')}`);

// ------------------------------------------------------------------- docs ----
const DOC_HEADER = `# 포켓몬 데이터 (POKEMON_DATA)

Generated sections below are (re)written by \`scripts/build-pokemon-data.mjs\` (data) and
\`scripts/fetch-sprites.mjs\` (sprites). Edit the scripts, not the generated blocks.
`;
function updateDocSection(file, key, body) {
  const order = ['data', 'sprites'];
  const begin = `<!-- BEGIN:${key} -->`, end = `<!-- END:${key} -->`;
  let doc = existsSync(file) ? readFileSync(file, 'utf8') : DOC_HEADER;
  const block = `${begin}\n${body.trim()}\n${end}`;
  const i = doc.indexOf(begin), j = doc.indexOf(end);
  if (i >= 0 && j > i) doc = doc.slice(0, i) + block + doc.slice(j + end.length);
  else {
    let at = -1;
    for (const later of order.slice(order.indexOf(key) + 1)) {
      const k = doc.indexOf(`<!-- BEGIN:${later} -->`);
      if (k >= 0 && (at < 0 || k < at)) at = k;
    }
    doc = at >= 0 ? doc.slice(0, at) + block + '\n\n' + doc.slice(at) : doc.trimEnd() + '\n\n' + block + '\n';
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, doc);
}
const list = (a) => (a.length ? a.join(', ') : 'none');
updateDocSection(DOC, 'sprites', `
## 스프라이트: public/assets/pokemon/

Source: Korean Pokémon wiki (pokemon.fandom.com/ko) via the MediaWiki API, cached in \`.cache/sprites/\`.
Regenerate with \`npm run data:sprites\` (\`-- --refresh\` re-resolves and re-downloads). Built ${new Date().toLocaleDateString('sv-SE')}.

| atlas | wiki file name (NNN = 3-digit id) | cell | layout | sprites | fallback (GitHub PokeAPI/sprites) | size |
|---|---|---|---|---|---|---|
| front.png | 도트_2금_NNN.png (Gold front) | 56 px | 16 cols × ${ROWS} rows, index = id−1, centered, bottom-aligned | ${report.front.ok}/${MAX_ID} | ${list(report.front.fallback)} | ${report.front.size}, ${(report.front.bytes / 1024).toFixed(0)} KB${report.front.palette ? ' (palette)' : ''} |
| back.png | 도트_뒷_2세대_NNN.png (Gen-2 back) | 56 px | same | ${report.back.ok}/${MAX_ID} | ${list(report.back.fallback)} | ${report.back.size}, ${(report.back.bytes / 1024).toFixed(0)} KB${report.back.palette ? ' (palette)' : ''} |
| icons.png | NNN박스아이콘.png (box icon) | 32 px | 16 cols × ${ROWS} rows, index = id−1, centered | ${report.icon.ok}/${MAX_ID} | ${list(report.icon.fallback)} | ${report.icon.size}, ${(report.icon.bytes / 1024).toFixed(0)} KB${report.icon.palette ? ' (palette)' : ''} |

- \`atlas.json\` = \`AtlasInfo\` (types.ts): \`{ front: { url, cell: 56, cols: 16 }, back: {…}, icons: { url, cell: 32, cols: 16 }, count: 251 }\`.
  Cell of species \`id\`: \`sx = ((id-1) % cols) * cell\`, \`sy = floor((id-1) / cols) * cell\`. URLs are relative to the site root (\`base: './'\`).
- Background: only white connected to the image border is made transparent (flood fill), so white eyes/bellies stay white.
- Icons: if the wiki icon has two stacked animation frames only the first is used (ids: ${list(notes.stacked)}).
- Alternative icon titles used: ${list(report.icon.alt)}.
- Missing after all fallbacks: front ${list(report.front.missing)}; back ${list(report.back.missing)}; icons ${list(report.icon.missing)}.
- Oversized sources downscaled (nearest): ${list(notes.scaled)}.
`);
console.log(`updated ${DOC}`);
const totalMissing = Object.values(report).reduce((n, r) => n + r.missing.length, 0);
if (totalMissing) { console.error(`${totalMissing} sprites missing`); process.exit(1); }
