import { type ShoutboxData } from '@/utils/fetch-shoutbox';
import { useShoutbox } from '@/hooks/use-shoutbox';
import { ShoutList } from './ShoutList';
import { LoadMoreButton } from './LoadMoreButton';
import { GuestPrompt } from './GuestPrompt';
import { ShoutForm } from './ShoutForm';

interface AppProps {
  initialData: ShoutboxData;
  fetchUrl: string;
  shoutboxUrl: string;
}

/** root component */
export function App({ initialData, fetchUrl, shoutboxUrl }: AppProps) {
  const {
    shouts,
    authState,
    csrfToken,
    hasMore,
    isLoading,
    loadError,
    loadMore,
    isSubmitting,
    submitError,
    postShout,
    postReply,
    voteShout,
    deleteShout,
  } = useShoutbox(initialData, fetchUrl, shoutboxUrl);

  return (
    <div class="rlfs-root">
      <div class="rlfs-header">
        <a href={shoutboxUrl}>Shoutbox</a>
        <span>({shouts.length} shouts loaded)</span>
      </div>
      {authState === 'guest' && <GuestPrompt shoutboxUrl={shoutboxUrl} />}
      {authState === 'logged-in' && csrfToken && (
        <ShoutForm onSubmit={postShout} isSubmitting={isSubmitting} />
      )}
      {submitError && <div class="rlfs-submit-error">{submitError}</div>}
      <ShoutList
        shouts={shouts}
        onReply={authState === 'logged-in' && csrfToken ? postReply : undefined}
        onVote={authState === 'logged-in' && csrfToken ? voteShout : undefined}
        onDelete={authState === 'logged-in' && csrfToken ? deleteShout : undefined}
      />
      {loadError && <div class="rlfs-load-error">{loadError}</div>}
      {hasMore && <LoadMoreButton isLoading={isLoading} onClick={loadMore} />}
    </div>
  );
}
