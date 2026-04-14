import { useState } from 'preact/hooks';
import { fetchShoutboxData, type ShoutboxData } from '@/utils/fetch-shoutbox';
import { postShout as postShoutUtil } from '@/utils/post-shout';
import { type Shout } from '@/parsers/shout-parser';
import { type PaginationInfo } from '@/parsers/pagination-parser';
import { type AuthState } from '@/parsers/auth-parser';

interface UseShoutboxResult {
  shouts: Shout[];
  pagination: PaginationInfo | null;
  authState: AuthState;
  csrfToken: string | null;
  isLoading: boolean;
  hasMore: boolean;
  loadError: string | null;
  loadMore: () => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  postShout: (text: string) => Promise<void>;
}

/**
 * manages shoutbox state: accumulated shouts & pagination across page loads.
 * fetchUrl is the base URL without query params (e.g. /user/X/partial/shoutbox)
 * shoutboxUrl is the POST target (e.g. /user/X/shoutbox)
 */
export function useShoutbox(initialData: ShoutboxData, fetchUrl: string, shoutboxUrl: string): UseShoutboxResult {
  const [shouts, setShouts] = useState<Shout[]>(initialData.shouts);
  const [pagination, setPagination] = useState<PaginationInfo | null>(initialData.pagination);
  const [authState] = useState<AuthState>(initialData.authState);
  const [csrfToken] = useState<string | null>(initialData.csrfToken);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** nextPageUrl is a relative query string like ?page=2 */
  const hasMore = pagination !== null && pagination.nextPageUrl !== null;

  /** append next page of shouts to accumulated list */
  async function loadMore(): Promise<void> {
    if (!hasMore || isLoading) return;

    const nextPageUrl = pagination?.nextPageUrl;
    if (!nextPageUrl) return;

    setIsLoading(true);
    setLoadError(null);
    try {
      const nextUrl = fetchUrl + nextPageUrl;
      const data = await fetchShoutboxData(nextUrl);
      setShouts((prev) => [...prev, ...data.shouts]);
      setPagination(data.pagination);
    } catch (error) {
      console.warn('useShoutbox: failed to load more shouts', error);
      setLoadError('Failed to load more shouts. Try again.');
    } finally {
      setIsLoading(false);
    }
  }

  /** post a new shout, then re-fetch page 1 to reflect it at the top */
  async function postShoutHandler(text: string): Promise<void> {
    if (!csrfToken || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await postShoutUtil(shoutboxUrl, csrfToken, text);
      /** re-fetch first page — replaces accumulated list so new shout appears at top */
      const data = await fetchShoutboxData(fetchUrl);
      setShouts(data.shouts);
      setPagination(data.pagination);
    } catch (error) {
      console.warn('useShoutbox: failed to post shout', error);
      setSubmitError('Failed to post shout. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    shouts,
    pagination,
    authState,
    csrfToken,
    isLoading,
    hasMore,
    loadError,
    loadMore,
    isSubmitting,
    submitError,
    postShout: postShoutHandler,
  };
}
