import type { ImageMetadata } from "@/services/image";

export const isSensitiveTag = (tag: string) =>
  ["sensitive", "spicy", "nude"].includes(tag.trim().toLowerCase());

export const isSensitivePhoto = (photo: ImageMetadata) =>
  (photo.imageTags ?? []).some(isSensitiveTag);

export const photoId = (photo: ImageMetadata) => photo.id ?? photo.imageKey;
