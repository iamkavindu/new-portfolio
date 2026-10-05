import {defineMiddleware} from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (context.url.pathname.startsWith('/trial/')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Referrer-Policy', 'same-origin');
  }
  return response;
});
