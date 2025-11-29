import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRelativeTimeAsText(dateString: string | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const interval in intervals) {
    const intervalSeconds = intervals[interval];
    if (diffInSeconds >= intervalSeconds) {
      const count = Math.floor(diffInSeconds / intervalSeconds);
      return `${count} ${interval}${count !== 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

// Convert object keys from snake_case to camelCase recursively.
type UnknownRecord = Record<string, unknown>;

export function snakeToCamel<T = unknown>(value: unknown): T {
  if (value == null || typeof value !== "object") {
    return value as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => snakeToCamel(item)) as unknown as T;
  }

  const input = value as UnknownRecord;
  const result: UnknownRecord = {};

  for (const [key, val] of Object.entries(input)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = snakeToCamel(val);
  }

  return result as T;
}

// Convert object keys from camelCase to snake_case recursively.
export function camelToSnake<T = unknown>(value: unknown): T {
  if (value == null || typeof value !== "object") {
    return value as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => camelToSnake(item)) as unknown as T;
  }

  const input = value as UnknownRecord;
  const result: UnknownRecord = {};

  for (const [key, val] of Object.entries(input)) {
    const snakeKey = key.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
    result[snakeKey] = camelToSnake(val);
  }

  return result as T;
}
