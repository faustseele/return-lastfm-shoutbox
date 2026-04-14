import { useState } from 'preact/hooks';
import { type Shout } from '@/parsers/shout-parser';

interface ShoutItemProps {
  shout: Shout;
  isNested?: boolean;
}

/** renders a single shout: avatar, username link, relative timestamp, text, and expandable replies */
export function ShoutItem({ shout, isNested = false }: ShoutItemProps) {
  const [repliesExpanded, setRepliesExpanded] = useState(false);

  const hasReplies = shout.replies.length > 0;
  const replyCount = shout.replies.length;
  const replyLabel = replyCount === 1 ? '1 reply' : `${replyCount} replies`;

  const rootClass = isNested ? 'rlfs-shout rlfs-shout--nested' : 'rlfs-shout';

  return (
    <div class={rootClass}>
      <div class="rlfs-shout__avatar-col">
        {shout.avatarUrl ? (
          <img
            class="rlfs-shout__avatar"
            src={shout.avatarUrl}
            alt={shout.author}
          />
        ) : (
          <div class="rlfs-shout__avatar-fallback" aria-label={shout.author}>
            {shout.author.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div class="rlfs-shout__content">
        <div class="rlfs-shout__header">
          <a class="rlfs-shout__author" href={shout.authorUrl}>
            {shout.author}
          </a>
          <time class="rlfs-shout__time" dateTime={shout.timestamp}>
            {shout.relativeTime}
          </time>
        </div>
        <p class="rlfs-shout__text">{shout.text}</p>
        {hasReplies && (
          <>
            <button
              class="rlfs-shout__replies-toggle"
              onClick={() => setRepliesExpanded((prev) => !prev)}
              type="button"
            >
              {replyLabel}
            </button>
            {repliesExpanded && (
              <div class="rlfs-shout__replies">
                {shout.replies.map((reply) => (
                  <ShoutItem key={reply.id} shout={reply} isNested={true} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
