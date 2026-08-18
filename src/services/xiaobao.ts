import { API_BASE_URL, ApiError } from "@/services/api";
import type {
  XiaoBaoConversation,
  XiaoBaoConversationDetail,
  XiaoBaoProposal,
  XiaoBaoProposalPayload,
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
  return processResponse<T>(await response.json());
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
};
