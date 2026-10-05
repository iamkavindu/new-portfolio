import type {APIRoute} from 'astro';
import {previewCookie} from '../../lib/auth';
export const POST: APIRoute = ({request, url, cookies, redirect}) => {
  if (request.headers.get('origin') !== url.origin) return new Response('Invalid form origin', {status: 403});
  cookies.delete(previewCookie, {path: '/preview/'});
  return redirect('/', 303);
};
