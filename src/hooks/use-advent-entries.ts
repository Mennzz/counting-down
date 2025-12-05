import { useCallback, useEffect, useRef, useState } from "react";

import { deleteAdvent, getAdventsByMe, getAdventsForMe } from "@/services/advent";
import { ApiError } from "@/services/api";
import { fetchImageWithAuth, fetchThumbnailWithAuth } from "@/services/image";
import type { AdventEntry } from "@/types/advent";
import type { AdventViewMode } from "@/types/advent-calendar";

type ImageCache = Record<string, string>;

const IMAGE_BATCH_SIZE = 4;
const THUMBNAIL_RETRY_DELAY = 2000;

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
  const [thumbnailCache, setThumbnailCache] = useState<ImageCache>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);

  const loadedImageKeysRef = useRef(new Set<string>());
  const loadedThumbnailKeysRef = useRef(new Set<string>());
  const imageCacheRef = useRef<ImageCache>({});
  const thumbnailCacheRef = useRef<ImageCache>({});
  const thumbnailRetryTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const isMountedRef = useRef(true);

  useEffect(() => {
    const cacheRef = imageCacheRef;
    const thumbnailRef = thumbnailCacheRef;
    const loadedKeysRef = loadedImageKeysRef;
    const loadedThumbKeysRef = loadedThumbnailKeysRef;
    const retryTimeoutsRef = thumbnailRetryTimeoutsRef;

    return () => {
      isMountedRef.current = false;
      Object.values(cacheRef.current).forEach((url) => revokeObjectURL(url));
      cacheRef.current = {};
      loadedKeysRef.current.clear();

      Object.values(thumbnailRef.current).forEach((url) => revokeObjectURL(url));
      thumbnailRef.current = {};
      loadedThumbKeysRef.current.clear();

      Object.values(retryTimeoutsRef.current).forEach((timeoutId) => clearTimeout(timeoutId));
      retryTimeoutsRef.current = {};
    };
  }, []);

  const fetchThumbnail = useCallback(async (key: string | null | undefined) => {
    if (!key || !isMountedRef.current) {
      return;
    }

    if (loadedThumbnailKeysRef.current.has(key) || thumbnailRetryTimeoutsRef.current[key]) {
      return;
    }

    try {
      const blob = await fetchThumbnailWithAuth(key);
      const url = URL.createObjectURL(blob);

      if (!isMountedRef.current) {
        revokeObjectURL(url);
        return;
      }

      const pendingRetry = thumbnailRetryTimeoutsRef.current[key];
      if (pendingRetry) {
        clearTimeout(pendingRetry);
        delete thumbnailRetryTimeoutsRef.current[key];
      }

      loadedThumbnailKeysRef.current.add(key);
      setThumbnailCache((prev) => {
        if (prev[key]) {
          revokeObjectURL(url);
          return prev;
        }

        const next = { ...prev, [key]: url };
        thumbnailCacheRef.current = next;
        return next;
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        if (thumbnailRetryTimeoutsRef.current[key]) {
          return;
        }

        thumbnailRetryTimeoutsRef.current[key] = setTimeout(() => {
          delete thumbnailRetryTimeoutsRef.current[key];
          if (isMountedRef.current) {
            void fetchThumbnail(key);
          }
        }, THUMBNAIL_RETRY_DELAY);
      } else {
        console.error(`Failed to load thumbnail for ${key}`, error);
      }
    }
  }, [fetchThumbnailWithAuth]);

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
        if (!key) {
          return false;
        }

        return !loadedThumbnailKeysRef.current.has(key);
      });

      for (let index = 0; index < entriesToLoad.length; index += IMAGE_BATCH_SIZE) {
        const batch = entriesToLoad.slice(index, index + IMAGE_BATCH_SIZE);
        await Promise.all(batch.map((advent) => fetchThumbnail(advent.imageKey)));
      }
    } catch (error) {
      console.error("Failed to load advents:", error);
      setLoadError(error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchThumbnail, viewMode]);

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

    setThumbnailCache((prev) => {
      const cachedUrl = prev[key];
      if (!cachedUrl) {
        return prev;
      }

      const next = { ...prev };
      delete next[key];
      revokeObjectURL(cachedUrl);
      thumbnailCacheRef.current = next;
      return next;
    });

    const pendingRetry = thumbnailRetryTimeoutsRef.current[key];
    if (pendingRetry) {
      clearTimeout(pendingRetry);
      delete thumbnailRetryTimeoutsRef.current[key];
    }

    loadedThumbnailKeysRef.current.delete(key);
  }, []);

  const getEntriesForDay = useCallback(
    (day: number) => advents.filter((entry) => entry.day === day),
    [advents]
  );

  const ensureFullImageLoaded = useCallback(async (key: string | undefined | null) => {
    if (!key || loadedImageKeysRef.current.has(key)) {
      return imageCacheRef.current[key as string] ?? null;
    }

    try {
      const blob = await fetchImageWithAuth(key);
      const url = URL.createObjectURL(blob);

      if (!isMountedRef.current) {
        revokeObjectURL(url);
        return null;
      }

      loadedImageKeysRef.current.add(key);
      setImageCache((prev) => {
        const next = { ...prev, [key]: url };
        imageCacheRef.current = next;
        return next;
      });

      return url;
    } catch (error) {
      console.error(`Failed to load full image for ${key}`, error);
      throw error;
    }
  }, []);

  return {
    advents,
    imageCache,
    thumbnailCache,
    isLoading,
    loadAdvents,
    deleteEntry,
    getEntriesForDay,
    loadError,
    ensureFullImageLoaded
  };
};
