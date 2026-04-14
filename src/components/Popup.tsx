import { useState, useEffect } from 'preact/hooks';
import { enabledState, lastStatus } from '@/utils/storage';

/** popup component — extension on/off toggle + status display */
export function Popup() {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    enabledState.getValue().then(setEnabled);
    lastStatus.getValue().then(setStatus);
  }, []);

  async function handleToggle(): Promise<void> {
    const next = !enabled;
    await enabledState.setValue(next);
    setEnabled(next);
  }

  const isError = status.startsWith('Error:');

  return (
    <div class="popup">
      <h1 class="popup__title">Return Last.fm Shoutbox</h1>
      <button class="popup__toggle" onClick={handleToggle}>
        {enabled ? 'Enabled' : 'Disabled'}
      </button>
      {status && (
        <div class={`popup__status ${isError ? 'popup__status--error' : ''}`}>
          {status}
        </div>
      )}
    </div>
  );
}
