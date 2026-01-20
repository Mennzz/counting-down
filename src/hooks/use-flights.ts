import { flightApi } from "@/services/flight";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: flightApi.createFlight,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FLIGHTS_QUERY_KEY });
            toast({
                title: "Success",
                description: "Flight created successfully!",
            });
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: `Failed to create flight: ${error.message}`,
            });
        },
    });
};