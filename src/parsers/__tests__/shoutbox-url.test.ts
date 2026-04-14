import { describe, it, expect } from 'vitest';
import { resolveShoutboxUrl } from '../shoutbox-url';
import { type PageInfo } from '../page-type';

describe('resolveShoutboxUrl', () => {
  it('resolves user shoutbox URL', () => {
    const pageInfo: PageInfo = { type: 'user', pathname: '/user/RJ' };
    expect(resolveShoutboxUrl(pageInfo)).toBe('/user/RJ/shoutbox');
  });

  it('resolves artist shoutbox URL', () => {
    const pageInfo: PageInfo = { type: 'artist', pathname: '/music/Radiohead' };
    expect(resolveShoutboxUrl(pageInfo)).toBe('/music/Radiohead/+shoutbox');
  });

  it('resolves album shoutbox URL', () => {
    const pageInfo: PageInfo = { type: 'album', pathname: '/music/Radiohead/OK+Computer' };
    expect(resolveShoutboxUrl(pageInfo)).toBe('/music/Radiohead/OK+Computer/+shoutbox');
  });

  it('resolves track shoutbox URL', () => {
    const pageInfo: PageInfo = { type: 'track', pathname: '/music/Radiohead/_/Creep' };
    expect(resolveShoutboxUrl(pageInfo)).toBe('/music/Radiohead/_/Creep/+shoutbox');
  });
});
