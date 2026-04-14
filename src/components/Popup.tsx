import { useState, useEffect } from 'preact/hooks';
import { enabledState } from '@/utils/storage';

interface PopupProps {}

/** popup component — extension on/off toggle */
export function Popup(_props: PopupProps): preact.JSX.Element {
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    enabledState.getValue().then(setEnabled);
  }, []);

  /** toggle enabled state -> persist to storage & update local state */
  async function handleToggle(): Promise<void> {
    const next = !enabled;
    await enabledState.setValue(next);
    setEnabled(next);
  }

  return (
    <div class="popup">
      <h1 class="popup__title">Return Last.fm Shoutbox</h1>
      <button class="popup__toggle" onClick={handleToggle}>
        {enabled ? 'Enabled' : 'Disabled'}
      </button>
    </div>
  );
}
