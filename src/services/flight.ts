import { API_BASE_URL } from "./api";
import { Flight, CreateFlightRequest } from "@/types/flight";
import { processResponse } from "@/utils/api";
import { camelToSnake } from "@/utils/utils";
import { getSessionId } from "@/utils/cookies";

export const flightApi = {
  getFlights: async (): Promise<Flight[]> => {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/flights`, {
      headers: {
        ...(sessionId ? { "X-Session-Id": sessionId } : {}),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch flights");
    }
    return await processResponse<Flight[]>(await response.json());
  },

  getFlightById: async (id: string): Promise<Flight> => {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/flights/${id}`, {
      headers: {
        ...(sessionId ? { "X-Session-Id": sessionId } : {}),
      },
    });
    if (!response.ok) {
      throw new Error("Flight not found");
    }
    return await processResponse<Flight>(await response.json());
  },

  getFlightByCode: async (code: string): Promise<Flight[]> => {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/flights/code/${code}`, {
      headers: {
        ...(sessionId ? { "X-Session-Id": sessionId } : {}),
      },
    });
    if (!response.ok) {
      throw new Error("Flight not found");
    }
    return await processResponse<Flight[]>(await response.json());
  },

  getFlightByFlightNumber: async (flightNumber: string): Promise<Flight> => {
    const sessionId = getSessionId();
    const response = await fetch(
      `${API_BASE_URL}/flights/flight_number/${flightNumber}`,
      {
        headers: {
          ...(sessionId ? { "X-Session-Id": sessionId } : {}),
        },
      }
    );
    if (!response.ok) {
      throw new Error("Flight not found");
    }
    return await processResponse<Flight>(await response.json());
  },

  getNextFlight: async (): Promise<Flight> => {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/flights/next`, {
      headers: {
        ...(sessionId ? { "X-Session-Id": sessionId } : {}),
      },
    });
    if (!response.ok) {
      throw new Error("Error getting next flight");
    }

    if ((await response.clone().json()).detail) {
      return null;
    }

    return await processResponse<Flight>(await response.json());
  },

  createFlight: async (flight: CreateFlightRequest): Promise<Flight> => {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/flights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sessionId ? { "X-Session-Id": sessionId } : {}),
      },
      body: JSON.stringify(camelToSnake(flight)),
    });
    return await processResponse<Flight>(await response.json());
  },
};
