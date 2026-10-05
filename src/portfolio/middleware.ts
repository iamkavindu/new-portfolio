import {defineMiddleware} from 'astro:middleware';
import {isLiveHost} from './lib/seo';
import {previewCookie, previewSecret, validSession, safePreviewPath} from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const privateRoute = context.url.pathname.startsWith('/preview/');
  context.locals.noIndex = privateRoute || import.meta.env.PORTFOLIO_REVIEW === 'true' || !isLiveHost(context.url);
  context.locals.preview = privateRoute && context.url.pathname !== '/preview/access/';
  let response: Response;
  if (privateRoute && context.url.pathname !== '/preview/access/' && !validSession(context.cookies.get(previewCookie)?.value, previewSecret())) {
    response = context.redirect(`/preview/access/?next=${encodeURIComponent(safePreviewPath(context.url.pathname + context.url.search))}`, 303);
  } else response = await next();
  if (context.locals.noIndex || response.status >= 400) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('CDN-Cache-Control', 'no-store');
  response.headers.set('Referrer-Policy', 'same-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (privateRoute) {
    const localStudio = ['localhost', '127.0.0.1'].includes(context.url.hostname) ? ' http://localhost:3333 http://127.0.0.1:3333' : '';
    response.headers.set('Content-Security-Policy', `frame-ancestors 'self'${localStudio}`);
    if (!localStudio) response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  } else response.headers.set('X-Frame-Options', 'DENY');
  return response;
});
