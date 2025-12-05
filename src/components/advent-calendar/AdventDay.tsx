import { Gift } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { AdventEntry } from "@/types/advent";
import { typeEmojis } from "@/types/advent";

import { DayDialogGallery } from "./DayDialogGallery";
import { DayPreviewGallery } from "./DayPreviewGallery";

type AdventDayProps = {
  day: number;
  entries: AdventEntry[];
  imageCache: Record<string, string>;
  thumbnailCache: Record<string, string>;
  backgroundClass: string;
  numberClass: string;
  isUnlocked: boolean;
  isOpened: boolean;
  viewMode: "for-me" | "by-me";
  onOpenGift: () => void;
  onDeleteEntry: (advent: AdventEntry) => void | Promise<void>;
  ensureImageLoaded: (key: string | null | undefined) => Promise<string | null>;
};

export const AdventDay = ({
  day,
  entries,
  imageCache,
  thumbnailCache,
  backgroundClass,
  numberClass,
  isUnlocked,
  isOpened,
  viewMode,
  onOpenGift,
  onDeleteEntry,
  ensureImageLoaded
}: AdventDayProps) => {
  const hasGallery = isOpened && entries.length > 0;
  const firstEntry = entries[0];
  const titleSuffix = hasGallery && firstEntry
    ? entries.length === 1
      ? ` - ${typeEmojis[firstEntry.type]} ${firstEntry.title}`
      : ` - ${entries.length} surprises`
    : "";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card
          className={`relative aspect-square cursor-pointer overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-xl ${backgroundClass} ${!isUnlocked ? "grayscale opacity-50" : ""
            }`}
        >
          <div className="relative flex h-full flex-col items-center justify-center p-4">
            {!isUnlocked && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/30">
                <div className="text-6xl">💌</div>
              </div>
            )}
            {hasGallery ? (
              <DayPreviewGallery entries={entries} previewCache={thumbnailCache} />
            ) : (
              <Gift className="mb-2 h-12 w-12 text-white/50" />
            )}
            <div className={`z-10 text-4xl font-bold ${numberClass}`}>{day}</div>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>
            Day {day}
            {titleSuffix}
          </DialogTitle>
          <DialogDescription>
            {!isUnlocked
              ? `This day is locked until December ${day}`
              : entries.length === 0
                ? "No surprise yet for this day"
                : isOpened
                  ? `${entries.length} surprise(s) from your loved one`
                  : "A gift is waiting to be opened!"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {!isUnlocked ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-8xl"> 💌 </div>
              <h3 className="mb-2 text-xl font-semibold">This day is locked but I love you!</h3>
              <p className="mb-2 text-muted-foreground">Come back on December {day} to open this surprise BIBI</p>
            </div>
          ) : entries.length > 0 ? (
            isOpened ? (
              <DayDialogGallery
                entries={entries}
                imageCache={imageCache}
                viewMode={viewMode}
                onDelete={onDeleteEntry}
                ensureImageLoaded={ensureImageLoaded}
              />
            ) : (
              <div className="py-12 text-center">
                <Gift className="mb-4 h-24 w-24 animate-pulse text-red-600" />
                <h3 className="mb-2 text-xl font-semibold">A gift is waiting for you!</h3>
                <p className="mb-6 text-muted-foreground">Click below to open your surprise</p>
                <Button size="lg" className="bg-red-600 hover:bg-red-700" onClick={onOpenGift}>
                  <Gift className="mr-2 h-5 w-5" />
                  Open Gift
                </Button>
              </div>
            )
          ) : (
            <div className="py-12 text-center">
              <Gift className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground">No surprise uploaded yet for Day {day}</p>
              <p className="mt-2 text-sm text-muted-foreground">Check back later!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
