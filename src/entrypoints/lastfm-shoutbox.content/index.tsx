import './style.css';
import { render } from 'preact';
import { App } from '@/components/App';
import { enabledState } from '@/utils/storage';
import { fetchShoutboxData } from '@/utils/fetch-shoutbox';
import { detectPageType } from '@/parsers/page-type';
import { resolveShoutboxUrl } from '@/parsers/shoutbox-url';

export default defineContentScript({
  matches: ['*://*.last.fm/*'],
  cssInjectionMode: 'ui',

  async main(ctx: ContentScriptContext): Promise<void> {
    const isEnabled = await enabledState.getValue();
    if (!isEnabled) return;

    let anchor: Element;
    let fetchUrl: string;
    let shoutboxUrl: string;

    const lazyShoutbox = document.querySelector('div#shoutbox[data-lazy-load-content]');

    if (lazyShoutbox) {
      const partialUrl = lazyShoutbox.getAttribute('data-lazy-load-content');
      if (!partialUrl) return;

      /** block Last.fm's lazy-loader from overwriting our UI */
      lazyShoutbox.removeAttribute('data-lazy-load-content');
      lazyShoutbox.removeAttribute('data-lazy-load-when-on-screen');
      lazyShoutbox.innerHTML = '';

      fetchUrl = partialUrl;
      shoutboxUrl = partialUrl;
      anchor = lazyShoutbox;
    } else {
      const pageInfo = detectPageType(window.location.pathname);
      if (!pageInfo) return;

      shoutboxUrl = resolveShoutboxUrl(pageInfo);
      fetchUrl = shoutboxUrl;

      const secondaryNav = document.querySelector('nav.secondary-nav');
      if (!secondaryNav) return;

      const container = document.createElement('div');
      secondaryNav.insertAdjacentElement('afterend', container);
      anchor = container;
    }

    const shoutboxData = await fetchShoutboxData(fetchUrl);

    const ui = await createShadowRootUi(ctx, {
      name: 'lastfm-shoutbox',
      position: 'inline',
      anchor,
      onMount(container) {
        const wrapper = document.createElement('div');
        container.append(wrapper);
        render(<App shoutboxData={shoutboxData} shoutboxUrl={shoutboxUrl} />, wrapper);
        return wrapper;
      },
      onRemove(wrapper) {
        if (wrapper) {
          render(null, wrapper);
        }
      },
    });

    ui.mount();
  },
});
