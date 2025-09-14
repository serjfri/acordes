const CACHE_NAME = 'mis-acordes-v1';
const urlsToCache = [
  '/acordes/',
  '/acordes/public/icons/site.webmanifest'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando y precacheando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Añadimos un catch para manejar el error si algún archivo falla
        return cache.addAll(urlsToCache)
          .then(() => self.skipWaiting()) // Forzar la activación del nuevo SW
          .catch((error) => console.error('Service Worker: Falló el precacheo de un archivo.', error));
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activado');
  event.waitUntil(
    // Eliminar cachés antiguas para evitar que ocupen espacio
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si hay una respuesta en caché, la devolvemos. Si no, hacemos fetch desde la red.
        return response || fetch(event.request);
      })
  );
});