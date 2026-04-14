import './style.css';
import { render } from 'preact';
import { App } from '@/components/App';
import { enabledState, lastStatus } from '@/utils/storage';
import { fetchShoutboxData } from '@/utils/fetch-shoutbox';
import { detectPageType } from '@/parsers/page-type';
import { resolveShoutboxUrl } from '@/parsers/shoutbox-url';

export default defineContentScript({
  matches: ['*://*.last.fm/*'],
  cssInjectionMode: 'ui',

  async main(ctx: ContentScriptContext): Promise<void> {
    const isEnabled = await enabledState.getValue();
    if (!isEnabled) return;

    let currentUi: ShadowRootContentScriptUi<HTMLDivElement> | null = null;
    let currentErrorIndicator: HTMLElement | null = null;

    async function injectShoutbox(): Promise<void> {
      /** clean up previous injection */
      if (currentUi) {
        currentUi.remove();
        currentUi = null;
      }
      if (currentErrorIndicator) {
        currentErrorIndicator.remove();
        currentErrorIndicator = null;
      }

      /** skip user pages — they already have inline shoutboxes */
      const pageInfo = detectPageType(window.location.pathname);
      if (pageInfo?.type === 'user') return;

      let anchor: Element;
      let fetchUrl: string;
      let shoutboxUrl: string;

      /** track which path we took so the catch block knows how to restore */
      let usedLazyPath = false;
      let savedInnerHtml = '';
      let savedLazyLoadContent = '';
      let savedLazyLoadWhenOnScreen: string | null = null;
      let usedJoinButton = false;
      let savedJoinButton: Element | null = null;
      let createdContainer: Element | null = null;

      const lazyShoutbox = document.querySelector('div#shoutbox[data-lazy-load-content]');
      const joinButton = document.querySelector('a.btn-shouts-join');

      if (lazyShoutbox) {
        /** user pages (legacy) — intercept the lazy-loader */
        const partialUrl = lazyShoutbox.getAttribute('data-lazy-load-content');
        if (!partialUrl) return;

        savedInnerHtml = lazyShoutbox.innerHTML;
        savedLazyLoadContent = partialUrl;
        savedLazyLoadWhenOnScreen = lazyShoutbox.getAttribute('data-lazy-load-when-on-screen');

        lazyShoutbox.removeAttribute('data-lazy-load-content');
        lazyShoutbox.removeAttribute('data-lazy-load-when-on-screen');
        lazyShoutbox.innerHTML = '';

        fetchUrl = partialUrl;
        shoutboxUrl = partialUrl.replace('/partial/', '/');
        anchor = lazyShoutbox;
        usedLazyPath = true;
      } else if (joinButton) {
        /** artist/album/track pages — replace the "Join the conversation" button */
        const href = joinButton.getAttribute('href');
        if (!href) return;

        shoutboxUrl = href;
        fetchUrl = href;

        savedJoinButton = joinButton;

        const container = document.createElement('div');
        joinButton.replaceWith(container);
        anchor = container;
        usedJoinButton = true;
        createdContainer = container;
      } else {
        /** last resort — try page type detection */
        if (!pageInfo) return;
        shoutboxUrl = resolveShoutboxUrl(pageInfo);
        fetchUrl = shoutboxUrl;

        const insertionPoint = document.querySelector('nav.secondary-nav') ?? document.querySelector('.page-content');
        if (!insertionPoint) {
          console.warn('lastfm-shoutbox: no injection point found on page');
          return;
        }

        const container = document.createElement('div');
        insertionPoint.insertAdjacentElement('afterend', container);
        anchor = container;
        createdContainer = container;
      }

      try {
        const shoutboxData = await fetchShoutboxData(fetchUrl);

        const ui = await createShadowRootUi(ctx, {
          name: 'lastfm-shoutbox',
          position: 'inline',
          anchor,
          onMount(container) {
            const wrapper = document.createElement('div');
            container.append(wrapper);
            render(<App initialData={shoutboxData} fetchUrl={fetchUrl} shoutboxUrl={shoutboxUrl} />, wrapper);
            return wrapper;
          },
          onRemove(wrapper) {
            if (wrapper) {
              render(null, wrapper);
            }
          },
        });

        ui.mount();
        currentUi = ui;
        await lastStatus.setValue(`Active on ${window.location.pathname}`);
      } catch (error) {
        console.warn('lastfm-shoutbox: failed to load shoutbox', error);
        const message = error instanceof Error ? error.message : 'unknown error';
        await lastStatus.setValue(`Error: ${message}`);

        if (usedLazyPath) {
          /** restore original container so Last.fm's native lazy-loader can take over */
          lazyShoutbox!.innerHTML = savedInnerHtml;
          lazyShoutbox!.setAttribute('data-lazy-load-content', savedLazyLoadContent);
          if (savedLazyLoadWhenOnScreen !== null) {
            lazyShoutbox!.setAttribute('data-lazy-load-when-on-screen', savedLazyLoadWhenOnScreen);
          }

          /** inline styles since this element lives in the real DOM, not Shadow DOM */
          const errorIndicator = document.createElement('div');
          errorIndicator.textContent = 'Shoutbox extension encountered an error';
          errorIndicator.style.cssText = 'padding:8px 12px;margin:8px 0;font-size:12px;color:#b35900;background:#fff8f0;border:1px solid #ffe0b2;border-radius:4px;text-align:center;font-family:sans-serif;';
          lazyShoutbox!.insertAdjacentElement('afterend', errorIndicator);
          currentErrorIndicator = errorIndicator;
        } else if (usedJoinButton && savedJoinButton && createdContainer) {
          /** restore the original "Join the conversation" button */
          createdContainer.replaceWith(savedJoinButton);

          const errorIndicator = document.createElement('div');
          errorIndicator.textContent = 'Shoutbox extension encountered an error';
          errorIndicator.style.cssText = 'padding:8px 12px;margin:8px 0;font-size:12px;color:#b35900;background:#fff8f0;border:1px solid #ffe0b2;border-radius:4px;text-align:center;font-family:sans-serif;';
          savedJoinButton.insertAdjacentElement('afterend', errorIndicator);
          currentErrorIndicator = errorIndicator;
        } else if (createdContainer) {
          createdContainer.remove();
        }
      }
    }

    await injectShoutbox();

    /** re-inject on client-side navigation — wxt:locationchange catches pushState/replaceState */
    ctx.addEventListener(window, 'wxt:locationchange', () => {
      injectShoutbox();
    });
  },
});
