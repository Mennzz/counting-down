/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { RELATIONSHIP_CARE_QUERY_KEY } from "@/hooks/use-relationship-care";
import { mediationKeys } from "@/hooks/use-mediation";
import { TODOS_QUERY_KEY } from "@/hooks/use-todos";
import { useToast } from "@/hooks/use-toast";
import { xiaoBaoApi } from "@/services/xiaobao";
import type {
  XiaoBaoConversation,
  XiaoBaoConversationDetail,
  XiaoBaoMessage,
  XiaoBaoProposal,
  XiaoBaoProposalPayload,
  XiaoBaoSseEvent,
} from "@/types/xiaobao";

export const XIAOBAO_QUERY_KEY = ["xiaobao"];
const conversationsKey = [...XIAOBAO_QUERY_KEY, "conversations"];
const conversationKey = (id: string) => [...XIAOBAO_QUERY_KEY, "conversation", id];

interface XiaoBaoContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeConversationId?: string;
  conversations: XiaoBaoConversation[];
  detail?: XiaoBaoConversationDetail;
  isLoading: boolean;
  isStreaming: boolean;
  liveMessageId?: string;
  startNewChat: () => Promise<string>;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  cancel: () => void;
  retry: (message: XiaoBaoMessage) => Promise<void>;
  updateProposal: (proposal: XiaoBaoProposal, payload: XiaoBaoProposalPayload) => Promise<void>;
  acceptProposal: (proposal: XiaoBaoProposal) => Promise<void>;
  rejectProposal: (proposal: XiaoBaoProposal) => Promise<void>;
}

const XiaoBaoContext = createContext<XiaoBaoContextValue | null>(null);

const emptyDetail = (conversation: XiaoBaoConversation): XiaoBaoConversationDetail => ({
  conversation,
  messages: [],
  proposals: [],
  hasMoreMessages: false,
});

