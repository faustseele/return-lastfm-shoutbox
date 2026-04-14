import { type ShoutboxData } from '@/utils/fetch-shoutbox';

interface AppProps {
  shoutboxData: ShoutboxData;
  shoutboxUrl: string;
}

/** root component — renders shoutbox data, will be expanded with real components later */
export function App({ shoutboxData, shoutboxUrl }: AppProps) {
  const { shouts, pagination, authState } = shoutboxData;
  return (
    <div class="rlfs-root">
      <div class="rlfs-header">
        <a href={shoutboxUrl}>Shoutbox</a>
        <span>({shouts.length} shouts loaded)</span>
      </div>
      <div class="rlfs-status">
        <span>Auth: {authState}</span>
        {pagination && <span> | Page {pagination.currentPage} of {pagination.totalPages}</span>}
      </div>
      <div class="rlfs-shouts">
        {shouts.map((shout) => (
          <div key={shout.id} class="rlfs-shout-placeholder">
            <strong>{shout.author}</strong>: {shout.text}
          </div>
        ))}
      </div>
    </div>
  );
}
