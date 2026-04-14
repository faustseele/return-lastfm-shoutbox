/**
 * delete a shout by POSTing to its permalink URL.
 * sends ajax=1 and X-Requested-With to match Last.fm's native delete behavior.
 * actionUrl: the shout's permalink (e.g. /user/X/shoutbox/{shoutId})
 * csrfToken: from the page's hidden input
 * throws on failure.
 */
export async function deleteShout(actionUrl: string, csrfToken: string): Promise<void> {
  const response = await fetch(actionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: new URLSearchParams({
      csrfmiddlewaretoken: csrfToken,
      ajax: '1',
      confirm: '1',
    }),
  });

  if (!response.ok) {
    console.warn(`delete-shout: failed to delete — status ${response.status}`);
    throw new Error(`Failed to delete shout: ${response.status}`);
  }
}
