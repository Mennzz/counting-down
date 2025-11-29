import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "advent-opened-days";

const parseStoredDays = (rawValue: string | null): Set<number> => {
  if (!rawValue) {
    return new Set();
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      const validDays = parsed.filter((day): day is number => typeof day === "number");
      return new Set(validDays);
    }
  } catch (error) {
    console.error("Failed to parse opened days:", error);
  }

  return new Set();
};

export const useAdventOpenedDays = () => {
  const [openedDays, setOpenedDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setOpenedDays(parseStoredDays(localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(openedDays)));
  }, [openedDays]);

  const markDayOpened = useCallback((day: number) => {
    setOpenedDays((prev) => {
      if (prev.has(day)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(day);
      return next;
    });
  }, []);

  return {
    openedDays,
    markDayOpened,
    setOpenedDays
  };
};
