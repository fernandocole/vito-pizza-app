self.addEventListener('install', (event) => {
  self.skipWaiting(); // Fuerza la actualización inmediata
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Toma el control inmediatamente
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Cierra la notificación visual

  // Obtenemos la URL enviada desde React (ej: '/admin' o '/')
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. Si la app ya está abierta en una pestaña...
      for (const client of clientList) {
        // Verificamos si es nuestra app
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus().then((focusedClient) => {
            // Forzamos la navegación a la URL correcta (Admin o Guest)
            return focusedClient.navigate(targetUrl);
          });
        }
      }

      // 2. Si la app estaba cerrada, abrimos una ventana nueva en la URL correcta
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});