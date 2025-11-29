import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { AdventEntry } from "@/types/advent";
import { typeEmojis, typeStyles } from "@/types/advent";

type DayDialogGalleryProps = {
  entries: AdventEntry[];
  imageCache: Record<string, string>;
  viewMode?: "for-me" | "by-me";
  onDelete?: (advent: AdventEntry) => void;
};

export const DayDialogGallery = ({ entries, imageCache, viewMode, onDelete }: DayDialogGalleryProps) => {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Carousel className="w-full" opts={{ align: "start", loop: entries.length > 1 }}>
        <CarouselContent>
          {entries.map((entry) => {
            const cacheKey = entry.imageKey;
            const imageUrl = cacheKey ? imageCache[cacheKey] : undefined;

            return (
              <CarouselItem key={entry.id}>
                <div className="space-y-3">
                  <div className="relative w-full overflow-hidden rounded-lg bg-black/60">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={entry.title ? `${entry.title}` : "Advent surprise"}
                        className="h-auto w-full max-h-[60vh] object-contain"
                      />
                    ) : (
                      <div className="flex h-[40vh] items-center justify-center text-6xl text-white/80">
                        {typeEmojis[entry.type]}
                      </div>
                    )}
                    <div className="absolute right-2 top-2 rounded-full bg-black/60 px-3 py-1 text-lg text-white shadow">
                      {typeEmojis[entry.type]}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className={`inline-block rounded-full px-3 py-1 text-sm ${typeStyles[entry.type]}`}>
                      {typeEmojis[entry.type]} {entry.type}
                    </div>
                    <h3 className="text-xl font-semibold">{entry.title || "Untitled surprise"}</h3>
                    {entry.description && <p className="text-muted-foreground">{entry.description}</p>}
                    <p className="text-xs text-muted-foreground">
                      From {entry.uploadedBy} on {new Date(entry.uploadedAt).toLocaleDateString()}
                    </p>
                    {viewMode === "by-me" && onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(entry)}
                        className="mt-2"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
