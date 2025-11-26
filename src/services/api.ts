export const API_BASE_URL = import.meta.env.DEV
  ? "/api/v1"
  : "https://counting-down-fastapi-c061e3e79aa6.herokuapp.com/api/v1";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}
