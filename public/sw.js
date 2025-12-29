self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activado');
  event.waitUntil(self.clients.claim());
});

// Escuchar notificaciones push (Backend)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  self.registration.showNotification(data.title || 'Vito Pizza', {
    body: data.body || '¡Novedades!',
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' } // Guardamos la URL destino
  });
});

// Manejar clics en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Obtenemos la URL destino (si viene del admin será '/admin', si no '/')
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. Si ya hay una pestaña abierta en esa URL, enfocarla
      for (const client of clientList) {
        // Comprobamos si la URL del cliente coincide con la destino
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. Si no, abrir una nueva ventana en la URL correcta
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});