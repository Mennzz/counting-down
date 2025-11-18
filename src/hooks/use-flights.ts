import { flightApi } from "@/services/flight";
import { useQuery } from "@tanstack/react-query"

export const FLIGHTS_QUERY_KEY = ["flights"];

export const useFlights = () => {
    return useQuery({
        queryKey: FLIGHTS_QUERY_KEY,
        queryFn: flightApi.getFlights,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useNextFlight = () => {
    return useQuery({
        queryKey: [...FLIGHTS_QUERY_KEY, "nextFlight"],
        queryFn: flightApi.getNextFlight,
        staleTime: 1 * 60 * 1000, // 1 minute
    });
}

export const useCreateFlight = () => {
    //TODO: Placeholder for future flight creation logic,
    // Mimick behavior from other hooks, like useCreateTodo
}