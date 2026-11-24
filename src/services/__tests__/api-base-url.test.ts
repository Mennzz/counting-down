import { describe, expect, it } from "vitest";

import {
  DEVELOPMENT_API_BASE_URL,
  LEGACY_PRODUCTION_API_BASE_URL,
  resolveApiBaseUrl,
} from "@/services/api-base-url";

describe("resolveApiBaseUrl", () => {
  it("uses the same-origin proxy path in development", () => {
    expect(
      resolveApiBaseUrl({ DEV: true, VITE_API_BASE_URL: "https://api.example.test/api/v1" }),
    ).toBe(DEVELOPMENT_API_BASE_URL);
  });

  it("uses the configured API root in production builds", () => {
    expect(
      resolveApiBaseUrl({ DEV: false, VITE_API_BASE_URL: " https://api.example.test/api/v1/ " }),
    ).toBe("https://api.example.test/api/v1");
  });

  it("keeps the current backend when nothing is configured", () => {
    expect(resolveApiBaseUrl({ DEV: false })).toBe(LEGACY_PRODUCTION_API_BASE_URL);
    expect(resolveApiBaseUrl({ DEV: false, VITE_API_BASE_URL: "  " })).toBe(
      LEGACY_PRODUCTION_API_BASE_URL,
    );
  });
});
