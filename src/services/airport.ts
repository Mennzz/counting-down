import { API_BASE_URL, ApiError } from "./api";
import { Airport, AirportSearchResponse, CreateAirportRequest } from "@/types/airport";
import { processResponse } from "@/utils/api";
import { camelToSnake } from "@/utils/utils";
import { getSessionId } from "@/utils/cookies";

const requireSession = (): string => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }
  return sessionId;
};

export const airportApi = {
  getAirports: async (): Promise<Airport[]> => {
    const sessionId = requireSession();

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

  searchAirports: async (query: string, k?: number): Promise<Airport[]> => {
    const sessionId = requireSession();

    const params = new URLSearchParams({ query });
    if (k !== undefined) {
      params.set("k", String(k));
    }

    const response = await fetch(
      `${API_BASE_URL}/airports/search?${params.toString()}`,
      {
        headers: {
          "X-Session-Id": sessionId,
        },
      }
    );
    if (!response.ok) {
      throw new ApiError(response.status, "Failed to search airports");
    }
    const { results } = await processResponse<AirportSearchResponse>(
      await response.json()
    );
    return results;
  },

  getAirportByCode: async (code: string): Promise<Airport> => {
    const sessionId = requireSession();

    const response = await fetch(`${API_BASE_URL}/airports/code/${code}`, {
      headers: {
        "X-Session-Id": sessionId,
      },
    });
    if (!response.ok) {
      throw new ApiError(response.status, "Airport not found");
    }
    return await processResponse<Airport>(await response.json());
  },

  createAirport: async (payload: CreateAirportRequest): Promise<Airport> => {
    const sessionId = requireSession();

    const response = await fetch(`${API_BASE_URL}/airports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Id": sessionId,
      },
      body: JSON.stringify(camelToSnake(payload)),
    });
    if (!response.ok) {
      throw new ApiError(response.status, "Failed to create airport");
    }
    return await processResponse<Airport>(await response.json());
  },
};
