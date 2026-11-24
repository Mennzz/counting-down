/** Backend used by production builds until `VITE_API_BASE_URL` is configured in Vercel. */
export const LEGACY_PRODUCTION_API_BASE_URL =
  "https://counting-down-fastapi-c061e3e79aa6.herokuapp.com/api/v1";

/** Development requests stay same-origin and go through the Vite proxy. */
export const DEVELOPMENT_API_BASE_URL = "/api/v1";

interface ApiBaseUrlEnv {
  DEV: boolean;
  VITE_API_BASE_URL?: string;
}

/**
 * Resolve the API root, including `/api/v1`.
 *
 * Production builds read `VITE_API_BASE_URL` at build time, so moving the backend needs no
 * source change. Development uses the proxy so cookies and CORS behave like same-origin requests.
 */
export function resolveApiBaseUrl(env: ApiBaseUrlEnv): string {
  if (env.DEV) {
    return DEVELOPMENT_API_BASE_URL;
  }
  const configured = env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");
  return configured || LEGACY_PRODUCTION_API_BASE_URL;
}
