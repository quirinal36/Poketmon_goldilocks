#!/usr/bin/env node
// scripts/gen-images.mjs — DESIGN §8: raster images for public/assets/img/.
//
//   node scripts/gen-images.mjs                      post-process every _gen/<key>_raw.png → public/assets/img/ + manifest.json
//   node scripts/gen-images.mjs oak rival            only these keys (manifest entries are merged, not replaced)
//   node scripts/gen-images.mjs --generate [keys]    run `codex exec` (built-in image tool) for keys whose raw is missing,
//                                                    3 at a time, up to 4 prompt attempts each; then post-process
//   node scripts/gen-images.mjs --generate --force k regenerate even if _gen/k_raw.png exists
//   node scripts/gen-images.mjs --mode=blocks|lanczos|hybrid   resampling for sprites (default: hybrid, see below)
//   node scripts/gen-images.mjs --preview            also write 3× nearest previews + a contact sheet to _gen/preview/
//
// Pipeline for sprites (people / badge / stamp):
//   1. flood-fill the white background from the image borders (tolerance 12; interior whites survive)
//   2. peel a 1–2 px near-white halo that touches the transparent area (anti-aliased fringe)
//   3. trim transparent margins
//   4. estimate the art's pixel size per axis (autocorrelation of the colour-gradient profile, refined on
//      its harmonics) and take the mode colour of every art block → a native-resolution pixel-art image
//   5. resample to the target size:
//        blocks  – nearest-neighbour from the native image (crispest, but 1.6–1.8× upscale makes uneven pixels
//                  and thin 1-block lines can drop out when the source grid drifts)
//        lanczos – lanczos3 straight from the keyed source, alpha hardened, palette-quantised
//        hybrid  – lanczos3 geometry with every pixel snapped to the ≤48-colour palette of the native image
//                  (default: keeps thin facial lines, no blended colours; judged best at 2–3× pixelated display)
//   6. write a palette PNG (≤64 colours, no dither)
// Backgrounds / icons keep their background (no transparency) and use lanczos3.
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GEN = path.join(ROOT, '_gen');
const OUT = path.join(ROOT, 'public', 'assets', 'img');
const PREVIEW = path.join(GEN, 'preview');

// ---------------------------------------------------------------------------
// Specs & prompts. Prompts describe ORIGINAL characters only (moderation rejects franchise references).
// ---------------------------------------------------------------------------
const STYLE_CHAR =
  'retro 16-bit color handheld RPG pixel art character sprite of an ORIGINAL character, clean black outlines, ' +
  'limited flat palette, simple cel shading, full body standing pose, front-facing, centered, plain pure white ' +
  'background, no text, no watermark, single character only';
const STYLE_ICON =
  'retro 16-bit handheld RPG pixel art game item icon, square image, clean black outlines, limited flat palette, ' +
  'centered and large in frame, plain pure white background, no text, no watermark';
const ORIGINAL = ' (an original design that does not resemble any existing character)';

const PERSON = { kind: 'trainer', target: 'person', height: 192 };

