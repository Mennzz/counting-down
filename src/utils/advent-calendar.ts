import type { AdventViewMode } from "@/types/advent-calendar";

export const isDayUnlocked = (viewMode: AdventViewMode, day: number, referenceDate: Date = new Date()): boolean => {
  if (viewMode === "by-me") {
    return true;
  }

  if (referenceDate.getMonth() !== 11) {
    return false;
  }

  return day <= referenceDate.getDate();
};

export const shouldShowAdventCalendar = (referenceDate: Date = new Date()): boolean => {
  const validMonths = [10, 11]; // November and December
  return validMonths.includes(referenceDate.getMonth());
}
