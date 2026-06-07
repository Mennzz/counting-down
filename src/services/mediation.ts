import { API_BASE_URL, ApiError } from "@/services/api";
import { getSessionId } from "@/utils/cookies";
import type {
  CreateMediationCommentRequest,
  CreateMediationSessionRequest,
  MediationComment,
  MediationPerspective,
  MediationSessionDetailResponse,
  MediationSessionListItem,
  AdviceEndpointResponse,
  ReflectionEndpointResponse,
  SavePerspectiveDraftRequest,
  SubmitPerspectiveResponse,
} from "@/types/mediation";

const MEDIATION_SESSIONS_PATH = `${API_BASE_URL}/mediation-sessions`;

const authHeaders = (hasBody = false): HeadersInit => {
  const sessionId = getSessionId();

  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(sessionId ? { "X-Session-Id": sessionId } : {}),
  };
};

const formatValidationError = (detail: unknown): string => {
  if (!Array.isArray(detail)) {
    return "Please check the form and try again.";
  }

  return detail
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const location = Array.isArray(record.loc) ? record.loc.join(".") : "field";
      return `${location}: ${record.msg ?? "Invalid value"}`;
    })
    .filter(Boolean)
    .join(", ");
};

const friendlyConflictMessage = (fallback: string): string => {
  const normalized = fallback.toLowerCase();

  if (normalized.includes("perspective") && normalized.includes("submitted")) {
    return "This perspective has already been submitted.";
  }
  if (normalized.includes("comment")) {
    return "Comments open after shared advice is ready.";
  }
  if (normalized.includes("archived")) {
    return "This session is archived.";
  }
  if (normalized.includes("resolved")) {
    return "This mediation is already resolved.";
  }
  if (normalized.includes("safety") || normalized.includes("blocked")) {
    return "This mediation has paused for safety.";
  }

  return fallback || "This action is not available right now.";
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  const data = await response.json().catch(() => ({}));
  const detail = (data as Record<string, unknown>).detail;
  const message = (data as Record<string, unknown>).message;
  const rawMessage =
    typeof detail === "string"
      ? detail
      : typeof message === "string"
        ? message
        : response.statusText || `HTTP ${response.status}`;

  if (response.status === 401) return "Please log in again.";
  if (response.status === 404) return "The requested mediation item was not found.";
  if (response.status === 409) return friendlyConflictMessage(rawMessage);
  if (response.status === 422) return formatValidationError(detail);

  return rawMessage;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(path, init);

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const mediationApi = {
  createMediationSession: (payload: CreateMediationSessionRequest) =>
    request<MediationSessionDetailResponse>(MEDIATION_SESSIONS_PATH, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(payload),
    }),

  listMediationSessions: () =>
    request<MediationSessionListItem[]>(MEDIATION_SESSIONS_PATH, {
      headers: authHeaders(),
    }),

  getMediationSession: (sessionId: string) =>
    request<MediationSessionDetailResponse>(`${MEDIATION_SESSIONS_PATH}/${sessionId}`, {
      headers: authHeaders(),
    }),

  resolveMediationSession: (sessionId: string) =>
    request<MediationSessionDetailResponse>(`${MEDIATION_SESSIONS_PATH}/${sessionId}/resolve`, {
      method: "POST",
      headers: authHeaders(),
    }),

  unresolveMediationSession: (sessionId: string) =>
    request<MediationSessionDetailResponse>(`${MEDIATION_SESSIONS_PATH}/${sessionId}/resolve`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  archiveMediationSession: (sessionId: string) =>
    request<MediationSessionDetailResponse>(`${MEDIATION_SESSIONS_PATH}/${sessionId}/archive`, {
      method: "POST",
      headers: authHeaders(),
    }),

  unarchiveMediationSession: (sessionId: string) =>
    request<MediationSessionDetailResponse>(`${MEDIATION_SESSIONS_PATH}/${sessionId}/archive`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  getMyPerspective: (sessionId: string) =>
    request<MediationPerspective>(`${MEDIATION_SESSIONS_PATH}/${sessionId}/perspectives/me`, {
      headers: authHeaders(),
    }),

  saveMyPerspectiveDraft: (sessionId: string, payload: SavePerspectiveDraftRequest) =>
    request<MediationPerspective>(`${MEDIATION_SESSIONS_PATH}/${sessionId}/perspectives/me/draft`, {
      method: "PUT",
      headers: authHeaders(true),
      body: JSON.stringify(payload),
    }),

  submitMyPerspective: (sessionId: string) =>
    request<SubmitPerspectiveResponse>(`${MEDIATION_SESSIONS_PATH}/${sessionId}/perspectives/me/submit`, {
      method: "POST",
      headers: authHeaders(),
    }),

  getMyReflection: (sessionId: string) =>
    request<ReflectionEndpointResponse>(`${MEDIATION_SESSIONS_PATH}/${sessionId}/reflections/me`, {
      headers: authHeaders(),
    }),

  getAdvice: (sessionId: string) =>
    request<AdviceEndpointResponse>(`${MEDIATION_SESSIONS_PATH}/${sessionId}/advice`, {
      headers: authHeaders(),
    }),

  listComments: (sessionId: string) =>
    request<MediationComment[]>(`${MEDIATION_SESSIONS_PATH}/${sessionId}/comments`, {
      headers: authHeaders(),
    }),

  createComment: (sessionId: string, payload: CreateMediationCommentRequest) =>
    request<MediationComment>(`${MEDIATION_SESSIONS_PATH}/${sessionId}/comments`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(payload),
    }),

  createReply: (sessionId: string, commentId: string, payload: CreateMediationCommentRequest) =>
    request<MediationComment>(
      `${MEDIATION_SESSIONS_PATH}/${sessionId}/comments/${commentId}/replies`,
      {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(payload),
      }
    ),
};
