import { type Shout } from '@/parsers/shout-parser';
import { ShoutItem } from './ShoutItem';

interface ShoutListProps {
  shouts: Shout[];
  onReply?: (shoutId: string, permalink: string, text: string) => Promise<void>;
}

/** renders the full list of shouts, or an empty state when there are none */
export function ShoutList({ shouts, onReply }: ShoutListProps) {
  if (shouts.length === 0) {
    return <p class="rlfs-empty">No shouts yet</p>;
  }

  return (
    <div class="rlfs-shouts">
      {shouts.map((shout) => (
        <ShoutItem key={shout.id} shout={shout} onReply={onReply} />
      ))}
    </div>
  );
}
