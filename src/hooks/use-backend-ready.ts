import { useQuery } from "@tanstack/react-query";

import { backendHealthApi } from "@/services/health";

export const BACKEND_READY_QUERY_KEY = ["backend", "ready"] as const;
export const BACKEND_STARTUP_RETRY_MS = 2_000;

export const useBackendReady = () => useQuery({
  queryKey: BACKEND_READY_QUERY_KEY,
  queryFn: backendHealthApi.isReady,
  refetchInterval: (query) => query.state.data === true ? false : BACKEND_STARTUP_RETRY_MS,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: false,
});
