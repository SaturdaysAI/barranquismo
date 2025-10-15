import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Export the Vite configuration tailored for GitHub Pages deployment and PWA support.
export default defineConfig({
  base: '/barranquismo/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: false,
      strategies: 'injectManifest',
      srcDir: 'src/pwa',
      filename: 'service-worker.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,json,png}']
      },
      workbox: {
        cleanupOutdatedCaches: true
      }
    })
  ]
});
