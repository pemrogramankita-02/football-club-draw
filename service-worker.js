
const CACHE_NAME = 'fcd-auto-update-merge-restore-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

// INSTALL: Mengunduh aset versi terbaru
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    await Promise.all(
      CORE_ASSETS.map(async path => {
        const url = new URL(path, self.registration.scope).href;

        try {
          const response = await fetch(url, {
            cache: 'no-store'
          });

          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.warn('Aset belum tersedia untuk cache:', url);
        }
      })
    );

    await self.skipWaiting();
  })());
});

// ACTIVATE: Menghapus cache versi lama
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key =>
          key.startsWith('fcd-') &&
          key !== CACHE_NAME
        )
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

// FETCH: Mengutamakan file terbaru dari GitHub
// Jika offline, gunakan file dari cache
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    try {
      const fresh = await fetch(
        new Request(request, {
          cache: 'no-store'
        })
      );

      if (fresh && fresh.ok) {
        const copy = fresh.clone();

        cache.put(request, copy).catch(() => {});
      }

      return fresh;

    } catch (error) {
      const cached = await cache.match(request);

      if (cached) return cached;

      if (request.mode === 'navigate') {
        const fallback = await cache.match(
          new URL('./index.html', self.registration.scope).href
        );

        if (fallback) return fallback;
      }

      throw error;
    }
  })());
});
