export type PageType = 'artist' | 'album' | 'track' | 'user';

export interface PageInfo {
  type: PageType;
  pathname: string;
}

/**
 * detect Last.fm page type from URL pathname
 * returns null for pages without shoutboxes (charts, tags, settings, etc.)
 */
export function detectPageType(pathname: string): PageInfo | null {
  const cleaned = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const segments = cleaned.split('/');
  // segments[0] is always '' because pathname starts with '/'

  const section = segments[1];

  if (section === 'user') {
    // exactly /user/{name} — no sub-paths
    if (segments.length !== 3) return null;
    return { type: 'user', pathname: cleaned };
  }

  if (section === 'music') {
    // /music alone is not a page
    if (segments.length < 3) return null;

    if (segments.length === 3) {
      // /music/{artist}
      return { type: 'artist', pathname: cleaned };
    }

    if (segments.length === 4) {
      const albumSegment = segments[3];
      // filter out special pages (+shoutbox, +wiki, +listeners, etc.) and the _ separator
      if (albumSegment.startsWith('+') || albumSegment === '_') return null;
      return { type: 'album', pathname: cleaned };
    }

    if (segments.length === 5) {
      // /music/{artist}/_/{track}
      if (segments[3] !== '_') return null;
      return { type: 'track', pathname: cleaned };
    }
  }

  return null;
}
