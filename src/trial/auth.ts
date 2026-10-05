import {createHmac, timingSafeEqual, randomBytes} from 'node:crypto';

export const previewCookie = 'portfolio_trial_preview';
export const sessionSeconds = 8 * 60 * 60;
const sign = (message: string, secret: string) => createHmac('sha256', secret).update(message).digest('hex');

export function sameSecret(actual: string, expected: string): boolean {
  if (!expected || expected.length < 24) return false;
  const left = Buffer.from(sign(actual, expected));
  const right = Buffer.from(sign(expected, expected));
  return timingSafeEqual(left, right);
}

export function createSession(secret: string, now = Date.now()): string {
  const payload = `${Math.floor(now / 1000) + sessionSeconds}.${randomBytes(16).toString('hex')}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function validSession(cookie: string | undefined, secret: string, now = Date.now()): boolean {
  if (!cookie || secret.length < 24) return false;
  const match = /^(\d{10})\.([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(cookie);
  if (!match) return false;
  const expires = Number(match[1]);
  const seconds = Math.floor(now / 1000);
  if (expires <= seconds || expires > seconds + sessionSeconds) return false;
  return timingSafeEqual(Buffer.from(match[3]), Buffer.from(sign(`${match[1]}.${match[2]}`, secret)));
}

export function safeReturnPath(value: string | null): string {
  return value && /^\/trial\/preview\/[a-z0-9-]+\/$/.test(value) ? value : '/trial/';
}
