import assert from 'node:assert/strict';
import {request as httpRequest} from 'node:http';
import {startMockServer} from './mock-server.mjs';

// Built with the real production rules, served locally through the Node test adapter.
process.env.SANITY_PREVIEW_SECRET = 'production-test-random-preview-password-at-least-24';
process.env.SANITY_API_READ_TOKEN = 'test-runtime-viewer-token';
const review = await startMockServer(0, true);
const liveOrigin = 'http://iamkavindu.dev';
const request = (path, init = {}, live = true) => new Promise((resolve, reject) => {
  const body = init.body?.toString();
  const headers = {...(live ? {Host: 'iamkavindu.dev'} : {}), ...init.headers};
  if (body) headers['Content-Type'] = 'application/x-www-form-urlencoded';
  const req = httpRequest(`${review.base}${path}`, {method: init.method || 'GET', headers}, (res) => {
    const chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => resolve(new Response(Buffer.concat(chunks), {status: res.statusCode, headers: res.headers})));
  });
  req.on('error', reject);
  req.end(body);
});
const html = async (path, expected = 200) => {
  const response = await request(path);
  assert.equal(response.status, expected, path);
  return response.text();
};
const post = (password, origin = liveOrigin, next = '/preview/article/review-streaming-article/') => request('/preview/access/', {
  method: 'POST', headers: {Origin: origin}, body: new URLSearchParams({password, next}),
});
try {
  const homeResponse = await request('/');
  assert.equal(homeResponse.status, 200);
  assert.equal(homeResponse.headers.get('x-robots-tag'), null);
  const home = await homeResponse.text();
  assert.ok(home.includes('rel="canonical" href="https://iamkavindu.dev/"'));
  assert.ok(home.includes('property="og:image"'));
  assert.ok(home.includes('application/ld+json'));
  assert.ok(!home.includes('noindex'));
  assert.ok((await request('/', {}, false)).headers.get('x-robots-tag').includes('noindex'));
  const article = await html('/writing/streaming-pipeline-trial/');
  const graph = JSON.parse(article.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]+?)<\/script>/)[1]);
  assert.ok(graph['@graph'].some((node) => node['@type'] === 'BlogPosting'));
  assert.ok(graph['@graph'].some((node) => node['@type'] === 'BreadcrumbList'));
  assert.ok((await html('/work/streaming-pipeline/')).includes('SoftwareSourceCode'));
  assert.ok((await html('/about/')).includes('ProfilePage'));
  assert.ok(!(await html('/writing/missing/', 404)).includes('rel="canonical"'));
  const robots = await html('/robots.txt');
  assert.ok(robots.includes('User-agent: OAI-SearchBot'));
  assert.ok(robots.includes('Disallow: /preview/'));
  assert.ok((await (await request('/robots.txt', {}, false)).text()).includes('Disallow: /'));
  const sitemap = await html('/sitemap.xml');
  assert.ok(sitemap.includes('https://iamkavindu.dev/writing/streaming-pipeline-trial/'));
  assert.ok(!sitemap.includes('/preview/'));
  assert.ok((await html('/sitemap-index.xml')).includes('/sitemap.xml'));
  assert.ok((await html('/rss.xml')).includes('streaming-pipeline-trial'));
  assert.ok((await html('/llms.txt')).includes('## Writing'));
  const social = await request('/social-card.png');
  assert.equal(social.status, 200);
  assert.ok(social.headers.get('content-type').startsWith('image/png'));
  assert.equal((await request('/blog/')).headers.get('location'), '/writing/');
  review.data.articles[0].legacySlugs = ['old-streaming-url'];
  const moved = await request('/blog/old-streaming-url/');
  assert.equal(moved.status, 301);
  assert.equal(moved.headers.get('location'), '/writing/streaming-pipeline-trial/');
  await html('/blog/generating-typescript-from-java-records/', 410);
  await html('/blog/unknown-url/', 404);
  const locked = await request('/preview/article/review-streaming-article/');
  assert.equal(locked.status, 303);
  assert.equal(review.draftReads, 0, 'Unauthenticated previews must not read drafts');
  const access = await request('/preview/access/');
  assert.equal(access.headers.get('referrer-policy'), 'same-origin');
  assert.ok(!(await access.text()).includes('name="referrer"'));
  assert.equal((await post('wrong')).status, 401);
  assert.equal((await post(process.env.SANITY_PREVIEW_SECRET, 'null')).status, 403);
  assert.equal((await post(process.env.SANITY_PREVIEW_SECRET, 'https://attacker.example')).status, 403);
  const safeRedirect = await post(process.env.SANITY_PREVIEW_SECRET, liveOrigin, 'https://attacker.example');
  assert.equal(safeRedirect.headers.get('location'), '/preview/');
  const unlock = await post(process.env.SANITY_PREVIEW_SECRET);
  assert.equal(unlock.status, 303);
  const cookie = unlock.headers.get('set-cookie');
  assert.ok(/httponly/i.test(cookie) && /secure/i.test(cookie) && /samesite=lax/i.test(cookie));
  const session = {Cookie: cookie.split(';')[0]};
  const draftResponse = await request('/preview/article/review-streaming-article/', {headers: session});
  assert.equal(draftResponse.status, 200);
  assert.equal(draftResponse.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal(draftResponse.headers.get('cdn-cache-control'), 'no-store');
  assert.equal(draftResponse.headers.get('x-frame-options'), 'SAMEORIGIN');
  const draft = await draftResponse.text();
  assert.ok(draft.includes('Private unpublished streaming draft'));
  assert.ok(!draft.includes('application/ld+json'));
  assert.ok(!(await (await request('/writing/streaming-pipeline-trial/', {headers: session})).text()).includes('Private unpublished'));
  for (const [path, content] of [
    ['/preview/project/review-streaming-project/', 'Video streaming pipeline'],
    ['/preview/profile/profile/', 'Private unpublished profile'],
    ['/preview/siteSettings/siteSettings/', 'Private unpublished homepage'],
    ['/preview/siteSettings/siteSettings/?view=contact', 'Private unpublished contact details'],
  ]) {
    const response = await request(path, {headers: session});
    assert.equal(response.status, 200, path);
    assert.ok((await response.text()).includes(content), path);
  }
  const contactRedirect = await request('/preview/siteSettings/siteSettings/?view=contact');
  assert.ok(contactRedirect.headers.get('location').includes('view%3Dcontact'));
  const beforeInvalid = review.draftReads;
  assert.equal((await request('/preview/unknown/id/', {headers: session})).status, 404);
  assert.equal(review.draftReads, beforeInvalid);
  process.env.SANITY_API_READ_TOKEN = '';
  assert.equal((await request('/preview/article/review-streaming-article/', {headers: session})).status, 503);
  process.env.SANITY_API_READ_TOKEN = 'test-runtime-viewer-token';
  assert.equal((await request('/preview/exit/', {method: 'POST', headers: {...session, Origin: 'https://attacker.example'}})).status, 403);
  const exit = await request('/preview/exit/', {method: 'POST', headers: {...session, Origin: liveOrigin}});
  assert.equal(exit.status, 303);
  assert.match(exit.headers.get('set-cookie'), /(?:Max-Age=0|Expires=Thu, 01 Jan 1970)/i);
  review.data.articles[0].title = '</title></script><script>alert(1)</script>';
  const escaped = await html('/writing/streaming-pipeline-trial/');
  assert.ok(!escaped.match(/<title[^>]*>([\s\S]*?)<\/title>/)[1].includes('<'));
  const escapedGraph = escaped.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]+?)<\/script>/)[1];
  assert.ok(!escapedGraph.includes('<script>'));
  assert.ok(JSON.parse(escapedGraph)['@graph'].some((node) => node.headline === review.data.articles[0].title));
  review.fail(true);
  assert.equal((await request('/sitemap.xml')).status, 503);
  assert.equal((await request('/rss.xml')).status, 503);
  assert.equal((await request('/blog/old-streaming-url/')).status, 503);
  console.log('Production HTTP checks passed: indexable public SEO/feeds, review-host protection, legacy URLs, runtime-only draft auth, all preview types, CSRF checks, private headers, and public/draft separation.');
} finally {
  await review.close();
}
