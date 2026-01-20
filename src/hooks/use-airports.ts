import { airportApi } from "@/services/airport";
import { useQuery } from "@tanstack/react-query";

export const AIRPORTS_QUERY_KEY = ["airports"];

export const useAirports = () => {
  return useQuery({
    queryKey: AIRPORTS_QUERY_KEY,
    queryFn: airportApi.getAirports,
    staleTime: 60 * 60 * 1000, // 1 hour - airports don't change often
  });
};
