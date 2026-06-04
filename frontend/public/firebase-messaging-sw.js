self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { notification, data: payload } = data;

    const title = notification?.title || 'CSMU Cloud Notes';
    const options = {
      body: notification?.body || '',
      icon: '/favicon-32x32.png',
      badge: '/favicon-32x32.png',
      data: payload || {},
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('CSMU Cloud Notes', { body: text })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const payload = event.notification.data || {};
  let url = '/';

  if (payload.type === 'new_file' && payload.fileId) {
    url = '/student/dashboard';
  } else if (payload.type === 'announcement') {
    url = '/student/dashboard';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url)) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
