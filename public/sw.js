// D28: Web Push for the Home Screen app — reminders for kids, approvals for parents, number on the app icon.
// iOS allows no silent push: every push shows a notification, otherwise Safari revokes the subscription.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Homeworks", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Homeworks";
  const badge = typeof data.badge === "number" ? data.badge : null;

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, {
        body: data.body || "",
        tag: data.tag || "homeworks",
        renotify: true,
        icon: "/icon-192.png",
        data: { url: data.url || "/" },
      }),
      badge === null || !("setAppBadge" in self.navigator)
        ? Promise.resolve()
        : badge > 0
          ? self.navigator.setAppBadge(badge)
          : self.navigator.clearAppBadge(),
    ]),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ("focus" in w) {
          w.navigate(url);
          return w.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
