export type AdventType = "ritual" | "memory" | "surprise" | "play" | "care";

export interface AdventDay {
  day: number;
  title: string;
  description: string;
  type: AdventType;
  actor?: string;
  imageData?: string;
  imageUrl?: string;
}

export interface AdventDayCreate {
  day: number;
  title: string;
  description: string;
  type: AdventType;
  actor?: string;
  image: File;
}

export const typeStyles: Record<AdventType, string> = {
  ritual: "bg-rose-100 text-rose-700 border border-rose-200",
  memory: "bg-amber-100 text-amber-700 border border-amber-200",
  surprise: "bg-purple-100 text-purple-700 border border-purple-200",
  play: "bg-blue-100 text-blue-700 border border-blue-200",
  care: "bg-green-100 text-green-700 border border-green-200",
};
