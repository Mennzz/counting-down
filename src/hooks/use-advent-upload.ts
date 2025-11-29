import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";

import { toast } from "sonner";

import { createAdvent } from "@/services/advent";
import { ApiError } from "@/services/api";
import type { AdventType, CreateAdventEntry } from "@/types/advent";

type UseAdventUploadOptions = {
  userType: string | null;
  onSuccess?: () => Promise<void> | void;
  onCompleted?: () => void;
};

export const useAdventUpload = ({ userType, onSuccess, onCompleted }: UseAdventUploadOptions) => {
  const [uploadDay, setUploadDay] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<AdventType>("cute");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = useCallback(() => {
    setUploadDay(1);
    setTitle("");
    setDescription("");
    setType("cute");
    setSelectedFile(null);
  }, []);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setSelectedFile(file);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedFile) {
      toast.error("Please select an image file");
      return;
    }

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
        type
      };

      await createAdvent(newAdvent, selectedFile);

      if (onSuccess) {
        await onSuccess();
      }

      toast.success(`Day ${uploadDay} created!`);

      resetForm();

      if (onCompleted) {
        onCompleted();
      }
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
  }, [selectedFile, title, uploadDay, userType, description, type, onSuccess, resetForm, onCompleted]);

  return {
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
  };
};
