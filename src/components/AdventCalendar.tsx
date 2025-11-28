import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Gift, Upload } from "lucide-react";
import { toast } from "sonner";
import { getAdventsForMe, createAdvent, deleteAdvent, getAdventsByMe } from "@/services/advent";
import { fetchImageWithAuth } from "@/services/image";
import { getUserType } from "@/utils/cookies";
import { ApiError } from "@/services/api";
import type { AdventEntry, AdventType, CreateAdventEntry } from "@/types/advent";
import { typeStyles, typeEmojis } from "@/types/advent";

// Festive color schemes for each day matching the design
const dayColors = [
  "bg-amber-400", "bg-cream-200", "bg-green-700", "bg-cream-200", "bg-red-600",
  "bg-red-700", "bg-green-700", "bg-amber-500", "bg-red-700", "bg-cream-200",
  "bg-cream-200", "bg-red-700", "bg-cream-200", "bg-green-700", "bg-amber-500",
  "bg-amber-400", "bg-cream-200", "bg-green-700", "bg-red-700", "bg-cream-200",
  "bg-green-700", "bg-red-700", "bg-amber-500", "bg-cream-200", "bg-red-700"
];

// Day number colors to contrast with background
const dayNumberColors = [
  "text-green-700", "text-red-700", "text-amber-400", "text-red-700", "text-amber-400",
  "text-white", "text-white", "text-green-700", "text-white", "text-green-700",
  "text-green-700", "text-white", "text-green-700", "text-white", "text-green-700",
  "text-green-700", "text-green-700", "text-white", "text-white", "text-green-700",
  "text-white", "text-white", "text-red-700", "text-red-700", "text-white"
];

type DayPreviewGalleryProps = {
  entries: AdventEntry[];
  imageCache: Record<string, string>;
};

// Renders a day preview collage with every advent image for that day.
const DayPreviewGallery = ({ entries, imageCache }: DayPreviewGalleryProps) => {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 grid auto-rows-fr grid-cols-2 gap-1 p-2 opacity-60 pointer-events-none">
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
                alt={entry.title ? `${entry.title} preview` : `Advent preview`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl text-white/80">
                {typeEmojis[entry.type]}
              </div>
            )}
            <div className="absolute top-1 right-1 text-lg drop-shadow-sm">
              {typeEmojis[entry.type]}
            </div>
          </div>
        );
      })}
    </div>
  );
};

type DayDialogGalleryProps = {
  entries: AdventEntry[];
  imageCache: Record<string, string>;
};

