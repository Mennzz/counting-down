import { API_BASE_URL } from "./api";
import { Airport } from "@/types/airport";
import { processResponse } from "@/utils/api";

export const airportApi = {
  getAirports: async (): Promise<Airport[]> => {
    const response = await fetch(`${API_BASE_URL}/airports`);
    if (!response.ok) {
      throw new Error("Failed to fetch airports");
    }
    return await processResponse<Airport[]>(await response.json());
  },
};
