export type AdventType = "spicy" | "cute" | "funny" | "hot";

export interface AdventEntry {
  day: number;
  uploadedBy: string;
  title: string;
  description: string;
  type: AdventType;
  id: string;
  imageKey: string;
  contentType: string;
  uploadedAt: string;
}

export interface CreateAdventEntry {
  day: number;
  uploaded_by: string;
  title: string;
  description: string;
  type: AdventType;
}

export const typeStyles: Record<AdventType, string> = {
  spicy: "bg-red-600 text-white",
  cute: "bg-pink-500 text-white",
  funny: "bg-yellow-500 text-white",
  hot: "bg-orange-600 text-white",
};

export const typeEmojis: Record<AdventType, string> = {
  spicy: "🌶️",
  cute: "🥰",
  funny: "😂",
  hot: "🔥",
};
