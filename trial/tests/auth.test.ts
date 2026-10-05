import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSession, validSession, sameSecret, safeReturnPath, sessionSeconds} from '../../src/trial/auth.ts';

const secret = 'test-only-password-at-least-24-characters';
const now = 1791150000000;

test('a signed preview session expires and cannot be reused with another secret', () => {
  const session = createSession(secret, now);
  assert.equal(validSession(session, secret, now), true);
  assert.equal(validSession(session, secret, now + sessionSeconds * 1000), false);
  assert.equal(validSession(session, 'different-password-at-least-24-characters', now), false);
});
test('missing, malformed, and tampered sessions never unlock drafts', () => {
  const session = createSession(secret, now);
  for (const value of [undefined, '', 'bad', session.slice(0, -1), `${session}x`, session.replace(/.$/, session.endsWith('0') ? '1' : '0')]) {
    assert.equal(validSession(value, secret, now), false);
  }
  assert.equal(validSession(session, '', now), false);
});
test('blank and short configuration fail closed; wrong passwords are rejected', () => {
  assert.equal(sameSecret(secret, secret), true);
  assert.equal(sameSecret('wrong', secret), false);
  assert.equal(sameSecret('', ''), false);
  assert.equal(sameSecret('short', 'short'), false);
});
test('preview login cannot redirect to an external URL or arbitrary path', () => {
  assert.equal(safeReturnPath('/trial/preview/streaming-pipeline-trial/'), '/trial/preview/streaming-pipeline-trial/');
  for (const path of ['https://example.com', '//example.com', '/\\example.com', '/trial/preview/../../secret/', '/trial/preview/test/?token=secret', null]) {
    assert.equal(safeReturnPath(path), '/trial/');
  }
});