export const SPECS = {
  oak: {
    ...PERSON, kind: 'portrait',
    prompts: [
      `${STYLE_CHAR}: a kind elderly professor with gray hair swept back, bushy gray eyebrows, gentle smile, wearing a white lab coat open over a red shirt and beige trousers, holding a clipboard in one hand`,
      `${STYLE_CHAR}: a friendly old scientist grandpa, gray combed-back hair, warm smile, white lab coat over a red polo shirt, tan pants, holding a clipboard`,
    ],
  },
  rival: {
    ...PERSON,
    prompts: [
      `${STYLE_CHAR}: a confident 11-year-old boy with spiky light-brown hair, wearing a purple jacket over a dark shirt and dark jeans, sneakers, both hands in his pockets, cocky smirk`,
      `${STYLE_CHAR}: a cocky preteen boy, messy spiky light-brown hair, violet zip jacket, gray pants, hands tucked in pockets, confident half-smile`,
    ],
  },
  bugcatcher: {
    ...PERSON,
    prompts: [
      `${STYLE_CHAR}: a cheerful young kid wearing a yellow straw hat, a white tank top and blue shorts with sneakers, holding a green bug-catching net over one shoulder, big smile`,
      `${STYLE_CHAR}: a happy little boy in a straw sun hat, white sleeveless shirt, navy shorts, holding a butterfly net, grinning`,
    ],
  },
  camper: {
    ...PERSON,
    prompts: [
      `${STYLE_CHAR}: a friendly boy scout kid wearing a green cap, khaki short-sleeve shirt and khaki shorts, hiking boots, small brown backpack, cheerful grin`,
      `${STYLE_CHAR}: a young camping boy with a green baseball cap, tan scout shirt and shorts, brown boots, wearing a small backpack, smiling`,
    ],
  },
  leader_woong: {
    ...PERSON,
    prompts: [
      `${STYLE_CHAR}: a friendly rock-climbing coach with spiky dark-brown hair, squinting closed-eye smile, orange t-shirt under a green sleeveless vest, brown pants, hiking shoes, arms crossed`,
      `${STYLE_CHAR}: a cheerful outdoorsy young man, spiky dark brown hair, eyes squinted shut in a smile, orange tee, olive utility vest, brown cargo pants, arms folded`,
    ],
  },
  mom: {
    ...PERSON, kind: 'portrait',
    prompts: [
      `${STYLE_CHAR}: a warm smiling mother with brown hair tied in a ponytail, wearing a pink apron over a light blue dress, hands clasped in front`,
      `${STYLE_CHAR}: a kind young mom with a chestnut ponytail, pastel pink apron over a sky-blue dress, gentle smile, hands together`,
    ],
  },
  nurse: {
    ...PERSON, kind: 'portrait',
    prompts: [
      `${STYLE_CHAR}: a kind nurse with light pink bob hair, small white cap with a green cross, white dress with a mint apron, smiling, hands clasped`,
      `${STYLE_CHAR}: a friendly young nurse with short pink hair under a small white nurse cap, white nurse uniform with mint-green trim, gentle smile, hands folded`,
    ],
  },
  clerk: {
    ...PERSON, kind: 'portrait',
    prompts: [
      `${STYLE_CHAR}: a cheerful shop clerk wearing a blue uniform cap, blue polo shirt with a blue apron, dark trousers, waving one hand`,
      `${STYLE_CHAR}: a friendly store employee in a navy cap and blue shop uniform with a name-less blue apron, black pants, one hand raised in a wave`,
    ],
  },
  badge_boulder: {
    kind: 'badge', target: 'fit', size: 128,
    prompts: [
      `${STYLE_ICON}: a small gray octagonal stone emblem badge, chunky faceted rock texture, polished shiny highlight, thin gold pin rim`,
      `${STYLE_ICON}: an eight-sided gray rock medal, glossy stone facets with a bright highlight, metal border`,
    ],
  },
  stamp: {
    kind: 'stamp', target: 'fit', size: 128,
    prompts: [
      `${STYLE_ICON}: a cute red circular rubber stamp mark like a teacher's reward stamp, red ink ring with a big star and a smiling face inside, slightly rough ink texture`,
      `${STYLE_ICON}: a round red ink stamp imprint with a smiling star in the middle, playful, for a kids' study reward`,
    ],
  },
  title_bg: {
    kind: 'background', target: 'cover', w: 960, h: 540,
    prompts: [
      'retro 16-bit color handheld RPG pixel art landscape, wide 16:9 landscape orientation: sunrise over a small peaceful village with red-roof houses, green rolling hills, a dirt path leading north into tall grass and a forest on the horizon, warm orange and pink sky, limited palette, clean pixel art, no people, no characters, no animals, no text, no watermark',
      'wide landscape pixel art scene in a retro handheld RPG style: dawn light over a tiny countryside village with red tiled roofs, green hills, a winding dirt road going up into tall grass and pine woods, pastel sunrise sky, no figures, no text',
    ],
  },
  app_icon: {
    kind: 'icon', target: 'icon',
    prompts: [
      // NOTE: "capture ball with a black band and a white center button" is rejected by the output moderation (looks like a famous item).
      'square app icon in retro 16-bit pixel art style: a shiny round ball toy, upper half red and lower half white, with a small yellow star emblem printed on its front, resting on top of an open school textbook with pale pages, a little yellow sparkle star floating above, clean black outlines, limited palette, centered, plain flat pale sky-blue background filling the whole square, an original design, no text, no watermark',
      'square app icon, chunky pixel art: a round ball toy with a red top half and white bottom half and a yellow star on it, sitting on an open notebook, a little yellow star sparkle above it, flat light sky-blue background covering the entire canvas, bold outlines, no text',
    ],
  },
};

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const modeArg = argv.find((a) => a.startsWith('--mode='));
const MODE = modeArg ? modeArg.slice(7) : 'hybrid'; // blocks | lanczos | hybrid
const keysArg = argv.filter((a) => !a.startsWith('--'));
for (const k of keysArg) if (!SPECS[k]) { console.error(`unknown key: ${k}`); process.exit(1); }
const KEYS = keysArg.length ? keysArg : Object.keys(SPECS);
const rawPath = (key) => path.join(GEN, `${key}_raw.png`);
const exists = (p) => fs.access(p).then(() => true, () => false);

