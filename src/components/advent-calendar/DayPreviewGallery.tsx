import { Skeleton } from "@/components/ui/skeleton";
import type { AdventEntry } from "@/types/advent";
import { typeEmojis } from "@/types/advent";

const renderPlaceholder = (emoji: string, sizeClass: string) => (
  <div className="relative flex h-full w-full items-center justify-center">
    <Skeleton className="absolute inset-0 h-full w-full animate-pulse bg-white/20 blur-sm" />
    <span className={`relative z-10 ${sizeClass} text-white/80`}>{emoji}</span>
  </div>
);

type DayPreviewGalleryProps = {
  entries: AdventEntry[];
  previewCache: Record<string, string>;
};

export const DayPreviewGallery = ({ entries, previewCache }: DayPreviewGalleryProps) => {
  if (entries.length === 0) {
    return null;
  }

  if (entries.length === 1) {
    const entry = entries[0];
    const cacheKey = entry.imageKey;
    const imageUrl = cacheKey ? previewCache[cacheKey] : undefined;

    return (
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={entry.title ? `${entry.title} preview` : "Advent preview"}
            className="h-full w-full object-cover"
            decoding="async"
            loading="lazy"
          />
        ) : (
          renderPlaceholder(typeEmojis[entry.type], "text-4xl")
        )}
        <div className="absolute right-2 top-2 text-2xl drop-shadow-sm">
          {typeEmojis[entry.type]}
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 grid auto-rows-fr grid-cols-2 gap-1 p-2 opacity-60">
      {entries.map((entry) => {
        const cacheKey = entry.imageKey;
        const imageUrl = cacheKey ? previewCache[cacheKey] : undefined;

        return (
          <div
            key={entry.id}
            className="relative h-full w-full overflow-hidden rounded-md border border-white/20 bg-black/20"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={entry.title ? `${entry.title} preview` : "Advent preview"}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              renderPlaceholder(typeEmojis[entry.type], "text-2xl")
            )}
            <div className="absolute right-1 top-1 text-lg drop-shadow-sm">
              {typeEmojis[entry.type]}
            </div>
          </div>
        );
      })}
    </div>
  );
};