const DayDialogGallery = ({ entries, imageCache }: DayDialogGalleryProps) => {
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
                        className="w-full h-auto max-h-[60vh] object-contain"
                      />
                    ) : (
                      <div className="flex h-[40vh] items-center justify-center text-6xl text-white/80">
                        {typeEmojis[entry.type]}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 rounded-full bg-black/60 px-3 py-1 text-lg text-white shadow">
                      {typeEmojis[entry.type]}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm ${typeStyles[entry.type]}`}>
                      {typeEmojis[entry.type]} {entry.type}
                    </div>
                    <h3 className="text-xl font-semibold">{entry.title || "Untitled surprise"}</h3>
                    {entry.description && (
                      <p className="text-muted-foreground">{entry.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      From {entry.uploadedBy} on {new Date(entry.uploadedAt).toLocaleDateString()}
                    </p>
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

export const AdventCalendarNew = () => {
  const [advents, setAdvents] = useState<AdventEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [openedDays, setOpenedDays] = useState<Set<number>>(new Set());
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const userType = getUserType();

  // Upload form state
  const [uploadDay, setUploadDay] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<AdventType>("cute");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load opened days from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("advent-opened-days");
    if (stored) {
      try {
        setOpenedDays(new Set(JSON.parse(stored)));
      } catch (error) {
        console.error("Failed to parse opened days:", error);
      }
    }
  }, []);

  // Save opened days to localStorage
  useEffect(() => {
    localStorage.setItem("advent-opened-days", JSON.stringify(Array.from(openedDays)));
  }, [openedDays]);

  useEffect(() => {
    loadAdvents();
  }, []);

  const loadAdvents = async () => {
    try {
      setIsLoading(true);
      const all_advents = await getAdventsByMe();
      setAdvents(all_advents);

      // Load images for all advents
      for (const advent of all_advents) {
        if (advent.imageKey && !imageCache[advent.imageKey]) {
          try {
            const blob = await fetchImageWithAuth(advent.imageKey);
            const url = URL.createObjectURL(blob);
            setImageCache(prev => ({ ...prev, [advent.imageKey]: url }));
          } catch (error) {
            console.error(`Failed to load image for ${advent.imageKey}`, error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load advents:", error);
      toast.error("Failed to load advent calendar");
    } finally {
      setIsLoading(false);
    }
  };

  const getAdventsForDay = (day: number): AdventEntry[] => {
    return advents.filter(a => a.day === day);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCreateAdvent = async () => {
    if (!selectedFile) return;

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsUploading(true);

    try {
      const newAdvent: CreateAdventEntry = {
        day: uploadDay,
        uploaded_by: userType || "",
        title,
        description,
        type,
      };

      const created = await createAdvent(newAdvent, selectedFile);

      // Reload all advents to get the new one
      await loadAdvents();

      toast.success(`Day ${uploadDay} created!`);

      // Reset form and close dialog
      setTitle("");
      setDescription("");
      setType("cute");
      setSelectedFile(null);
      setUploadDay(1);
      setIsUploadDialogOpen(false);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create advent");
      }
      console.error("Create error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (advent: AdventEntry) => {
    try {
      await deleteAdvent(advent.id);
      setAdvents(prev => prev.filter(a => a.id !== advent.id));

      // Cleanup image URL
      if (imageCache[advent.imageKey]) {
        URL.revokeObjectURL(imageCache[advent.imageKey]);
        setImageCache(prev => {
          const newCache = { ...prev };
          delete newCache[advent.imageKey];
          return newCache;
        });
      }

      toast.success("Advent deleted");
    } catch (error) {
      toast.error("Failed to delete advent");
      console.error("Delete error:", error);
    }
  };

  const openDayDialog = (day: number) => {
    setSelectedDay(day);
    // Don't automatically mark as opened - user must click "Open Gift" button
  };

  const progressPercentage = Math.round((openedDays.size / 25) * 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading advent calendar...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2 text-red-600">🎄 Advent Calendar 🎄</h1>
        <p className="text-muted-foreground">25 days of surprises leading to Christmas!</p>

        {/* Upload Button */}
        <div className="mt-4">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <Upload className="w-5 h-5 mr-2" />
                Upload Advent Gift
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Upload Advent Gift</DialogTitle>
                <DialogDescription>
                  Create a surprise for your loved one
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 overflow-y-auto flex-1">
                <div className="space-y-2">
                  <Label htmlFor="upload-day">Day (1-25)</Label>
                  <Select value={uploadDay.toString()} onValueChange={(v) => setUploadDay(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 25 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          Day {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-title">Title</Label>
                  <Input
                    id="upload-title"
                    placeholder="e.g., A cozy surprise"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-description">Description</Label>
                  <Textarea
                    id="upload-description"
                    placeholder="Describe this day's surprise..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-type">Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as AdventType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spicy">🌶️ Spicy</SelectItem>
                      <SelectItem value="cute">🥰 Cute</SelectItem>
                      <SelectItem value="funny">😂 Funny</SelectItem>
                      <SelectItem value="hot">🔥 Hot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upload-image">Image</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="upload-image-input"
                  />
                  <label htmlFor="upload-image-input">
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {selectedFile ? selectedFile.name : "Choose Image"}
                      </span>
                    </Button>
                  </label>
                </div>

                {selectedFile && (
                  <Button
                    onClick={handleCreateAdvent}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? "Uploading..." : "Upload Gift"}
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Progress: {openedDays.size} / 25 gifts opened
          </span>
          <span className="text-sm font-bold text-red-600">
            {progressPercentage}%
          </span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
        {openedDays.size === 25 && (
          <p className="text-center mt-4 text-lg font-semibold text-green-600">
            🎉 Congratulations! You've opened all the gifts! 🎉
          </p>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3 max-w-6xl mx-auto">
        {Array.from({ length: 25 }, (_, i) => i + 1).map((day) => {
          const adventsForDay = getAdventsForDay(day);
          const bgColor = dayColors[day - 1];
          const numColor = dayNumberColors[day - 1];
          const isDayOpened = openedDays.has(day);
          const hasGallery = isDayOpened && adventsForDay.length > 0;
          const firstEntry = adventsForDay[0];
          const titleSuffix =
            hasGallery && firstEntry
              ? adventsForDay.length === 1
                ? ` - ${typeEmojis[firstEntry.type]} ${firstEntry.title}`
                : ` - ${adventsForDay.length} surprises`
              : "";

          return (
            <Dialog key={day}>
              <DialogTrigger asChild>
                <Card
                  className={`cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 aspect-square relative overflow-hidden ${bgColor}`}
                  onClick={() => openDayDialog(day)}
                >
                  <div className="h-full flex flex-col items-center justify-center p-4 relative">
                    {hasGallery ? (
                      <DayPreviewGallery entries={adventsForDay} imageCache={imageCache} />
                    ) : (
                      <Gift className="w-12 h-12 text-white/50 mb-2" />
                    )}
                    <div className={`text-4xl font-bold z-10 ${numColor}`}>
                      {day}
                    </div>
                  </div>
                </Card>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Day {day}{titleSuffix}</DialogTitle>
                  <DialogDescription>
                    {adventsForDay.length === 0
                      ? "No surprise yet for this day"
                      : openedDays.has(day)
                      ? adventsForDay.length + " surprise(s) from your loved one"
                      : "A gift is waiting to be opened!"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 overflow-y-auto flex-1">
                  {adventsForDay.length > 0 ? (
                    openedDays.has(day) ? (
                      <DayDialogGallery entries={adventsForDay} imageCache={imageCache} />
                    ) : (
                      // Gift exists but not opened - show wrapped gift
                      <div className="text-center py-12">
                        <Gift className="w-24 h-24 text-red-600 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-xl font-semibold mb-2">A gift is waiting for you!</h3>
                        <p className="text-muted-foreground mb-6">Click below to open your surprise</p>
                        <Button
                          size="lg"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            setOpenedDays(prev => new Set(prev).add(day));
                          }}
                        >
                          <Gift className="w-5 h-5 mr-2" />
                          Open Gift
                        </Button>
                      </div>
                    )
                  ) : (
                    // No gift uploaded yet
                    <div className="text-center py-12">
                      <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No surprise uploaded yet for Day {day}</p>
                      <p className="text-sm text-muted-foreground mt-2">Check back later!</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
};
