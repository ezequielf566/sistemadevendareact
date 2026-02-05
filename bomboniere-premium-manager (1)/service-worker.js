const CACHE_NAME = 'bomboniere-premium-v3';
const urlsToCache = [
  './',
  './index.html',
  './index.css',
  './index.tsx',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap'
];

// Install SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Usamos addAll mas com catch individual para não quebrar o SW se um ícone falhar
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url))
        );
      })
  );
  self.skipWaiting();
});

// Listen for requests
self.addEventListener('fetch', (event) => {
  // Navigation fallback: Sempre serve index.html para qualquer navegação de página
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('./index.html');
      })
    );
    return;
  }

  // Estratégia: Cache First, falling back to Network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
            // Se for uma resposta válida, podemos cachear dinamicamente (opcional)
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
            }
            return networkResponse;
        }).catch(() => {
            // Se falhar rede e não tiver cache, apenas retorna erro silencioso para assets
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