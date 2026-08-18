import type { PersonalGoalCategory, RelationshipCareCategory } from "@/types/relationship-care";

export const categoryLabels: Record<RelationshipCareCategory, string> = {
  CONFLICT: "Conflict",
  PRIVACY: "Privacy",
  TRUST: "Trust",
  AUTONOMY: "Autonomy",
  COMMUNICATION: "Communication",
  INTIMACY: "Intimacy",
  FAMILY: "Family",
  TIME: "Time",
  SOCIAL_LIFE: "Social life",
  OTHER: "Other",
};

export const goalCategoryLabels: Record<PersonalGoalCategory, string> = {
  EMOTIONAL_REGULATION: "Emotional regulation",
  CONFLICT: "Conflict",
  COMMUNICATION: "Communication",
  TRUST: "Trust",
  AUTONOMY: "Autonomy",
  INTIMACY: "Intimacy",
  ATTACHMENT: "Attachment",
  SELF_RESPECT: "Self-respect",
  OTHER: "Other",
};

export const formatCareDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
