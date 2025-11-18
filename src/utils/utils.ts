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
export function snakeToCamel<T = any>(value: any): T {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map((v) => snakeToCamel(v)) as any;
  if (typeof value !== "object") return value;

  const res: any = {};
  for (const key of Object.keys(value)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    res[camelKey] = snakeToCamel(value[key]);
  }
  return res as T;
}

// Convert object keys from camelCase to snake_case recursively.
export function camelToSnake<T = any>(value: any): T {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map((v) => camelToSnake(v)) as any;
  if (typeof value !== "object") return value;

  const res: any = {};
  for (const key of Object.keys(value)) {
    const snakeKey = key.replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`);
    res[snakeKey] = camelToSnake(value[key]);
  }
  return res as T;
}
