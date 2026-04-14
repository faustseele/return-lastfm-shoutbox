import { useState } from 'preact/hooks';
import { type Shout } from '@/parsers/shout-parser';

interface ShoutItemProps {
  shout: Shout;
  isNested?: boolean;
  onReply?: (shoutId: string, permalink: string, text: string) => Promise<void>;
  onVote?: (permalink: string) => Promise<void>;
}

/** renders a single shout: avatar, username link, relative timestamp, text, and expandable replies */
export function ShoutItem({ shout, isNested = false, onReply, onVote }: ShoutItemProps) {
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const hasReplies = shout.replies.length > 0;
  const replyCount = shout.replies.length;
  const replyLabel = replyCount === 1 ? '1 reply' : `${replyCount} replies`;

  const rootClass = isNested ? 'rlfs-shout rlfs-shout--nested' : 'rlfs-shout';

  /** submit reply -> call onReply, reset form on success */
  async function handleReplySubmit(event: Event) {
    event.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed || !onReply || isSubmittingReply) return;
    setIsSubmittingReply(true);
    try {
      await onReply(shout.id, shout.permalink, trimmed);
      setReplyText('');
      setIsReplying(false);
    } finally {
      setIsSubmittingReply(false);
    }
  }

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
        {(onReply || onVote) && (
          <div class="rlfs-shout__actions">
            {onReply && (
              <button class="rlfs-shout__reply-btn" type="button" onClick={() => setIsReplying(!isReplying)}>
                {isReplying ? 'Cancel' : 'Reply'}
              </button>
            )}
            {onVote && (
              <button
                class="rlfs-shout__vote-btn"
                type="button"
                onClick={() => onVote(shout.permalink)}
              >
                &#8593; {shout.voteCount}
              </button>
            )}
          </div>
        )}
        {isReplying && (
          <form class="rlfs-shout__reply-form" onSubmit={handleReplySubmit}>
            <textarea
              class="rlfs-shout__reply-form-input"
              placeholder="Write a reply..."
              value={replyText}
              onInput={(e) => setReplyText((e.target as HTMLTextAreaElement).value)}
              disabled={isSubmittingReply}
              rows={2}
            />
            <button
              class="rlfs-shout__reply-form-submit"
              type="submit"
              disabled={replyText.trim().length === 0 || isSubmittingReply}
            >
              {isSubmittingReply ? 'Posting...' : 'Reply'}
            </button>
          </form>
        )}
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
                  <ShoutItem key={reply.id} shout={reply} isNested={true} onReply={onReply} onVote={onVote} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
