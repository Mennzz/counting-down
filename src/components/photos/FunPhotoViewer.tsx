import { useCallback, useEffect, useRef, useState } from "react";
import { listImages, listImagesByMe, listImagesForMe, type ImageMetadata } from "@/services/image";
import { isSensitivePhoto, photoId } from "@/utils/photos";
import { PhotoViewer } from "./PhotoViewer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FunPhotoViewerProps {
  filter: "all" | "by-me" | "for-me";
  filterLabel: string;
  onUpdated: (photo: ImageMetadata) => void;
  onDeleted: (photo: ImageMetadata) => void;
  onClose: () => void;
  onRestoreFocus: () => void;
}

export function FunPhotoViewer({ filter, filterLabel, onUpdated, onDeleted, onClose, onRestoreFocus }: FunPhotoViewerProps) {
  // This sequence and cursor belong exclusively to this Fun mode session.
  const [page, setPage] = useState({ photos: [] as ImageMetadata[], selectedId: null as string | null,
    nextCursor: null as string | null, loaded: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);
  const busyRef = useRef(false);

  const loadPage = useCallback(async (cursor: string | null) => {
    if (busyRef.current) return;
    busyRef.current = true;
    const request = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const list = filter === "by-me" ? listImagesByMe : filter === "for-me" ? listImagesForMe : listImages;
      const response = await list({ limit: 12, cursor, sensitiveOnly: true });
      if (request !== requestRef.current) return;
      setPage((previous) => {
        const combined = [...(cursor ? previous.photos : []), ...response.items.filter(isSensitivePhoto)];
        const photos = Array.from(new Map(combined.map((photo) => [photoId(photo), photo])).values());
        return { photos, selectedId: previous.selectedId ?? (photos[0] ? photoId(photos[0]) : null),
          nextCursor: response.nextCursor ?? null, loaded: true };
      });
    } catch (cause) {
      if (request === requestRef.current) setError(cause instanceof Error ? cause.message : "Failed to load photos");
    } finally {
      if (request === requestRef.current) { busyRef.current = false; setLoading(false); }
    }
  }, [filter]);

  const cancelRequests = useCallback(() => { requestRef.current++; busyRef.current = false; }, []);

  useEffect(() => {
    void loadPage(null);
    return cancelRequests;
  }, [loadPage, cancelRequests]);

  const loadMore = useCallback(() => { void loadPage(page.nextCursor); }, [loadPage, page.nextCursor]);

  // Continue if an empty page or an edit removes the last currently loaded match.
  useEffect(() => {
    if (page.loaded && !page.photos.length && page.nextCursor && !loading && !error) loadMore();
  }, [page.loaded, page.photos.length, page.nextCursor, loading, error, loadMore]);

  const removePhoto = (removed: ImageMetadata) => setPage((previous) => {
    const index = previous.photos.findIndex((photo) => photoId(photo) === photoId(removed));
    const photos = previous.photos.filter((photo) => photoId(photo) !== photoId(removed));
    const replacement = photos[Math.min(Math.max(index, 0), photos.length - 1)];
    return { ...previous, photos, selectedId: previous.selectedId === photoId(removed)
      ? (replacement ? photoId(replacement) : null) : previous.selectedId };
  });

  if (page.selectedId && page.photos.length) return <PhotoViewer
    photos={page.photos} selectedId={page.selectedId}
    existingTags={Array.from(new Set(page.photos.flatMap((photo) => photo.imageTags ?? [])))}
    modeLabel={`Fun mode · ${filterLabel}`} closeOnDelete={false}
    hasMore={Boolean(page.nextCursor)} isLoadingMore={loading} loadError={error}
    onSelect={(selectedId) => setPage((previous) => ({ ...previous, selectedId }))}
    onLoadMore={loadMore} onClose={onClose} onRestoreFocus={onRestoreFocus}
    onUpdated={(updated) => {
      onUpdated(updated);
      if (!isSensitivePhoto(updated)) removePhoto(updated);
      else setPage((previous) => ({ ...previous, photos: previous.photos.map((photo) =>
        photoId(photo) === photoId(updated) ? { ...photo, ...updated } : photo) }));
    }}
    onDeleted={(deleted) => { onDeleted(deleted); removePhoto(deleted); }}
  />;

  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent onCloseAutoFocus={(event) => { event.preventDefault(); onRestoreFocus(); }}>
      <DialogHeader>
        <DialogTitle>Fun mode</DialogTitle>
        <DialogDescription>Sensitive photos · {filterLabel}</DialogDescription>
      </DialogHeader>
      {loading || (!error && page.nextCursor) ? <p role="status">Loading sensitive photos...</p>
        : error ? <div role="alert">{error} <Button variant="outline" onClick={loadMore}>Retry loading photos</Button></div>
        : <p>No sensitive photos for this filter.</p>}
      <Button variant="outline" onClick={onClose}>Back to gallery</Button>
    </DialogContent>
  </Dialog>;
}
