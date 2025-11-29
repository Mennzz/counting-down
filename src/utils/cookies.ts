export const setCookie = (name: string, value: string, expiresAt?: string) => {
  let cookieString = `${name}=${encodeURIComponent(value)}; path=/`;

  if (expiresAt) {
    cookieString += `; expires=${new Date(expiresAt).toUTCString()}`;
  }

  document.cookie = cookieString;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
};

export const getSessionId = (): string | null => {
  return getCookie("session_id");
};

export const getSessionExpiry = (): string | null => {
  return getCookie("session_expires_at");
};

export const getUserType = (): string | null => {
  return getCookie("user_type");
};

export const isSessionValid = (): boolean => {
  const sessionId = getSessionId();
  const expiresAt = getSessionExpiry();

  if (!sessionId || !expiresAt) {
    return false;
  }

  const expiryDate = new Date(expiresAt);
  const now = new Date();

  return expiryDate > now;
};

export const clearSession = () => {
  deleteCookie("session_id");
  deleteCookie("session_expires_at");
  deleteCookie("user_type");
};
