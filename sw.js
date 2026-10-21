// v67: el itinerario ya es público y sin contraseña. Este service worker borra la copia cifrada
// guardada en los teléfonos, se da de baja y recarga la página para mostrar la versión nueva.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) await caches.delete(k);
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: 'window' })) c.navigate(c.url);
})()));
