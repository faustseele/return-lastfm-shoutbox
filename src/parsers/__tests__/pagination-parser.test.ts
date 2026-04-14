// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { parsePagination } from '../pagination-parser';

/** load an HTML fixture file and parse it into a Document via jsdom's DOMParser */
function loadFixture(name: string): Document {
  const fixturePath = join(__dirname, 'fixtures', name);
  const html = readFileSync(fixturePath, 'utf-8');
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('parsePagination', () => {
  describe('shoutbox-paginated fixture (multi-page, page 1 of 50)', () => {
    const document = loadFixture('shoutbox-paginated.html');
    const result = parsePagination(document);

    it('returns a non-null result', () => {
      expect(result).not.toBeNull();
    });

    it('extracts currentPage as 1', () => {
      expect(result?.currentPage).toBe(1);
    });

    it('extracts totalPages as 50', () => {
      expect(result?.totalPages).toBe(50);
    });

    it('extracts nextPageUrl as ?page=2', () => {
      expect(result?.nextPageUrl).toBe('?page=2');
    });
  });

  describe('shoutbox-single-page fixture (no nav.pagination)', () => {
    it('returns null when there is no pagination nav', () => {
      const document = loadFixture('shoutbox-single-page.html');
      expect(parsePagination(document)).toBeNull();
    });
  });

  describe('shoutbox-last-page fixture (page 50 of 50, no Next button)', () => {
    const document = loadFixture('shoutbox-last-page.html');
    const result = parsePagination(document);

    it('returns a non-null result', () => {
      expect(result).not.toBeNull();
    });

    it('extracts currentPage as 50', () => {
      expect(result?.currentPage).toBe(50);
    });

    it('extracts totalPages as 50', () => {
      expect(result?.totalPages).toBe(50);
    });

    it('returns null for nextPageUrl on last page', () => {
      expect(result?.nextPageUrl).toBeNull();
    });
  });

  describe('last page — no Next button, currentPage equals totalPages', () => {
    it('returns null nextPageUrl and correct page numbers', () => {
      const html = `
        <nav class="pagination">
          <ul class="pagination-list">
            <li class="pagination-page"><a href="?page=49" data-pagination-link>49</a></li>
            <li class="pagination-page pagination-page--ellipsis"><span>...</span></li>
            <li class="pagination-page" aria-current="page"><span>50</span></li>
          </ul>
        </nav>
      `;
      const document = new DOMParser().parseFromString(html, 'text/html');
      const result = parsePagination(document);

      expect(result).not.toBeNull();
      expect(result?.currentPage).toBe(50);
      expect(result?.totalPages).toBe(50);
      expect(result?.nextPageUrl).toBeNull();
    });
  });

  describe('edge case — no nav.pagination at all', () => {
    it('returns null for a document with no pagination nav', () => {
      const document = new DOMParser().parseFromString('<div></div>', 'text/html');
      expect(parsePagination(document)).toBeNull();
    });
  });
});
