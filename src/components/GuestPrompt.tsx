interface GuestPromptProps {
  shoutboxUrl: string;
}

/** login/join banner shown to unauthenticated users above the shout list */
export function GuestPrompt({ shoutboxUrl }: GuestPromptProps) {
  const loginUrl = `/login?next=${encodeURIComponent(shoutboxUrl)}`;
  const joinUrl = `/join?next=${encodeURIComponent(shoutboxUrl)}`;

  return (
    <div class="rlfs-guest-prompt">
      <p>
        <a href={loginUrl}>Log in</a> or <a href={joinUrl}>join Last.fm</a> to leave a shout.
      </p>
    </div>
  );
}
