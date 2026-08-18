import { API_BASE_URL, ApiError } from "@/services/api";
import type {
  AgreementDetail,
  AgreementResponseType,
  AgreementRevisionInput,
  PersonalBoundary,
  PersonalBoundaryInput,
  PersonalGoal,
  PersonalGoalInput,
  RelationshipCareOverview,
  RelationshipRequest,
  RelationshipRequestInput,
} from "@/types/relationship-care";
import { processResponse } from "@/utils/api";
import { getSessionId } from "@/utils/cookies";
import { camelToSnake } from "@/utils/utils";

const BASE_PATH = `${API_BASE_URL}/relationship-care`;

const headers = (hasBody = false): HeadersInit => {
  const sessionId = getSessionId();
  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(sessionId ? { "X-Session-Id": sessionId } : {}),
  };
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${BASE_PATH}${path}`, init);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const detail = (data as { detail?: unknown }).detail;
    const message =
      typeof detail === "string"
        ? detail
        : response.status === 422
          ? "Please check the highlighted fields."
          : response.statusText || "Something went wrong.";
    throw new ApiError(response.status, message);
  }
  return processResponse<T>(await response.json());
};

const body = (value: unknown) => JSON.stringify(camelToSnake(value));

export const relationshipCareApi = {
  getOverview: () =>
    request<RelationshipCareOverview>("/overview", { headers: headers() }),

  createBoundary: (payload: PersonalBoundaryInput) =>
    request<PersonalBoundary>("/boundaries", {
      method: "POST",
      headers: headers(true),
      body: body(payload),
    }),
  updateBoundary: (id: string, payload: PersonalBoundaryInput) =>
    request<PersonalBoundary>(`/boundaries/${id}`, {
      method: "PATCH",
      headers: headers(true),
      body: body(payload),
    }),
  archiveBoundary: (id: string) =>
    request<PersonalBoundary>(`/boundaries/${id}/archive`, {
      method: "POST",
      headers: headers(),
    }),
  restoreBoundary: (id: string) =>
    request<PersonalBoundary>(`/boundaries/${id}/archive`, {
      method: "DELETE",
      headers: headers(),
    }),

  createRequest: (payload: RelationshipRequestInput) =>
    request<RelationshipRequest>("/requests", {
      method: "POST",
      headers: headers(true),
      body: body(payload),
    }),
  updateRequest: (id: string, payload: RelationshipRequestInput) =>
    request<RelationshipRequest>(`/requests/${id}`, {
      method: "PATCH",
      headers: headers(true),
      body: body(payload),
    }),
  archiveRequest: (id: string) =>
    request<RelationshipRequest>(`/requests/${id}/archive`, {
      method: "POST",
      headers: headers(),
    }),
  restoreRequest: (id: string) =>
    request<RelationshipRequest>(`/requests/${id}/archive`, {
      method: "DELETE",
      headers: headers(),
    }),

  getGoal: (id: string) =>
    request<PersonalGoal>(`/goals/${id}`, { headers: headers() }),
  createGoal: (payload: PersonalGoalInput) =>
    request<PersonalGoal>("/goals", {
      method: "POST",
      headers: headers(true),
      body: body(payload),
    }),
  updateGoal: (id: string, payload: Partial<PersonalGoalInput>) =>
    request<PersonalGoal>(`/goals/${id}`, {
      method: "PATCH",
      headers: headers(true),
      body: body(payload),
    }),
  archiveGoal: (id: string) =>
    request<PersonalGoal>(`/goals/${id}/archive`, {
      method: "POST",
      headers: headers(),
    }),
  restoreGoal: (id: string) =>
    request<PersonalGoal>(`/goals/${id}/archive`, {
      method: "DELETE",
      headers: headers(),
    }),

  getAgreement: (id: string) =>
    request<AgreementDetail>(`/agreements/${id}`, { headers: headers() }),
  createAgreement: (payload: AgreementRevisionInput) =>
    request<AgreementDetail>("/agreements", {
      method: "POST",
      headers: headers(true),
      body: body(payload),
    }),
  createRevision: (
    agreementId: string,
    currentRevisionId: string,
    payload: AgreementRevisionInput,
  ) =>
    request<AgreementDetail>(`/agreements/${agreementId}/revisions`, {
      method: "POST",
      headers: headers(true),
      body: body({ ...payload, expectedCurrentRevisionId: currentRevisionId }),
    }),
  proposeAgreement: (id: string) =>
    request<AgreementDetail>(`/agreements/${id}/propose`, {
      method: "POST",
      headers: headers(),
    }),
  acceptRevision: (revisionId: string) =>
    request<AgreementDetail>(`/agreement-revisions/${revisionId}/acceptance`, {
      method: "POST",
      headers: headers(),
    }),
  revokeAcceptance: (revisionId: string) =>
    request<AgreementDetail>(`/agreement-revisions/${revisionId}/acceptance`, {
      method: "DELETE",
      headers: headers(),
    }),
  respondToRevision: (revisionId: string, responseType: AgreementResponseType, note?: string) =>
    request<AgreementDetail>(`/agreement-revisions/${revisionId}/response`, {
      method: "POST",
      headers: headers(true),
      body: body({ responseType, note }),
    }),
  requestArchive: (agreementId: string) =>
    request<AgreementDetail>(`/agreements/${agreementId}/archive`, {
      method: "POST",
      headers: headers(),
    }),
  withdrawArchive: (agreementId: string) =>
    request<AgreementDetail>(`/agreements/${agreementId}/archive`, {
      method: "DELETE",
      headers: headers(),
    }),
};
