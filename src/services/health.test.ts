import { afterEach, describe, expect, it, vi } from "vitest";

import { BACKEND_HEALTH_URL, backendHealthApi } from "./health";

describe("backend health service", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses the root health endpoint and accepts only an explicit ok response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ status: "ok" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(backendHealthApi.isReady()).resolves.toBe(true);
    expect(BACKEND_HEALTH_URL).toBe("/health");
    expect(fetchMock).toHaveBeenCalledWith("/health", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  });

  it("reports unavailable for startup errors or unexpected responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("not listening")));
    await expect(backendHealthApi.isReady()).resolves.toBe(false);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ status: "starting" }),
    }));
    await expect(backendHealthApi.isReady()).resolves.toBe(false);
  });
});
