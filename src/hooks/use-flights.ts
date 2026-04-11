import { flightApi } from "@/services/flight";
import { UpdateFlightRequest } from "@/types/flight";
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

export const useUpdateFlight = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, flight }: { id: string; flight: UpdateFlightRequest }) =>
            flightApi.updateFlight(id, flight),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FLIGHTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: [...FLIGHTS_QUERY_KEY, "nextFlight"] });
            toast({
                title: "Success",
                description: "Flight updated successfully!",
            });
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: `Failed to update flight: ${error.message}`,
            });
        },
    });
};
