import { API_BASE_URL, ApiError } from "@/services/api";
import type {
  XiaoBaoPushCapability,
  XiaoBaoPushConfig,
  XiaoBaoPushSubscriptions,
} from "@/types/xiaobao";
import { processResponse } from "@/utils/api";
import { getSessionId } from "@/utils/cookies";
import { camelToSnake } from "@/utils/utils";

const BASE_PATH = `${API_BASE_URL}/xiaobao/push`;
const DEVICE_ID_STORAGE_KEY = "xiaobao_push_device_id";
const SERVICE_WORKER_PATH = "/xiaobao-push-sw.js";
let fallbackDeviceId: string | undefined;

type BrowserPushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

const headers = (hasBody = false): HeadersInit => {
  const sessionId = getSessionId();
  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(sessionId ? { "X-Session-Id": sessionId } : {}),
  };
};

const apiError = async (response: Response): Promise<ApiError> => {
  const data = await response.json().catch(() => ({}));
  const detail = (data as { detail?: unknown }).detail;
  return new ApiError(
    response.status,
    typeof detail === "string" ? detail : response.statusText || "Notifications could not be updated.",
  );
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${BASE_PATH}${path}`, init);
  if (!response.ok) throw await apiError(response);
  if (response.status === 204) return undefined as T;
  return processResponse<T>(await response.json());
};

const randomId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const isAppleMobile = () => {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

const isStandalone = () => {
  if (typeof window === "undefined") return false;
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
};

export const getXiaoBaoPushDeviceId = () => {
  if (typeof window === "undefined") return "";
  let existing: string | null = null;
  try {
    existing = window.localStorage?.getItem(DEVICE_ID_STORAGE_KEY) ?? null;
  } catch {
    // Storage can be disabled; keep the ID stable for this browser session instead.
  }
  if (existing) return existing;
  if (fallbackDeviceId) return fallbackDeviceId;
  const deviceId = randomId();
  let stored = false;
  try {
    const storage = window.localStorage;
    storage?.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    stored = Boolean(storage);
  } catch {
    // Storage can be disabled; fall through to the in-memory fallback.
  }
  if (!stored) fallbackDeviceId = deviceId;
  return deviceId;
};

export const getXiaoBaoPushCapability = (): XiaoBaoPushCapability => {
  const browserSupport = typeof window !== "undefined"
    && "serviceWorker" in navigator
    && "PushManager" in window
    && "Notification" in window;
  const needsIosHomeScreenInstall = isAppleMobile() && !isStandalone();

  if (!browserSupport) {
    return {
      status: "UNSUPPORTED",
      permission: "UNSUPPORTED",
      needsIosHomeScreenInstall,
    };
  }
  if (!window.isSecureContext) {
    return {
      status: "INSECURE_CONTEXT",
      permission: Notification.permission,
      needsIosHomeScreenInstall,
    };
  }
  return {
    status: "SUPPORTED",
    permission: Notification.permission,
    needsIosHomeScreenInstall,
  };
};

const urlBase64ToUint8Array = (value: string) => {
  const padded = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`.replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(padded);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
};

const subscriptionPayload = (subscription: PushSubscription): BrowserPushSubscription => {
  const value = subscription.toJSON();
  if (!value.endpoint || !value.keys?.p256dh || !value.keys.auth) {
    throw new Error("This browser returned an incomplete notification subscription.");
  }
  return {
    endpoint: value.endpoint,
    keys: { p256dh: value.keys.p256dh, auth: value.keys.auth },
  };
};

const serviceWorkerRegistration = async () => {
  const capability = getXiaoBaoPushCapability();
  if (capability.status !== "SUPPORTED") {
    throw new Error("Notifications are not available in this browser context.");
  }
  await navigator.serviceWorker.register(SERVICE_WORKER_PATH, { scope: "/" });
  return navigator.serviceWorker.ready;
};

export const xiaoBaoPushApi = {
  getConfig: () => request<XiaoBaoPushConfig>("/config", { headers: headers() }),
  listSubscriptions: async (): Promise<XiaoBaoPushSubscriptions> => ({
    devices: await request<XiaoBaoPushSubscriptions["devices"]>("/subscriptions", { headers: headers() }),
  }),
  upsertSubscription: (deviceId: string, subscription: BrowserPushSubscription) =>
    request(`/subscriptions/${encodeURIComponent(deviceId)}`, {
      method: "PUT",
      headers: headers(true),
      body: JSON.stringify(camelToSnake({ subscription })),
    }),
  revokeSubscription: (deviceId: string) =>
    request<void>(`/subscriptions/${encodeURIComponent(deviceId)}`, {
      method: "DELETE",
      headers: headers(),
    }),
  sendTest: (deviceId: string, clientTestId: string) =>
    request<void>(`/subscriptions/${encodeURIComponent(deviceId)}/test`, {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify(camelToSnake({ clientTestId })),
    }),
};

/** Called only by the enable button: it may prompt for notification permission. */
export const enableXiaoBaoPush = async () => {
  const capability = getXiaoBaoPushCapability();
  if (capability.needsIosHomeScreenInstall) {
    throw new Error("Install BIBI Dairy on your Home Screen before enabling notifications on this iPhone or iPad.");
  }
  if (capability.status !== "SUPPORTED") {
    throw new Error("Notifications are not available in this browser context.");
  }
  if (Notification.permission === "denied") {
    throw new Error("Notifications are blocked in this browser’s settings.");
  }
  // iOS/WebKit requires this call to remain directly in the user-activation turn. Do not move
  // configuration or service-worker awaits above it.
  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission was not granted. Your private inbox still works normally.");
    }
  }

  const config = await xiaoBaoPushApi.getConfig();
  if (!config.enabled || !config.vapidPublicKey) {
    throw new Error("Notifications are not configured yet. Your private inbox is still available.");
  }

  const registration = await serviceWorkerRegistration();
  const current = await registration.pushManager.getSubscription();
  const subscription = current ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(config.vapidPublicKey),
  });
  await xiaoBaoPushApi.upsertSubscription(getXiaoBaoPushDeviceId(), subscriptionPayload(subscription));
};

export const revokeXiaoBaoPush = async () => {
  const deviceId = getXiaoBaoPushDeviceId();
  try {
    const registration = navigator.serviceWorker ? await navigator.serviceWorker.ready : undefined;
    const subscription = await registration?.pushManager.getSubscription();
    await subscription?.unsubscribe();
  } catch {
    // Continue with server revocation; a stale browser capability must not remain deliverable.
  }
  await xiaoBaoPushApi.revokeSubscription(deviceId);
};

export const sendXiaoBaoPushTest = () =>
  xiaoBaoPushApi.sendTest(getXiaoBaoPushDeviceId(), randomId());
