/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API root including `/api/v1`, used by production builds. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
