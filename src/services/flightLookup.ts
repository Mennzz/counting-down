import { API_BASE_URL } from "./api";
import { FlightLookupResponse } from "@/types/flightLookup";
import { processResponse } from "@/utils/api";
import { getSessionId } from "@/utils/cookies";

export const flightLookupApi = {
  lookupFlight: async (flightNumber: string): Promise<FlightLookupResponse> => {
    const sessionId = getSessionId();
    const params = new URLSearchParams({ flightNumber });
    const response = await fetch(`${API_BASE_URL}/flights/lookup?${params}`, {
      headers: {
        ...(sessionId ? { "X-Session-Id": sessionId } : {}),
      },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        body?.detail ?? "Flight lookup is temporarily unavailable. You can still enter the flight manually."
      );
    }
    return processResponse<FlightLookupResponse>(await response.json());
  },
};
