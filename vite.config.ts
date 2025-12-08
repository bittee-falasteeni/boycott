import { defineConfig } from 'vite'
import { readFileSync, writeFileSync } from 'fs'
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
  plugins: [
    {
      name: 'fix-favicon-paths',
      closeBundle() {
        if (process.env.NODE_ENV === 'production') {
          const indexPath = join(process.cwd(), 'dist', 'index.html')
          try {
            let html = readFileSync(indexPath, 'utf-8')
            // Replace relative favicon paths with absolute paths
            html = html.replace(/href="\.\/bittee-logo/g, 'href="/boycott/bittee-logo')
            html = html.replace(/href="\.\/favicon\.ico/g, 'href="/boycott/favicon.ico')
            html = html.replace(/href="\.\/manifest\.json"/g, 'href="/boycott/manifest.json"')
            
            writeFileSync(indexPath, html, 'utf-8')
            console.log('[BUILD] Fixed favicon paths in index.html')
          } catch (err) {
            console.warn('[BUILD] Failed to fix favicon paths:', err)
          }
        }
      },
    },
  ],
})

