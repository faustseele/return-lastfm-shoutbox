/**
 * post a shout to Last.fm by replicating the native form submission.
 * actionUrl: the shoutbox page URL (e.g. /user/X/shoutbox)
 * csrfToken: from the page's hidden input
 * body: the shout text
 * throws on failure.
 */
export async function postShout(actionUrl: string, csrfToken: string, body: string): Promise<void> {
  const response = await fetch(actionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      csrfmiddlewaretoken: csrfToken,
      body,
    }),
  });

  if (!response.ok) {
    console.warn(`post-shout: failed to post — status ${response.status}`);
    throw new Error(`Failed to post shout: ${response.status}`);
  }
}
