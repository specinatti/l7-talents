// Service Worker for Cache Control
const CACHE_VERSION = 'v' + Date.now();
const CACHE_NAME = 'l7talents-' + CACHE_VERSION;

// Install - clear old caches
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate - take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch - network first, no cache for HTML
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Never cache HTML pages
  if (event.request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Network first for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
    );
    return;
  }
  
  // Cache images for 1 hour
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }
  
  // Default: network first
  event.respondWith(
    fetch(event.request, { cache: 'reload' })
      .catch(() => caches.match(event.request))
  );
});
