export interface LoginResponse {
  sessionId: string;
  userType: string;
  createdAt: string;
  expiresAt: string;
}

export interface LoginRequest {
  accessKey: string;
}
