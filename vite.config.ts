import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/*.png'],
        manifest: {
          name: 'RDV Salon',
          short_name: 'RDV Salon',
          description: "Application de gestion d'agenda et réservation de rendez-vous pour salons de coiffure et beauté.",
          lang: 'fr',
          start_url: '/app',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#FFFDF5',
          theme_color: '#111111',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'Agenda',
              url: '/app/agenda',
              description: 'Consulter le planning et les rendez-vous',
            },
            {
              name: 'Nouveau rendez-vous',
              url: '/app/rendez-vous/nouveau',
              description: 'Ajouter un nouveau rendez-vous',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: null,
          runtimeCaching: [
            // RÈGLE STRICTE : Requêtes Supabase, API et réservation JAMAIS en cache (NetworkOnly)
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /\/api\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /\/s\/[a-zA-Z0-9_-]+\/book/i,
              handler: 'NetworkOnly',
            },
            // Polices distantes Google Fonts en CacheFirst
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 25,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 an
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
