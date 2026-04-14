import { useState, useEffect } from 'preact/hooks';
import { type Shout } from '@/parsers/shout-parser';

interface ShoutActionsProps {
  shout: Shout;
  onDelete?: (permalink: string) => Promise<void>;
}

/** three-dot dropdown for per-shout actions: delete (own shouts) and report */
export function ShoutActions({ shout, onDelete }: ShoutActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * overlay approach — an invisible fixed layer catches any outside click
   * while avoiding Shadow DOM event propagation issues with document listeners
   */
  function handleTriggerClick(event: MouseEvent) {
    event.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  async function handleDelete() {
    setIsOpen(false);
    const confirmed = window.confirm('Delete this shout?');
    if (!confirmed || !onDelete) return;
    await onDelete(shout.permalink);
  }

  function handleReport() {
    setIsOpen(false);
    window.open(shout.permalink, '_blank', 'noopener,noreferrer');
  }

  const showDelete = shout.isDeletable && onDelete !== undefined;

  return (
    <div class="rlfs-shout__actions-menu">
      {isOpen && (
        <div class="rlfs-shout__actions-overlay" onClick={() => setIsOpen(false)} />
      )}
      <button
        class="rlfs-shout__actions-trigger"
        type="button"
        aria-label="Shout actions"
        onClick={handleTriggerClick}
      >
        ⋮
      </button>
      {isOpen && (
        <div class="rlfs-shout__actions-dropdown">
          {showDelete && (
            <button
              class="rlfs-shout__actions-item rlfs-shout__actions-item--danger"
              type="button"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
          <button
            class="rlfs-shout__actions-item"
            type="button"
            onClick={handleReport}
          >
            Report
          </button>
        </div>
      )}
    </div>
  );
}
