import { storage } from 'wxt/utils/storage';

export const enabledState = storage.defineItem<boolean>('local:enabled', {
  fallback: true,
});
