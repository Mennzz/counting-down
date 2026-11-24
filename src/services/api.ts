import { resolveApiBaseUrl } from "@/services/api-base-url";

export const API_BASE_URL = resolveApiBaseUrl(import.meta.env);

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}
