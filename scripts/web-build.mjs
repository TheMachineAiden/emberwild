import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join, relative } from 'node:path';

export async function fileList(root) {
  const result = [];
  async function walk(path) {
    for (const entry of await readdir(path, {withFileTypes:true})) {
      const full = join(path, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) result.push(relative(root,full).split('\\').join('/'));
    }
  }
  await walk(root);
  return result.sort();
}

export async function buildWeb({ source, destination, revision }) {
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('An exact source revision is required.');
  source = resolve(source); destination = resolve(destination);
  if (source === destination || !destination.startsWith(source + '/'))
    throw new Error('Build destination must be a child of the source directory.');
  await rm(destination, {recursive:true,force:true});
  const assetRoot = `builds/${revision}/`;
  await mkdir(join(destination,assetRoot), {recursive:true});
  for (const path of ['src','music/scores.js']) {
    const target = join(destination,assetRoot,path);
    await mkdir(resolve(target,'..'), {recursive:true});
    await cp(join(source,path),target,{recursive:true});
    // Cached pre-PWA HTML may still name the old module/stylesheet URLs.
    const legacy = join(destination,path);
    await mkdir(resolve(legacy,'..'), {recursive:true});
    await cp(join(source,path),legacy,{recursive:true});
  }
  // Keep artwork URLs too, for already-open pre-PWA adventures.
  for (const path of ['assets/creatures','assets/world'])
    await cp(join(source,path),join(destination,path),{recursive:true});
  await cp(join(source,'assets/app'),join(destination,'assets/app'),{recursive:true});
  await cp(join(source,'manifest.webmanifest'),join(destination,'manifest.webmanifest'));
  let html = await readFile(join(source,'index.html'),'utf8');
  html = html.replace('<!-- build identity -->', `<meta name="emberwild-build" content="${revision}" />`)
    .replace('href="src/style.css"',`href="${assetRoot}src/style.css"`)
    .replace('src="src/boot.js"',`src="${assetRoot}src/boot.js"`);
  await writeFile(join(destination,'index.html'),html);
  await writeFile(join(destination,'version.json'),JSON.stringify({game:'Emberwild',revision,assetRoot},null,2)+'\n');
  const entries = await Promise.all((await fileList(destination)).map(async path => ({
    path, sha256:createHash('sha256').update(await readFile(join(destination,path))).digest('hex'),
  })));
  const template = await readFile(join(source,'scripts/service-worker.js'),'utf8');
  await writeFile(join(destination,'sw.js'),template
    .replace('__REVISION__',JSON.stringify(revision))
    .replace('__FILES__',JSON.stringify(entries)));
  await writeFile(join(destination,'.nojekyll'),'');
  return {revision,assetRoot,entries};
}
