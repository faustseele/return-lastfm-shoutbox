import './style.css';
import { render } from 'preact';
import { App } from '@/components/App';
import { enabledState } from '@/utils/storage';

export default defineContentScript({
  matches: ['*://*.last.fm/*'],
  cssInjectionMode: 'ui',

  async main(ctx: ContentScriptContext): Promise<void> {
    const isEnabled = await enabledState.getValue();
    if (!isEnabled) return;

    const ui = await createShadowRootUi(ctx, {
      name: 'lastfm-shoutbox',
      position: 'inline',
      anchor: 'body',
      onMount(container) {
        const wrapper = document.createElement('div');
        container.append(wrapper);
        render(<App />, wrapper);
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
