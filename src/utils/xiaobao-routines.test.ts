import { describe, expect, it } from "vitest";

import { formatRoutineSchedule } from "./xiaobao-routines";

describe("Xiao Bao scheduled item formatting", () => {
  it("formats a one-time reminder from its local date and time", () => {
    expect(formatRoutineSchedule({
      schedule: {
        frequency: "ONCE",
        localDate: "2026-08-28",
        localTime: "12:00",
        timezone: "Europe/Stockholm",
        weekdays: [],
      },
    })).toMatch(/August 28 at 12:00|28 August at 12:00/);
  });

  it("keeps a recurring routine's weekday schedule intact", () => {
    expect(formatRoutineSchedule({
      schedule: {
        frequency: "WEEKLY",
        localTime: "09:00",
        timezone: "Europe/Amsterdam",
        weekdays: [0, 4],
      },
    })).toBe("Monday, Friday at 09:00");
  });
});
