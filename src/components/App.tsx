import { type ShoutboxData } from '@/utils/fetch-shoutbox';
import { useShoutbox } from '@/hooks/use-shoutbox';
import { ShoutList } from './ShoutList';
import { LoadMoreButton } from './LoadMoreButton';

interface AppProps {
  initialData: ShoutboxData;
  fetchUrl: string;
  shoutboxUrl: string;
}

/** root component */
export function App({ initialData, fetchUrl, shoutboxUrl }: AppProps) {
  const { shouts, hasMore, isLoading, loadMore } = useShoutbox(initialData, fetchUrl);

  return (
    <div class="rlfs-root">
      <div class="rlfs-header">
        <a href={shoutboxUrl}>Shoutbox</a>
        <span>({shouts.length} shouts loaded)</span>
      </div>
      <ShoutList shouts={shouts} />
      {hasMore && <LoadMoreButton isLoading={isLoading} onClick={loadMore} />}
    </div>
  );
}
