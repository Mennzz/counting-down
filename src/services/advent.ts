import { API_BASE_URL, ApiError } from "@/services/api";
import { processResponse } from "@/utils/api";
import type { AdventEntry, CreateAdventEntry } from "@/types/advent";
import { getSessionId } from "@/utils/cookies";

export const getAdventsByMe = async (): Promise<AdventEntry[]> => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }

  const response = await fetch(`${API_BASE_URL}/advent/by_me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Failed to fetch advents");
  }

  const data = await response.json();
  return await processResponse<AdventEntry[]>(data);
};

export const getAdventsForMe = async (): Promise<AdventEntry[]> => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }

  const response = await fetch(`${API_BASE_URL}/advent/for_me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Failed to fetch advents");
  }

  const data = await response.json();
  return await processResponse<AdventEntry[]>(data);
};

export const getTodayAdvents = async (): Promise<AdventEntry[]> => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }

  const response = await fetch(`${API_BASE_URL}/advent/today`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Failed to fetch today's advents");
  }

  const data = await response.json();
  return await processResponse<AdventEntry[]>(data);
};

export const getAdventsByDay = async (day: number): Promise<AdventEntry[]> => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }

  const response = await fetch(`${API_BASE_URL}/advent/day/${day}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Failed to fetch advents for day ${day}`);
  }

  const data = await response.json();
  return await processResponse<AdventEntry[]>(data);
};

export const getAdventById = async (id: string): Promise<AdventEntry | null> => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }

  const response = await fetch(`${API_BASE_URL}/advent/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new ApiError(response.status, "Failed to fetch advent");
  }

  const data = await response.json();
  return await processResponse<AdventEntry>(data);
};

export const createAdvent = async (
  advent: CreateAdventEntry,
  image: File
): Promise<AdventEntry> => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }

  const formData = new FormData();
  formData.append("day", advent.day.toString());
  formData.append("title", advent.title);
  formData.append("description", advent.description);
  formData.append("type", advent.type);
  formData.append("image", image);

  const response = await fetch(`${API_BASE_URL}/advent/`, {
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
      errorData.detail || "Failed to create advent"
    );
  }

  const data = await response.json();
  return await processResponse<AdventEntry>(data);
};

export const deleteAdvent = async (id: string): Promise<void> => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }

  const response = await fetch(`${API_BASE_URL}/advent/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Failed to delete advent");
  }
};
