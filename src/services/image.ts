import { API_BASE_URL, ApiError } from "@/services/api";
import { processResponse } from "@/utils/api";
import { getSessionId } from "@/utils/cookies";

export type ImageMetadata = {
  id?: string | null;
  uploadedBy: string;
  title?: string;
  description?: string;
  imageKey: string;
  imageTags?: string[];
  mediaType?: string | null;
  uploadedAt?: string;
  url: string;
  thumbnailUrl?: string | null;
  thumbnailXlUrl?: string | null;
};

export type ImagePageResponse = {
  items: ImageMetadata[];
  nextCursor?: string | null;
};

type ImageListParams = {
  limit?: number;
  cursor?: string | null;
};

type CreateImagePayload = {
  image: File;
  uploadedBy: string;
  title?: string;
  description?: string;
  imageTags?: string[];
};

const getSessionHeader = () => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }
  return sessionId;
};

const fetchJson = async <T>(url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.detail || "Request failed");
  }
  const data = await response.json();
  return await processResponse<T>(data);
};

const buildListUrl = (path: string, params?: ImageListParams) => {
  const search = new URLSearchParams();
  if (params?.limit) {
    search.set("limit", params.limit.toString());
  }
  if (params?.cursor) {
    search.set("cursor", params.cursor);
  }
  const query = search.toString();
  return `${API_BASE_URL}${path}${query ? `?${query}` : ""}`;
};

export const listImages = async (
  params?: ImageListParams,
): Promise<ImagePageResponse> => {
  const sessionId = getSessionHeader();
  return await fetchJson<ImagePageResponse>(buildListUrl("/images", params), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    },
  });
};

export const listImagesByMe = async (
  params?: ImageListParams,
): Promise<ImagePageResponse> => {
  const sessionId = getSessionHeader();
  return await fetchJson<ImagePageResponse>(
    buildListUrl("/images/by_me", params),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Id": sessionId,
      },
    },
  );
};

export const listImagesForMe = async (
  params?: ImageListParams,
): Promise<ImagePageResponse> => {
  const sessionId = getSessionHeader();
  return await fetchJson<ImagePageResponse>(
    buildListUrl("/images/for_me", params),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Id": sessionId,
      },
    },
  );
};

export const createImageMetadata = async (
  payload: CreateImagePayload,
): Promise<ImageMetadata> => {
  const sessionId = getSessionHeader();
  const formData = new FormData();
  formData.append("image", payload.image);
  formData.append("uploaded_by", payload.uploadedBy);
  if (payload.title) {
    formData.append("title", payload.title);
  }
  if (payload.description) {
    formData.append("description", payload.description);
  }
  if (payload.imageTags?.length) {
    payload.imageTags.forEach((tag) => formData.append("image_tags", tag));
  }

  return await fetchJson<ImageMetadata>(`${API_BASE_URL}/images/`, {
    method: "POST",
    headers: {
      "X-Session-Id": sessionId,
    },
    body: formData,
  });
};

export const requestThumbnailGenerationByKey = async (
  key: string,
): Promise<void> => {
  const sessionId = getSessionHeader();
  const response = await fetch(
    `${API_BASE_URL}/images/${encodeURIComponent(key)}/thumbnail`,
    {
      method: "POST",
      headers: {
        "X-Session-Id": sessionId,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.detail || "Failed to request thumbnail generation",
    );
  }
};

export const getImageMetadataById = async (
  id: string,
): Promise<ImageMetadata> => {
  const sessionId = getSessionHeader();
  return await fetchJson<ImageMetadata>(
    `${API_BASE_URL}/images/${encodeURIComponent(id)}/meta`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Id": sessionId,
      },
    },
  );
};

export const uploadImage = async (key: string, file: File): Promise<void> => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/images/${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: {
        "X-Session-Id": sessionId,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.detail || "Failed to upload images",
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

  const response = await fetch(
    `${API_BASE_URL}/images/${encodeURIComponent(key)}`,
    {
      method: "GET",
      headers: {
        "X-Session-Id": sessionId,
      },
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(404, "images not found");
    }
    throw new ApiError(response.status, "Failed to fetch images");
  }

  return await response.blob();
};

export const requestThumbnailGeneration = async (
  key: string,
): Promise<void> => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }

  const response = await fetch(
    `${API_BASE_URL}/images/${encodeURIComponent(key)}/thumbnail`,
    {
      method: "POST",
      headers: {
        "X-Session-Id": sessionId,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.detail || "Failed to request thumbnail generation",
    );
  }
};

export const fetchThumbnailWithAuth = async (key: string): Promise<Blob> => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }

  const response = await fetch(
    `${API_BASE_URL}/images/${encodeURIComponent(key)}/thumbnail`,
    {
      method: "GET",
      headers: {
        "X-Session-Id": sessionId,
      },
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      try {
        await requestThumbnailGeneration(key);
      } catch (generationError) {
        console.error(
          "Failed to request thumbnail generation:",
          generationError,
        );
      }

      throw new ApiError(404, "thumbnail pending generation");
    }
    throw new ApiError(response.status, "Failed to fetch thumbnail");
  }

  return await response.blob();
};
