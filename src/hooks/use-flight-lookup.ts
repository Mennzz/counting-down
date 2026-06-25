import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { flightLookupApi } from "@/services/flightLookup";
import { FlightLookupResponse } from "@/types/flightLookup";

export const useFlightLookup = () => {
  const { toast } = useToast();

  return useMutation<FlightLookupResponse, Error, string>({
    mutationFn: flightLookupApi.lookupFlight,
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Lookup failed",
        description: error.message,
      });
    },
  });
};
