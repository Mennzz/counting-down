import { API_BASE_URL, ApiError } from "@/services/api";
import type {
  XiaoBaoConversation,
  XiaoBaoConversationDetail,
  XiaoBaoInbox,
  XiaoBaoInboxMessage,
  XiaoBaoInboxUnreadCount,
  XiaoBaoProposal,
  XiaoBaoProposalPayload,
  XiaoBaoRoutine,
  XiaoBaoRoutineInput,
  XiaoBaoRoutineRunList,
  XiaoBaoSseEvent,
} from "@/types/xiaobao";
import { processResponse } from "@/utils/api";
import { getSessionId } from "@/utils/cookies";
import { camelToSnake } from "@/utils/utils";

const BASE_PATH = `${API_BASE_URL}/xiaobao`;

const headers = (hasBody = false): HeadersInit => {
  const sessionId = getSessionId();
  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(sessionId ? { "X-Session-Id": sessionId } : {}),
  };
};

const body = (value: unknown) => JSON.stringify(camelToSnake(value));

// `local_date` is a calendar choice in the selected timezone, not a UTC instant. The shared
// response normalizer intentionally converts date-looking values to instants, so restore this
// one schedule field before it reaches the reminder editor or display helpers.
const preserveLocalScheduleDates = <T,>(value: T): T => {
  if (Array.isArray(value)) return value.map(preserveLocalScheduleDates) as T;
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [
    key,
    key === "localDate" && typeof item === "string" ? item.slice(0, 10) : preserveLocalScheduleDates(item),
  ])) as T;
};

const apiError = async (response: Response): Promise<ApiError> => {
  const data = await response.json().catch(() => ({}));
  const detail = (data as { detail?: unknown }).detail;
  return new ApiError(
    response.status,
    typeof detail === "string" ? detail : response.statusText || "Xiao Bao could not do that.",
  );
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${BASE_PATH}${path}`, init);
  if (!response.ok) throw await apiError(response);
  if (response.status === 204) return undefined as T;
  return preserveLocalScheduleDates(await processResponse<T>(await response.json()));
};

export async function consumeSse(
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: XiaoBaoSseEvent) => void,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const consumeFrame = async (frame: string) => {
    const lines = frame.split("\n");
    const eventName = lines.find((line) => line.startsWith("event:"))?.slice(6).trim();
    const data = lines
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (!eventName || !data) return;
    const normalized = await processResponse<Record<string, unknown>>(JSON.parse(data));
    onEvent({ type: eventName, ...normalized } as XiaoBaoSseEvent);
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
    let boundary = buffer.indexOf("\n\n");
    while (boundary >= 0) {
      await consumeFrame(buffer.slice(0, boundary));
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");
    }
    if (done) break;
  }
  if (buffer.trim()) await consumeFrame(buffer);
}

const stream = async (
  path: string,
  payload: unknown | undefined,
  signal: AbortSignal,
  onEvent: (event: XiaoBaoSseEvent) => void,
) => {
  const response = await fetch(`${BASE_PATH}${path}`, {
    method: "POST",
    headers: headers(payload !== undefined),
    body: payload === undefined ? undefined : body(payload),
    signal,
  });
  if (!response.ok) throw await apiError(response);
  if (!response.body) throw new Error("This browser cannot read Xiao Bao’s response stream.");
  await consumeSse(response.body, onEvent);
};

export const xiaoBaoApi = {
  createConversation: () =>
    request<XiaoBaoConversation>("/conversations", { method: "POST", headers: headers() }),
  listConversations: () =>
    request<XiaoBaoConversation[]>("/conversations?limit=20", { headers: headers() }),
  getConversation: (id: string) =>
    request<XiaoBaoConversationDetail>(`/conversations/${id}`, { headers: headers() }),
  deleteConversation: (id: string) =>
    request<void>(`/conversations/${id}`, { method: "DELETE", headers: headers() }),
  sendMessage: (
    conversationId: string,
    content: string,
    clientMessageId: string,
    signal: AbortSignal,
    onEvent: (event: XiaoBaoSseEvent) => void,
  ) =>
    stream(
      `/conversations/${conversationId}/messages`,
      { content, clientMessageId },
      signal,
      onEvent,
    ),
  retryMessage: (
    conversationId: string,
    messageId: string,
    signal: AbortSignal,
    onEvent: (event: XiaoBaoSseEvent) => void,
  ) => stream(`/conversations/${conversationId}/messages/${messageId}/retry`, undefined, signal, onEvent),
  updateProposal: (id: string, payload: XiaoBaoProposalPayload) =>
    request<XiaoBaoProposal>(`/proposals/${id}`, {
      method: "PATCH",
      headers: headers(true),
      body: body({ payload }),
    }),
  acceptProposal: (id: string) =>
    request<XiaoBaoProposal>(`/proposals/${id}/accept`, { method: "POST", headers: headers() }),
  rejectProposal: (id: string) =>
    request<XiaoBaoProposal>(`/proposals/${id}/reject`, { method: "POST", headers: headers() }),
  listRoutines: () => request<XiaoBaoRoutine[]>("/routines", { headers: headers() }),
  createRoutine: (input: XiaoBaoRoutineInput) =>
    request<XiaoBaoRoutine>("/routines", {
      method: "POST",
      headers: headers(true),
      body: body(input),
    }),
  getRoutine: (id: string) => request<XiaoBaoRoutine>(`/routines/${id}`, { headers: headers() }),
  updateRoutine: (id: string, input: Partial<XiaoBaoRoutineInput>) =>
    request<XiaoBaoRoutine>(`/routines/${id}`, {
      method: "PATCH",
      headers: headers(true),
      body: body(input),
    }),
  deleteRoutine: (id: string) =>
    request<void>(`/routines/${id}`, { method: "DELETE", headers: headers() }),
  pauseRoutine: (id: string) =>
    request<XiaoBaoRoutine>(`/routines/${id}/pause`, { method: "POST", headers: headers() }),
  resumeRoutine: (id: string) =>
    request<XiaoBaoRoutine>(`/routines/${id}/resume`, { method: "POST", headers: headers() }),
  listRoutineRuns: (id: string) =>
    request<XiaoBaoRoutineRunList>(`/routines/${id}/runs`, { headers: headers() }),
  getInbox: ({
    limit = 50,
    routineId,
    cursor,
  }: {
    limit?: number;
    routineId?: string;
    cursor?: string;
  } = {}) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (routineId) params.set("routine_id", routineId);
    if (cursor) params.set("cursor", cursor);
    return request<XiaoBaoInbox>(`/inbox?${params.toString()}`, { headers: headers() });
  },
  getInboxUnreadCount: () =>
    request<XiaoBaoInboxUnreadCount>("/inbox/unread-count", { headers: headers() }),
  markInboxMessageRead: (messageId: string) =>
    request<XiaoBaoInboxMessage>(`/inbox/${messageId}/read`, {
      method: "POST",
      headers: headers(),
    }),
};
