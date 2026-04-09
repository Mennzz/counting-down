import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart, Image, Pencil, Trash2, Upload, X } from "lucide-react";

import {
  createImageMetadata,
  deleteImage,
  getImageMetadataById,
  listImages,
  listImagesByMe,
  listImagesForMe,
  requestThumbnailGenerationByKey,
  updateImageMetadata,
  type ImageMetadata,
  type ImagePageResponse
} from "@/services/image";
import { PhotoGallerySkeleton } from "@/components/loading/PageSkeletons";
import { getUserType } from "@/utils/cookies";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type PhotoFilter = "all" | "by-me" | "for-me";

const PAGE_SIZE = 12;
const THUMBNAIL_RETRY_DELAY = 2000;
const THUMBNAIL_MAX_RETRIES = 4;

const PhotoGallery = () => {
  const [filter, setFilter] = useState<PhotoFilter>("all");
  const [photos, setPhotos] = useState<ImageMetadata[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<ImageMetadata | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [uploadSensitive, setUploadSensitive] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editSensitive, setEditSensitive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const thumbnailRequestedRef = useRef<Set<string>>(new Set());
  const thumbnailRetryTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const thumbnailRetryCountsRef = useRef<Record<string, number>>({});
  const cacheRef = useRef<
    Record<PhotoFilter, { items: ImageMetadata[]; nextCursor: string | null; hasMore: boolean; loaded: boolean }>
  >({
    all: { items: [], nextCursor: null, hasMore: true, loaded: false },
    "by-me": { items: [], nextCursor: null, hasMore: true, loaded: false },
    "for-me": { items: [], nextCursor: null, hasMore: true, loaded: false }
  });
  const requestRef = useRef(0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const userType = getUserType();
  const otherUser =
    userType === "Joris" ? "Danfeng" : userType === "Danfeng" ? "Joris" : "Partner";

  const fetchImages = useCallback(async (target: PhotoFilter, cursor?: string | null): Promise<ImagePageResponse> => {
    const params = { limit: PAGE_SIZE, cursor };
    if (target === "by-me") {
      return await listImagesByMe(params);
    }
    if (target === "for-me") {
      return await listImagesForMe(params);
    }
    return await listImages(params);
  }, []);

  const loadPhotos = useCallback(
    async (target: PhotoFilter, cursor?: string | null, append?: boolean) => {
      const requestId = ++requestRef.current;
      const cached = cacheRef.current[target];

      if (!append && cached.loaded) {
        setPhotos(cached.items);
        setNextCursor(cached.nextCursor);
        setHasMore(cached.hasMore);
        setIsLoading(false);
        setIsLoadingMore(false);
        setLoadError(null);
        return;
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const page = await fetchImages(target, cursor);
        if (requestRef.current !== requestId) {
          return;
        }

        const combined = append ? [...cached.items, ...(page.items ?? [])] : (page.items ?? []);
        const sorted = [...combined].sort((a, b) => {
          const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
          const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
          return bTime - aTime;
        });

        const next = page.nextCursor ?? null;
        const more = Boolean(next);

        cacheRef.current[target] = {
          items: sorted,
          nextCursor: next,
          hasMore: more,
          loaded: true
        };
        setPhotos(sorted);
        setNextCursor(next);
        setHasMore(more);
        setIsLoading(false);
        setIsLoadingMore(false);
      } catch (error) {
        if (requestRef.current !== requestId) {
          return;
        }

        console.error("Failed to load photos:", error);
        cacheRef.current[target].loaded = false;
        setLoadError(error instanceof Error ? error.message : "Failed to load photos");
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [fetchImages]
  );

  useEffect(() => {
    void loadPhotos(filter);
  }, [filter, loadPhotos]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) {
      return;
    }

    void loadPhotos(filter, nextCursor, true);
  }, [filter, hasMore, isLoading, isLoadingMore, loadPhotos, nextCursor]);

  const photoCount = photos.length;
  const filterLabel = useMemo(() => {
    if (filter === "by-me") return "By Me";
    if (filter === "for-me") return `From ${otherUser}`;
    return "All Photos";
  }, [filter, otherUser]);

  const resetUploadForm = () => {
    setUploadTitle("");
    setUploadDescription("");
    setUploadTags("");
    setUploadSensitive(false);
    setUploadFile(null);
    setUploadError(null);
  };

  const existingTags = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => p.imageTags?.forEach((t) => set.add(t.trim().toLowerCase())));
    return Array.from(set).sort();
  }, [photos]);

  const enterEditMode = (photo: ImageMetadata) => {
    const isSensitive = (photo.imageTags ?? []).some((t) => t.trim().toLowerCase() === "sensitive");
    setEditTitle(photo.title?.trim() ?? "");
    setEditDescription(photo.description?.trim() ?? "");
    setEditTags((photo.imageTags ?? []).filter((t) => t.trim().toLowerCase() !== "sensitive").join(", "));
    setEditSensitive(isSensitive);
    setEditError(null);
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    if (!selectedPhoto?.id) return;
    setIsSaving(true);
    setEditError(null);
    try {
      const tags = editTags.split(",").map((t) => t.trim()).filter(Boolean);
      if (editSensitive && !tags.includes("sensitive")) tags.push("sensitive");
      const updated = await updateImageMetadata(selectedPhoto.id, {
        title: editTitle.trim() || undefined,
        description: editDescription.trim() || undefined,
        imageTags: tags.length ? tags : [],
      });
      updatePhotoInCache(updated);
      setSelectedPhoto(updated);
      setIsEditing(false);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPhoto?.id) return;
    setIsDeleting(true);
    try {
      await deleteImage(selectedPhoto.id);
      // Remove from all caches and current view
      const id = selectedPhoto.id;
      const key = selectedPhoto.imageKey;
      (["all", "by-me", "for-me"] as PhotoFilter[]).forEach((target) => {
        cacheRef.current[target].items = cacheRef.current[target].items.filter(
          (p) => p.id !== id && p.imageKey !== key,
        );
      });
      setPhotos((prev) => prev.filter((p) => p.id !== id && p.imageKey !== key));
      setIsConfirmDeleteOpen(false);
      setSelectedPhoto(null);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Failed to delete photo");
      setIsConfirmDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const invalidateCache = (targets: PhotoFilter[]) => {
    targets.forEach((target) => {
      cacheRef.current[target] = {
        items: [],
        nextCursor: null,
        hasMore: true,
        loaded: false
      };
    });
  };

  const updatePhotoInCache = useCallback((updated: ImageMetadata) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        (updated.id && photo.id === updated.id) || photo.imageKey === updated.imageKey
          ? { ...photo, ...updated }
          : photo,
      ),
    );
    const cached = cacheRef.current[filter];
    cacheRef.current[filter] = {
      ...cached,
      items: cached.items.map((photo) =>
        (updated.id && photo.id === updated.id) || photo.imageKey === updated.imageKey
          ? { ...photo, ...updated }
          : photo,
      ),
    };
  }, [filter]);

  const scheduleThumbnailRefresh = useCallback(
    (photo: ImageMetadata, attempt: number) => {
      const key = photo.imageKey;
      if (!key || thumbnailRetryTimeoutsRef.current[key]) {
        return;
      }

      const delay = THUMBNAIL_RETRY_DELAY * Math.pow(2, attempt);
      thumbnailRetryTimeoutsRef.current[key] = setTimeout(async () => {
        delete thumbnailRetryTimeoutsRef.current[key];
        try {
          if (!photo.id) {
            return;
          }
          const updated = await getImageMetadataById(photo.id);
          updatePhotoInCache(updated);
          if (!updated.thumbnailXlUrl) {
            const nextAttempt = (thumbnailRetryCountsRef.current[key] ?? 0) + 1;
            if (nextAttempt <= THUMBNAIL_MAX_RETRIES) {
              thumbnailRetryCountsRef.current[key] = nextAttempt;
              scheduleThumbnailRefresh(photo, nextAttempt);
            }
          }
        } catch (error) {
          const nextAttempt = (thumbnailRetryCountsRef.current[key] ?? 0) + 1;
          if (nextAttempt <= THUMBNAIL_MAX_RETRIES) {
            thumbnailRetryCountsRef.current[key] = nextAttempt;
            scheduleThumbnailRefresh(photo, nextAttempt);
          }
        }
      }, delay);
    },
    [updatePhotoInCache],
  );

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          handleLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [handleLoadMore, hasMore]);

  useEffect(() => {
    return () => {
      Object.values(thumbnailRetryTimeoutsRef.current).forEach((timeoutId) => clearTimeout(timeoutId));
      thumbnailRetryTimeoutsRef.current = {};
      thumbnailRetryCountsRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (!photos.length || isLoading) {
      return;
    }

    photos.forEach((photo) => {
      if (!photo.imageKey || photo.thumbnailXlUrl) {
        return;
      }

      if (!thumbnailRequestedRef.current.has(photo.imageKey)) {
        thumbnailRequestedRef.current.add(photo.imageKey);
        thumbnailRetryCountsRef.current[photo.imageKey] = 0;
        void requestThumbnailGenerationByKey(photo.imageKey).catch((error) => {
          console.error("Failed to request thumbnail generation:", error);
        });
      }

      const currentRetries = thumbnailRetryCountsRef.current[photo.imageKey] ?? 0;
      if (currentRetries < THUMBNAIL_MAX_RETRIES) {
        scheduleThumbnailRefresh(photo, currentRetries);
      }
    });
  }, [isLoading, photos, scheduleThumbnailRefresh]);

  const handleUploadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userType) {
      setUploadError("Missing user information");
      return;
    }

    if (!uploadFile) {
      setUploadError("Please select an image to upload");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const trimmedTitle = uploadTitle.trim();
      const trimmedDescription = uploadDescription.trim();

      const tags = uploadTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      if (uploadSensitive && !tags.includes("sensitive")) {
        tags.push("sensitive");
      }

      await createImageMetadata({
        image: uploadFile,
        uploadedBy: userType,
        title: trimmedTitle || undefined,
        description: trimmedDescription || undefined,
        imageTags: tags.length ? tags : undefined
      });

      invalidateCache(["all", "by-me"]);
      if (filter === "all" || filter === "by-me") {
        await loadPhotos(filter);
      }

      setIsUploadOpen(false);
      resetUploadForm();
    } catch (error) {
      console.error("Failed to upload photo:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <PhotoGallerySkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Image className="w-6 h-6 text-rose-500" />
          <h2 className="text-4xl font-playfair font-semibold text-rose-600">Our Memories</h2>
          <Image className="w-6 h-6 text-rose-500" />
        </div>
        <p className="text-lg text-gray-600 font-inter">
          Every picture tells our story
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="inline-flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${filter === "all" ? "bg-rose-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("for-me")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${filter === "for-me" ? "bg-rose-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              From {otherUser}
            </button>
            <button
              onClick={() => setFilter("by-me")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${filter === "by-me" ? "bg-rose-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              By Me
            </button>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={(open) => {
            setIsUploadOpen(open);
            if (!open) resetUploadForm();
          }}>
            <Button type="button" onClick={() => setIsUploadOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-playfair text-rose-600">Upload Photo</DialogTitle>
                <DialogDescription className="text-gray-600 font-inter">
                  Share a new memory with your partner.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleUploadSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="upload-photo-file">Photo</Label>
                  <Input
                    id="upload-photo-file"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-photo-title">Title</Label>
                  <Input
                    id="upload-photo-title"
                    value={uploadTitle}
                    onChange={(event) => setUploadTitle(event.target.value)}
                    placeholder="Our weekend hike"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-photo-description">Description</Label>
                  <Textarea
                    id="upload-photo-description"
                    value={uploadDescription}
                    onChange={(event) => setUploadDescription(event.target.value)}
                    placeholder="Add a short note about this memory"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-photo-tags">Tags (comma separated)</Label>
                  <Input
                    id="upload-photo-tags"
                    value={uploadTags}
                    onChange={(event) => setUploadTags(event.target.value)}
                    placeholder="travel, sunset, cozy"
                  />
                  {(() => {
                    const currentTagSet = new Set(
                      uploadTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
                    );
                    const suggestions = existingTags.filter((t) => !currentTagSet.has(t));
                    if (!suggestions.length) return null;
                    return (
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              const trimmed = uploadTags.trimEnd();
                              setUploadTags(trimmed ? `${trimmed}, ${tag}` : tag);
                            }}
                            className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs text-rose-700 hover:bg-rose-200 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="upload-photo-sensitive"
                    checked={uploadSensitive}
                    onCheckedChange={(checked) => setUploadSensitive(Boolean(checked))}
                  />
                  <Label htmlFor="upload-photo-sensitive" className="text-sm font-normal cursor-pointer">
                    Sensitive content (will be blurred in gallery)
                  </Label>
                </div>
                {uploadError ? (
                  <p className="text-sm text-rose-600 font-inter">{uploadError}</p>
                ) : null}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsUploadOpen(false);
                      resetUploadForm();
                    }}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-gray-500 font-inter">{filterLabel}</p>
      </div>
      {loadError ? (
        <div className="text-center text-rose-600 font-inter">{loadError}</div>
      ) : null}

      {!isLoading && !loadError && photos.length === 0 ? (
        <div className="text-center text-gray-500 font-inter">No photos to show yet.</div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => {
          const caption =
            photo.title?.trim() ||
            photo.description?.trim() ||
            "A beautiful memory";
          const dateLabel = photo.uploadedAt
            ? new Date(photo.uploadedAt).toLocaleDateString()
            : "";
          const imageUrl = photo.thumbnailXlUrl || photo.thumbnailUrl || photo.url;
          const hasSensitiveTag = (photo.imageTags ?? []).some((tag) => {
            const normalized = tag.trim().toLowerCase();
            return normalized === "sensitive" || normalized === "spicy" || normalized === "nude";
          });

          return (
            <button
              key={photo.id ?? photo.imageKey}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className="love-card group cursor-pointer overflow-hidden text-left"
            >
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={caption}
                  loading="lazy"
                  decoding="async"
                  className={`w-full h-64 object-cover rounded-lg transition-transform duration-300 ${hasSensitiveTag ? "blur-xl" : "group-hover:scale-105"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="font-medium mb-1">{caption}</h3>
                  {dateLabel ? <p className="text-sm opacity-90">{dateLabel}</p> : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div ref={loadMoreRef} className="h-6" />
      {isLoadingMore ? (
        <div className="text-center text-gray-500 font-inter">Loading more photos...</div>
      ) : null}

      <div className="text-center">
        <div className="love-card inline-block">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <p className="text-gray-600 font-inter">
              <span className="font-medium text-rose-600">{photoCount}</span> beautiful memories captured
            </p>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(selectedPhoto)} onOpenChange={(open) => {
        if (!open) {
          setSelectedPhoto(null);
          setIsEditing(false);
          setEditError(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-playfair text-rose-600">
              {isEditing ? "Edit Photo" : (selectedPhoto?.title?.trim() || "Photo Details")}
              {!isEditing && selectedPhoto ? (
                <>
                  <button
                    type="button"
                    onClick={() => enterEditMode(selectedPhoto)}
                    className="rounded-md p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    aria-label="Edit photo"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmDeleteOpen(true)}
                    className="rounded-md p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Delete photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : null}
            </DialogTitle>
            <DialogDescription className="text-gray-600 font-inter">
              Uploaded by {selectedPhoto?.uploadedBy ?? "Unknown"}
              {selectedPhoto?.uploadedAt ? ` · ${new Date(selectedPhoto.uploadedAt).toLocaleString()}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedPhoto ? (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title?.trim() || selectedPhoto.description?.trim() || "Photo"}
                  className="w-full max-h-[60vh] object-contain bg-black/5"
                />
              </div>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-photo-title">Title</Label>
                    <Input
                      id="edit-photo-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Our weekend hike"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-photo-description">Description</Label>
                    <Textarea
                      id="edit-photo-description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Add a short note about this memory"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-photo-tags">Tags (comma separated)</Label>
                    <Input
                      id="edit-photo-tags"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="travel, sunset, cozy"
                    />
                    {(() => {
                      const currentTagSet = new Set(
                        editTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
                      );
                      const suggestions = existingTags.filter((t) => t !== "sensitive" && !currentTagSet.has(t));
                      if (!suggestions.length) return null;
                      return (
                        <div className="flex flex-wrap gap-1.5">
                          {suggestions.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                const trimmed = editTags.trimEnd();
                                setEditTags(trimmed ? `${trimmed}, ${tag}` : tag);
                              }}
                              className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs text-rose-700 hover:bg-rose-200 transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="edit-photo-sensitive"
                      checked={editSensitive}
                      onCheckedChange={(checked) => setEditSensitive(Boolean(checked))}
                    />
                    <Label htmlFor="edit-photo-sensitive" className="text-sm font-normal cursor-pointer">
                      Sensitive content (will be blurred in gallery)
                    </Label>
                  </div>
                  {editError ? <p className="text-sm text-rose-600 font-inter">{editError}</p> : null}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setIsEditing(false); setEditError(null); }}
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleEditSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {selectedPhoto.description?.trim() ? (
                    <p className="text-gray-700 font-inter">{selectedPhoto.description.trim()}</p>
                  ) : null}
                  {selectedPhoto.imageTags && selectedPhoto.imageTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedPhoto.imageTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-700 font-inter"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-playfair text-gray-900">Delete photo?</DialogTitle>
            <DialogDescription className="text-gray-600 font-inter">
              This will permanently delete the photo and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoGallery;