// ---------------------------------------------------------------------------
// Generation via codex CLI (built-in image tool)
// ---------------------------------------------------------------------------
async function generateOne(key, attempt) {
  const spec = SPECS[key];
  const base = spec.prompts[Math.floor(attempt / 2) % spec.prompts.length];
  const prompt = attempt % 2 === 0 ? base : base + ORIGINAL;
  const task =
    `Use your built-in image generation tool to create ONE image: ${prompt}. ` +
    `After generating, copy the resulting PNG file into the current working directory as ${key}_raw.png and print its absolute path.`;
  const log = await fs.open(path.join(GEN, `${key}.log`), attempt === 0 ? 'w' : 'a');
  await log.write(`\n===== attempt ${attempt + 1} =====\n${task}\n\n`);
  const code = await new Promise((resolve, reject) => {
    const p = spawn('codex', ['exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', GEN, task], {
      cwd: ROOT, stdio: ['ignore', log.fd, log.fd],
    });
    p.on('error', reject);
    p.on('exit', (c) => resolve(c));
  });
  await log.close();
  return code === 0 && (await exists(rawPath(key)));
}

async function generateAll(keys, force) {
  await fs.mkdir(GEN, { recursive: true });
  const todo = [];
  for (const k of keys) if (force || !(await exists(rawPath(k)))) todo.push(k);
  if (!todo.length) { console.log('generate: nothing to do'); return; }
  console.log(`generate: ${todo.join(', ')}`);
  const results = {};
  const worker = async () => {
    while (todo.length) {
      const key = todo.shift();
      if (force) await fs.rm(rawPath(key), { force: true });
      let ok = false;
      for (let attempt = 0; attempt < 4 && !ok; attempt++) {
        console.log(`  ${key}: attempt ${attempt + 1}`);
        ok = await generateOne(key, attempt);
      }
      results[key] = ok;
      console.log(`  ${key}: ${ok ? 'OK' : 'FAILED (see _gen/' + key + '.log)'}`);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  return results;
}

// ---------------------------------------------------------------------------
// Raw RGBA helpers
// ---------------------------------------------------------------------------
async function loadRGBA(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}
const toSharp = (img) => sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } });

