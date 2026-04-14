import { storage } from 'wxt/utils/storage';

export const enabledState = storage.defineItem<boolean>('local:enabled', {
  fallback: true,
});

/** last status message from content script — shown in popup */
export const lastStatus = storage.defineItem<string>('local:lastStatus', {
  fallback: '',
});
