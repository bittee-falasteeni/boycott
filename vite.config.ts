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
            
            // Inject favicon debugging script before closing </head>
            const faviconDebugScript = `
    <!-- Favicon debugging -->
    <script>
      (function() {
        console.log('[FAVICON DEBUG] Page loaded, checking favicon links...');
        const faviconLinks = document.querySelectorAll('link[rel*="icon"]');
        console.log('[FAVICON DEBUG] Found', faviconLinks.length, 'favicon link(s)');
        faviconLinks.forEach((link, i) => {
          const href = link.getAttribute('href');
          const type = link.getAttribute('type');
          const sizes = link.getAttribute('sizes');
          console.log(\`[FAVICON DEBUG] Link \${i + 1}: href="\${href}", type="\${type}", sizes="\${sizes}"\`);
          
          const img = new Image();
          img.onload = () => {
            console.log(\`[FAVICON DEBUG] ✓ Successfully loaded favicon: \${href}\`);
          };
          img.onerror = () => {
            console.error(\`[FAVICON DEBUG] ✗ Failed to load favicon: \${href}\`);
          };
          if (href && !href.endsWith('.ico')) {
            img.src = href;
          }
        });
        
        // Force reload favicon with cache buster
        const favicon = document.querySelector('link[rel*="icon"]');
        if (favicon) {
          const originalHref = favicon.getAttribute('href');
          const newHref = originalHref + (originalHref.includes('?') ? '&' : '?') + 'v=' + Date.now();
          console.log('[FAVICON DEBUG] Attempting force reload with cache buster:', newHref);
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.type = favicon.getAttribute('type') || 'image/png';
          newLink.href = newHref;
          document.head.appendChild(newLink);
        }
      })();
    </script>`
            
            // Insert debug script before closing </head>
            html = html.replace('</head>', faviconDebugScript + '\n  </head>')
            
            // Ensure favicon.ico link exists (add if missing)
            if (!html.includes('favicon.ico')) {
              const faviconLink = '    <link rel="icon" type="image/x-icon" href="/boycott/favicon.ico" />\n'
              html = html.replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />\n' + faviconLink)
            }
            
            writeFileSync(indexPath, html, 'utf-8')
            console.log('[BUILD] Fixed favicon paths and added debugging in index.html')
          } catch (err) {
            console.warn('[BUILD] Failed to fix favicon paths:', err)
          }
        }
      },
    },
  ],
})

