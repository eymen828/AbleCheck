// Service Worker für Push-Benachrichtigungen
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push-Event Handler
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'AbleCheck', body: event.data.text() };
    }
  }

  const options = {
    title: data.title || 'AbleCheck',
    body: data.body || 'Neue Benachrichtigung',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    image: data.image,
    data: data.data,
    actions: [
      {
        action: 'open',
        title: 'Öffnen',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Schließen'
      }
    ],
    requireInteraction: false,
    silent: false,
    tag: 'ablecheck-notification',
    timestamp: Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Öffne die App oder fokussiere sie
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Schaue, ob die App bereits geöffnet ist
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Öffne neue Instanz wenn keine gefunden wurde
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Background Sync (optional, für offline Funktionalität)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
  }
});
