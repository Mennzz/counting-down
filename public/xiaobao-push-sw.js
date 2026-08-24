/*
 * This worker deliberately does only Web Push presentation and navigation. It does not cache
 * application resources, prompt for permission, subscribe a device, or contain notification text
 * supplied by the server. Inbox content is fetched and authorized by the app after navigation.
 */
const PUSH_PAYLOAD_VERSION = 1;
const INBOX_MESSAGE_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

const notificationForPayload = (payload) => {
  if (!payload || typeof payload !== "object" || payload.v !== PUSH_PAYLOAD_VERSION) {
    return null;
  }

  if (
    payload.kind === "TEST"
    && typeof payload.message_id === "string"
    && INBOX_MESSAGE_ID_PATTERN.test(payload.message_id)
  ) {
    return {
      title: "Xiao Bao",
      body: "Notifications are working on this device.",
      tag: `xiaobao:push-test:${payload.message_id}`,
      url: "/xiaobao/notifications",
    };
  }

  if (
    payload.kind === "INBOX"
    && typeof payload.message_id === "string"
    && INBOX_MESSAGE_ID_PATTERN.test(payload.message_id)
  ) {
    return {
      title: "Xiao Bao",
      body: "You have a new private message.",
      tag: `xiaobao:inbox:${payload.message_id}`,
      url: `/xiaobao/inbox?messageId=${encodeURIComponent(payload.message_id)}`,
    };
  }

  return null;
};

self.addEventListener("push", (event) => {
  let payload;
  try {
    payload = event.data ? event.data.json() : null;
  } catch {
    return;
  }

  const notification = notificationForPayload(payload);
  if (!notification) return;

  event.waitUntil(self.registration.showNotification(notification.title, {
    body: notification.body,
    data: { url: notification.url },
    icon: "/icons/xiaobao-icon-192.png",
    badge: "/icons/xiaobao-icon-192.png",
    tag: notification.tag,
    renotify: false,
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const candidateUrl = event.notification.data?.url;
  const url = new URL(
    typeof candidateUrl === "string" ? candidateUrl : "/xiaobao/inbox",
    self.location.origin,
  );

  if (url.origin !== self.location.origin) return;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = windows.find((client) => new URL(client.url).origin === self.location.origin);

    if (existing) {
      try {
        if ("navigate" in existing) {
          const navigated = await existing.navigate(url.href);
          if (navigated) {
            await navigated.focus();
            return;
          }
        }
      } catch {
        // A closing or no-longer-controllable client can fail navigation; opening a new app window
        // still preserves the same-origin deep link.
      }
    }

    await self.clients.openWindow(url.href);
  })());
});
