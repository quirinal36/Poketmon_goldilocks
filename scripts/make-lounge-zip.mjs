import { execFileSync } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import assert from 'node:assert/strict';
import JSZip from 'jszip';

// Build without baked-in cloud credentials; config.js is also emptied in the archive.
execFileSync('npm', ['run', 'build'], { stdio: 'inherit', env: { ...process.env, VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' } });
const root = resolve('dist');
const zip = new JSZip();
let count = 0, bytes = 0;
async function add(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), `Symlink forbidden: ${entry.name}`);
    const path = join(dir, entry.name);
    if (entry.isDirectory()) { await add(path); continue; }
    const name = relative(root, path).replaceAll('\\', '/');
    assert(!name.startsWith('/') && !name.split('/').includes('..'), `Unsafe path ${name}`);
    const data = name === 'config.js' ? Buffer.alloc(0) : await readFile(path);
    if (name.endsWith('.html')) assert(!/(?:src|href)\s*=\s*["'](?:\/|https?:)/i.test(data.toString()), `Nonrelative HTML reference: ${name}`);
    bytes += data.length; count++; zip.file(name, data);
  }
}
await add(root);
assert(count <= 500, `${count} files exceeds 500`);
assert(bytes <= 30 * 1024 * 1024, `${bytes} bytes exceeds 30 MB unpacked`);
assert(zip.file('index.html') && zip.file('config.js') && zip.file('data/curriculum.json'));
const data = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });
assert(data.length <= 30 * 1024 * 1024, 'Compressed archive exceeds 30 MB');
const name = 'pokemon-study-lounge.zip'; await writeFile(name, data);
console.log(`OK: ${name} · ${count} files · ${(data.length / 1048576).toFixed(2)} MB ZIP · ${(bytes / 1048576).toFixed(2)} MB unpacked · empty config.js`);
