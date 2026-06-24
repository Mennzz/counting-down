import { airportApi } from "@/services/airport";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const AIRPORTS_QUERY_KEY = ["airports"];

export const useAirports = () => {
  return useQuery({
    queryKey: AIRPORTS_QUERY_KEY,
    queryFn: airportApi.getAirports,
    staleTime: 60 * 60 * 1000, // 1 hour - airports don't change often
  });
};

export const useAirportSearch = (query: string, k?: number) => {
  return useQuery({
    queryKey: [...AIRPORTS_QUERY_KEY, "search", query, k],
    queryFn: () => airportApi.searchAirports(query, k),
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAirportByCode = (code?: string) => {
  return useQuery({
    queryKey: [...AIRPORTS_QUERY_KEY, "code", code],
    queryFn: () => airportApi.getAirportByCode(code as string),
    enabled: !!code && code.length >= 3,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useCreateAirport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: airportApi.createAirport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AIRPORTS_QUERY_KEY });
      toast({
        title: "Success",
        description: "Airport added successfully!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add airport: ${error.message}`,
      });
    },
  });
};