/** Make the white background transparent: flood fill from the borders, then peel the anti-aliased halo. */
function keyOutWhite(img, tol = 12, haloPasses = 2, haloMin = 200) {
  const { data, width: W, height: H } = img;
  const lim = 255 - tol;
  const bg = new Uint8Array(W * H);
  const stack = [];
  const push = (i) => {
    if (bg[i]) return;
    const o = i * 4;
    if (data[o] >= lim && data[o + 1] >= lim && data[o + 2] >= lim) { bg[i] = 1; stack.push(i); }
  };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (stack.length) {
    const i = stack.pop();
    const x = i % W;
    if (x > 0) push(i - 1);
    if (x < W - 1) push(i + 1);
    if (i >= W) push(i - W);
    if (i < (H - 1) * W) push(i + W);
  }
  for (let pass = 0; pass < haloPasses; pass++) {
    const add = [];
    for (let i = 0; i < W * H; i++) {
      if (bg[i]) continue;
      const o = i * 4;
      if (Math.min(data[o], data[o + 1], data[o + 2]) < haloMin) continue;
      const x = i % W;
      if ((x > 0 && bg[i - 1]) || (x < W - 1 && bg[i + 1]) || (i >= W && bg[i - W]) || (i < (H - 1) * W && bg[i + W])) add.push(i);
    }
    for (const i of add) bg[i] = 1;
  }
  for (let i = 0; i < W * H; i++) if (bg[i]) data[i * 4 + 3] = 0;
  return img;
}

function trim(img) {
  const { data, width: W, height: H } = img;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (data[(y * W + x) * 4 + 3] === 0) continue;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  if (x1 < 0) return img;
  return crop(img, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
}

function crop(img, x0, y0, w, h) {
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) img.data.copy(out, y * w * 4, ((y0 + y) * img.width + x0) * 4, ((y0 + y) * img.width + x0 + w) * 4);
  return { data: out, width: w, height: h };
}

/** Period (art pixel size) + phase of block boundaries along one axis.
 *  The colour-gradient profile g[] peaks at every block boundary; its autocorrelation peaks at the
 *  period and its harmonics (2s, 3s, 4s), which are used for sub-pixel refinement. */
function estimatePeriod(img, axis) {
  const { data, width: W, height: H } = img;
  const N = axis === 'x' ? W : H, M = axis === 'x' ? H : W;
  const g = new Float64Array(N);
  for (let a = 0; a < N - 1; a++) {
    for (let b = 0; b < M; b++) {
      const i = axis === 'x' ? b * W + a : a * W + b;
      const j = axis === 'x' ? i + 1 : i + W;
      if (data[i * 4 + 3] === 0 || data[j * 4 + 3] === 0) continue;
      g[a] += Math.abs(data[i * 4] - data[j * 4]) + Math.abs(data[i * 4 + 1] - data[j * 4 + 1]) + Math.abs(data[i * 4 + 2] - data[j * 4 + 2]);
    }
  }
  const mean = g.reduce((a, b) => a + b, 0) / N;
  const gc = g.map((v) => v - mean);
  const LAGS = Math.min(96, N - 2);
  const R = new Float64Array(LAGS + 1);
  for (let t = 0; t <= LAGS; t++) { let sum = 0; for (let a = 0; a + t < N; a++) sum += gc[a] * gc[a + t]; R[t] = sum / (N - t); }
  const isPeak = (t) => t > 0 && t < LAGS && R[t] >= R[t - 1] && R[t] >= R[t + 1];
  const refine = (t) => { const d = (R[t - 1] - R[t + 1]) / (2 * (R[t - 1] - 2 * R[t] + R[t + 1])); return t + (Number.isFinite(d) ? Math.max(-0.5, Math.min(0.5, d)) : 0); };
  let t0 = -1;
  for (let t = 3; t < LAGS; t++) if (isPeak(t) && R[t] / R[0] >= 0.15) { t0 = t; break; }
  if (t0 < 0) return { s: 1, phi: 0, conf: 0 }; // no periodic structure → treat source as 1:1 pixel art
  let s = refine(t0);
  for (let k = 2; k <= 6; k++) { // harmonics give better precision
    const c = Math.round(k * s);
    if (c + 2 > LAGS) break;
    let bt = -1, bv = -Infinity;
    for (let t = c - 2; t <= c + 2; t++) if (R[t] > bv) { bv = R[t]; bt = t; }
    if (isPeak(bt) && R[bt] / R[0] >= 0.08) s = refine(bt) / k; else break;
  }
  let phi = 0, bestSc = -1;
  for (let p0 = 0; p0 < s; p0 += 0.25) {
    let sum = 0, n = 0;
    for (let p = p0; p < N - 1; p += s) { sum += g[Math.round(p)]; n++; }
    if (sum / n > bestSc) { bestSc = sum / n; phi = p0; }
  }
  return { s, phi: phi + 1, conf: R[t0] / R[0] }; // g[a] is the edge between a and a+1 → boundary at a+1
}

