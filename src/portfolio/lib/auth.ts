import {getSecret} from 'astro:env/server';
export {createSession, sameSecret, validSession, sessionSeconds} from '../../trial/auth';
export const previewCookie = 'portfolio_preview';
export const previewSecret = () => getSecret('SANITY_PREVIEW_SECRET') || '';
export const safePreviewPath = (path: string | null) => path && /^\/preview\/(?:$|(?:article|project|profile|siteSettings)\/[A-Za-z0-9_.-]+\/(?:\?view=contact)?$)/.test(path) ? path : '/preview/';
