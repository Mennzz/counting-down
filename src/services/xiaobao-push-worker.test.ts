import { readFileSync } from "node:fs";

import { beforeEach, describe, expect, it, vi } from "vitest";

type WorkerEvent = {
  data?: { json: () => unknown };
  notification?: { close: () => void; data?: { url?: unknown } };
  waitUntil: (promise: Promise<unknown>) => void;
};

const workerSource = readFileSync(`${process.cwd()}/public/xiaobao-push-sw.js`, "utf8");
const messageId = "64b64c8f2f3f6d1f7a8b9001";

describe("Xiao Bao push service worker", () => {
  const handlers = new Map<string, (event: WorkerEvent) => void>();
  const showNotification = vi.fn();
  const openWindow = vi.fn();
  const matchAll = vi.fn();

  beforeEach(() => {
    handlers.clear();
    showNotification.mockReset().mockResolvedValue(undefined);
    openWindow.mockReset().mockResolvedValue(undefined);
    matchAll.mockReset().mockResolvedValue([]);
    const worker = {
      addEventListener: (type: string, handler: (event: WorkerEvent) => void) => handlers.set(type, handler),
      registration: { showNotification },
      location: { origin: "https://bibi.example.test" },
      clients: { matchAll, openWindow },
    };
    new Function("self", workerSource)(worker);
  });

  it("shows generic privacy-safe inbox text and no content from the payload", async () => {
    const waits: Promise<unknown>[] = [];
    handlers.get("push")!({
      data: { json: () => ({ v: 1, kind: "INBOX", message_id: messageId, content: "Never show this" }) },
      waitUntil: (promise) => waits.push(promise),
    });
    await Promise.all(waits);

    expect(showNotification).toHaveBeenCalledWith("Xiao Bao", expect.objectContaining({
      body: "You have a new private message.",
      data: { url: `/xiaobao/inbox?messageId=${messageId}` },
      tag: `xiaobao:inbox:${messageId}`,
      renotify: false,
    }));
    expect(JSON.stringify(showNotification.mock.calls[0])).not.toContain("Never show this");
  });

  it("opens the exact inbox deep link when an inbox notification is tapped", async () => {
    const waits: Promise<unknown>[] = [];
    const close = vi.fn();
    handlers.get("notificationclick")!({
      notification: { close, data: { url: `/xiaobao/inbox?messageId=${messageId}` } },
      waitUntil: (promise) => waits.push(promise),
    });
    await Promise.all(waits);

    expect(close).toHaveBeenCalledTimes(1);
    expect(openWindow).toHaveBeenCalledWith(`https://bibi.example.test/xiaobao/inbox?messageId=${messageId}`);
  });

  it("opens a new window when an existing client cannot navigate to the deep link", async () => {
    const waits: Promise<unknown>[] = [];
    const navigate = vi.fn().mockResolvedValue(null);
    const focus = vi.fn();
    matchAll.mockResolvedValue([{
      url: "https://bibi.example.test/xiaobao",
      navigate,
      focus,
    }]);

    handlers.get("notificationclick")!({
      notification: {
        close: vi.fn(),
        data: { url: `/xiaobao/inbox?messageId=${messageId}` },
      },
      waitUntil: (promise) => waits.push(promise),
    });
    await Promise.all(waits);

    expect(navigate).toHaveBeenCalledWith(
      `https://bibi.example.test/xiaobao/inbox?messageId=${messageId}`,
    );
    expect(focus).not.toHaveBeenCalled();
    expect(openWindow).toHaveBeenCalledWith(
      `https://bibi.example.test/xiaobao/inbox?messageId=${messageId}`,
    );
  });
});
