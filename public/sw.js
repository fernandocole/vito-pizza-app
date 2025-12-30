self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  self.registration.showNotification(data.title || 'Vito Pizza', {
    body: data.body || '¡Novedades!',
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' }
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Construimos la URL completa destino
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    let matchingClient = null;

    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i];
      // Si ya hay una ventana abierta de nuestra app
      if (windowClient.url.includes(self.location.origin)) {
        matchingClient = windowClient;
        break;
      }
    }

    if (matchingClient) {
      // 1. Enfocar la ventana
      return matchingClient.focus().then(() => {
        // 2. IMPORTANTE: Navegar a la URL correcta (/admin) si no estamos ahí
        if (matchingClient.url !== urlToOpen) {
          return matchingClient.navigate(urlToOpen);
        }
      });
    } else {
      // Si no hay ventana abierta, abrir una nueva
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});