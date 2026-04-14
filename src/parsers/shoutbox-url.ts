import { type PageInfo } from './page-type';

/**
 * resolve shoutbox URL from page info
 * users -> /user/{name}/shoutbox
 * music entities -> /music/{...}/+shoutbox
 */
export function resolveShoutboxUrl(pageInfo: PageInfo): string {
  if (pageInfo.type === 'user') {
    return `${pageInfo.pathname}/shoutbox`;
  }
  return `${pageInfo.pathname}/+shoutbox`;
}
