// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { parseCsrfToken } from '../csrf-parser';

/** load an HTML fixture file and parse it into a Document via jsdom's DOMParser */
function loadFixture(name: string): Document {
  const fixturePath = join(__dirname, 'fixtures', name);
  const html = readFileSync(fixturePath, 'utf-8');
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('parseCsrfToken', () => {
  it('extracts the token from shoutbox-with-csrf fixture', () => {
    const document = loadFixture('shoutbox-with-csrf.html');
    expect(parseCsrfToken(document)).toBe('test-csrf-token-abc123');
  });

  it('returns null when no csrfmiddlewaretoken input is present', () => {
    const document = loadFixture('empty-shoutbox.html');
    expect(parseCsrfToken(document)).toBeNull();
  });

  it('picks the first token when multiple forms each have a token', () => {
    const html = `
      <form>
        <input type="hidden" name="csrfmiddlewaretoken" value="first-token">
      </form>
      <form>
        <input type="hidden" name="csrfmiddlewaretoken" value="second-token">
      </form>
    `;
    const document = new DOMParser().parseFromString(html, 'text/html');
    expect(parseCsrfToken(document)).toBe('first-token');
  });
});
