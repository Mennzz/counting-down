import { useCallback, useEffect, useRef, useState } from "react";

import { deleteAdvent, getAdventsByMe, getAdventsForMe } from "@/services/advent";
import { fetchImageWithAuth } from "@/services/image";
import type { AdventEntry } from "@/types/advent";
import type { AdventViewMode } from "@/types/advent-calendar";

type ImageCache = Record<string, string>;

const revokeObjectURL = (url: string) => {
  try {
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to revoke object URL:", error);
  }
};

export const useAdventEntries = (viewMode: AdventViewMode) => {
  const [advents, setAdvents] = useState<AdventEntry[]>([]);
  const [imageCache, setImageCache] = useState<ImageCache>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);

  const loadedImageKeysRef = useRef(new Set<string>());
  const imageCacheRef = useRef<ImageCache>({});
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      Object.values(imageCacheRef.current).forEach((url) => revokeObjectURL(url));
      imageCacheRef.current = {};
      loadedImageKeysRef.current.clear();
    };
  }, []);

  const loadAdvents = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = viewMode === "for-me" ? await getAdventsForMe() : await getAdventsByMe();
      if (!isMountedRef.current) {
        return;
      }

      setAdvents(data);

      for (const advent of data) {
        const key = advent.imageKey;
        if (!key || loadedImageKeysRef.current.has(key)) {
          continue;
        }

        try {
          const blob = await fetchImageWithAuth(key);
          const url = URL.createObjectURL(blob);

          if (!isMountedRef.current) {
            revokeObjectURL(url);
            return;
          }

          loadedImageKeysRef.current.add(key);
          setImageCache((prev) => {
            const next = { ...prev, [key]: url };
            imageCacheRef.current = next;
            return next;
          });
        } catch (error) {
          console.error(`Failed to load image for ${key}`, error);
        }
      }

      setLoadError(null);
    } catch (error) {
      console.error("Failed to load advents:", error);
      setLoadError(error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [viewMode]);

  useEffect(() => {
    void loadAdvents();
  }, [loadAdvents]);

  const deleteEntry = useCallback(async (entry: AdventEntry) => {
    await deleteAdvent(entry.id);
    if (!isMountedRef.current) {
      return;
    }

    setAdvents((prev) => prev.filter((existing) => existing.id !== entry.id));

    const key = entry.imageKey;
    if (!key) {
      return;
    }

    setImageCache((prev) => {
      const cachedUrl = prev[key];
      if (!cachedUrl) {
        return prev;
      }

      const next = { ...prev };
      delete next[key];
      revokeObjectURL(cachedUrl);
      imageCacheRef.current = next;
      return next;
    });

    loadedImageKeysRef.current.delete(key);
  }, []);

  const getEntriesForDay = useCallback(
    (day: number) => advents.filter((entry) => entry.day === day),
    [advents]
  );

  return {
    advents,
    imageCache,
    isLoading,
    loadAdvents,
    deleteEntry,
    getEntriesForDay,
    loadError
  };
};
