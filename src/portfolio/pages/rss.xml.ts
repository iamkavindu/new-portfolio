import rss from '@astrojs/rss';
import type {APIRoute} from 'astro';
import {getCatalog, entryPath} from '../content';
import {SITE_URL} from '../lib/seo';
export const GET: APIRoute = async ({locals}) => {
  if (locals.noIndex) return new Response('RSS is disabled for this review host.', {status: 404});
  const {data, unavailable} = await getCatalog();
  if (unavailable) return new Response('Content is temporarily unavailable.', {status: 503});
  return rss({
    title: `${data.profile?.name || 'Kavindu Perera'} — Writing`,
    description: data.settings?.homeIntroduction || 'Notes on software engineering and the projects I build.',
    site: SITE_URL,
    items: data.articles.filter((article) => article.publishedAt && !Number.isNaN(Date.parse(article.publishedAt))).map((article) => ({title: article.title, description: article.description, pubDate: new Date(article.publishedAt!), link: entryPath(article)})),
    customData: '<language>en</language>',
  });
};
