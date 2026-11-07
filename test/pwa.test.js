import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash, webcrypto } from 'node:crypto';
import vm from 'node:vm';
import { buildWeb, fileList } from '../scripts/web-build.mjs';

const digest = data => createHash('sha256').update(data).digest('hex');
const template = await readFile(new URL('../scripts/service-worker.js',import.meta.url),'utf8');
const revision = 'a'.repeat(40);
const scope = 'https://example.test/emberwild/';

async function fixture() {
  await mkdir('.cache',{recursive:true});
  const source = await mkdtemp(resolve('.cache/pwa-test-'));
  const files = {
    'index.html':'<head><!-- build identity --><link href="src/style.css"></head><script type="module" src="src/boot.js"></script>',
    'src/boot.js':"import './main.js';", 'src/main.js':"import '../music/scores.js';", 'src/style.css':'body {margin:0}',
    'music/scores.js':'export const scores = {};', 'assets/creatures/friend.png':'creature', 'assets/world/coast.png':'coast',
    'assets/app/icon-192.png':'icon', 'manifest.webmanifest':await readFile(new URL('../manifest.webmanifest',import.meta.url),'utf8'),
    'scripts/service-worker.js':template,
    'docs/private-note.txt':'must never ship', 'assets/source/artwork.png':'must never ship',
  };
  for(const [path,data] of Object.entries(files)) {
    await mkdir(resolve(source,path,'..'),{recursive:true}); await writeFile(join(source,path),data);
  }
  return {source,destination:join(source,'dist'),revision};
}

test('build binds code to one revision and inventories the exact offline runtime',async () => {
  const f=await fixture();
  try {
    const result=await buildWeb(f);
    const html=await readFile(join(f.destination,'index.html'),'utf8');
    assert.ok(html.includes(`content="${revision}"`));
    assert.ok(html.includes(`builds/${revision}/src/boot.js`));
    assert.ok(html.includes(`builds/${revision}/src/style.css`));
    assert.deepEqual(JSON.parse(await readFile(join(f.destination,'version.json'),'utf8')),
      {game:'Emberwild',revision,assetRoot:`builds/${revision}/`});
    const paths=await fileList(f.destination);
    assert.ok(paths.includes(`builds/${revision}/music/scores.js`));
    assert.ok(paths.includes('assets/world/coast.png'),'previously open adventures keep their artwork URLs');
    assert.ok(!paths.some(path => path.startsWith('docs/') || path.includes('assets/source/')));
    assert.ok(paths.includes('src/main.js'),'cached pre-PWA HTML keeps working through its legacy URLs');
    assert.ok(!html.includes('src="src/boot.js"'),'the new entry binds its module URL to the revision');
    assert.deepEqual(result.entries.map(file=>file.path),paths.filter(path=>!['sw.js','.nojekyll'].includes(path)));
    for(const file of result.entries) assert.equal(file.sha256,digest(await readFile(join(f.destination,file.path))));
    const manifest=JSON.parse(await readFile(join(f.destination,'manifest.webmanifest'),'utf8'));
    assert.equal(manifest.id,'/emberwild/'); assert.equal(manifest.scope,manifest.id);
    assert.equal(manifest.start_url,manifest.id); assert.equal(manifest.display,'standalone');
  } finally { await rm(f.source,{recursive:true,force:true}); }
});

