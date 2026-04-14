// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { parseAuthState } from '../auth-parser';

/** load an HTML fixture file and parse it into a Document via jsdom's DOMParser */
function loadFixture(name: string): Document {
  const fixturePath = join(__dirname, 'fixtures', name);
  const html = readFileSync(fixturePath, 'utf-8');
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('parseAuthState', () => {
  it('returns "guest" when div.shouting-unavailable is present', () => {
    const document = loadFixture('shoutbox-guest.html');
    expect(parseAuthState(document)).toBe('guest');
  });

  it('returns "logged-in" when div.shouting-unavailable is absent', () => {
    const document = loadFixture('shoutbox-logged-in.html');
    expect(parseAuthState(document)).toBe('logged-in');
  });

  it('returns "guest" for inline HTML with the guest banner', () => {
    const html = '<div class="shouting-unavailable"><p>Join or log in</p></div>';
    const document = new DOMParser().parseFromString(html, 'text/html');
    expect(parseAuthState(document)).toBe('guest');
  });

  it('returns "logged-in" for a document with no guest banner', () => {
    const document = new DOMParser().parseFromString('<div></div>', 'text/html');
    expect(parseAuthState(document)).toBe('logged-in');
  });
});