/** One sample per art block → native pixel-art image. Each block's colour is the mode of its
 *  central half-block region (robust against grid drift and anti-aliased edges). */
function sampleBlocks(img, px, py) {
  const { data, width: W, height: H } = img;
  if (px.s <= 1.5 && py.s <= 1.5) return img;
  const bx0 = px.phi - px.s * Math.ceil(px.phi / px.s);
  const by0 = py.phi - py.s * Math.ceil(py.phi / py.s);
  const nx = Math.ceil((W - bx0) / px.s), ny = Math.ceil((H - by0) / py.s);
  const out = Buffer.alloc(nx * ny * 4);
  const rx = Math.max(0, Math.floor(px.s / 4)), ry = Math.max(0, Math.floor(py.s / 4));
  const bins = new Map();
  for (let j = 0; j < ny; j++) {
    const cy = Math.floor(by0 + (j + 0.5) * py.s);
    for (let i = 0; i < nx; i++) {
      const cx = Math.floor(bx0 + (i + 0.5) * px.s);
      bins.clear();
      for (let y = Math.max(0, cy - ry); y <= Math.min(H - 1, cy + ry); y++) {
        for (let x = Math.max(0, cx - rx); x <= Math.min(W - 1, cx + rx); x++) {
          const o = (y * W + x) * 4;
          const k = data[o + 3] === 0 ? -1 : ((data[o] >> 3) << 10) | ((data[o + 1] >> 3) << 5) | (data[o + 2] >> 3);
          const b = bins.get(k);
          if (b) { b.n++; b.r += data[o]; b.g += data[o + 1]; b.b += data[o + 2]; }
          else bins.set(k, { n: 1, r: data[o], g: data[o + 1], b: data[o + 2] });
        }
      }
      let best = null, bestK = -1;
      for (const [k, b] of bins) if (!best || b.n > best.n) { best = b; bestK = k; }
      const o = (j * nx + i) * 4;
      if (!best || bestK === -1) { out[o + 3] = 0; continue; }
      out[o] = Math.round(best.r / best.n); out[o + 1] = Math.round(best.g / best.n); out[o + 2] = Math.round(best.b / best.n); out[o + 3] = 255;
    }
  }
  return trim({ data: out, width: nx, height: ny });
}

function resampleNearest(img, w, h) {
  const { data, width: W, height: H } = img;
  const out = Buffer.alloc(w * h * 4);
  for (let j = 0; j < h; j++) {
    const sy = Math.min(H - 1, Math.floor((j + 0.5) * H / h));
    for (let i = 0; i < w; i++) {
      const sx = Math.min(W - 1, Math.floor((i + 0.5) * W / w));
      data.copy(out, (j * w + i) * 4, (sy * W + sx) * 4, (sy * W + sx) * 4 + 4);
    }
  }
  return { data: out, width: w, height: h };
}

/** Centre img on a transparent w×h canvas. */
function pad(img, w, h) {
  const out = Buffer.alloc(w * h * 4);
  const x0 = Math.floor((w - img.width) / 2), y0 = Math.floor((h - img.height) / 2);
  for (let y = 0; y < img.height; y++) img.data.copy(out, ((y0 + y) * w + x0) * 4, y * img.width * 4, (y + 1) * img.width * 4);
  return { data: out, width: w, height: h };
}

