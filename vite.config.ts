import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PURRINT',
        short_name: 'PURRINT',
        description: 'Print on a thermal printer',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'src/assets/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
});
