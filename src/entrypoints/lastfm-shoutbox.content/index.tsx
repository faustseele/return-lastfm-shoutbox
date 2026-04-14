import './style.css';
import { render } from 'preact';
import { App } from '@/components/App';
import { enabledState, lastStatus } from '@/utils/storage';
import { fetchShoutboxData } from '@/utils/fetch-shoutbox';
import { detectPageType } from '@/parsers/page-type';
import { resolveShoutboxUrl } from '@/parsers/shoutbox-url';

/** wait for a DOM element to appear, using MutationObserver with a timeout */
function waitForElement(selector: string, timeoutMs: number, signal: AbortSignal): Promise<Element | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        clearTimeout(timeout);
        resolve(element);
      }
    });

    const timeout = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutMs);

    signal.addEventListener('abort', () => {
      observer.disconnect();
      clearTimeout(timeout);
      resolve(null);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
}

export default defineContentScript({
  matches: ['*://*.last.fm/*'],
  cssInjectionMode: 'ui',

  async main(ctx: ContentScriptContext): Promise<void> {
    const isEnabled = await enabledState.getValue();
    if (!isEnabled) return;

    let currentUi: ShadowRootContentScriptUi<HTMLDivElement> | null = null;
    let currentErrorIndicator: HTMLElement | null = null;
    let inFlightAbort: AbortController | null = null;

    async function injectShoutbox(): Promise<void> {
      /** abort any in-flight injection from a previous navigation */
      if (inFlightAbort) inFlightAbort.abort();
      const abort = new AbortController();
      inFlightAbort = abort;

      /** clear stale status from previous page */
      await lastStatus.setValue('');

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
      let joinButton = document.querySelector('a.btn-shouts-join');

      /** on SPA navigation, Last.fm renders the page async — wait for the join button to appear */
      if (!lazyShoutbox && !joinButton && pageInfo) {
        joinButton = await waitForElement('a.btn-shouts-join', 5000, abort.signal);
        if (abort.signal.aborted) return;
      }

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
        /** show loading indicator immediately while fetching */
        container.textContent = 'Loading shoutbox...';
        container.style.cssText = 'padding:12px 0;color:#999;font-size:13px;font-family:sans-serif;';
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
        if (abort.signal.aborted) return;

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
        if (abort.signal.aborted) return;
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
        } else if (usedJoinButton && createdContainer) {
          /** show error inline where the loading indicator was */
          createdContainer.textContent = `Shoutbox failed to load: ${message}`;
          createdContainer.style.cssText = 'padding:8px 12px;margin:8px 0;font-size:12px;color:#b35900;background:#fff8f0;border:1px solid #ffe0b2;border-radius:4px;text-align:center;font-family:sans-serif;';
          currentErrorIndicator = createdContainer;
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

    /** listen for reload message from popup */
    browser.runtime.onMessage.addListener((message: unknown) => {
      const msg = message as { type?: string };
      if (msg.type === 'reload-shoutbox') {
        injectShoutbox();
      }
    });
  },
});
