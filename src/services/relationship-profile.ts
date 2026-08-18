import { API_BASE_URL, ApiError } from "@/services/api";
import type {
  RelationshipProfile,
  RelationshipProfileInput,
} from "@/types/relationship-profile";
import { processResponse } from "@/utils/api";
import { getSessionId } from "@/utils/cookies";
import { camelToSnake } from "@/utils/utils";

const BASE_PATH = `${API_BASE_URL}/relationship-profile`;

const headers = (hasBody = false): HeadersInit => {
  const sessionId = getSessionId();
  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(sessionId ? { "X-Session-Id": sessionId } : {}),
  };
};

const request = async (init: RequestInit = {}): Promise<RelationshipProfile> => {
  const response = await fetch(BASE_PATH, init);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const detail = (data as { detail?: unknown }).detail;
    throw new ApiError(
      response.status,
      typeof detail === "string" ? detail : "Relationship context could not be saved.",
    );
  }
  return processResponse<RelationshipProfile>(await response.json());
};

export const relationshipProfileApi = {
  get: () => request({ headers: headers() }),
  update: (profile: RelationshipProfileInput) =>
    request({
      method: "PUT",
      headers: headers(true),
      body: JSON.stringify(camelToSnake(profile)),
    }),
};
