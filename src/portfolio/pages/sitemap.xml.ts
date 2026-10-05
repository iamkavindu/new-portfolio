import type {APIRoute} from 'astro';
import {getCatalog, entryPath} from '../content';
import {absoluteUrl} from '../lib/seo';
const xml = (value: string) => value.replace(/[&<>"']/g, (char) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[char]!));
export const GET: APIRoute = async ({locals}) => {
  if (locals.noIndex) return new Response('Sitemap is disabled for this review host.', {status: 404});
  const {data, unavailable} = await getCatalog();
  if (unavailable) return new Response('Content is temporarily unavailable.', {status: 503});
  const entries = [
    ...['/', '/writing/', '/work/', '/about/', '/contact/'].map((path) => ({path, updated: undefined as string | undefined})),
    ...[...data.articles, ...data.projects].map((entry) => ({path: entryPath(entry), updated: entry._updatedAt || entry.publishedAt})),
  ];
  const body = entries.map(({path, updated}) => `<url><loc>${xml(absoluteUrl(path))}</loc>${updated && !Number.isNaN(Date.parse(updated)) ? `<lastmod>${new Date(updated).toISOString()}</lastmod>` : ''}</url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`, {headers: {'Content-Type': 'application/xml; charset=utf-8'}});
};
