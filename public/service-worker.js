const CACHE_NAME = 'temporizador-pwa-cache-v1';
const urlsToCache = [
  '/', // Página principal
  '/manifest.json', // Archivo del manifest
  '/icons/icon-192x192.png', // Ícono
  '/icons/icon-512x512.png', // Ícono grande
  '/screenshots/screenshot-desktop.png', // Captura de escritorio
  '/screenshots/screenshot-mobile.png', // Captura de móvil
];

// Evento de instalación
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado.');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Archivos en caché.');
      return cache.addAll(urlsToCache);
    })
  );
});

// Evento de activación
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Eliminando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Interceptar solicitudes de red
self.addEventListener('fetch', (event) => {
  console.log('Interceptando solicitud para:', event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devuelve el archivo del caché si existe, de lo contrario realiza una solicitud de red
      return response || fetch(event.request);
    })
  );
});

// Evento de clic en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Notificación clicada:', event);
  event.notification.close(); // Cierra la notificación
  // Puedes agregar lógica adicional aquí, como redirigir al usuario
});
