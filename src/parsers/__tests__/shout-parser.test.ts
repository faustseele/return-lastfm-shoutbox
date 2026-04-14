// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { parseShouts } from '../shout-parser';

/** load an HTML fixture file and parse it into a Document via jsdom's DOMParser */
function loadFixture(name: string): Document {
  const fixturePath = join(__dirname, 'fixtures', name);
  const html = readFileSync(fixturePath, 'utf-8');
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('parseShouts', () => {
  describe('user-shoutbox fixture', () => {
    const document = loadFixture('user-shoutbox.html');
    const shouts = parseShouts(document);

    it('returns the correct number of top-level shouts', () => {
      expect(shouts).toHaveLength(2);
    });

    describe('first top-level shout (nohighs)', () => {
      const shout = shouts[0];

      it('extracts the id', () => {
        expect(shout.id).toBe('27309121:shoutbox:86084cab-3b07-4dc7-a3ea-f04b6db42803');
      });

      it('extracts the author', () => {
        expect(shout.author).toBe('nohighs');
      });

      it('extracts the authorUrl', () => {
        expect(shout.authorUrl).toBe('/user/nohighs');
      });

      it('extracts the avatarUrl', () => {
        expect(shout.avatarUrl).toBe(
          'https://lastfm.freetls.fastly.net/i/u/avatar70s/12a5a5303daf2e29aac248aa7899e8f7.png',
        );
      });

      it('extracts the ISO timestamp', () => {
        expect(shout.timestamp).toBe('2026-04-13T22:02:31+02:00');
      });

      it('extracts the relative time and trims whitespace', () => {
        expect(shout.relativeTime).toBe('18 hours ago');
      });

      it('extracts and trims the shout text', () => {
        expect(shout.text).toBe("hi why can't i edit tracks anymore?");
      });

      it('extracts the permalink href', () => {
        expect(shout.permalink).toBe(
          '/user/LAST.HQ/shoutbox/27309121:shoutbox:86084cab-3b07-4dc7-a3ea-f04b6db42803',
        );
      });

      it('marks top-level shout as not a reply', () => {
        expect(shout.isReply).toBe(false);
      });

      it('has no replies', () => {
        expect(shout.replies).toHaveLength(0);
      });

      it('extracts the vote count from the initially-visible vote button', () => {
        expect(shout.voteCount).toBe(3);
      });
    });

    describe('second top-level shout (homework) with a reply', () => {
      const shout = shouts[1];

      it('extracts the id', () => {
        expect(shout.id).toBe('2107690:shoutbox:cd6c2318-3016-46e7-96d5-ce9c38c6d446');
      });

      it('extracts the author', () => {
        expect(shout.author).toBe('homework');
      });

      it('extracts the permalink href', () => {
        expect(shout.permalink).toBe(
          '/user/LAST.HQ/shoutbox/2107690:shoutbox:cd6c2318-3016-46e7-96d5-ce9c38c6d446',
        );
      });

      it('marks as not a reply', () => {
        expect(shout.isReply).toBe(false);
      });

      it('has one reply', () => {
        expect(shout.replies).toHaveLength(1);
      });

      it('defaults voteCount to 0 when vote button is absent', () => {
        expect(shout.voteCount).toBe(0);
      });

      describe('nested reply (mercuriie)', () => {
        const reply = shout.replies[0];

        it('extracts the reply id', () => {
          expect(reply.id).toBe('2107690:comment:70caf749-9d11-4618-bb55-5ebecb383381');
        });

        it('extracts the reply author', () => {
          expect(reply.author).toBe('mercuriie');
        });

        it('extracts the reply authorUrl', () => {
          expect(reply.authorUrl).toBe('/user/mercuriie');
        });

        it('extracts the reply avatarUrl', () => {
          expect(reply.avatarUrl).toBe(
            'https://lastfm.freetls.fastly.net/i/u/avatar70s/d5720dac5c13098e6bd238f115cd7aaa.png',
          );
        });

        it('extracts the reply ISO timestamp', () => {
          expect(reply.timestamp).toBe('2026-04-03T10:54:29+02:00');
        });

        it('extracts and trims the reply relative time', () => {
          expect(reply.relativeTime).toBe('3 Apr 10:54am');
        });

        it('extracts and trims the reply text', () => {
          expect(reply.text).toBe('upvote this !!');
        });

        it('extracts the reply permalink href', () => {
          expect(reply.permalink).toBe(
            '/user/LAST.HQ/shoutbox/2107690:shoutbox:cd6c2318-3016-46e7-96d5-ce9c38c6d446/2107690:comment:70caf749-9d11-4618-bb55-5ebecb383381#2107690:comment:70caf749-9d11-4618-bb55-5ebecb383381',
          );
        });

        it('marks the reply isReply as true', () => {
          expect(reply.isReply).toBe(true);
        });

        it('reply has no further nested replies', () => {
          expect(reply.replies).toHaveLength(0);
        });
      });
    });
  });

  describe('empty-shoutbox fixture', () => {
    it('returns an empty array for an empty shout list', () => {
      const document = loadFixture('empty-shoutbox.html');
      const shouts = parseShouts(document);
      expect(shouts).toEqual([]);
    });
  });

  describe('single shout fixture', () => {
    const document = loadFixture('shoutbox-single-shout.html');
    const shouts = parseShouts(document);

    it('returns an array of length 1', () => {
      expect(shouts).toHaveLength(1);
    });

    it('parses the shout id correctly', () => {
      expect(shouts[0].id).toBe('12345678:shoutbox:aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    });

    it('extracts the permalink href', () => {
      expect(shouts[0].permalink).toBe(
        '/user/LAST.HQ/shoutbox/12345678:shoutbox:aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      );
    });

    it('marks as not a reply', () => {
      expect(shouts[0].isReply).toBe(false);
    });

    it('has no replies', () => {
      expect(shouts[0].replies).toHaveLength(0);
    });
  });

  describe('special characters fixture', () => {
    const document = loadFixture('shoutbox-special-chars.html');
    const shouts = parseShouts(document);

    it('returns two shouts', () => {
      expect(shouts).toHaveLength(2);
    });

    describe('first shout — HTML entities and unicode', () => {
      it('decodes HTML entities in shout text', () => {
        /** browser DOMParser decodes &amp; &#39; &lt; etc. before textContent is read */
        expect(shouts[0].text).toContain('&');
        expect(shouts[0].text).toContain("'");
        expect(shouts[0].text).toContain('<');
      });

      it('preserves unicode characters in shout text', () => {
        expect(shouts[0].text).toContain('Björk');
        expect(shouts[0].text).toContain('café');
        expect(shouts[0].text).toContain('🎵');
      });

      it('parses author with hyphens and numbers', () => {
        expect(shouts[0].author).toBe('user-123');
      });

      it('parses authorUrl with hyphens and numbers', () => {
        expect(shouts[0].authorUrl).toBe('/user/user-123');
      });
    });

    describe('second shout — multi-paragraph body', () => {
      it('joins multiple paragraphs with a space', () => {
        expect(shouts[1].text).toBe('first paragraph of the shout second paragraph of the shout');
      });
    });
  });

  describe('missing avatar fixture', () => {
    const document = loadFixture('shoutbox-no-avatar.html');
    const shouts = parseShouts(document);

    it('does not skip the shout when img src is empty', () => {
      expect(shouts).toHaveLength(1);
    });

    it('returns empty string for avatarUrl', () => {
      expect(shouts[0].avatarUrl).toBe('');
    });

    it('still parses author and text correctly', () => {
      expect(shouts[0].author).toBe('noavataruser');
      expect(shouts[0].text).toBe('shout from a user with no avatar');
    });
  });

  describe('edge cases', () => {
    it('returns empty array when no ul.shout-list exists in document', () => {
      const document = new DOMParser().parseFromString('<div></div>', 'text/html');
      const shouts = parseShouts(document);
      expect(shouts).toEqual([]);
    });

    it('trims leading/trailing whitespace from shout text', () => {
      const html = `
        <ul class="shout-list js-shout-list">
          <li id="1:shoutbox:abc" class="shout-list-item">
            <div class="shout-container">
              <div class="shout">
                <h3 class="shout-user"><a href="/user/test">test</a></h3>
                <span class="avatar shout-user-avatar"><img src="https://example.com/img.png"></span>
                <a class="shout-permalink shout-timestamp" href="/user/test/shoutbox/1:shoutbox:abc">
                  <time datetime="2026-01-01T00:00:00+00:00">  1 hour ago  </time>
                </a>
                <div class="shout-body"><p>   hello world   </p></div>
              </div>
            </div>
          </li>
        </ul>
      `;
      const document = new DOMParser().parseFromString(html, 'text/html');
      const shouts = parseShouts(document);
      expect(shouts[0].text).toBe('hello world');
      expect(shouts[0].relativeTime).toBe('1 hour ago');
    });
  });
});
