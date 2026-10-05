import assert from 'node:assert/strict';
import {startMockServer} from './mock-server.mjs';

// Uses the built renderer with fixture Sanity responses, never the remote dataset.
const review = await startMockServer();
const page = async (path, expected = 200) => {
  const response = await fetch(`${review.base}${path}`);
  assert.equal(response.status, expected, path);
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  return response.text();
};
try {
  const home = await page('/');
  assert.ok(home.indexOf('Notes from the notebook') < home.indexOf(review.data.articles[0].title), 'Homepage respects selected reference order');
  assert.ok(home.includes('aria-label="Main navigation"'));
  assert.ok(home.includes('Skip to content'));
  const writing = await page('/writing/');
  assert.ok(writing.includes('aria-current="page"'));
  assert.ok(writing.includes('/writing/?topic=Architecture'));
  const filtered = await page('/writing/?topic=Architecture');
  assert.ok(filtered.includes('Notes from the notebook'));
  assert.ok(!filtered.includes(review.data.articles[0].title));
  assert.ok((await page('/writing/?topic=unknown')).includes('No articles match this topic'));
  const article = await page('/writing/streaming-pipeline-trial/');
  for (const text of ['<table>', 'S3ObjectKeys', 'architecture.png', 'Behind this article', '/work/streaming-pipeline/']) assert.ok(article.includes(text), text);
  assert.ok(!article.includes('unpublished-project'));
  assert.ok(!(await page('/writing/notebook/')).includes('Behind this article'));
  const work = await page('/work/streaming-pipeline/');
  assert.ok(work.includes('Writing about this project'));
  assert.ok(work.includes('/writing/streaming-pipeline-trial/'));
  assert.ok(!work.includes('/writing/notebook/'));
  assert.ok(work.includes('View source'));
  const about = await page('/about/');
  assert.ok(/Experience (?:&amp;|&) education/.test(about));
  review.data.profile.cvUrl = 'https://cdn.sanity.io/files/ty4afqwx/production/fixture.pdf';
  assert.ok((await page('/about/')).includes('Download CV (PDF)'));
  const contact = await page('/contact/');
  assert.ok(contact.includes('https://github.com/iamkavindu'));
  review.data.settings.email = 'review@example.com';
  assert.ok((await page('/contact/')).includes('mailto:review@example.com'));
  review.data.projects[0].repositoryUrl = 'javascript:alert(1)';
  assert.ok(!(await page('/work/streaming-pipeline/')).includes('javascript:'));
  await page('/writing/missing/', 404);
  await page('/work/missing/', 404);
  const cssHref = home.match(/href="([^"]+\.css)"/)[1];
  assert.equal((await fetch(`${review.base}${cssHref}`)).status, 200);
  assert.equal((await fetch(`${review.base}/images/blogs/stream-app/architecture.png`)).status, 200);
  review.data.articles = [];
  review.data.projects = [];
  assert.ok((await page('/')).includes('The notebook is starting a new chapter'));
  review.fail(true);
  assert.ok((await page('/', 503)).includes('Content is temporarily unavailable'));
  await page('/writing/streaming-pipeline-trial/', 503);
  console.log('Portfolio HTTP checks passed: published-only reader, featured order, topic filters, rich content, optional relationships, profile/CV, contact links, empty/missing/outage states, CSS/images, and noindex.');
} finally {
  await review.close();
}
