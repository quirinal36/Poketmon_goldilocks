// Serve the actual extracted archive under a nested URL and a self-only network CSP.
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
const root = await mkdtemp(join(tmpdir(),'pokestudy-zip-'));
const zip = await JSZip.loadAsync(await readFile('pokemon-study-lounge.zip'));
for (const [name,entry] of Object.entries(zip.files)) {
  assert(!name.startsWith('/') && !name.split('/').includes('..'));
  if(entry.dir) continue;
  const file = join(root,name); await mkdir(dirname(file),{recursive:true}); await writeFile(file,await entry.async('nodebuffer'));
}
assert.equal((await readFile(join(root,'config.js'))).length,0);
const server = createServer(async(req,res)=>{
  try {
    const name = decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/class\/game\//,'') || 'index.html';
    if(name.includes('..') || name.startsWith('/')) {res.writeHead(404);res.end();return;}
    const data=await readFile(join(root,name));
    const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.woff2':'font/woff2'}[extname(name)] || 'application/octet-stream';
    res.writeHead(200,{'Content-Type':mime,'Content-Security-Policy':"connect-src 'self'"});res.end(data);
  }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch();
try {
  const page=await browser.newPage(); const errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('data:'))external.push(r.url());});
  await page.goto(origin+'/class/game/?debug=1');
  await page.getByRole('button',{name:'새로 시작',exact:true}).waitFor();
  await page.evaluate(()=>{window.__TEST__.fastText=true;});
  await page.getByRole('button',{name:'새로 시작',exact:true}).click();
  await page.getByRole('button',{name:'이 모습으로 결정'}).click();
  await page.getByRole('button',{name:'결정',exact:true}).click();
  await page.getByRole('button',{name:'결정',exact:true}).click();
  await page.waitForFunction(()=>window.__G.save.flag('intro_done'));
  await page.evaluate(async()=>{window.__TEST__.autoAnswer='correct';const result=await window.__G.learn.quiz({purpose:'practice'});if(!result.correct)throw Error('offline question failed');});
  await page.reload(); await page.getByRole('button',{name:'이어서 하기',exact:true}).waitFor();
  const devtools=await page.context().newCDPSession(page);
  const appManifest=await devtools.send('Page.getAppManifest');
  assert.deepEqual(appManifest.errors,[]);
  assert.equal(appManifest.url,origin+'/class/game/manifest.webmanifest');
  const manifest=JSON.parse(appManifest.data);
  assert.equal(manifest.name,'포켓몬 공부 대모험');
  assert.equal(manifest.display,'standalone');
  assert.equal(manifest.start_url,'./');
  for(const icon of manifest.icons){
    const response=await page.request.get(origin+'/class/game/'+icon.src);
    assert.equal(response.status(),200);
    const meta=await sharp(await response.body()).metadata();
    const size=Number(icon.sizes.split('x')[0]);
    assert.equal(meta.width,size);assert.equal(meta.height,size);
  }
  const touchIcon=await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  assert.equal((await page.request.get(origin+'/class/game/'+touchIcon)).status(),200);
  await page.goto(origin+'/class/game/questions.html'); await page.waitForSelector('.qb-filters');
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('OK: extracted ZIP, nested relative URLs, self-only CSP, new game/question/save restore, question browser, manifest/icons, zero external requests/errors');
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); await rm(root,{recursive:true,force:true}); }
