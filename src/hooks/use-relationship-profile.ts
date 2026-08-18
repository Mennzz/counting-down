import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import { relationshipProfileApi } from "@/services/relationship-profile";
import type { RelationshipProfileInput } from "@/types/relationship-profile";

export const RELATIONSHIP_PROFILE_QUERY_KEY = ["relationship-profile"];

export const useRelationshipProfile = () =>
  useQuery({
    queryKey: RELATIONSHIP_PROFILE_QUERY_KEY,
    queryFn: relationshipProfileApi.get,
    staleTime: 60_000,
  });

export const useSaveRelationshipProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (profile: RelationshipProfileInput) => relationshipProfileApi.update(profile),
    onSuccess: (profile) => {
      queryClient.setQueryData(RELATIONSHIP_PROFILE_QUERY_KEY, profile);
      toast({ title: "Relationship context saved" });
    },
    onError: (error: Error) => {
      toast({ title: "That didn’t work", description: error.message, variant: "destructive" });
    },
  });
};
