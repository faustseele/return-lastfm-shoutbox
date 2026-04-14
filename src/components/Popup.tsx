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

  /** send reload message to the active tab's content script */
  async function handleReload(): Promise<void> {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (!activeTab?.id) return;
    await browser.tabs.sendMessage(activeTab.id, { type: 'reload-shoutbox' });
    /** refresh status after a short delay */
    setTimeout(async () => {
      const newStatus = await lastStatus.getValue();
      setStatus(newStatus);
    }, 2000);
  }

  return (
    <div class="popup">
      <h1 class="popup__title">Return Last.fm Shoutbox</h1>
      <button class="popup__toggle" onClick={handleToggle}>
        {enabled ? 'Enabled' : 'Disabled'}
      </button>
      <button class="popup__reload" onClick={handleReload}>
        Reload shoutbox
      </button>
      {status && (
        <div class={`popup__status ${isError ? 'popup__status--error' : ''}`}>
          {status}
        </div>
      )}
    </div>
  );
}
