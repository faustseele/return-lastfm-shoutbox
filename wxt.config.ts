import { defineConfig } from 'wxt';
import preact from '@preact/preset-vite';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'Return Last.fm Shoutbox',
    description: 'Brings back inline shouts on Last.fm pages',
    host_permissions: ['*://*.last.fm/*'],
    permissions: ['storage'],
  },
  vite: () => ({
    plugins: [preact()],
  }),
});
