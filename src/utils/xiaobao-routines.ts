import type { XiaoBaoRoutineInput, XiaoBaoRoutineWeekday } from "@/types/xiaobao";

export const XIAOBAO_WEEKDAYS: Array<{ value: XiaoBaoRoutineWeekday; short: string; label: string }> = [
  { value: 0, short: "M", label: "Monday" },
  { value: 1, short: "T", label: "Tuesday" },
  { value: 2, short: "W", label: "Wednesday" },
  { value: 3, short: "T", label: "Thursday" },
  { value: 4, short: "F", label: "Friday" },
  { value: 5, short: "S", label: "Saturday" },
  { value: 6, short: "S", label: "Sunday" },
];

export const defaultXiaoBaoRoutineInput = (): XiaoBaoRoutineInput => ({
  kind: "REMINDER",
  name: "",
  instruction: null,
  message: "",
  schedule: {
    frequency: "ONCE",
    localDate: "",
    localTime: "09:00",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    weekdays: [],
  },
  contextProfile: "RELATIONSHIP_CARE",
});

export const formatRoutineSchedule = (input: Pick<XiaoBaoRoutineInput, "schedule">) => {
  const { frequency, localDate, localTime, weekdays } = input.schedule;
  if (frequency === "ONCE") {
    if (!localDate) return `Once at ${localTime}`;
    const [year, month, day] = localDate.split("-").map(Number);
    const formattedDate = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date(year, month - 1, day));
    return `${formattedDate} at ${localTime}`;
  }
  if (frequency === "DAILY") return `Every day at ${localTime}`;
  const days = weekdays
    .map((weekday) => XIAOBAO_WEEKDAYS.find((item) => item.value === weekday)?.label)
    .filter(Boolean);
  return `${days.join(", ")} at ${localTime}`;
};
