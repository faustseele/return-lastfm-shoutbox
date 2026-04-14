interface LoadMoreButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

/** "load more" trigger — disabled & labelled during fetch */
export function LoadMoreButton({ isLoading, onClick }: LoadMoreButtonProps) {
  return (
    <button class="rlfs-load-more" onClick={onClick} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Load more'}
    </button>
  );
}
