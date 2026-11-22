import { useState } from "react";
import type { ImageMetadata } from "@/services/image";
import { Button } from "@/components/ui/button";

interface PhotoViewerImageProps {
  photo: ImageMetadata;
  active: boolean;
  fullScreen?: boolean;
  onRetry: (photo: ImageMetadata) => Promise<void>;
}

export function PhotoViewerImage(props: PhotoViewerImageProps) {
  // A refreshed signed URL gets its own load/error state.
  return <ImageAttempt key={props.photo.url} {...props} />;
}

function ImageAttempt({ photo, active, onRetry, fullScreen }: PhotoViewerImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const preview = photo.thumbnailXlUrl || photo.thumbnailUrl;

  const retry = async () => {
    setRetrying(true);
    try {
      await onRetry(photo);
    } catch {
      // Still retry the current URL when metadata refresh is unavailable.
    } finally {
      setAttempt((previous) => previous + 1);
      setStatus("loading");
      setRetrying(false);
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${fullScreen ? "h-[calc(100dvh-8rem)] bg-black" : "h-[45dvh] bg-black/5 sm:h-[55dvh]"}`} aria-busy={status === "loading"}>
      {preview && !previewFailed && status !== "loaded" ? (
        <img src={preview} alt="" draggable={false} onError={() => setPreviewFailed(true)} className="absolute inset-0 h-full w-full object-contain" />
      ) : null}
      {status !== "error" ? (
        <img key={attempt} src={photo.url} alt={photo.title?.trim() || photo.description?.trim() || "Photo"}
          draggable={false} decoding="async" onLoad={() => setStatus("loaded")} onError={() => setStatus("error")}
          className={`absolute inset-0 h-full w-full object-contain ${status === "loaded" ? "opacity-100" : "opacity-0"}`} />
      ) : null}
      {status === "loading" && active ? <span role="status" className="absolute bottom-2 rounded bg-white/90 px-3 py-1 text-sm text-gray-600">Loading full photo...</span> : null}
      {status === "error" && active ? (
        <div role="alert" className="relative rounded-lg bg-white/95 p-4 text-center text-sm">
          <p className="mb-2">Couldn’t load this photo.</p>
          <Button variant="outline" disabled={retrying} onClick={() => void retry()}>{retrying ? "Retrying..." : "Retry photo"}</Button>
        </div>
      ) : null}
    </div>
  );
}
