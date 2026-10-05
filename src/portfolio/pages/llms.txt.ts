import type {APIRoute} from 'astro';
import {getCatalog, entryPath} from '../content';
import {absoluteUrl} from '../lib/seo';
const line = (text: string) => text.replace(/[\r\n]/g, ' ');
export const GET: APIRoute = async ({locals}) => {
  if (locals.noIndex) return new Response('Content index is disabled for this review host.', {status: 404});
  const {data, unavailable} = await getCatalog();
  if (unavailable) return new Response('Content is temporarily unavailable.', {status: 503});
  const lines = [
    `# ${line(data.profile?.name || 'Kavindu Perera')}`, '',
    `> ${line(data.settings?.homeIntroduction || 'Writing and projects by a backend-focused software engineer.')}`, '',
    '## About', `- [About / CV](${absoluteUrl('/about/')})`, `- [Contact](${absoluteUrl('/contact/')})`, '',
    '## Writing', ...data.articles.map((entry) => `- [${line(entry.title)}](${absoluteUrl(entryPath(entry))}): ${line(entry.description || '')}`), '',
    '## Work', ...data.projects.map((entry) => `- [${line(entry.title)}](${absoluteUrl(entryPath(entry))}): ${line(entry.description || '')}`), '',
    '## Feeds', `- [RSS](${absoluteUrl('/rss.xml')})`, `- [Sitemap](${absoluteUrl('/sitemap.xml')})`, '',
  ];
  return new Response(lines.join('\n'), {headers: {'Content-Type': 'text/plain; charset=utf-8'}});
};
