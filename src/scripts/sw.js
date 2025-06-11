import { registerRoute } from 'workbox-routing';
import { precacheAndRoute } from 'workbox-precaching';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Cache otomatis hasil Webpack (bundle JS, HTML, CSS, dsb)
precacheAndRoute(self.__WB_MANIFEST);

// Cache halaman navigasi (index.html)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new CacheFirst({
    cacheName: 'pages',
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',
  new StaleWhileRevalidate({
    cacheName: 'stories-api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 1 hari
      }),
    ],
  })
);

registerRoute(
  ({url}) => url.origin === 'https://api.opencagedata.com',
  new StaleWhileRevalidate({
    cacheName: 'place-names-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,               // Maksimal 50 entri cache
        maxAgeSeconds: 60 * 60 * 24 * 30, // Cache selama 30 hari
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://ui-avatars.com',
  new CacheFirst({
    cacheName: 'avatar-images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://tile.openstreetmap.org',
  new CacheFirst({
    cacheName: 'osm-tiles-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

registerRoute(
  ({ request, url }) => {
    return (
      request.destination === 'style' &&
      (url.href.includes('fontawesome') || url.href.includes('cdnjs.cloudflare.com'))
    );
  },
  new CacheFirst({
    cacheName: 'fontawesome',
plugins: [
  new ExpirationPlugin({
    maxEntries: 10,
    maxAgeSeconds: 60 * 60 * 24 * 30,
  }),
],
  })
);

self.addEventListener('push', async event => {
  console.log('Service worker received push');

  let notificationData = {
    title: 'Notifikasi Baru!',
    options: {
      body: 'Ada update terbaru, cek sekarang!',
    }
  };

  if (event.data) {
    const rawText = await event.data.text();

    try {
      const data = JSON.parse(rawText);
      notificationData.title = data.title || notificationData.title;
      notificationData.options = data.options || notificationData.options;
    } catch {
      notificationData.options.body = rawText;
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData.options)
  );
});
