import { API_BASE_URL } from "@/services/api";

const apiRoot = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export const BACKEND_HEALTH_URL = `${apiRoot}/health`;

export const backendHealthApi = {
  isReady: async (): Promise<boolean> => {
    try {
      const response = await fetch(BACKEND_HEALTH_URL, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return false;
      const body = await response.json() as { status?: unknown };
      return body.status === "ok";
    } catch {
      return false;
    }
  },
};
