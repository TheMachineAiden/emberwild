import { cp, mkdir, writeFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const gitEnv = {...process.env, GIT_CONFIG_NOSYSTEM:'1', GIT_CONFIG_GLOBAL:'/dev/null'};
const git = (...args) => execFileSync('git', args, {encoding:'utf8',env:gitEnv}).trim();
if (git('status','--porcelain')) throw new Error('Commit reviewed source changes before building a release.');
const revision = git('rev-parse','HEAD');
const destination = resolve('dist');
await rm(destination, {recursive:true, force:true});
await mkdir(destination, {recursive:true});
// Allowlist only game runtime files; retained artwork, QA and history are excluded.
for (const path of ['index.html','src','assets/creatures','assets/world']) {
  await cp(path, resolve(destination,path), {recursive:true});
}
await mkdir(resolve(destination,'music'), {recursive:true});
await cp('music/scores.js', resolve(destination,'music/scores.js'));
await writeFile(resolve(destination,'version.json'), JSON.stringify({game:'Emberwild',revision},null,2)+'\n');
await writeFile(resolve(destination,'.nojekyll'),'');
console.log(`Static game built at dist, revision ${revision}`);
