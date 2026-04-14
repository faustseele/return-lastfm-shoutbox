export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  nextPageUrl: string | null;
}

/**
 * extract pagination info from a shoutbox page Document.
 * returns null if no pagination nav exists (single page or empty shoutbox)
 */
export function parsePagination(document: Document): PaginationInfo | null {
  const nav = document.querySelector('nav.pagination');
  if (!nav) {
    return null;
  }

  const currentPageElement = nav.querySelector('li.pagination-page[aria-current="page"]');
  if (!currentPageElement) {
    console.warn('pagination-parser: nav.pagination found but no aria-current="page" element');
    return null;
  }

  const currentPageText = currentPageElement.textContent?.trim();
  const currentPage = parseInt(currentPageText ?? '', 10);
  if (isNaN(currentPage)) {
    console.warn('pagination-parser: could not parse current page number from', currentPageText);
    return null;
  }

  /** all numbered page items — exclude ellipsis and next-button wrapper */
  const numberedPageItems = nav.querySelectorAll(
    'li.pagination-page:not(.pagination-page--ellipsis):not(.pagination-next)',
  );

  let totalPages = currentPage;

  if (numberedPageItems.length > 0) {
    const lastItem = numberedPageItems[numberedPageItems.length - 1];
    /** last item is a link on multi-page, or aria-current span on single/last page */
    const lastPageLink = lastItem.querySelector('a[data-pagination-link]');
    const lastPageText = lastPageLink
      ? lastPageLink.textContent?.trim()
      : lastItem.textContent?.trim();

    const parsed = parseInt(lastPageText ?? '', 10);
    if (!isNaN(parsed)) {
      totalPages = parsed;
    } else {
      console.warn('pagination-parser: could not parse total pages from', lastPageText);
    }
  }

  const nextLink = nav.querySelector('li.pagination-next a[href]');
  const nextPageUrl = nextLink ? nextLink.getAttribute('href') : null;

  return { currentPage, totalPages, nextPageUrl };
}
