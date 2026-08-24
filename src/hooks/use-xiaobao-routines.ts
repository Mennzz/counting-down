import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";
import { xiaoBaoApi } from "@/services/xiaobao";
import type {
  XiaoBaoInbox,
  XiaoBaoInboxMessage,
  XiaoBaoInboxUnreadCount,
  XiaoBaoRoutine,
  XiaoBaoRoutineInput,
} from "@/types/xiaobao";

export const XIAOBAO_ROUTINES_QUERY_KEY = ["xiaobao", "routines"] as const;
export const XIAOBAO_INBOX_QUERY_KEY = ["xiaobao", "inbox", "pages"] as const;
export const XIAOBAO_INBOX_UNREAD_QUERY_KEY = ["xiaobao", "inbox", "unread-count"] as const;
export const xiaoBaoRoutineRunsKey = (routineId: string) => [
  ...XIAOBAO_ROUTINES_QUERY_KEY,
  routineId,
  "runs",
] as const;

export const useXiaoBaoRoutines = () => useQuery({
  queryKey: XIAOBAO_ROUTINES_QUERY_KEY,
  queryFn: xiaoBaoApi.listRoutines,
});

export const useXiaoBaoRoutineRuns = (routineId: string) => useQuery({
  queryKey: xiaoBaoRoutineRunsKey(routineId),
  queryFn: () => xiaoBaoApi.listRoutineRuns(routineId),
  enabled: Boolean(routineId),
  staleTime: 20_000,
});

export const useXiaoBaoInbox = (routineId?: string) => useInfiniteQuery({
  queryKey: [...XIAOBAO_INBOX_QUERY_KEY, routineId ?? "all"],
  queryFn: ({ pageParam }) => xiaoBaoApi.getInbox({
    routineId,
    cursor: pageParam || undefined,
  }),
  initialPageParam: "",
  getNextPageParam: (lastPage) => lastPage.hasMoreMessages
    ? lastPage.nextCursor ?? undefined
    : undefined,
});

export const useXiaoBaoInboxUnreadCount = () => useQuery({
  queryKey: XIAOBAO_INBOX_UNREAD_QUERY_KEY,
  queryFn: xiaoBaoApi.getInboxUnreadCount,
  staleTime: 20_000,
  refetchInterval: 60_000,
});

const useRoutineMutation = <TVariables,>(
  mutationFn: (variables: TVariables) => Promise<XiaoBaoRoutine | void>,
  successTitle: string,
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: XIAOBAO_ROUTINES_QUERY_KEY });
      toast({ title: successTitle });
    },
    onError: (error: Error) => {
      toast({
        title: "That routine couldn’t be updated",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCreateXiaoBaoRoutine = () =>
  useRoutineMutation<XiaoBaoRoutineInput>(xiaoBaoApi.createRoutine, "Routine created");

export const useUpdateXiaoBaoRoutine = () =>
  useRoutineMutation<{ id: string; input: Partial<XiaoBaoRoutineInput> }>(
    ({ id, input }) => xiaoBaoApi.updateRoutine(id, input),
    "Routine updated",
  );

export const usePauseXiaoBaoRoutine = () =>
  useRoutineMutation<string>(xiaoBaoApi.pauseRoutine, "Routine paused");

export const useResumeXiaoBaoRoutine = () =>
  useRoutineMutation<string>(xiaoBaoApi.resumeRoutine, "Routine resumed");

export const useDeleteXiaoBaoRoutine = () =>
  useRoutineMutation<string>(xiaoBaoApi.deleteRoutine, "Routine deleted");

export const useMarkXiaoBaoInboxMessageRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: xiaoBaoApi.markInboxMessageRead,
    onSuccess: (message: XiaoBaoInboxMessage) => {
      queryClient.setQueriesData<InfiniteData<XiaoBaoInbox>>({ queryKey: XIAOBAO_INBOX_QUERY_KEY }, (current) => {
        if (!current) return current;
        const wasUnread = current.pages.some((page) =>
          page.messages.some((item) => item.id === message.id && !item.readAt),
        );
        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            messages: page.messages.map((item) => item.id === message.id ? message : item),
            unreadCount: wasUnread ? Math.max(0, page.unreadCount - 1) : page.unreadCount,
          })),
        };
      });
      queryClient.setQueryData<XiaoBaoInboxUnreadCount>(XIAOBAO_INBOX_UNREAD_QUERY_KEY, (current) => ({
        unreadCount: Math.max(0, (current?.unreadCount ?? 1) - 1),
      }));
      void queryClient.invalidateQueries({ queryKey: XIAOBAO_INBOX_UNREAD_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: XIAOBAO_INBOX_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast({
        title: "That message couldn’t be marked as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
