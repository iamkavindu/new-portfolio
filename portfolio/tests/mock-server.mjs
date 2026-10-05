import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {SanityClient} from '@sanity/client';

// Test/demo data stays in this process. Nothing is written to Sanity.
export async function startMockServer(port = 0) {
  const sample = JSON.parse(await readFile(new URL('../../trial/fixtures/streaming-article.json', import.meta.url), 'utf8'));
  const project = {
    _id: 'review-streaming-project', _type: 'project', title: 'Video streaming pipeline',
    slug: {current: 'streaming-pipeline'}, description: 'A personal project exploring video upload, processing, and HLS playback.',
    technologies: ['Java', 'Spring Boot', 'AWS'], repositoryUrl: 'https://github.com/iamkavindu/stream-app',
    status: 'in-progress', body: sample.body,
  };
  const article = {...sample, _id: 'review-streaming-article', _type: 'article', tags: ['Streaming', 'Java'], relatedProjects: [{_ref: project._id}, {_ref: 'unpublished-project'}]};
  const standalone = {...article, _id: 'review-standalone', title: 'Notes from the notebook', slug: {current: 'notebook'}, tags: ['Architecture'], relatedProjects: []};
  const data = {
    articles: [article, standalone], projects: [project],
    profile: {
      name: 'Kavindu Perera', headline: 'Software engineer · Backend systems', skills: ['Java', 'Spring Boot', 'Docker', 'Kubernetes'],
      body: [{_type: 'block', _key: 'intro', style: 'normal', markDefs: [], children: [{_type: 'span', _key: 'text', marks: [], text: 'This local review uses sample content. Your published biography, experience, and CV will appear here when you add them in Sanity.'}]}],
    },
    settings: {
      homeTitle: 'Building things. Sharing what I learn.',
      homeIntroduction: 'Notes on backend engineering, the decisions behind the code, and projects that put ideas into practice.',
      featuredArticles: [{_ref: standalone._id}, {_ref: 'unpublished-article'}, {_ref: article._id}],
      featuredProjects: [{_ref: project._id}],
      contactIntroduction: 'A question about something I wrote, an interesting engineering problem, or an opportunity to collaborate? Let’s talk.',
      socialLinks: [{_key: 'github', title: 'GitHub', url: 'https://github.com/iamkavindu'}],
    },
  };
  let unavailable = false;
  const originalFetch = SanityClient.prototype.fetch;
  SanityClient.prototype.fetch = async function () {
    if (this.config().perspective !== 'published' || this.config().token) throw new Error('Public pages must use published content without credentials.');
    if (unavailable) throw new Error('Simulated CMS outage');
    return structuredClone(data);
  };
  process.env.ASTRO_NODE_AUTOSTART = 'disabled';
  const {handler} = await import('../../dist-portfolio/server/entry.mjs');
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  return {
    data, base: `http://127.0.0.1:${server.address().port}`,
    fail: (value) => {unavailable = value;},
    close: async () => {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
      SanityClient.prototype.fetch = originalFetch;
    },
  };
}
