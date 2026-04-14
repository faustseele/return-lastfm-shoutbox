/**
 * extract the CSRF token from any form on the shoutbox page.
 * looks for the first input[name="csrfmiddlewaretoken"] element.
 * returns null if no token found.
 */
export function parseCsrfToken(document: Document): string | null {
  const input = document.querySelector('input[name="csrfmiddlewaretoken"]');
  if (!input) {
    console.warn('csrf-parser: no csrfmiddlewaretoken input found');
    return null;
  }
  const value = input.getAttribute('value');
  if (!value) {
    console.warn('csrf-parser: csrfmiddlewaretoken input has no value');
    return null;
  }
  return value;
}
