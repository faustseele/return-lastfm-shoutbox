import { parseShouts, type Shout } from '@/parsers/shout-parser';
import { parsePagination, type PaginationInfo } from '@/parsers/pagination-parser';
import { parseAuthState, type AuthState } from '@/parsers/auth-parser';
import { parseCsrfToken } from '@/parsers/csrf-parser';

export interface ShoutboxData {
  shouts: Shout[];
  pagination: PaginationInfo | null;
  authState: AuthState;
  csrfToken: string | null;
}

/**
 * fetch the shoutbox endpoint and parse the response HTML.
 * throws on non-OK responses — callers handle or let it propagate.
 */
export async function fetchShoutboxData(partialUrl: string): Promise<ShoutboxData> {
  const response = await fetch(partialUrl);
  if (!response.ok) {
    console.warn(`fetch-shoutbox: failed to fetch "${partialUrl}" — status ${response.status}`);
    throw new Error(`failed to fetch shoutbox: ${response.status}`);
  }
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');

  return {
    shouts: parseShouts(doc),
    pagination: parsePagination(doc),
    authState: parseAuthState(doc),
    csrfToken: parseCsrfToken(doc),
  };
}
