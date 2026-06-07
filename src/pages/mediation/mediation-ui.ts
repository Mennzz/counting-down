import type { MediationSessionDetailResponse, MediationSessionStatus } from "@/types/mediation";

export const statusLabel = (status: MediationSessionStatus) =>
  status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const enumLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const isSessionReadOnly = (session?: Pick<MediationSessionDetailResponse, "status" | "safety_status"> | null) =>
  !session ||
  session.status === "ARCHIVED" ||
  session.status === "RESOLVED" ||
  session.safety_status === "BLOCKED";

export const canDiscuss = (status?: MediationSessionStatus) =>
  status === "AI_ADVICE_AVAILABLE" || status === "DISCUSSION_OPEN";

export const isAdviceAvailable = (session?: MediationSessionDetailResponse | null) =>
  session?.advice_status === "AVAILABLE" ||
  session?.advice?.status === "AVAILABLE" ||
  session?.shared_advice?.status === "AVAILABLE";
