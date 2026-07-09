/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

self.skipWaiting();
clientsClaim();

// Só o app shell (JS/CSS/fontes/ícones do build) — dados de saúde não devem
// servir de um cache potencialmente desatualizado; a fila offline de
// registros (useOfflineLogQueue) já cobre a escrita offline de forma
// explícita e auditável, então chamadas a /api/ ficam de fora do cache do
// service worker deliberadamente.
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/api\//],
  }),
);

interface PushPayload {
  title?: string;
  body?: string;
  url?: string;
}

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;
  let payload: PushPayload;
  try {
    payload = event.data.json();
  } catch {
    payload = { body: event.data.text() };
  }

  const title = payload.title ?? 'Perfil Sensorial';
  const url = payload.url ?? '/dashboard';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: { url },
    }),
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  const url = (event.notification.data?.url as string | undefined) ?? '/dashboard';
  event.notification.close();

  event.waitUntil(
    (async () => {
      const target = new URL(url, self.location.origin).href;
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

      const exactMatch = allClients.find((client) => client.url === target);
      if (exactMatch && 'focus' in exactMatch) {
        await exactMatch.focus();
        return;
      }

      const anyClient = allClients[0];
      if (anyClient && 'focus' in anyClient) {
        if ('navigate' in anyClient) await anyClient.navigate(target);
        await anyClient.focus();
        return;
      }

      await self.clients.openWindow(target);
    })(),
  );
});
