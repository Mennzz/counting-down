import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { XiaoBaoRoutineEditor } from "./XiaoBaoRoutineEditor";

describe("Xiao Bao routine editor", () => {
  it("submits a structured daily schedule and explains the read-only context boundary", async () => {
    const onSubmit = vi.fn();
    render(<XiaoBaoRoutineEditor submitLabel="Review routine" onSubmit={onSubmit} initialValue={{
      kind: "ROUTINE",
      name: "",
      instruction: "",
      message: null,
      schedule: {
        frequency: "DAILY",
        localTime: "09:00",
        timezone: "Europe/Amsterdam",
        weekdays: [],
      },
      contextProfile: "RELATIONSHIP_CARE",
    }} />);

    expect(screen.getByText(/cannot add, edit, complete, or delete list items/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Routine name")).toHaveAttribute("maxLength", "100");
    expect(screen.getByRole("button", { name: "Review routine" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Routine name"), { target: { value: "Morning idea" } });
    fireEvent.change(screen.getByLabelText("What Xiao Bao should prepare"), {
      target: { value: "Give me one thoughtful idea." },
    });
    fireEvent.change(screen.getByLabelText("Timezone"), { target: { value: "Europe/Amsterdam" } });
    fireEvent.click(screen.getByRole("button", { name: "Review routine" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      kind: "ROUTINE",
      name: "Morning idea",
      instruction: "Give me one thoughtful idea.",
      message: null,
      schedule: {
        frequency: "DAILY",
        localTime: "09:00",
        timezone: "Europe/Amsterdam",
        weekdays: [],
      },
      contextProfile: "RELATIONSHIP_CARE",
    }));
  });

  it("uses a distinct one-time reminder contract with exact static text", async () => {
    const onSubmit = vi.fn();
    render(<XiaoBaoRoutineEditor submitLabel="Review" onSubmit={onSubmit} />);

    expect(screen.getByText(/deliver this exact reminder text.*not use AI or relationship context/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Reminder name")).toHaveAttribute("maxLength", "100");
    expect(screen.getByLabelText("Reminder text")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toHaveAttribute("type", "date");
    expect(screen.queryByLabelText("Repeats")).not.toBeInTheDocument();
    expect(screen.getByText(/event-based triggers.*aren’t supported yet.*separate from reminders and routines/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Reminder name"), { target: { value: "Cozy date" } });
    fireEvent.change(screen.getByLabelText("Reminder text"), { target: { value: "Plan our cozy mini-date." } });
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-08-28" } });
    fireEvent.change(screen.getByLabelText("Timezone"), { target: { value: "Europe/Stockholm" } });
    fireEvent.click(screen.getByRole("button", { name: "Review" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      kind: "REMINDER",
      name: "Cozy date",
      instruction: null,
      message: "Plan our cozy mini-date.",
      schedule: {
        frequency: "ONCE",
        localDate: "2026-08-28",
        localTime: "09:00",
        timezone: "Europe/Stockholm",
        weekdays: [],
      },
      contextProfile: "RELATIONSHIP_CARE",
    }));
  });
});
