const CACHE_NAME = 'jgapp-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js'
];

// Instalar e cachear assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.log('Cache adiciona falhou (ok para desenvolvimento):', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativar e limpar caches antigos
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
  self.clients.claim();
});

// Estratégia: Cache First, Fall back to Network
self.addEventListener('fetch', (event) => {
  // Ignorar requisições de extensões e do Google Apps Script
  if (event.request.url.includes('chrome-extension://') ||
      event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Não cachear respostas inválidas
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Cachear a resposta para requisições bem-sucedidas
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Sem conexão - tentar retornar versão em cache
        return caches.match(event.request).then((response) => {
          return response || new Response('Sem conexão', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      });
    })
  );
});

// Sincronizar dados em background
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-ideias') {
    event.waitUntil(syncIdeas());
  }
});

async function syncIdeas() {
  // Sincronizar ideias quando a conexão voltar
  // Implementar quando houver backend
  console.log('Background sync: ideias');
}
