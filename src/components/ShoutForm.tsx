import { useState } from 'preact/hooks';

interface ShoutFormProps {
  onSubmit: (text: string) => Promise<void>;
  isSubmitting: boolean;
}

/** form for composing & submitting a new shout */
export function ShoutForm({ onSubmit, isSubmitting }: ShoutFormProps) {
  const [text, setText] = useState('');

  async function handleSubmit(event: Event) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSubmitting) return;
    await onSubmit(trimmed);
    setText('');
  }

  const isEmpty = text.trim().length === 0;

  return (
    <form class="rlfs-shout-form" onSubmit={handleSubmit}>
      <textarea
        class="rlfs-shout-form__input"
        placeholder="Write a shout..."
        value={text}
        onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
        disabled={isSubmitting}
        rows={3}
      />
      <button
        class="rlfs-shout-form__submit"
        type="submit"
        disabled={isEmpty || isSubmitting}
      >
        {isSubmitting ? 'Posting...' : 'Shout!'}
      </button>
    </form>
  );
}
