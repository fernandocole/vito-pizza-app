self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activado');
  event.waitUntil(self.clients.claim());
});

// Escuchar notificaciones push (preparado para el futuro)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  self.registration.showNotification(data.title || 'Vito Pizza', {
    body: data.body || '¡Tu pizza está lista!',
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200]
  });
});

// Manejar clics en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si la app ya está abierta, enfocarla
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      // Si no, abrirla
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});