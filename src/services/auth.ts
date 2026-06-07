import { API_BASE_URL, ApiError } from "@/services/api";
import { processResponse } from "@/utils/api";
import type { LoginResponse, LoginRequest } from "@/types/auth";
import { setCookie, clearSession } from "@/utils/cookies";

export const login = async (accessKey: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ access_key: accessKey }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.detail || "Login failed. Please check your password."
    );
  }

  const data = await response.json();
  const loginData = await processResponse<LoginResponse>(data);
  const sessionCookieId = loginData.sessionCookieId ?? loginData.sessionId;

  if (!sessionCookieId) {
    throw new ApiError(500, "Login response did not include a session cookie id.");
  }

  // Store session_cookie_id, expires_at, and user_type in cookies
  setCookie("session_cookie_id", sessionCookieId, loginData.expiresAt);
  setCookie("session_expires_at", loginData.expiresAt, loginData.expiresAt);
  setCookie("user_type", loginData.userType, loginData.expiresAt);

  return loginData;
};

export const logout = async (sessionId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Id": sessionId,
      },
    });

    if (!response.ok) {
      console.error("Logout failed on server");
    }
  } finally {
    // Always clear cookies regardless of server response
    clearSession();
  }
};
