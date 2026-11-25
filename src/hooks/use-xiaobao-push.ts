import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import {
  enableXiaoBaoPush,
  getXiaoBaoPushCapability,
  revokeXiaoBaoPush,
  sendXiaoBaoPushTest,
  xiaoBaoPushApi,
} from "@/services/xiaobao-push";

export const XIAOBAO_PUSH_SUBSCRIPTIONS_QUERY_KEY = ["xiaobao", "push", "subscriptions"] as const;
export const XIAOBAO_PUSH_CAPABILITY_QUERY_KEY = ["xiaobao", "push", "capability"] as const;

export const useXiaoBaoPushCapability = () => useQuery({
  queryKey: XIAOBAO_PUSH_CAPABILITY_QUERY_KEY,
  queryFn: getXiaoBaoPushCapability,
  staleTime: Infinity,
});

export const useXiaoBaoPushSubscriptions = () => useQuery({
  queryKey: XIAOBAO_PUSH_SUBSCRIPTIONS_QUERY_KEY,
  queryFn: xiaoBaoPushApi.listSubscriptions,
});

const usePushMutation = (
  mutationFn: () => Promise<void>,
  successTitle: string,
  successDescription?: string,
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: XIAOBAO_PUSH_SUBSCRIPTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: XIAOBAO_PUSH_CAPABILITY_QUERY_KEY }),
      ]);
      toast({ title: successTitle, description: successDescription });
    },
    onError: (error: Error) => {
      toast({
        title: "Notifications couldn’t be updated",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useEnableXiaoBaoPush = () =>
  usePushMutation(enableXiaoBaoPush, "Notifications enabled on this device");

export const useRevokeXiaoBaoPush = () =>
  usePushMutation(revokeXiaoBaoPush, "Notifications revoked on this device");

export const useTestXiaoBaoPush = () =>
  usePushMutation(
    sendXiaoBaoPushTest,
    "Test notification requested",
    "The test never creates or changes a Xiao Bao inbox message.",
  );
