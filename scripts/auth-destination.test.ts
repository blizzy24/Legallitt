import assert from 'node:assert/strict';
import { test } from 'node:test';
import { afterSignIn, authDestination, destinationRole } from '../apps/mobile/lib/auth-destination';

test('preserves case IDs, encoded query values and anchors', () => {
  const url = '/legal-notice/tracking?caseId=a1dffec9-35ab-45b8-bee5-c1f15feb3846&from=shared%20link#delivery';
  assert.equal(authDestination(url), url);
  assert.equal(afterSignIn(url, 'user'), url);
});

test('rejects outside URLs, unknown routes, auth loops and ambiguous paths', () => {
  for (const url of [null, '/', '/home', '/login', '/(auth)/signup', '/onboarding', '/unknown', 'https://example.com', '//example.com', '/\\example.com', '/legal-notice/../login', '/legal-notice/%2e%2e/login']) {
    assert.equal(authDestination(url), null, String(url));
  }
  assert.equal(afterSignIn('//example.com', 'user'), '/home');
});

test('keeps role guards, distinguishing client advocate-selection routes from the advocate workspace', () => {
  const workspace = '/advocate/notice/actual-case-id/draft';
  assert.equal(destinationRole(workspace), 'lawyer');
  assert.equal(afterSignIn(workspace, 'user'), '/home');
  assert.equal(afterSignIn(workspace, 'lawyer'), workspace);
  const selection = '/services/district-court/advocate/decide';
  assert.equal(destinationRole(selection), 'user');
  assert.equal(afterSignIn(selection, 'user'), selection);
  assert.equal(afterSignIn('/(tabs)/cases', 'lawyer'), '/dashboard');
  assert.equal(afterSignIn('/(tabs)/cases', 'user'), '/cases');
});
