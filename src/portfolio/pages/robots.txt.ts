import type {APIRoute} from 'astro';
import {SITE_URL} from '../lib/seo';
export const GET: APIRoute = ({locals}) => {
  const policy = locals.noIndex ? 'User-agent: *\nDisallow: /\n' : [
    'User-agent: *', 'Allow: /', 'Disallow: /preview/', 'Disallow: /studio/', 'Disallow: /trial/', '',
    'User-agent: OAI-SearchBot', 'Allow: /', 'Disallow: /preview/', 'Disallow: /studio/', 'Disallow: /trial/', '',
    `Sitemap: ${SITE_URL}/sitemap-index.xml`, '',
  ].join('\n');
  return new Response(policy, {headers: {'Content-Type': 'text/plain; charset=utf-8'}});
};
