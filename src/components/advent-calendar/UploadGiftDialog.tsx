import type { ChangeEvent, ReactNode } from "react";

import { Upload as UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AdventType } from "@/types/advent";

export type UploadGiftDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  uploadDay: number;
  onDayChange: (day: number) => void;
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  type: AdventType;
  onTypeChange: (value: AdventType) => void;
  selectedFile: File | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void | Promise<void>;
  isSubmitting: boolean;
};

export const UploadGiftDialog = ({
  isOpen,
  onOpenChange,
  trigger,
  uploadDay,
  onDayChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  type,
  onTypeChange,
  selectedFile,
  onFileChange,
  onSubmit,
  isSubmitting
}: UploadGiftDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Upload Advent Gift</DialogTitle>
          <DialogDescription>Create a surprise for your loved one</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="upload-day">Day (1-25)</Label>
            <Select value={uploadDay.toString()} onValueChange={(value) => onDayChange(parseInt(value, 10))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 25 }, (_, index) => index + 1).map((day) => (
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
              onChange={(event) => onTitleChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-description">Description</Label>
            <Textarea
              id="upload-description"
              placeholder="Describe this day's surprise..."
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-type">Type</Label>
            <Select value={type} onValueChange={(value) => onTypeChange(value as AdventType)}>
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
            <Label htmlFor="upload-image-input">Image</Label>
            <input
              id="upload-image-input"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
            <Button variant="outline" className="w-full" type="button" asChild>
              <label htmlFor="upload-image-input" className="flex cursor-pointer items-center justify-center gap-2">
                <UploadIcon className="h-4 w-4" />
                {selectedFile ? selectedFile.name : "Choose Image"}
              </label>
            </Button>
          </div>

          {selectedFile && (
            <Button onClick={() => void onSubmit()} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Uploading..." : "Upload Gift"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
