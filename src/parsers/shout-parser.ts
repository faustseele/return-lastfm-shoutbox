export interface Shout {
  id: string;
  author: string;
  authorUrl: string;
  avatarUrl: string;
  /** ISO 8601 datetime from the time element's datetime attribute */
  timestamp: string;
  /** human-readable relative time, e.g. "18 hours ago" */
  relativeTime: string;
  text: string;
  /** true when the shout ID contains :comment: (vs :shoutbox: for top-level) */
  isReply: boolean;
  replies: Shout[];
}

/**
 * extract text from a single required element within a shout container.
 * logs a warning and returns null when the element is missing — allows
 * caller to skip malformed shouts instead of crashing.
 */
function queryText(container: Element, selector: string): string | null {
  const element = container.querySelector(selector);
  if (!element) {
    console.warn(`shout-parser: missing element for selector "${selector}"`, container.id);
    return null;
  }
  return element.textContent?.trim() ?? '';
}

/**
 * extract an attribute from a single required element within a shout container.
 * logs a warning and returns null when the element or attribute is missing.
 */
function queryAttr(container: Element, selector: string, attribute: string): string | null {
  const element = container.querySelector(selector);
  if (!element) {
    console.warn(`shout-parser: missing element for selector "${selector}"`, container.id);
    return null;
  }
  const value = element.getAttribute(attribute);
  if (value === null) {
    console.warn(`shout-parser: missing attribute "${attribute}" on "${selector}"`, container.id);
    return null;
  }
  return value;
}

/**
 * join all paragraph elements from div.shout-body into a single trimmed string.
 * multiple <p> tags are joined with a single space.
 * returns null when div.shout-body is missing.
 */
function extractShoutText(container: Element): string | null {
  const body = container.querySelector('div.shout-body');
  if (!body) {
    console.warn('shout-parser: missing div.shout-body', container.id);
    return null;
  }
  const paragraphs = body.querySelectorAll('p');
  if (paragraphs.length === 0) {
    /** fallback to raw text if Last.fm changes markup to not use <p> tags */
    console.warn('shout-parser: div.shout-body has no <p> elements, falling back to textContent', container.id);
    return body.textContent?.trim() ?? '';
  }
  return Array.from(paragraphs)
    .map((p) => p.textContent?.trim() ?? '')
    .filter((segment) => segment.length > 0)
    .join(' ');
}

/**
 * parse a single li.shout-list-item element into a Shout.
 * scopes field extraction to the item's own div.shout-container to avoid
 * accidentally reading data from deeply nested reply shouts.
 * returns null when required fields are missing.
 */
function parseShoutItem(item: Element): Shout | null {
  const id = item.getAttribute('id');
  if (!id) {
    console.warn('shout-parser: shout-list-item has no id, skipping');
    return null;
  }

  /** scope selectors to the direct shout content, not nested replies */
  const container = item.querySelector(':scope > div.shout-container');
  if (!container) {
    console.warn(`shout-parser: no div.shout-container found for shout id=${id}`);
    return null;
  }

  /** required fields — skip the shout if any of these are missing */
  const author = queryText(container, 'h3.shout-user > a');
  const authorUrl = queryAttr(container, 'h3.shout-user > a', 'href');
  const timestamp = queryAttr(container, 'a.shout-timestamp > time', 'datetime');
  const text = extractShoutText(container);

  if (author === null || authorUrl === null || timestamp === null || text === null) {
    return null;
  }

  /** cosmetic fields — default to empty string if missing */
  const avatarUrl = queryAttr(container, 'span.avatar.shout-user-avatar > img', 'src') ?? '';
  const relativeTime = queryText(container, 'a.shout-timestamp > time') ?? '';

  const isReply = id.includes(':comment:');

  /** recursively parse any direct-child reply list */
  const replyList = item.querySelector(':scope > ul.shout-list');
  const replies = replyList ? parseShoutList(replyList) : [];

  return {
    id,
    author,
    authorUrl,
    avatarUrl,
    timestamp,
    relativeTime,
    text,
    isReply,
    replies,
  };
}

/**
 * parse all li.shout-list-item direct children of a ul.shout-list element.
 * skips items that fail field extraction (already warned inside parseShoutItem).
 */
function parseShoutList(list: Element): Shout[] {
  const items = list.querySelectorAll(':scope > li.shout-list-item');
  const shouts: Shout[] = [];

  for (const item of items) {
    const shout = parseShoutItem(item);
    if (shout !== null) {
      shouts.push(shout);
    }
  }

  return shouts;
}

/**
 * parse shouts from a Document (from DOMParser or jsdom).
 * finds the first top-level ul.shout-list and builds a tree of Shout objects
 * where each entry may contain nested replies.
 */
export function parseShouts(document: Document): Shout[] {
  const list = document.querySelector('ul.shout-list');
  if (!list) {
    console.warn('shout-parser: no ul.shout-list found in document');
    return [];
  }
  return parseShoutList(list);
}
