import { useState } from 'preact/hooks';
import { fetchShoutboxData, type ShoutboxData } from '@/utils/fetch-shoutbox';
import { postShout as postShoutUtil, postVote as postVoteUtil } from '@/utils/post-shout';
import { deleteShout as deleteShoutUtil } from '@/utils/delete-shout';
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
  postReply: (shoutId: string, permalink: string, text: string) => Promise<void>;
  voteShout: (permalink: string) => Promise<void>;
  deleteShout: (permalink: string) => Promise<void>;
}

/**
 * manages shoutbox state: accumulated shouts & pagination across page loads.
 * fetchUrl is the base URL without query params (e.g. /user/X/partial/shoutbox)
 * shoutboxUrl is the POST target (e.g. /user/X/shoutbox)
 */
const INITIAL_SHOUT_LIMIT = 10;

export function useShoutbox(initialData: ShoutboxData, fetchUrl: string, shoutboxUrl: string): UseShoutboxResult {
  const [shouts, setShouts] = useState<Shout[]>(initialData.shouts.slice(0, INITIAL_SHOUT_LIMIT));
  const [pagination, setPagination] = useState<PaginationInfo | null>(initialData.pagination);
  const [authState] = useState<AuthState>(initialData.authState);
  const [csrfToken, setCsrfToken] = useState<string | null>(initialData.csrfToken);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** remaining shouts from initial page that weren't shown due to INITIAL_SHOUT_LIMIT */
  const [remainingFromFirstPage] = useState<Shout[]>(initialData.shouts.slice(INITIAL_SHOUT_LIMIT));

  const hasMoreFromFirstPage = remainingFromFirstPage.length > 0 && shouts.length <= INITIAL_SHOUT_LIMIT;
  const hasMorePages = pagination !== null && pagination.nextPageUrl !== null;
  const hasMore = hasMoreFromFirstPage || hasMorePages;

  /** append more shouts — first drain the sliced remainder, then fetch next pages */
  async function loadMore(): Promise<void> {
    if (!hasMore || isLoading) return;

    if (hasMoreFromFirstPage) {
      setShouts((prev) => [...prev, ...remainingFromFirstPage]);
      return;
    }

    const nextPageUrl = pagination?.nextPageUrl;
    if (!nextPageUrl) return;

    setIsLoading(true);
    setLoadError(null);
    try {
      const nextUrl = fetchUrl + nextPageUrl;
      const data = await fetchShoutboxData(nextUrl);
      setShouts((prev) => [...prev, ...data.shouts]);
      setPagination(data.pagination);
      if (data.csrfToken) setCsrfToken(data.csrfToken);
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
      if (data.csrfToken) setCsrfToken(data.csrfToken);
    } catch (error) {
      console.warn('useShoutbox: failed to post shout', error);
      setSubmitError('Failed to post shout. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  /** post a reply to an existing shout, then re-fetch page 1 to get updated reply tree */
  async function postReply(shoutId: string, permalink: string, text: string): Promise<void> {
    if (!csrfToken || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await postShoutUtil(permalink, csrfToken, text);
      /** re-fetch first page to get updated reply tree */
      const data = await fetchShoutboxData(fetchUrl);
      setShouts(data.shouts);
      setPagination(data.pagination);
      if (data.csrfToken) setCsrfToken(data.csrfToken);
    } catch (error) {
      console.warn(`useShoutbox: failed to post reply to shoutId=${shoutId}`, error);
      setSubmitError('Failed to post reply. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  /** toggle an up-vote — separate from isSubmitting so votes don't block other actions */
  async function voteShout(permalink: string): Promise<void> {
    if (!csrfToken || isVoting) return;

    setIsVoting(true);
    try {
      await postVoteUtil(permalink, csrfToken);
      const data = await fetchShoutboxData(fetchUrl);
      setShouts(data.shouts);
      setPagination(data.pagination);
      if (data.csrfToken) setCsrfToken(data.csrfToken);
    } catch (error) {
      console.warn(`useShoutbox: failed to vote on permalink=${permalink}`, error);
    } finally {
      setIsVoting(false);
    }
  }

  /** delete a shout, then re-fetch page 1 to remove it from the list */
  async function deleteShoutHandler(permalink: string): Promise<void> {
    if (!csrfToken || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await deleteShoutUtil(permalink, csrfToken);
      /** re-fetch first page to reflect the deleted shout being gone */
      const data = await fetchShoutboxData(fetchUrl);
      setShouts(data.shouts);
      setPagination(data.pagination);
      if (data.csrfToken) setCsrfToken(data.csrfToken);
    } catch (error) {
      console.warn(`useShoutbox: failed to delete shout at permalink=${permalink}`, error);
      setSubmitError('Failed to delete shout. Try again.');
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
    postReply,
    voteShout,
    deleteShout: deleteShoutHandler,
  };
}
