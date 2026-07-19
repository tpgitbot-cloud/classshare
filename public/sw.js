self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));

self.addEventListener("push", (e) => {
  let data = { title: "ClassShare", body: "New activity", icon: "/icons/icon.svg", badge: "/icons/icon.svg" };
  try {
    if (e.data) data = { ...data, ...e.data.json() };
  } catch {}
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: "classshare-upload",
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: data,
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = e.notification.data?.url || "/dashboard";
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    for (const c of cs) { if (c.url.includes(target) && "focus" in c) return c.focus(); }
    return clients.openWindow(target);
  }));
});
