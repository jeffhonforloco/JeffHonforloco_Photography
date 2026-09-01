const CACHE_NAME = 'jeff-honforloco-v3';
const OFFLINE_URL = '/';

// Install event - cache the offline fallback shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .catch(() => {})
  );
  self.skipWaiting();
});

// Activate event - clean up old caches (including the stale v1 cache)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET and external requests
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(request.url);

  // Navigations must be network-first: a cache-first shell pins users to a
  // deleted deploy's hashed chunks and breaks every lazy-loaded route.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(OFFLINE_URL, responseToCache))
            .catch(() => {});
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Hashed build assets are content-addressed and safe to serve cache-first.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, responseToCache))
            .catch(() => {});
          return response;
        });
      })
    );
    return;
  }

  // Images use cache-first only after verifying the response is actually an
  // image. This prevents a Pages HTML fallback from poisoning an image URL.
  if (url.pathname.startsWith('/images/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          const contentType = response.headers.get('content-type') || '';
          if (!response || response.status !== 200 || response.type !== 'basic' || !contentType.startsWith('image/')) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, responseToCache))
            .catch(() => {});
          return response;
        });
      })
    );
  }

  // Everything else falls through to the network untouched
});
