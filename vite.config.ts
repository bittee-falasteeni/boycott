import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/boycott/' : '/',
  server: {
    // Fix CORS for audio files in local dev
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
  build: {
    assetsDir: 'assets',
    // Minification re-enabled - code is verified to be in build
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Don't hash image files - keep original names for Phaser runtime loading
          if (assetInfo.name && /\.(png|jpg|jpeg|gif|svg|webp)$/.test(assetInfo.name)) {
            return 'assets/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
})

