import fs from 'fs';
import path from 'path';

// Generate unique build timestamp version
const buildVersion = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
console.log(`🚀 Post-build: Generating version ${buildVersion}`);

// 1. Ensure dist directories exist
const distDir = path.resolve('dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const templatePath = path.resolve('dist', 'index.html');

const distHtml = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="description" content="Maisya Chat Room - Platform Komunikasi Internal & Halaqah Pondok Pesantren Imam Syafi'i Brebes berbasis Google Spreadsheet DB_MAISYA_CHAT dan WebRTC" />
    <meta name="theme-color" content="#064E3B" />
    <meta name="app-version" content="${buildVersion}" />
    
    <!-- Anti-Cache Meta: Memastikan hard reload atau refresh meminta index terbaru -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />

    <!-- PWA & Mobile Web App Meta -->
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Maisya Room" />
    <meta name="application-name" content="Maisya Room" />
    
    <!-- PWA Manifest & Icons -->
    <link rel="manifest" href="./manifest.webmanifest" />
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <link rel="icon" type="image/png" sizes="192x192" href="./icons/icon-192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="./icons/icon-512.png" />
    <link rel="apple-touch-icon" href="./icons/apple-touch-icon.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="./icons/apple-touch-icon.png" />

    <title>Maisya Chat Room - Pondok Pesantren Imam Syafi'i Brebes</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;600&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      }
    </style>
    <link rel="stylesheet" crossorigin href="./assets/app.css?v=${buildVersion}" />
    <script type="module" crossorigin src="./assets/app.js?v=${buildVersion}"></script>
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
    <div id="root"></div>

    <!-- PWA Service Worker Registration dengan Auto-Update Instan -->
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js?v=${buildVersion}', { scope: './' })
            .then(reg => {
              console.log('✅ PWA Service Worker Registered (v${buildVersion}):', reg.scope);
              // Selalu cek update ke server secara otomatis
              reg.update();
              reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                if (installingWorker) {
                  installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      installingWorker.postMessage({ type: 'SKIP_WAITING' });
                    }
                  };
                }
              };
            })
            .catch(err => console.warn('PWA SW Register Error:', err));
        });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      }
    </script>
  </body>
</html>`;

fs.writeFileSync(templatePath, distHtml);

// 2. Generate versioned Service Worker
const swTemplatePath = path.resolve('public', 'sw.js');
if (fs.existsSync(swTemplatePath)) {
  let swContent = fs.readFileSync(swTemplatePath, 'utf8');
  swContent = swContent.replace(/BUILD_VERSION_PLACEHOLDER/g, buildVersion);
  fs.writeFileSync(path.resolve('dist', 'sw.js'), swContent);
  fs.writeFileSync(path.resolve('sw.js'), swContent);
}

// 3. Copy public PWA assets to dist and root
const publicFiles = [
  'manifest.webmanifest',
  'manifest.json',
  'favicon.svg',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

publicFiles.forEach(file => {
  const src = path.resolve('public', file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.resolve('dist', file));
    fs.copyFileSync(src, path.resolve(file));
  }
});

// Copy icons directory
if (fs.existsSync(path.resolve('public', 'icons'))) {
  fs.cpSync(path.resolve('public', 'icons'), path.resolve('dist', 'icons'), { recursive: true });
  fs.cpSync(path.resolve('public', 'icons'), path.resolve('icons'), { recursive: true });
}

// 4. Copy dist/assets to ./assets
if (fs.existsSync(path.resolve('dist', 'assets'))) {
  fs.cpSync(path.resolve('dist', 'assets'), path.resolve('assets'), { recursive: true });
}

// 5. Copy dist to docs for GitHub Pages docs resolution
fs.cpSync(path.resolve('dist'), path.resolve('docs'), { recursive: true });

console.log(`✅ Post-build: Synced dist, docs, assets with version ${buildVersion} and auto-cache-bust successfully.`);
