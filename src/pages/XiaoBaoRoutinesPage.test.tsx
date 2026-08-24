import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { XiaoBaoRoutine } from "@/types/xiaobao";
import XiaoBaoRoutinesPage from "./XiaoBaoRoutinesPage";

const createRoutine = vi.fn();
const resumeRoutine = vi.fn();
const routinesState: { data: XiaoBaoRoutine[] } = { data: [] };

vi.mock("@/hooks/use-xiaobao-routines", () => ({
  useXiaoBaoRoutines: () => ({ data: routinesState.data, isLoading: false, isError: false }),
  useCreateXiaoBaoRoutine: () => ({ mutateAsync: createRoutine, isPending: false }),
  useDeleteXiaoBaoRoutine: () => ({ mutate: vi.fn(), isPending: false }),
  usePauseXiaoBaoRoutine: () => ({ mutate: vi.fn(), isPending: false }),
  useResumeXiaoBaoRoutine: () => ({ mutate: resumeRoutine, isPending: false }),
  useUpdateXiaoBaoRoutine: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useXiaoBaoRoutineRuns: () => ({ data: { items: [], hasMore: false }, isError: false }),
}));

describe("Xiao Bao routines page", () => {
  beforeEach(() => {
    createRoutine.mockReset();
    createRoutine.mockResolvedValue({});
    resumeRoutine.mockReset();
    routinesState.data = [];
  });

  it("requires a second review confirmation before creating a routine", async () => {
    render(<MemoryRouter><XiaoBaoRoutinesPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "New reminder or routine" }));
    fireEvent.change(screen.getByLabelText("Reminder name"), { target: { value: "Cozy date" } });
    fireEvent.change(screen.getByLabelText("Reminder text"), {
      target: { value: "Plan our cozy mini-date." },
    });
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-08-28" } });
    fireEvent.change(screen.getByLabelText("Timezone"), { target: { value: "Europe/Amsterdam" } });
    fireEvent.click(screen.getByRole("button", { name: "Review" }));

    expect(createRoutine).not.toHaveBeenCalled();
    expect(await screen.findByRole("heading", { name: "Set this reminder?" })).toBeInTheDocument();
    expect(screen.getByText("Only you")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Set reminder" }));

    await waitFor(() => expect(createRoutine).toHaveBeenCalledWith(expect.objectContaining({
      kind: "REMINDER",
      name: "Cozy date",
      schedule: expect.objectContaining({
        frequency: "ONCE",
        localDate: "2026-08-28",
        timezone: "Europe/Amsterdam",
        weekdays: [],
      }),
    })));
  });

  it("explains an unread-inactivity auto-pause and guides the owner to the inbox", () => {
    routinesState.data = [routine({ pauseReason: "UNREAD_INACTIVITY" })];
    render(<MemoryRouter><XiaoBaoRoutinesPage /></MemoryRouter>);

    expect(screen.getByText("Auto-paused")).toBeInTheDocument();
    expect(screen.getByText("Paused after five unread days")).toBeInTheDocument();
    expect(screen.getByText(/one of this routine’s delivered inbox messages was unread for five full days/i)).toBeInTheDocument();
    expect(screen.getByText(/need to read the old routine messages before this routine can resume/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read this routine’s inbox first" })).toHaveAttribute(
      "href",
      "/xiaobao/inbox?routineId=routine-1",
    );

    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    expect(screen.getByText(/once you’re caught up, you can resume it here/i)).toBeInTheDocument();
  });

  it("keeps a manual pause presentation neutral", () => {
    routinesState.data = [routine({ pauseReason: "MANUAL" })];
    render(<MemoryRouter><XiaoBaoRoutinesPage /></MemoryRouter>);

    expect(screen.getAllByText("Paused")).not.toHaveLength(0);
    expect(screen.queryByText("Paused after five unread days")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Read this routine’s inbox first" })).not.toBeInTheDocument();
  });

  it("keeps a delivered reminder as private history without routine controls", () => {
    routinesState.data = [routine({
      kind: "REMINDER",
      name: "Cozy date",
      instruction: null,
      message: "Plan our cozy mini-date.",
      schedule: {
        frequency: "ONCE",
        localDate: "2026-08-28",
        localTime: "12:00",
        timezone: "Europe/Stockholm",
        weekdays: [],
      },
      enabled: true,
      nextRunAt: null,
      finishedAt: "2026-08-28T10:00:30.000Z",
      finishReason: "DELIVERED",
    })];
    render(<MemoryRouter><XiaoBaoRoutinesPage /></MemoryRouter>);

    expect(screen.getByText("Delivered")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Open inbox" })[1]).toHaveAttribute(
      "href",
      "/xiaobao/inbox?routineId=routine-1",
    );
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pause" })).not.toBeInTheDocument();
  });

  it("guides a paused, expired reminder to a future edit instead of offering resume", () => {
    routinesState.data = [routine({
      kind: "REMINDER",
      name: "Past plan",
      instruction: null,
      message: "Plan our cozy mini-date.",
      schedule: {
        frequency: "ONCE",
        localDate: "2020-01-01",
        localTime: "12:00",
        timezone: "Europe/Amsterdam",
        weekdays: [],
      },
      enabled: false,
      nextRunAt: "2020-01-01T11:00:00.000Z",
      finishedAt: null,
      finishReason: null,
      pauseReason: "MANUAL",
    })];
    render(<MemoryRouter><XiaoBaoRoutinesPage /></MemoryRouter>);

    expect(screen.getByText("Needs a new time")).toBeInTheDocument();
    expect(screen.getByText(/time has passed.*edit it to choose a future date and time.*you can resume it/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Resume" })).not.toBeInTheDocument();
  });
});

const routine = (overrides: Partial<XiaoBaoRoutine> = {}): XiaoBaoRoutine => ({
  kind: "ROUTINE",
  id: "routine-1",
  name: "Morning idea",
  instruction: "Give me one small caring idea.",
  message: null,
  schedule: {
    frequency: "DAILY",
    localTime: "09:00",
    timezone: "Europe/Amsterdam",
    weekdays: [],
  },
  contextProfile: "RELATIONSHIP_CARE",
  deliveryChannel: "IN_APP",
  enabled: false,
  nextRunAt: "2026-08-25T07:00:00.000Z",
  pauseReason: null,
  pausedAt: "2026-08-24T08:00:00.000Z",
  createdAt: "2026-08-20T08:00:00.000Z",
  updatedAt: "2026-08-24T08:00:00.000Z",
  ...overrides,
});