/** Binary alpha so nothing is semi-transparent after resampling. */
function hardenAlpha(img) {
  for (let i = 3; i < img.data.length; i += 4) img.data[i] = img.data[i] < 128 ? 0 : 255;
  return img;
}

async function lanczosRGBA(img, w, h) {
  const { data, info } = await toSharp(img).resize(w, h, { kernel: 'lanczos3', fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  return hardenAlpha({ data, width: info.width, height: info.height });
}

/** Distinct opaque colours of img after quantising it to ≤ n colours. */
async function paletteOf(img, n) {
  const { data } = await sharp(await toSharp(img).png(pngOpts(n)).toBuffer()).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const seen = new Set(), pal = [];
  for (let o = 0; o < data.length; o += 4) {
    if (data[o + 3] < 128) continue;
    const k = (data[o] << 16) | (data[o + 1] << 8) | data[o + 2];
    if (!seen.has(k)) { seen.add(k); pal.push([data[o], data[o + 1], data[o + 2]]); }
  }
  return pal;
}

function snapToPalette(img, pal) {
  const { data } = img;
  const cache = new Map();
  for (let o = 0; o < data.length; o += 4) {
    if (data[o + 3] === 0) continue;
    const k = ((data[o] >> 2) << 12) | ((data[o + 1] >> 2) << 6) | (data[o + 2] >> 2);
    let best = cache.get(k);
    if (!best) {
      let bd = Infinity;
      for (const c of pal) {
        const d = (c[0] - data[o]) ** 2 + (c[1] - data[o + 1]) ** 2 + (c[2] - data[o + 2]) ** 2;
        if (d < bd) { bd = d; best = c; }
      }
      cache.set(k, best);
    }
    data[o] = best[0]; data[o + 1] = best[1]; data[o + 2] = best[2];
  }
  return img;
}

const pngOpts = (colours) => ({ palette: true, colours, dither: 0, compressionLevel: 9, effort: 10 });

/** Sprite with transparent background → {img, native, period} at target size (w×h box or height). */
async function processSprite(key, spec) {
  const raw = await loadRGBA(rawPath(key));
  const keyed = trim(keyOutWhite(raw));
  const px = estimatePeriod(keyed, 'x'), py = estimatePeriod(keyed, 'y');
  let scaleW, scaleH;
  if (spec.target === 'person') {
    scaleH = spec.height;
    scaleW = Math.max(1, Math.round(keyed.width * spec.height / keyed.height));
  } else { // fit inside size×size
    const s = Math.min(spec.size / keyed.width, spec.size / keyed.height);
    scaleW = Math.max(1, Math.round(keyed.width * s));
    scaleH = Math.max(1, Math.round(keyed.height * s));
  }
  let native, img;
  if (MODE === 'lanczos') {
    img = await lanczosRGBA(keyed, scaleW, scaleH);
  } else if (MODE === 'blocks') {
    native = sampleBlocks(keyed, px, py);
    img = resampleNearest(native, scaleW, scaleH);
  } else { // hybrid: lanczos geometry, every pixel snapped to the palette of the block-sampled art
    native = sampleBlocks(keyed, px, py);
    img = snapToPalette(await lanczosRGBA(keyed, scaleW, scaleH), await paletteOf(native, 48));
  }
  if (spec.target === 'fit') img = pad(img, spec.size, spec.size);
  return { img, native, keyed, px, py };
}

async function writePng(img, file, colours = 64) {
  await toSharp(img).png(pngOpts(colours)).toFile(file);
}

async function preview(key, img, scale = 3) {
  await fs.mkdir(PREVIEW, { recursive: true });
  const big = resampleNearest(img, img.width * scale, img.height * scale);
  await toSharp(big).png().toFile(path.join(PREVIEW, `${key}_x${scale}.png`));
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main() {
  if (flags.has('--generate')) await generateAll(KEYS, flags.has('--force'));

  await fs.mkdir(OUT, { recursive: true });
  const manifestFile = path.join(OUT, 'manifest.json');
  const manifest = (await exists(manifestFile)) ? JSON.parse(await fs.readFile(manifestFile, 'utf8')) : {};
  const done = [];

  for (const key of KEYS) {
    const spec = SPECS[key];
    if (!(await exists(rawPath(key)))) { console.log(`skip ${key}: no _gen/${key}_raw.png`); continue; }
    const entry = (k, file, w, h, kind) => { manifest[k] = { file, w, h, kind }; done.push(k); };

    if (spec.target === 'cover') {
      await sharp(rawPath(key)).removeAlpha().resize(spec.w, spec.h, { fit: 'cover', position: 'centre', kernel: 'lanczos3' })
        .png(pngOpts(256)).toFile(path.join(OUT, `${key}.png`));
      entry(key, `${key}.png`, spec.w, spec.h, spec.kind);
      console.log(`${key}: ${spec.w}×${spec.h}`);
    } else if (spec.target === 'icon') {
      const src = sharp(rawPath(key)).removeAlpha();
      const outs = [
        ['app_icon', 'app_icon.png', 512],
        ['app_icon_192', 'app_icon_192.png', 192],
        ['apple_touch_icon', 'apple-touch-icon.png', 180],
        ['favicon', 'favicon.png', 64],
      ];
      for (const [k, file, size] of outs) {
        await src.clone().resize(size, size, { fit: 'cover', kernel: 'lanczos3' }).png(pngOpts(256)).toFile(path.join(OUT, file));
        entry(k, file, size, size, 'icon');
      }
      console.log(`${key}: 512/192/180/64`);
    } else {
      const { img, native, px, py } = await processSprite(key, spec);
      await writePng(img, path.join(OUT, `${key}.png`));
      entry(key, `${key}.png`, img.width, img.height, spec.kind);
      console.log(`${key}: ${img.width}×${img.height}  art px ≈ ${px.s.toFixed(2)}×${py.s.toFixed(2)} (conf ${px.conf.toFixed(2)})` + (native ? `  native ${native.width}×${native.height}` : ''));
      if (flags.has('--preview')) await preview(key, img);
    }
  }

  // stable key order: SPECS order, then icon variants
  const ordered = {};
  for (const k of [...Object.keys(SPECS), 'app_icon_192', 'apple_touch_icon', 'favicon']) if (manifest[k]) ordered[k] = manifest[k];
  await fs.writeFile(manifestFile, JSON.stringify(ordered, null, 2) + '\n');
  console.log(`manifest: ${Object.keys(ordered).length} entries → ${path.relative(ROOT, manifestFile)}`);

  if (flags.has('--preview')) await contactSheet(ordered);
}

/** Side-by-side 3× sheet of all people sprites, to judge set consistency. */
async function contactSheet(manifest) {
  const people = Object.entries(manifest).filter(([, m]) => m.kind === 'trainer' || m.kind === 'portrait');
  if (!people.length) return;
  const scale = 3, gap = 12;
  const imgs = [];
  for (const [k, m] of people) imgs.push({ k, img: await loadRGBA(path.join(OUT, m.file)) });
  const H = Math.max(...imgs.map((i) => i.img.height)) * scale;
  const W = imgs.reduce((a, i) => a + i.img.width * scale + gap, gap);
  const layers = [];
  let x = gap;
  for (const { img } of imgs) {
    const big = resampleNearest(img, img.width * scale, img.height * scale);
    layers.push({ input: await toSharp(big).png().toBuffer(), left: x, top: H - big.height });
    x += big.width + gap;
  }
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 120, g: 200, b: 120, alpha: 1 } } })
    .composite(layers).png().toFile(path.join(PREVIEW, 'sheet_people_x3.png'));
  console.log(`preview: _gen/preview/sheet_people_x3.png (${people.map(([k]) => k).join(', ')})`);
}

export { loadRGBA, keyOutWhite, trim, estimatePeriod, sampleBlocks, resampleNearest, pad, toSharp };
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
