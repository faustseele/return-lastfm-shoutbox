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
  /** relative URL to this shout's permalink page, used as the POST target for replies */
  permalink: string;
  /** true when the shout ID contains :comment: (vs :shoutbox: for top-level) */
  isReply: boolean;
  replies: Shout[];
  /** number of up-votes; cosmetic — defaults to 0 when the vote button is absent */
  voteCount: number;
  /** true when the logged-in user owns this shout — detected by presence of form.js-delete-shout */
  isDeletable: boolean;
}

/** extract text from a single element; returns null when missing */
function queryText(container: Element, selector: string): string | null {
  const element = container.querySelector(selector);
  if (!element) return null;
  return element.textContent?.trim() ?? '';
}

/** extract an attribute from a single element; returns null when missing */
function queryAttr(container: Element, selector: string, attribute: string): string | null {
  const element = container.querySelector(selector);
  if (!element) return null;
  const value = element.getAttribute(attribute);
  if (value === null) return null;
  return value;
}

/**
 * join all paragraph elements from div.shout-body into a single trimmed string.
 * returns null when div.shout-body is missing.
 */
function extractShoutText(container: Element): string | null {
  const body = container.querySelector('div.shout-body');
  if (!body) return null;
  const paragraphs = body.querySelectorAll('p');
  if (paragraphs.length === 0) {
    return body.textContent?.trim() ?? '';
  }
  return Array.from(paragraphs)
    .map((p) => p.textContent?.trim() ?? '')
    .filter((segment) => segment.length > 0)
    .join(' ');
}

/**
 * parse a single li.shout-list-item element into a Shout.
 * silently returns null for template/spacer items that lack shout content —
 * the full shoutbox page has these and they're expected, not errors.
 */
function parseShoutItem(item: Element): Shout | null {
  const id = item.getAttribute('id');
  if (!id) return null;

  const container = item.querySelector(':scope > div.shout-container');
  if (!container) return null;

  /** required fields — skip the item silently if any are missing */
  const author = queryText(container, 'h3.shout-user > a');
  const authorUrl = queryAttr(container, 'h3.shout-user > a', 'href');
  const timestamp = queryAttr(container, 'a.shout-timestamp > time', 'datetime');
  const permalink = queryAttr(container, 'a.shout-permalink', 'href');
  const text = extractShoutText(container);

  if (author === null || authorUrl === null || timestamp === null || permalink === null || text === null) {
    return null;
  }

  /** cosmetic fields — default to empty string if missing */
  const avatarUrl = queryAttr(container, 'span.avatar.shout-user-avatar > img', 'src') ?? '';
  const relativeTime = queryText(container, 'a.shout-timestamp > time') ?? '';

  /** vote count from the initially-visible vote button; cosmetic, defaults to 0 */
  const voteButtonElement = container.querySelector('div.vote-button-wrapper.initially-visible a.vote-button');
  const voteCountRaw = voteButtonElement?.textContent?.trim() ?? '';
  const voteCountParsed = parseInt(voteCountRaw, 10);
  const voteCount = Number.isNaN(voteCountParsed) ? 0 : voteCountParsed;

  /** cosmetic — server only renders this form when the logged-in user owns the shout */
  const isDeletable = container.querySelector('form.js-delete-shout') !== null;

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
    permalink,
    isReply,
    replies,
    voteCount,
    isDeletable,
  };
}

/**
 * parse all li.shout-list-item direct children of a ul.shout-list element.
 * silently skips items that don't contain actual shout content.
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
