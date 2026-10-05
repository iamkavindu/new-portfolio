import assert from 'node:assert/strict';
import {createServer} from 'node:http';

// Run after trial:build. Uses no Sanity credentials and performs no CMS writes.
process.env.ASTRO_NODE_AUTOSTART = 'disabled';
process.env.SANITY_PREVIEW_SECRET = 'local-http-test-only-password-with-enough-length';
process.env.SANITY_API_READ_TOKEN = '';
const {handler} = await import('../../dist-trial/server/entry.mjs');
const server = createServer(handler);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
try {
  const sample = await fetch(`${base}/trial/article/sample/`);
  const html = await sample.text();
  assert.equal(sample.status, 200);
  assert.equal(sample.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal(sample.headers.get('cache-control'), 'private, no-store');
  for (const content of ['S3ObjectKeys', '<table>', 'architecture.png', 'Local sample']) assert.ok(html.includes(content), content);
  const image = await fetch(`${base}/images/blogs/stream-app/architecture.png`);
  assert.equal(image.status, 200);
  const locked = await fetch(`${base}/trial/preview/streaming-pipeline-trial/`, {redirect: 'manual'});
  assert.equal(locked.status, 303);
  assert.ok(locked.headers.get('location').startsWith('/trial/access/'));
  const post = (password, origin = base) => fetch(`${base}/trial/access/`, {
    method: 'POST', redirect: 'manual', headers: {Origin: origin},
    body: new URLSearchParams({password, next: '/trial/preview/streaming-pipeline-trial/'}),
  });
  assert.equal((await post('wrong')).status, 401);
  assert.equal((await post(process.env.SANITY_PREVIEW_SECRET, 'https://wrong-origin.example')).status, 403);
  const unlock = await post(process.env.SANITY_PREVIEW_SECRET);
  assert.equal(unlock.status, 303);
  const cookie = unlock.headers.get('set-cookie');
  assert.ok(cookie && /httponly/i.test(cookie));
  assert.ok(/samesite=lax/i.test(cookie));
  const draft = await fetch(`${base}/trial/preview/streaming-pipeline-trial/`, {headers: {Cookie: cookie.split(';')[0]}});
  assert.equal(draft.status, 503);
  assert.ok((await draft.text()).includes('Preview connection unavailable'));
  console.log('HTTP checks passed: rendered sample, image, noindex/no-store, locked drafts, password/origin checks, HttpOnly session, missing-token failure.');
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