function worker({files=[{path:'index.html',sha256:digest('document')}],body='document',corrupt=false,stored=new Map(),missing=false}={}) {
  const handlers={},requests=[]; let networkAllowed=true;
  const cacheApi={
    async keys(){return [...stored.keys()]},
    async delete(key){return stored.delete(key)},
    async open(name){
      if(!stored.has(name))stored.set(name,new Map()); const values=stored.get(name);
      return {async put(url,response){values.set(url,response.clone())},async match(url){return values.get(url)?.clone()}};
    },
  };
  const self={registration:{scope},addEventListener:(name,fn)=>handlers[name]=fn,
    skipWaiting:()=>assert.fail('open adventures must not be taken over'),clients:{claim:()=>assert.fail('no mid-game claim')}};
  const source=template.replace('__REVISION__',JSON.stringify(revision)).replace('__FILES__',JSON.stringify(files));
  vm.runInNewContext(source,{self,caches:cacheApi,crypto:webcrypto,URL,Response,AbortController,setTimeout,clearTimeout,
    fetch:async (url,options)=>{
      assert.equal(networkAllowed,true,'fetch handler must use its complete cache'); requests.push({url,options});
      return new Response(corrupt?'wrong':body,{status:missing?404:200});
    },
  });
  return {
    stored,requests,handlers,
    async lifecycle(name){let pending;handlers[name]({waitUntil:p=>pending=p});await pending;},
    fetch(path,{method='GET',mode='navigate'}={}) {
      networkAllowed=false; let response;
      handlers.fetch({request:{url:new URL(path,scope).href,method,mode},respondWith:p=>response=p});
      return response;
    },
  };
}

test('a complete verified cache serves a cold offline root/index/query navigation',async () => {
  const module=`builds/${revision}/src/main.js`;
  const w=worker({files:[{path:'index.html',sha256:digest('document')},{path:module,sha256:digest('document')}]});
  await w.lifecycle('install'); await w.lifecycle('activate');
  assert.equal(w.requests.length,2); assert.equal(w.requests[0].options.cache,'reload');
  for(const path of ['./','index.html','?launch=home']) assert.equal(await(await w.fetch(path)).text(),'document');
  assert.equal(await(await w.fetch(module,{mode:'cors'})).text(),'document');
  assert.equal(w.fetch('/another-game/'),undefined);
  assert.equal(w.fetch('https://foreign.test/emberwild/'),undefined);
  assert.equal(w.fetch('./',{method:'POST'}),undefined);
  assert.equal(w.fetch('unknown-route/'),undefined,'the game has no invented navigation routes');
});

test('corrupt or incomplete new files cannot replace the prior offline package',async () => {
  for(const options of [{corrupt:true},{missing:true}]) {
    const previous='emberwild-runtime:/emberwild/:'+'b'.repeat(40);
    const stored=new Map([[previous,new Map([['old','old']])],['other-game-cache',new Map()]]);
    const w=worker({...options,stored});
    await assert.rejects(w.lifecycle('install'));
    assert.equal(stored.size,2); assert.equal(stored.get(previous).get('old'),'old');
  }
});

test('activation retires only this scope, and missing pinned files never fall through to a new network version',async () => {
  const previous='emberwild-runtime:/emberwild/:previous';
  const otherScope='emberwild-runtime:/other-preview/:previous';
  const stored=new Map([[previous,new Map()],[otherScope,new Map()],['another-game-cache',new Map()]]);
  const w=worker({stored}); await w.lifecycle('install'); await w.lifecycle('activate');
  assert.equal(stored.has(previous),false); assert.equal(stored.has(otherScope),true); assert.equal(stored.has('another-game-cache'),true);
  stored.get('emberwild-runtime:/emberwild/:'+revision).clear();
  assert.equal((await w.fetch('./')).status,503);
});

test('install icons are real opaque PNGs at their declared platform sizes',async () => {
  const manifest=JSON.parse(await readFile(new URL('../manifest.webmanifest',import.meta.url),'utf8'));
  const files=[...manifest.icons.map(icon=>({path:icon.src,size:Number(icon.sizes.split('x')[0])})),
    {path:'assets/app/apple-touch-icon.png',size:180},{path:'assets/app/favicon-32.png',size:32}];
  assert.deepEqual(manifest.icons.map(icon=>icon.purpose),['any','any','maskable','maskable']);
  for(const file of files) {
    const png=await readFile(new URL('../'+file.path,import.meta.url));
    assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16),file.size);
    assert.equal(png.readUInt32BE(20),file.size);
    assert.equal(png[25],2,'RGB export has no transparent edge under a platform mask');
  }
});
