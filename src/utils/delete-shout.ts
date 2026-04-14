/**
 * delete a shout by POSTing to its permalink URL.
 * identical pattern to postVote — only the CSRF token is required in the body.
 * actionUrl: the shout's permalink (e.g. /user/X/shoutbox/{shoutId})
 * csrfToken: from the page's hidden input
 * throws on failure.
 */
export async function deleteShout(actionUrl: string, csrfToken: string): Promise<void> {
  const response = await fetch(actionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      csrfmiddlewaretoken: csrfToken,
    }),
  });

  if (!response.ok) {
    console.warn(`delete-shout: failed to delete — status ${response.status}`);
    throw new Error(`Failed to delete shout: ${response.status}`);
  }
}
