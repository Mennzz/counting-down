import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { useAdventEntries } from "@/hooks/use-advent-entries";
import { useAdventOpenedDays } from "@/hooks/use-advent-opened-days";
import { useAdventUpload } from "@/hooks/use-advent-upload";
import { AdventDay } from "./advent-calendar/AdventDay";
import { dayColors, dayNumberColors } from "./advent-calendar/constants";
import { UploadGiftDialog } from "./advent-calendar/UploadGiftDialog";
import { Skeleton } from "./ui/skeleton";
import type { AdventEntry } from "@/types/advent";
import type { AdventViewMode } from "@/types/advent-calendar";
import { isDayUnlocked as isAdventDayUnlocked } from "@/utils/advent-calendar";
import { getUserType } from "@/utils/cookies";

export const AdventCalendarNew = () => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<AdventViewMode>("for-me");
  const userType = getUserType();

  const {
    imageCache,
    isLoading,
    loadAdvents,
    deleteEntry,
    getEntriesForDay,
    loadError
  } = useAdventEntries(viewMode);

  const { openedDays, markDayOpened } = useAdventOpenedDays();

  const {
    uploadDay,
    setUploadDay,
    title,
    setTitle,
    description,
    setDescription,
    type,
    setType,
    selectedFile,
    isUploading,
    handleFileChange,
    handleSubmit
  } = useAdventUpload({
    userType,
    onSuccess: loadAdvents,
    onCompleted: () => setIsUploadDialogOpen(false)
  });

  useEffect(() => {
    if (loadError) {
      toast.error("Failed to load advent calendar");
    }
  }, [loadError]);

  const handleDelete = async (advent: AdventEntry) => {
    try {
      await deleteEntry(advent);
      toast.success("Advent deleted");
    } catch (error) {
      toast.error("Failed to delete advent");
      console.error("Delete error:", error);
    }
  };

  const handleOpenGift = (day: number) => {
    if (viewMode === "for-me") {
      markDayOpened(day);
    }
  };

  const progressPercentage = Math.round((openedDays.size / 25) * 100);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-5xl font-bold text-red-600">🎄 Advent Calendar 🎄</h1>
          <p className="text-muted-foreground">25 days of surprises leading to Christmas!</p>

          <div className="mt-4 flex justify-center">
            <Skeleton className="h-10 w-56 rounded" />
          </div>
        </div>

        <Loader2 className="mx-auto my-20 h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-5xl font-bold text-red-600">🎄 Advent Calendar 🎄</h1>
        <p className="text-muted-foreground">25 days of surprises leading to Christmas!</p>

        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setViewMode("for-me")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${viewMode === "for-me" ? "bg-rose-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              For Me
            </button>
            <button
              onClick={() => setViewMode("by-me")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${viewMode === "by-me" ? "bg-rose-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              By Me
            </button>
          </div>

          {/* Upload Gift Dialog */}
          <UploadGiftDialog
            isOpen={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
            trigger={
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <Upload className="mr-2 h-5 w-5" />
                Upload Advent Gift
              </Button>
            }
            uploadDay={uploadDay}
            onDayChange={(day) => setUploadDay(day)}
            title={title}
            onTitleChange={setTitle}
            description={description}
            onDescriptionChange={setDescription}
            type={type}
            onTypeChange={setType}
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            isSubmitting={isUploading}
          />
        </div>
      </div>

      {/* Progress Section */}
      <div className="mx-auto mb-8 max-w-4xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Progress: {openedDays.size} / 25 gifts opened
          </span>
          <span className="text-sm font-bold text-red-600">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
        {openedDays.size === 25 && (
          <p className="mt-4 text-center text-lg font-semibold text-green-600">
            🎉 Congratulations! You've opened all the gifts! 🎉
          </p>
        )}
      </div>

      {/* Advent Days Grid */}
      <div className="mx-auto grid max-w-6xl grid-cols-5 gap-3">
        {Array.from({ length: 25 }, (_, index) => {
          const day = index + 1;
          const entries = getEntriesForDay(day);
          const isUnlocked = isAdventDayUnlocked(viewMode, day);
          const isOpened = viewMode === "by-me" || openedDays.has(day);

          return (
            <AdventDay
              key={day}
              day={day}
              entries={entries}
              imageCache={imageCache}
              backgroundClass={dayColors[day - 1]}
              numberClass={dayNumberColors[day - 1]}
              isUnlocked={isUnlocked}
              isOpened={isOpened}
              viewMode={viewMode}
              onOpenGift={() => handleOpenGift(day)}
              onDeleteEntry={handleDelete}
            />
          );
        })}
      </div>
    </div>
  );
};
