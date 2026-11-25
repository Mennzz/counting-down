import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { XiaoBaoPushNotificationControls } from "./XiaoBaoPushNotificationControls";

const enable = vi.fn();
const revoke = vi.fn();
const testNotification = vi.fn();
const state: {
  capability: { data: unknown; isLoading: boolean };
  subscriptions: { data: unknown; isLoading: boolean; isError: boolean };
} = {
  capability: { data: undefined, isLoading: false },
  subscriptions: { data: undefined, isLoading: false, isError: false },
};

vi.mock("@/hooks/use-xiaobao-push", () => ({
  useXiaoBaoPushCapability: () => state.capability,
  useXiaoBaoPushSubscriptions: () => state.subscriptions,
  useEnableXiaoBaoPush: () => ({ mutate: enable, isPending: false }),
  useRevokeXiaoBaoPush: () => ({ mutate: revoke, isPending: false }),
  useTestXiaoBaoPush: () => ({ mutate: testNotification, isPending: false }),
}));

vi.mock("@/services/xiaobao-push", () => ({
  getXiaoBaoPushDeviceId: () => "this-device",
}));

describe("Xiao Bao push notification controls", () => {
  beforeEach(() => {
    enable.mockReset();
    revoke.mockReset();
    testNotification.mockReset();
    state.capability = {
      data: { status: "SUPPORTED", permission: "granted", needsIosHomeScreenInstall: false },
      isLoading: false,
    };
    state.subscriptions = {
      data: { devices: [{ deviceId: "this-device", deviceName: "My phone", createdAt: "2026-08-24T10:00:00.000Z" }] },
      isLoading: false,
      isError: false,
    };
  });

  it("allows testing and revoking the current safe device summary", () => {
    render(<XiaoBaoPushNotificationControls />);

    expect(screen.getByText("This device")).toBeInTheDocument();
    expect(screen.getByText(/lock-screen previews never include/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Send test" }));
    fireEvent.click(screen.getByRole("button", { name: "Revoke this device" }));
    expect(testNotification).toHaveBeenCalledTimes(1);
    expect(revoke).toHaveBeenCalledTimes(1);
  });

  it("shows Home Screen instructions before offering iPhone notification permission", () => {
    state.capability = {
      data: { status: "SUPPORTED", permission: "default", needsIosHomeScreenInstall: true },
      isLoading: false,
    };
    render(<XiaoBaoPushNotificationControls />);

    expect(screen.getByText("Install BIBI Dairy first")).toBeInTheDocument();
    expect(screen.getByText(/Add to Home Screen/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Enable on this device" })).not.toBeInTheDocument();
  });

  it("does not offer a repeated browser prompt after permission was denied", () => {
    state.capability = {
      data: { status: "SUPPORTED", permission: "denied", needsIosHomeScreenInstall: false },
      isLoading: false,
    };
    render(<XiaoBaoPushNotificationControls />);

    expect(screen.getByText(/blocked in this browser/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Enable on this device" })).not.toBeInTheDocument();
  });
});
