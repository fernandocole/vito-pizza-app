self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ESCUCHAR CLIC EN LA NOTIFICACIÓN
self.addEventListener('notificationclick', (event) => {
  // 1. Cerrar la notificación inmediatamente
  event.notification.close();

  // 2. Obtener la URL que enviamos desde React (Admin o Guest)
  // Si no viene nada, por defecto va al inicio '/'
  const targetUrl = event.notification.data?.url || '/';

  // 3. Gestionar la ventana
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // A. Si ya hay una pestaña abierta de la app...
      for (const client of clientList) {
        // Comprobamos si la URL base coincide (para no capturar otras webs)
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          // ...la enfocamos y navegamos a la sección correcta (Admin o Guest)
          return client.focus().then((focusedClient) => {
             return focusedClient.navigate(targetUrl);
          });
        }
      }

      // B. Si NO hay pestaña abierta, abrimos una nueva en la URL indicada
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});