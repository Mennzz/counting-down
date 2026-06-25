import { API_BASE_URL } from "./api";
import { FlightLookupResponse } from "@/types/flightLookup";
import { processResponse } from "@/utils/api";
import { getSessionId } from "@/utils/cookies";

export interface FlightLookupRequest {
  flightNumber: string;
  /** Optional ISO date (YYYY-MM-DD) to look up flights on a specific day. */
  date?: string;
}

export const flightLookupApi = {
  lookupFlight: async ({ flightNumber, date }: FlightLookupRequest): Promise<FlightLookupResponse> => {
    const sessionId = getSessionId();
    const params = new URLSearchParams({ flightNumber });
    if (date) params.set("date", date);
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
