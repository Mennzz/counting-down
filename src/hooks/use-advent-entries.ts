import { useCallback, useEffect, useRef, useState } from "react";

import { deleteAdvent, getAdventsByMe, getAdventsForMe } from "@/services/advent";
import { fetchImageWithAuth } from "@/services/image";
import type { AdventEntry } from "@/types/advent";
import type { AdventViewMode } from "@/types/advent-calendar";

type ImageCache = Record<string, string>;

const IMAGE_BATCH_SIZE = 4;

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
    const cacheRef = imageCacheRef;
    const loadedKeysRef = loadedImageKeysRef;

    return () => {
      isMountedRef.current = false;
      Object.values(cacheRef.current).forEach((url) => revokeObjectURL(url));
      cacheRef.current = {};
      loadedKeysRef.current.clear();
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
      setLoadError(null);
      setIsLoading(false);

      const entriesToLoad = data.filter((advent) => {
        const key = advent.imageKey;
        return key && !loadedImageKeysRef.current.has(key);
      });

      for (let index = 0; index < entriesToLoad.length; index += IMAGE_BATCH_SIZE) {
        const batch = entriesToLoad.slice(index, index + IMAGE_BATCH_SIZE);

        const results = await Promise.all(
          batch.map(async (advent) => {
            const key = advent.imageKey;
            if (!key) {
              return null;
            }

            try {
              const blob = await fetchImageWithAuth(key);
              const url = URL.createObjectURL(blob);

              if (!isMountedRef.current) {
                revokeObjectURL(url);
                return null;
              }

              return { key, url };
            } catch (error) {
              console.error(`Failed to load image for ${key}`, error);
              return null;
            }
          })
        );

        if (!isMountedRef.current) {
          results.forEach((result) => {
            if (result) {
              revokeObjectURL(result.url);
            }
          });
          return;
        }

        const batchUpdates: ImageCache = {};

        results.forEach((result) => {
          if (!result) {
            return;
          }

          const { key, url } = result;
          if (loadedImageKeysRef.current.has(key)) {
            revokeObjectURL(url);
            return;
          }

          loadedImageKeysRef.current.add(key);
          batchUpdates[key] = url;
        });

        if (Object.keys(batchUpdates).length > 0) {
          setImageCache((prev) => {
            const next = { ...prev, ...batchUpdates };
            imageCacheRef.current = next;
            return next;
          });
        }
      }
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
