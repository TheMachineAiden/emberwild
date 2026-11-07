import { execFileSync } from 'node:child_process';
import { buildWeb } from './web-build.mjs';
const gitEnv = {...process.env, GIT_CONFIG_NOSYSTEM:'1', GIT_CONFIG_GLOBAL:'/dev/null'};
const git = (...args) => execFileSync('git', args, {encoding:'utf8',env:gitEnv}).trim();
if (git('status','--porcelain')) throw new Error('Commit reviewed source changes before building a release.');
const revision = git('rev-parse','HEAD');
await buildWeb({source:'.',destination:'dist',revision});
console.log(`Static game built at dist, revision ${revision}`);
