import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// When building for GitHub Pages, set GITHUB_PAGES=true so assets are served
// from the correct sub-path (https://firepol.github.io/times-tables-game/).
// Leave unset for local dev and Vercel (both serve from root).
const base = process.env.GITHUB_PAGES === 'true' ? '/times-tables-game/' : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'manifest-en.webmanifest', 'manifest-it.webmanifest'],
      // Manifest is provided as static files in public/ (manifest-en.webmanifest, manifest-it.webmanifest)
      // so the app can swap to the locale-appropriate one at runtime.
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
