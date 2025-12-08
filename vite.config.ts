import { defineConfig } from 'vite'
import { copyFileSync, existsSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/boycott/' : '/',
  publicDir: 'public',
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
    minify: false, // Disable minification to preserve console.logs for debugging
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

