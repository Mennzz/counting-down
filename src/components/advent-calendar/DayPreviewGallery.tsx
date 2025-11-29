import type { AdventEntry } from "@/types/advent";
import { typeEmojis } from "@/types/advent";

type DayPreviewGalleryProps = {
  entries: AdventEntry[];
  imageCache: Record<string, string>;
};

export const DayPreviewGallery = ({ entries, imageCache }: DayPreviewGalleryProps) => {
  if (entries.length === 0) {
    return null;
  }

  if (entries.length === 1) {
    const entry = entries[0];
    const cacheKey = entry.imageKey;
    const imageUrl = cacheKey ? imageCache[cacheKey] : undefined;

    return (
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={entry.title ? `${entry.title} preview` : "Advent preview"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-white/80">
            {typeEmojis[entry.type]}
          </div>
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
        const imageUrl = cacheKey ? imageCache[cacheKey] : undefined;

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
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl text-white/80">
                {typeEmojis[entry.type]}
              </div>
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
