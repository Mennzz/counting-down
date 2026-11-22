import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Pencil, Trash2, X } from "lucide-react";
import { deleteImage, getImageMetadataById, updateImageMetadata, type ImageMetadata } from "@/services/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PhotoViewerImage } from "@/components/photos/PhotoViewerImage";
import { isSensitivePhoto, isSensitiveTag, photoId } from "@/utils/photos";

interface PhotoViewerProps {
  photos: ImageMetadata[];
  selectedId: string;
  existingTags: string[];
  hasMore: boolean;
  isLoadingMore: boolean;
  loadError: string | null;
  onSelect: (id: string) => void;
  onLoadMore: () => void;
  onUpdated: (photo: ImageMetadata) => void;
  onDeleted: (photo: ImageMetadata) => void;
  onClose: () => void;
  onRestoreFocus: () => void;
  modeLabel?: string;
  closeOnDelete?: boolean;
}

export function PhotoViewer({ photos, selectedId, existingTags, hasMore, isLoadingMore, loadError,
  onSelect, onLoadMore, onUpdated, onDeleted, onClose, onRestoreFocus,
  modeLabel, closeOnDelete = true }: PhotoViewerProps) {
  const selectedIndex = photos.findIndex((photo) => photoId(photo) === selectedId);
  const selectedPhoto = photos[selectedIndex];
  const [isEditing, setIsEditing] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editSensitive, setEditSensitive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const locked = isEditing || isConfirmDeleteOpen || isSaving || isDeleting;
  const initialIndex = useRef(selectedIndex);
  const [viewportRef, carousel] = useEmblaCarousel({
    loop: false, startIndex: initialIndex.current, watchSlides: false,
    watchDrag: !locked, skipSnaps: false,
  });
  const selectionRef = useRef({ photos, selectedId, locked, onSelect });
  selectionRef.current = { photos, selectedId, locked, onSelect };
  const slideIds = photos.map(photoId).join("\n");

  // Restore the ID after pagination or reordering before accepting swipe events.
  useLayoutEffect(() => {
    if (!carousel) return;
    const restoreSelection = () => {
      const current = selectionRef.current;
      const index = current.photos.findIndex((photo) => photoId(photo) === current.selectedId);
      if (index >= 0) carousel.scrollTo(index, true);
    };
    carousel.reInit();
    restoreSelection();
    const select = () => {
      const current = selectionRef.current;
      if (current.locked) { restoreSelection(); return; }
      const photo = current.photos[carousel.selectedScrollSnap()];
      if (photo && photoId(photo) !== current.selectedId) current.onSelect(photoId(photo));
    };
    carousel.on("reInit", restoreSelection);
    carousel.on("select", select);
    return () => { carousel.off("reInit", restoreSelection); carousel.off("select", select); };
  }, [carousel, slideIds, locked, fullScreen]);

  useEffect(() => {
    if (selectedIndex >= 0 && photos.length - selectedIndex <= 3 && hasMore && !isLoadingMore && !loadError) {
      onLoadMore();
    }
  }, [selectedIndex, photos.length, hasMore, isLoadingMore, loadError, onLoadMore]);

  useEffect(() => { setEditError(null); }, [selectedId]);

  const navigate = (direction: -1 | 1) => {
    if (locked) return;
    const next = selectedIndex + direction;
    if (next < 0 || next >= photos.length) return;
    carousel?.scrollTo(next);
    onSelect(photoId(photos[next]));
    // Keep arrow keys usable when the clicked navigation button becomes disabled.
    carousel?.rootNode().focus({ preventScroll: true });
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (locked || target.closest("input, textarea, select, [contenteditable='true']") || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      navigate(event.key === "ArrowLeft" ? -1 : 1);
    }
  };
  const retryImage = useCallback(async (photo: ImageMetadata) => {
    if (photo.id) onUpdated(await getImageMetadataById(photo.id));
  }, [onUpdated]);

  if (!selectedPhoto) return null;

  const imageCarousel = (
    <div className="space-y-2">
      <div ref={viewportRef} tabIndex={0} role="region" className="overflow-hidden rounded-lg" style={{ touchAction: "pan-y pinch-zoom" }} aria-label="Photo carousel" aria-roledescription="carousel">
        <div className="flex">
          {photos.map((photo, index) => (
            <div key={photoId(photo)} className="min-w-0 flex-[0_0_100%]" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${photos.length}`} aria-hidden={index !== selectedIndex}>
              {Math.abs(index - selectedIndex) <= 1 ? (
                <PhotoViewerImage photo={photo} active={index === selectedIndex} onRetry={retryImage} fullScreen={fullScreen} />
              ) : <div className={fullScreen ? "h-[calc(100dvh-8rem)]" : "h-[45dvh] sm:h-[55dvh]"} />}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="icon" className="text-gray-900" aria-label="Previous photo" disabled={locked || selectedIndex <= 0} onClick={() => navigate(-1)}><ChevronLeft /></Button>
        <p className={`text-sm ${fullScreen ? "text-white" : "text-gray-500"}`} aria-live="polite">{selectedIndex + 1} / {photos.length}{hasMore ? "+" : ""}</p>
        <Button variant="outline" size="icon" className="text-gray-900" aria-label="Next photo" disabled={locked || selectedIndex >= photos.length - 1} onClick={() => navigate(1)}><ChevronRight /></Button>
      </div>
      {isLoadingMore ? <p role="status" className="text-sm text-gray-500">Loading more photos...</p> : null}
      {loadError ? <div role="alert" className="text-sm text-rose-600">{loadError} <Button variant="outline" onClick={onLoadMore}>Retry loading photos</Button></div> : null}
    </div>
  );
  const enterEditMode = (photo: ImageMetadata) => {
    const isSensitive = isSensitivePhoto(photo);
    setEditTitle(photo.title?.trim() ?? "");
    setEditDescription(photo.description?.trim() ?? "");
    setEditTags((photo.imageTags ?? []).filter((t) => !isSensitiveTag(t)).join(", "));
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
      onUpdated(updated);
      setIsEditing(false);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPhoto.id) return;
    setIsDeleting(true);
    setEditError(null);
    try {
      await deleteImage(selectedPhoto.id);
      setIsConfirmDeleteOpen(false);
      onDeleted(selectedPhoto);
      if (closeOnDelete) onClose();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Failed to delete photo");
      setIsConfirmDeleteOpen(false);
    } finally { setIsDeleting(false); }
  };
  return (
    <>
      <Dialog open onOpenChange={(open) => { if (!open && !isSaving && !isDeleting && !isConfirmDeleteOpen) onClose(); }}>
        <DialogContent className={fullScreen ? "h-[100dvh] max-h-none w-screen max-w-none grid-rows-[auto_1fr] gap-2 overflow-hidden rounded-none border-0 bg-black p-4 text-white sm:rounded-none [&>button:last-child]:text-white" : "max-w-3xl max-h-[90dvh] overflow-y-auto"}
          onEscapeKeyDown={(event) => { if (fullScreen) { event.preventDefault(); setFullScreen(false); } }}
          onCloseAutoFocus={(event) => { event.preventDefault(); onRestoreFocus(); }} onKeyDown={handleKeyDown}>
          <DialogHeader className={fullScreen ? "sr-only" : undefined}>
            {modeLabel ? <p className="text-sm font-medium text-rose-600">{modeLabel}</p> : null}
            <DialogTitle className="flex items-center gap-2 pr-6 text-2xl font-playfair text-rose-600">
              {isEditing ? "Edit Photo" : (selectedPhoto?.title?.trim() || "Photo Details")}
              {!isEditing && !fullScreen && selectedPhoto ? (
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
            <div className={fullScreen ? "min-h-0" : "space-y-4"}>
              <div className={fullScreen ? "absolute left-4 top-4 z-10" : "flex justify-end"}>
                <Button type="button" variant="outline" size="sm" className="text-gray-900" disabled={locked} onClick={() => setFullScreen(!fullScreen)} aria-label={fullScreen ? "Exit full screen" : "View full screen"}>
                  {fullScreen ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
                  {fullScreen ? "Exit full screen" : "Full screen"}
                </Button>
              </div>
              {imageCarousel}
              {!fullScreen && (isEditing ? (
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
                      const suggestions = existingTags.filter((t) => !isSensitiveTag(t) && !currentTagSet.has(t));
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
                  {editError ? <p role="alert" className="text-sm text-rose-600">{editError}</p> : null}
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
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDeleteOpen} onOpenChange={(open) => { if (!isDeleting) setIsConfirmDeleteOpen(open); }}>
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
    </>
  );
}

