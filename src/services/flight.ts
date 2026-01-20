import { API_BASE_URL } from "./api";
import { Flight, CreateFlightRequest } from "@/types/flight";
import { processResponse } from "@/utils/api";
import { camelToSnake } from "@/utils/utils";

export const flightApi = {
  getFlights: async (): Promise<Flight[]> => {
    const response = await fetch(`${API_BASE_URL}/flights`);
    if (!response.ok) {
      throw new Error("Failed to fetch flights");
    }
    return await processResponse<Flight[]>(await response.json());
  },

  getFlightById: async (id: string): Promise<Flight> => {
    const response = await fetch(`${API_BASE_URL}/flights/${id}`);
    if (!response.ok) {
      throw new Error("Flight not found");
    }
    return await processResponse<Flight>(await response.json());
  },

  getFlightByCode: async (code: string): Promise<Flight[]> => {
    const response = await fetch(
      `${API_BASE_URL}/flights/code/${code}`
    );
    if (!response.ok) {
      throw new Error("Flight not found");
    }
    return await processResponse<Flight[]>(await response.json());
  },

  getFlightByFlightNumber: async (flightNumber: string): Promise<Flight> => {
    const response = await fetch(
      `${API_BASE_URL}/flights/flight_number/${flightNumber}`
    );
    if (!response.ok) {
      throw new Error("Flight not found");
    }
    return await processResponse<Flight>(await response.json());
  },

  getNextFlight: async (): Promise<Flight> => {
    const response = await fetch(`${API_BASE_URL}/flights/next`);
    if (!response.ok) {
      throw new Error("Error getting next flight");
    }

    if ((await response.clone().json()).detail) {
      return null;
    }

    return await processResponse<Flight>(await response.json());
  },

  createFlight: async (flight: CreateFlightRequest): Promise<Flight> => {
    const response = await fetch(`${API_BASE_URL}/flights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(camelToSnake(flight)),
    });
    return await processResponse<Flight>(await response.json());
  },
};
