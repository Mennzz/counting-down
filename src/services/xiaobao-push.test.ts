import { afterEach, describe, expect, it, vi } from "vitest";

import {
  enableXiaoBaoPush,
  getXiaoBaoPushCapability,
  getXiaoBaoPushDeviceId,
  xiaoBaoPushApi,
} from "./xiaobao-push";

const deviceId = "84a53c3a-6eb5-4b9d-8bc2-8faa8e7a2e11";
const clientTestId = "cc0c8048-05f1-465c-9748-65f9372e41ae";

describe("Xiao Bao push API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage?.clear();
  });

  it("keeps a stable local device id without placing subscription credentials in UI state", () => {
    const first = getXiaoBaoPushDeviceId();
    expect(first).not.toBe("");
    expect(getXiaoBaoPushDeviceId()).toBe(first);
  });

  it("shows Home Screen guidance for iPadOS desktop-class user agents", () => {
    const originalPlatform = Object.getOwnPropertyDescriptor(navigator, "platform");
    const originalTouchPoints = Object.getOwnPropertyDescriptor(navigator, "maxTouchPoints");
    Object.defineProperty(navigator, "platform", { configurable: true, value: "MacIntel" });
    Object.defineProperty(navigator, "maxTouchPoints", { configurable: true, value: 5 });

    expect(getXiaoBaoPushCapability().needsIosHomeScreenInstall).toBe(true);

    if (originalPlatform) Object.defineProperty(navigator, "platform", originalPlatform);
    else delete (navigator as Navigator & { platform?: string }).platform;
    if (originalTouchPoints) Object.defineProperty(navigator, "maxTouchPoints", originalTouchPoints);
    else delete (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints;
  });

  it("uses the agreed device-scoped registration and test endpoints with snake_case bodies", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        device_id: deviceId,
        device_name: "This device",
        created_at: "2026-08-24T10:00:00+00:00",
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await xiaoBaoPushApi.upsertSubscription(deviceId, {
      endpoint: "https://push.example.test/subscription",
      keys: { p256dh: "public-key", auth: "auth-key" },
    });
    await xiaoBaoPushApi.sendTest(deviceId, clientTestId);

    const register = fetchMock.mock.calls[0];
    expect(register[0]).toContain(`/xiaobao/push/subscriptions/${deviceId}`);
    expect(register[1]).toMatchObject({ method: "PUT" });
    expect(JSON.parse(String((register[1] as RequestInit).body))).toEqual({
      subscription: {
        endpoint: "https://push.example.test/subscription",
        keys: { p256dh: "public-key", auth: "auth-key" },
      },
    });

    const test = fetchMock.mock.calls[1];
    expect(test[0]).toContain(`/xiaobao/push/subscriptions/${deviceId}/test`);
    expect(test[1]).toMatchObject({ method: "POST" });
    expect(JSON.parse(String((test[1] as RequestInit).body))).toEqual({ client_test_id: clientTestId });
  });

  it("requests permission before awaiting push configuration so iOS keeps the click gesture", async () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
    Object.defineProperty(window, "PushManager", { configurable: true, value: class PushManager {} });
    Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: {} });
    vi.stubGlobal("Notification", { permission: "default", requestPermission });
    const getConfig = vi.spyOn(xiaoBaoPushApi, "getConfig").mockResolvedValue({
      enabled: false,
      vapidPublicKey: null,
    });

    await expect(enableXiaoBaoPush()).rejects.toThrow("not configured yet");

    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(requestPermission.mock.invocationCallOrder[0]).toBeLessThan(getConfig.mock.invocationCallOrder[0]);
  });
});
