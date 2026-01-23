const CACHE_NAME = 'sql-formatter-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.svg',
    '/apple-touch-icon.svg',
    '/locales/en/translation.json',
    '/locales/pt/translation.json',
    '/locales/de/translation.json',
    '/locales/fr/translation.json',
    '/locales/es/translation.json',
    '/locales/zh/translation.json',
    '/locales/ja/translation.json',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return;

    // Don't cache AdSense or Gtag
    if (event.request.url.includes('googlesyndication') || event.request.url.includes('googletagmanager')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((response) => {
                // Don't cache if not a valid success response or if it's an external resource we shouldn't cache
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            });
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
