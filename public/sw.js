/* Rutu-Maa service worker — Web Push display + click routing.
   (Next serves the app; this SW focuses on notifications.) */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

/* Server-sent Web Push (fires even when the app/browser is closed). */
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(
    self.registration.showNotification(d.title || 'Rutu-Maa 🌸', {
      body: d.body || '',
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: d.tag || d.route || 'rutumaa',
      renotify: true,
      vibrate: [120, 60, 120],
      data: { route: d.route || 'reminders' }
    })
  );
});

/* In-app notifications requested by the page (when push keys aren't set). */
self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === 'notify' && self.registration.showNotification) {
    self.registration.showNotification(d.title || 'Rutu-Maa', {
      body: d.body || '', icon: '/icon.svg', badge: '/icon.svg',
      tag: d.tag || 'rutumaa', renotify: true, vibrate: [120, 60, 120],
      data: { route: d.route || 'reminders' }
    });
  }
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const route = (e.notification.data && e.notification.data.route) || 'reminders';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) { c.postMessage({ type: 'navigate', route }); return c.focus(); } }
      if (self.clients.openWindow) return self.clients.openWindow('/' + route);
    })
  );
});
