import { useCallback, useEffect, useState } from "react";
import { getUserType } from "@/utils/cookies";

const getStorageKey = () => `advent-opened-days-${new Date().getUTCFullYear()}-${getUserType() ?? "unknown"}`;

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
  const storageKey = getStorageKey();
  const [openedDays, setOpenedDays] = useState<Set<number>>(() =>
    typeof window === "undefined" ? new Set() : parseStoredDays(localStorage.getItem(storageKey))
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(Array.from(openedDays)));
  }, [openedDays, storageKey]);

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
