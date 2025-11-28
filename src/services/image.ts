import { API_BASE_URL, ApiError } from "@/services/api";
import { getSessionId } from "@/utils/cookies";

export const uploadImage = async (key: string, file: File): Promise<void> => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/images/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      "X-Session-Id": sessionId,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.detail || "Failed to upload images"
    );
  }
};

export const getImageUrl = (key: string): string => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }

  return `${API_BASE_URL}/images/${encodeURIComponent(key)}`;
};

export const fetchImageWithAuth = async (key: string): Promise<Blob> => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }

  const response = await fetch(`${API_BASE_URL}/images/${encodeURIComponent(key)}`, {
    method: "GET",
    headers: {
      "X-Session-Id": sessionId,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(404, "images not found");
    }
    throw new ApiError(response.status, "Failed to fetch images");
  }

  return await response.blob();
};
