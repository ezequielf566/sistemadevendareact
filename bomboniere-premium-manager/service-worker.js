const CACHE_NAME = 'bomboniere-premium-v4';
const urlsToCache = [
  'index.html',
  'index.css',
  'index.tsx',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap'
];

// Install SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url))
        );
      })
  );
  self.skipWaiting();
});

// Listen for requests
self.addEventListener('fetch', (event) => {
  // Navigation fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('index.html');
      })
    );
    return;
  }

  // Especial para o manifest se der erro de rede (pode ajudar com o 401 em alguns ambientes)
  if (event.request.url.includes('manifest.json')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('manifest.json');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
            if (event.request.destination === 'image') {
               return caches.match('https://cdn-icons-png.flaticon.com/512/2829/2829800.png');
            }
            return new Response('Not found', { status: 404 });
        });
      })
  );
});

// Activate and Clean old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cacheName) => {
        if (!cacheWhitelist.includes(cacheName)) {
          return caches.delete(cacheName);
        }
      })
    ))
  );
  self.clients.claim();
});