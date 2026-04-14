import { describe, it, expect } from 'vitest';
import { detectPageType } from '../page-type';

describe('detectPageType', () => {
  describe('artist pages', () => {
    it('detects plain artist', () => {
      expect(detectPageType('/music/Radiohead')).toEqual({
        type: 'artist',
        pathname: '/music/Radiohead',
      });
    });

    it('detects artist with + in name', () => {
      expect(detectPageType('/music/The+Beatles')).toEqual({
        type: 'artist',
        pathname: '/music/The+Beatles',
      });
    });

    it('detects artist with URL-encoded characters', () => {
      expect(detectPageType('/music/Bj%C3%B6rk')).toEqual({
        type: 'artist',
        pathname: '/music/Bj%C3%B6rk',
      });
    });
  });

  describe('album pages', () => {
    it('detects album', () => {
      expect(detectPageType('/music/Radiohead/OK+Computer')).toEqual({
        type: 'album',
        pathname: '/music/Radiohead/OK+Computer',
      });
    });

    it('detects another album', () => {
      expect(detectPageType('/music/Radiohead/The+Bends')).toEqual({
        type: 'album',
        pathname: '/music/Radiohead/The+Bends',
      });
    });
  });

  describe('track pages', () => {
    it('detects track', () => {
      expect(detectPageType('/music/Radiohead/_/Creep')).toEqual({
        type: 'track',
        pathname: '/music/Radiohead/_/Creep',
      });
    });

    it('detects track with + in name', () => {
      expect(detectPageType('/music/Radiohead/_/Everything+in+Its+Right+Place')).toEqual({
        type: 'track',
        pathname: '/music/Radiohead/_/Everything+in+Its+Right+Place',
      });
    });
  });

  describe('user pages', () => {
    it('detects user', () => {
      expect(detectPageType('/user/RJ')).toEqual({
        type: 'user',
        pathname: '/user/RJ',
      });
    });

    it('detects user with dashes and numbers', () => {
      expect(detectPageType('/user/some-user-123')).toEqual({
        type: 'user',
        pathname: '/user/some-user-123',
      });
    });
  });

  describe('unicode and special character paths', () => {
    it('detects artist with literal unicode in name', () => {
      expect(detectPageType('/music/Björk')).toEqual({
        type: 'artist',
        pathname: '/music/Björk',
      });
    });

    it('detects user with underscores and numbers', () => {
      expect(detectPageType('/user/user-name_123')).toEqual({
        type: 'user',
        pathname: '/user/user-name_123',
      });
    });
  });

  describe('null cases', () => {
    it('returns null for root', () => {
      expect(detectPageType('/')).toBeNull();
    });

    it('returns null for /charts', () => {
      expect(detectPageType('/charts')).toBeNull();
    });

    it('returns null for /tag/rock', () => {
      expect(detectPageType('/tag/rock')).toBeNull();
    });

    it('returns null for user shoutbox sub-path', () => {
      expect(detectPageType('/user/RJ/shoutbox')).toBeNull();
    });

    it('returns null for user library sub-path', () => {
      expect(detectPageType('/user/RJ/library')).toBeNull();
    });

    it('returns null for /music alone', () => {
      expect(detectPageType('/music')).toBeNull();
    });

    it('returns null for /settings', () => {
      expect(detectPageType('/settings')).toBeNull();
    });

    it('returns null for /about', () => {
      expect(detectPageType('/about')).toBeNull();
    });

    it('returns null for /inbox', () => {
      expect(detectPageType('/inbox')).toBeNull();
    });

    it('returns null for /friends', () => {
      expect(detectPageType('/friends')).toBeNull();
    });

    it('returns null for artist +shoutbox page', () => {
      expect(detectPageType('/music/Radiohead/+shoutbox')).toBeNull();
    });

    it('returns null for artist +wiki page', () => {
      expect(detectPageType('/music/Radiohead/+wiki')).toBeNull();
    });

    it('returns null for artist +listeners page', () => {
      expect(detectPageType('/music/Radiohead/+listeners')).toBeNull();
    });

    it('returns null for generic artist +listeners sub-path', () => {
      expect(detectPageType('/music/artist/+listeners')).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('strips trailing slash from artist', () => {
      expect(detectPageType('/music/Radiohead/')).toEqual({
        type: 'artist',
        pathname: '/music/Radiohead',
      });
    });

    it('strips trailing slash from user', () => {
      expect(detectPageType('/user/RJ/')).toEqual({
        type: 'user',
        pathname: '/user/RJ',
      });
    });

    it('strips trailing slash from track', () => {
      expect(detectPageType('/music/Radiohead/_/Creep/')).toEqual({
        type: 'track',
        pathname: '/music/Radiohead/_/Creep',
      });
    });
  });
});
