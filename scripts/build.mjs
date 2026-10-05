import {spawnSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const studioEnv = {...process.env};
delete studioEnv.SANITY_API_READ_TOKEN;
delete studioEnv.SANITY_PREVIEW_SECRET;
studioEnv.SANITY_STUDIO_BASEPATH = '/studio';
studioEnv.SANITY_STUDIO_PREVIEW_ORIGIN = process.env.CONTEXT === 'production'
  ? 'https://iamkavindu.dev'
  : process.env.DEPLOY_PRIME_URL || process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:4321';
const output = fileURLToPath(new URL('../public/studio', import.meta.url));
for (const [args, env] of [
  [['--prefix', 'studio', 'run', 'build', '--', output], studioEnv],
  [['run', 'build:site'], process.env],
]) {
  const result = spawnSync(npm, args, {stdio: 'inherit', env});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
  if (env === studioEnv) {
    const index = `${output}/index.html`;
    writeFileSync(index, readFileSync(index, 'utf8').replace('<head>', '<head><meta name="robots" content="noindex, nofollow" />'));
  }
}
