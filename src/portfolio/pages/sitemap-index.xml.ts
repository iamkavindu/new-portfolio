import type {APIRoute} from 'astro';
import {absoluteUrl} from '../lib/seo';
export const GET: APIRoute = ({locals}) => locals.noIndex
  ? new Response('Sitemap is disabled for this review host.', {status: 404})
  : new Response(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${absoluteUrl('/sitemap.xml')}</loc></sitemap></sitemapindex>`, {headers: {'Content-Type': 'application/xml; charset=utf-8'}});
