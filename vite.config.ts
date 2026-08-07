import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * SINGLE_FILE=1 時輸出「單一 HTML 檔」版本（給不想裝任何東西的人）：
 * 關掉 Service Worker、改用 IIFE 打包，再由 tools/make-single-file.mjs
 * 把 CSS / JS 全部塞進 index.html。
 */
const single = process.env.SINGLE_FILE === '1';

export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    sourcemap: !single,
    outDir: single ? 'dist-single' : 'dist',
    rollupOptions: single
      ? { output: { format: 'iife', inlineDynamicImports: true, entryFileNames: 'app.js', assetFileNames: 'app.[ext]' } }
      : {},
  },
  plugins: single
    ? []
    : [
        VitePWA({
          registerType: 'autoUpdate',
          manifest: {
            name: '玄空紫白',
            short_name: '紫白',
            description: '年月日時刻飛星排盤',
            display: 'standalone',
            orientation: 'portrait-primary',
            start_url: './',
            scope: './',
            background_color: '#f4f0e7',
            theme_color: '#f4f0e7',
            icons: [
              { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
              { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,svg,woff2}'],
            navigateFallback: 'index.html',
          },
        }),
      ],
  resolve: single
    ? { alias: { 'virtual:pwa-register': fileURLToPath(new URL('./src/pwa/pwaRegisterStub.ts', import.meta.url)) } }
    : {},
  define: single ? { __SINGLE_FILE__: 'true' } : { __SINGLE_FILE__: 'false' },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
} as any);
