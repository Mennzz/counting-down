import { API_BASE_URL, ApiError } from "./api";
import { Airport } from "@/types/airport";
import { processResponse } from "@/utils/api";
import { getSessionId } from "@/utils/cookies";

export const airportApi = {
  getAirports: async (): Promise<Airport[]> => {
    const sessionId = getSessionId();
    if (!sessionId) {
      throw new Error("No active session");
    }

    const response = await fetch(`${API_BASE_URL}/airports`, {
      headers: {
        "X-Session-Id": sessionId,
      },
    });
    if (!response.ok) {
      throw new ApiError(response.status, "Failed to fetch airports");
    }
    return await processResponse<Airport[]>(await response.json());
  },
};