export function XiaoBaoProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveMessageId, setLiveMessageId] = useState<string>();
  const controllerRef = useRef<AbortController>();

  const conversationsQuery = useQuery({
    queryKey: conversationsKey,
    queryFn: xiaoBaoApi.listConversations,
    staleTime: 20_000,
  });
  const resolvedId = activeConversationId ?? conversationsQuery.data?.[0]?.id;
  const detailQuery = useQuery({
    queryKey: resolvedId ? conversationKey(resolvedId) : [...XIAOBAO_QUERY_KEY, "empty"],
    queryFn: () => xiaoBaoApi.getConversation(resolvedId as string),
    enabled: Boolean(resolvedId),
  });

  useEffect(() => {
    if (isStreaming || !liveMessageId) return;
    const timer = setTimeout(() => setLiveMessageId(undefined), 1_600);
    return () => clearTimeout(timer);
  }, [isStreaming, liveMessageId]);

  const setDetail = useCallback(
    (id: string, updater: (current: XiaoBaoConversationDetail) => XiaoBaoConversationDetail) => {
      queryClient.setQueryData<XiaoBaoConversationDetail>(conversationKey(id), (current) =>
        current ? updater(current) : current,
      );
    },
    [queryClient],
  );

  const startNewChat = useCallback(async () => {
    const conversation = await xiaoBaoApi.createConversation();
    queryClient.setQueryData<XiaoBaoConversationDetail>(conversationKey(conversation.id), emptyDetail(conversation));
    queryClient.setQueryData<XiaoBaoConversation[]>(conversationsKey, (current = []) => [
      conversation,
      ...current,
    ]);
    setActiveConversationId(conversation.id);
    setLiveMessageId(undefined);
    return conversation.id;
  }, [queryClient]);

  const applyEvent = useCallback(
    (id: string, event: XiaoBaoSseEvent) => {
      if (event.type === "action.completed" && event.completedActions.length > 0) {
        void queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      }
      if (
        event.type === "assistant.started" ||
        event.type === "assistant.completed" ||
        event.type === "assistant.failed"
      ) {
        setLiveMessageId(event.message.id);
      }
      setDetail(id, (current) => {
        if (event.type === "message.accepted" || event.type === "assistant.started") {
          const message = event.message;
          const messages = current.messages.some((item) => item.id === message.id)
            ? current.messages.map((item) => (item.id === message.id ? message : item))
            : [...current.messages, message];
          return { ...current, messages };
        }
        if (event.type === "assistant.delta") {
          const messages = [...current.messages];
          const index = messages.findLastIndex(
            (item) => item.role === "ASSISTANT" && item.status === "GENERATING",
          );
          if (index >= 0) messages[index] = { ...messages[index], content: messages[index].content + event.delta };
          return { ...current, messages };
        }
        if (event.type === "assistant.completed" || event.type === "assistant.failed") {
          const message = event.message;
          const messages = message
            ? current.messages.map((item) => (item.id === message.id ? message : item))
            : current.messages;
          const proposals = event.type === "assistant.completed"
            ? [...current.proposals.filter((item) => item.messageId !== message.id), ...event.proposals]
            : current.proposals;
          return { ...current, messages, proposals };
        }
        return current;
      });
    },
    [queryClient, setDetail],
  );

  const runStream = useCallback(
    async (id: string, execute: (signal: AbortSignal, onEvent: (event: XiaoBaoSseEvent) => void) => Promise<void>) => {
      const controller = new AbortController();
      controllerRef.current = controller;
      setIsStreaming(true);
      try {
        await execute(controller.signal, (event) => applyEvent(id, event));
      } catch (error) {
        if (!controller.signal.aborted) {
          toast({
            title: "Xiao Bao couldn’t answer",
            description: error instanceof Error ? error.message : "Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        const wasCancelled = controller.signal.aborted;
        setIsStreaming(false);
        controllerRef.current = undefined;
        if (!wasCancelled) {
          await queryClient.invalidateQueries({ queryKey: conversationKey(id) });
        }
        await queryClient.invalidateQueries({ queryKey: conversationsKey });
      }
    },
    [applyEvent, queryClient, toast],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const id = resolvedId ?? (await startNewChat());
      await runStream(id, (signal, onEvent) =>
        xiaoBaoApi.sendMessage(id, content, crypto.randomUUID(), signal, onEvent),
      );
    },
    [resolvedId, runStream, startNewChat],
  );

  const retry = useCallback(
    async (message: XiaoBaoMessage) => {
      if (!resolvedId) return;
      await runStream(resolvedId, (signal, onEvent) =>
        xiaoBaoApi.retryMessage(resolvedId, message.id, signal, onEvent),
      );
    },
    [resolvedId, runStream],
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    const generatingMessage = detailQuery.data?.messages.findLast(
      (message) => message.status === "GENERATING",
    );
    setLiveMessageId(generatingMessage?.id);
    if (resolvedId) {
      setDetail(resolvedId, (current) => ({
        ...current,
        messages: current.messages.map((message) =>
          message.status === "GENERATING" ? { ...message, status: "CANCELLED" } : message,
        ),
      }));
    }
  }, [detailQuery.data?.messages, resolvedId, setDetail]);

  const selectConversation = useCallback((id: string) => {
    setLiveMessageId(undefined);
    setActiveConversationId(id);
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      await xiaoBaoApi.deleteConversation(id);
      queryClient.removeQueries({ queryKey: conversationKey(id) });
      const remaining = (conversationsQuery.data ?? []).filter((item) => item.id !== id);
      queryClient.setQueryData(conversationsKey, remaining);
      if (resolvedId === id) setActiveConversationId(remaining[0]?.id);
    },
    [conversationsQuery.data, queryClient, resolvedId],
  );

  const updateProposal = useCallback(
    async (proposal: XiaoBaoProposal, payload: XiaoBaoProposalPayload) => {
      const updated = await xiaoBaoApi.updateProposal(proposal.id, payload);
      setDetail(proposal.conversationId, (current) => ({
        ...current,
        proposals: current.proposals.map((item) => (item.id === updated.id ? updated : item)),
      }));
    },
    [setDetail],
  );

  const decideProposal = useCallback(
    async (proposal: XiaoBaoProposal, action: "accept" | "reject") => {
      const updated = action === "accept"
        ? await xiaoBaoApi.acceptProposal(proposal.id)
        : await xiaoBaoApi.rejectProposal(proposal.id);
      setDetail(proposal.conversationId, (current) => ({
        ...current,
        proposals: current.proposals.map((item) => (item.id === updated.id ? updated : item)),
      }));
      if (action === "accept") {
        if (proposal.type === "TOGETHER_LIST_ITEM") {
          await queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
        } else if (proposal.type === "MEDIATION_SESSION") {
          await queryClient.invalidateQueries({ queryKey: mediationKeys.sessions });
        } else if (proposal.type === "MEDIATION_COMMENT" && proposal.target) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: mediationKeys.session(proposal.target.id) }),
            queryClient.invalidateQueries({ queryKey: mediationKeys.comments(proposal.target.id) }),
          ]);
        } else if (proposal.type === "MEDIATION_PERSPECTIVE_DRAFT" && proposal.target) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: mediationKeys.session(proposal.target.id) }),
            queryClient.invalidateQueries({ queryKey: mediationKeys.perspective(proposal.target.id) }),
          ]);
        } else {
          await queryClient.invalidateQueries({ queryKey: RELATIONSHIP_CARE_QUERY_KEY });
        }
        await queryClient.invalidateQueries({ queryKey: conversationKey(proposal.conversationId) });
      }
    },
    [queryClient, setDetail],
  );

  const value = useMemo<XiaoBaoContextValue>(() => ({
    isOpen,
    setIsOpen,
    activeConversationId: resolvedId,
    conversations: conversationsQuery.data ?? [],
    detail: detailQuery.data,
    isLoading: detailQuery.isLoading,
    isStreaming,
    liveMessageId,
    startNewChat,
    selectConversation,
    deleteConversation,
    sendMessage,
    cancel,
    retry,
    updateProposal,
    acceptProposal: (proposal) => decideProposal(proposal, "accept"),
    rejectProposal: (proposal) => decideProposal(proposal, "reject"),
  }), [
    conversationsQuery.data,
    cancel,
    deleteConversation,
    detailQuery.data,
    detailQuery.isLoading,
    isOpen,
    isStreaming,
    liveMessageId,
    resolvedId,
    retry,
    sendMessage,
    selectConversation,
    startNewChat,
    updateProposal,
    decideProposal,
  ]);

  return <XiaoBaoContext.Provider value={value}>{children}</XiaoBaoContext.Provider>;
}

export const useXiaoBao = () => {
  const value = useContext(XiaoBaoContext);
  if (!value) throw new Error("useXiaoBao must be used inside XiaoBaoProvider");
  return value;
};
