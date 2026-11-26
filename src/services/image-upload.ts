import { API_BASE_URL, ApiError } from "@/services/api";
import { processResponse } from "@/utils/api";
import { getSessionId } from "@/utils/cookies";

export type ImageUploadPurpose = "gallery" | "advent";

type UploadTicket = {
  uploadKey: string;
  url: string;
  fields: { name: string; value: string }[];
  expiresAt: string;
  maxBytes: number;
};

const EXTENSION_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

/** Some browsers leave `File.type` empty (often for HEIC photos); fall back to the extension. */
export const imageContentType = (file: File): string => {
  if (/^image\/[a-z0-9.+-]+$/.test(file.type)) {
    return file.type;
  }
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TYPES[extension] ?? "image/jpeg";
};

const sessionHeader = (): string => {
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error("No active session");
  }
  return sessionId;
};

const errorDetail = async (response: Response, fallback: string): Promise<string> => {
  const body = await response.json().catch(() => ({}));
  return typeof body?.detail === "string" ? body.detail : fallback;
};

/**
 * Upload the original photo straight to S3 and return its upload key.
 *
 * The API hands out a short-lived form bound to one key, the content type and a size limit;
 * the file itself never passes through the API, so photos are not limited by the API's
 * request size. Pass the key to the matching `.../from-upload` endpoint afterwards.
 */
export const uploadImageDirect = async (
  file: File,
  purpose: ImageUploadPurpose,
): Promise<string> => {
  const contentType = imageContentType(file);
  const ticketResponse = await fetch(`${API_BASE_URL}/images/uploads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionHeader(),
    },
    body: JSON.stringify({ purpose, content_type: contentType, size_bytes: file.size }),
  });
  if (!ticketResponse.ok) {
    throw new ApiError(
      ticketResponse.status,
      await errorDetail(ticketResponse, "Could not start the upload"),
    );
  }
  const ticket = await processResponse<UploadTicket>(await ticketResponse.json());

  // S3 requires the signed fields first and the file last.
  const form = new FormData();
  for (const field of ticket.fields) {
    form.append(field.name, field.value);
  }
  form.append("file", new File([file], file.name, { type: contentType }));

  const uploadResponse = await fetch(ticket.url, { method: "POST", body: form });
  if (!uploadResponse.ok) {
    throw new ApiError(
      uploadResponse.status,
      "The photo could not be uploaded. Please try again.",
    );
  }
  return ticket.uploadKey;
};
