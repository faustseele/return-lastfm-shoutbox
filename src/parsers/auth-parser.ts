export type AuthState = 'guest' | 'logged-in';

/**
 * detect whether the user is logged in or a guest.
 * guest: div.shouting-unavailable is present
 * logged-in: div.shouting-unavailable is absent
 */
export function parseAuthState(document: Document): AuthState {
  const guestBanner = document.querySelector('div.shouting-unavailable');
  return guestBanner ? 'guest' : 'logged-in';
}
