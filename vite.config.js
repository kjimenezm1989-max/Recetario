import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'
  const base = isBuild ? '/Recetario/' : '/'

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifestFilename: 'manifest.webmanifest',
        strategies: 'generateSW',
        includeAssets: ['Favicon.png', 'apple-touch-icon.png', 'masked-icon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          name: 'Recetario',
          short_name: 'Recetario',
          description: 'Recetario - Gestión inteligente de recetas y cotizaciones',
          theme_color: '#FDCAE1',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: base,
          start_url: base,
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png'
            },
            {
              src: 'masked-icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,svg,ico,json,webmanifest}'],
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true
        },
        devOptions: {
          enabled: false
        }
      })
    ],
    server: {
      port: 3000,
      host: '0.0.0.0',
      open: false,
      strictPort: false
    }
  }
})