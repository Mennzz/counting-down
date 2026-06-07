import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { mediationApi } from "@/services/mediation";
import type {
  CreateMediationCommentRequest,
  CreateMediationSessionRequest,
  MediationSessionDetailResponse,
  SavePerspectiveDraftRequest,
} from "@/types/mediation";

export const MEDIATION_QUERY_KEY = ["mediation"];

const sessionsKey = [...MEDIATION_QUERY_KEY, "sessions"];
const sessionKey = (sessionId: string) => [...sessionsKey, sessionId];
const perspectiveKey = (sessionId: string) => [...sessionKey(sessionId), "perspective", "me"];
const reflectionKey = (sessionId: string) => [...sessionKey(sessionId), "reflection", "me"];
const adviceKey = (sessionId: string) => [...sessionKey(sessionId), "advice"];
const commentsKey = (sessionId: string) => [...sessionKey(sessionId), "comments"];

export const shouldPollSession = (session?: MediationSessionDetailResponse | null) => {
  if (!session) return false;

  return (
    session.status === "AI_MEDIATION_PROCESSING" ||
    session.my_perspective?.status === "SUBMITTED_PENDING_REVIEW" ||
    session.my_reflection_status === "PROCESSING" ||
    session.advice_status === "PROCESSING"
  );
};

export const useMediationSessions = () =>
  useQuery({
    queryKey: sessionsKey,
    queryFn: mediationApi.listMediationSessions,
    staleTime: 30_000,
  });

export const useMediationSession = (sessionId?: string) =>
  useQuery({
    queryKey: sessionId ? sessionKey(sessionId) : [...sessionsKey, "missing"],
    queryFn: () => mediationApi.getMediationSession(sessionId as string),
    enabled: Boolean(sessionId),
    refetchInterval: (query) => (shouldPollSession(query.state.data) ? 3000 : false),
  });

export const useMyPerspective = (sessionId?: string) =>
  useQuery({
    queryKey: sessionId ? perspectiveKey(sessionId) : [...MEDIATION_QUERY_KEY, "perspective", "missing"],
    queryFn: () => mediationApi.getMyPerspective(sessionId as string),
    enabled: Boolean(sessionId),
    retry: (failureCount, error: Error & { status?: number }) =>
      error.status === 404 ? false : failureCount < 2,
  });

export const useMyReflection = (sessionId?: string, enabled = true) =>
  useQuery({
    queryKey: sessionId ? reflectionKey(sessionId) : [...MEDIATION_QUERY_KEY, "reflection", "missing"],
    queryFn: () => mediationApi.getMyReflection(sessionId as string),
    enabled: Boolean(sessionId) && enabled,
    refetchInterval: (query) => (query.state.data?.status === "PROCESSING" ? 3000 : false),
  });

export const useMediationAdvice = (sessionId?: string, enabled = true) =>
  useQuery({
    queryKey: sessionId ? adviceKey(sessionId) : [...MEDIATION_QUERY_KEY, "advice", "missing"],
    queryFn: () => mediationApi.getAdvice(sessionId as string),
    enabled: Boolean(sessionId) && enabled,
    refetchInterval: (query) => (query.state.data?.status === "PROCESSING" ? 3000 : false),
  });

export const useMediationComments = (sessionId?: string, enabled = true, poll = false) =>
  useQuery({
    queryKey: sessionId ? commentsKey(sessionId) : [...MEDIATION_QUERY_KEY, "comments", "missing"],
    queryFn: () => mediationApi.listComments(sessionId as string),
    enabled: Boolean(sessionId) && enabled,
    refetchInterval: poll ? 3000 : false,
  });

export const useCreateMediationSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateMediationSessionRequest) => mediationApi.createMediationSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKey });
      toast({ title: "Mediation session created" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Could not create session", description: error.message });
    },
  });
};

export const useSaveMyPerspectiveDraft = (sessionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: SavePerspectiveDraftRequest) =>
      mediationApi.saveMyPerspectiveDraft(sessionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: perspectiveKey(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKey(sessionId) });
      toast({ title: "Draft saved" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Could not save draft", description: error.message });
    },
  });
};

export const useSubmitMyPerspective = (sessionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => mediationApi.submitMyPerspective(sessionId),
    onSuccess: (response) => {
      queryClient.setQueryData(perspectiveKey(sessionId), response.perspective);
      queryClient.invalidateQueries({ queryKey: perspectiveKey(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKey(sessionId) });
      queryClient.invalidateQueries({ queryKey: reflectionKey(sessionId) });
      toast({ title: "Perspective submitted", description: "Checking safety and preparing reflection." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Could not submit perspective", description: error.message });
    },
  });
};

export const useResolveMediationSession = (sessionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => mediationApi.resolveMediationSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKey(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionsKey });
      toast({ title: "Resolve marked" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Could not resolve mediation", description: error.message });
    },
  });
};

export const useUnresolveMediationSession = (sessionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => mediationApi.unresolveMediationSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKey(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionsKey });
      toast({ title: "Resolve mark removed" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Could not undo resolve", description: error.message });
    },
  });
};

export const useArchiveMediationSession = (sessionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => mediationApi.archiveMediationSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKey(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionsKey });
      toast({ title: "Mediation archived" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Could not archive mediation", description: error.message });
    },
  });
};

export const useUnarchiveMediationSession = (sessionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => mediationApi.unarchiveMediationSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKey(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionsKey });
      toast({ title: "Archive mark removed" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Could not undo archive", description: error.message });
    },
  });
};

export const useCreateMediationComment = (sessionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateMediationCommentRequest) => mediationApi.createComment(sessionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKey(sessionId) });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Could not post comment", description: error.message });
    },
  });
};

export const useCreateMediationReply = (sessionId: string, commentId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateMediationCommentRequest) =>
      mediationApi.createReply(sessionId, commentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey(sessionId) });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Could not post reply", description: error.message });
    },
  });
};
