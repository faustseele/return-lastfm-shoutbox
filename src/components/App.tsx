import { type ShoutboxData } from '@/utils/fetch-shoutbox';
import { ShoutList } from './ShoutList';

interface AppProps {
  shoutboxData: ShoutboxData;
  shoutboxUrl: string;
}

/** root component */
export function App({ shoutboxData, shoutboxUrl }: AppProps) {
  return (
    <div class="rlfs-root">
      <div class="rlfs-header">
        <a href={shoutboxUrl}>Shoutbox</a>
        <span>({shoutboxData.shouts.length} shouts loaded)</span>
      </div>
      <ShoutList shouts={shoutboxData.shouts} />
    </div>
  );
}
