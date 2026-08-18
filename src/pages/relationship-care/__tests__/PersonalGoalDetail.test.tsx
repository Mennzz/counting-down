import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PersonalGoal } from "@/types/relationship-care";
import { PersonalGoalDetailPage } from "../PersonalGoalDetail";

const updateMutate = vi.fn();
const archiveMutateAsync = vi.fn();

vi.mock("@/hooks/use-relationship-care", () => ({
  usePersonalGoal: vi.fn(),
  useUpdatePersonalGoal: () => ({ mutate: updateMutate, isPending: false }),
  useArchivePersonalGoal: () => ({ mutateAsync: archiveMutateAsync, isPending: false }),
  useSavePersonalGoal: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

import { usePersonalGoal } from "@/hooks/use-relationship-care";

const sharedGoal: PersonalGoal = {
  id: "64a7f0c2f1d2c4b5a6e7d8f5",
  ownerUserType: "Danfeng",
  title: "Speak more directly",
  goal: "Say what I need with care.",
  whyItMatters: "Honesty helps us understand each other.",
  trigger: "When I worry about disappointing someone.",
  practice: "Use one clear sentence.",
  reminder: "Kind and direct can coexist.",
  category: "COMMUNICATION",
  visibility: "SHARED_WITH_PARTNER",
  createdAt: "2026-08-18T10:00:00Z",
  updatedAt: "2026-08-18T10:00:00Z",
  isMine: false,
};

const renderRoute = () => render(
  <MemoryRouter initialEntries={[`/boundaries-agreements/goals/${sharedGoal.id}`]}>
    <Routes>
      <Route path="/boundaries-agreements/goals/:goalId" element={<PersonalGoalDetailPage />} />
    </Routes>
  </MemoryRouter>,
);

describe("PersonalGoalDetailPage", () => {
  beforeEach(() => {
    updateMutate.mockReset();
    archiveMutateAsync.mockReset();
    vi.mocked(usePersonalGoal).mockReturnValue({
      data: sharedGoal,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof usePersonalGoal>);
  });

  it("renders a partner's shared goal as a read-only reflection", () => {
    renderRoute();

    expect(screen.getByRole("heading", { level: 1, name: "Speak more directly" })).toBeInTheDocument();
    expect(screen.getByText("Kind and direct can coexist.")).toBeInTheDocument();
    expect(screen.getByText("Danfeng chose to share this personal goal with you.")).toBeInTheDocument();
    expect(screen.getByText("Read only")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Make private|Share with/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Archive" })).not.toBeInTheDocument();
  });

  it("lets the owner explicitly share a private goal", async () => {
    vi.mocked(usePersonalGoal).mockReturnValue({
      data: { ...sharedGoal, ownerUserType: "Joris", visibility: "PRIVATE", isMine: true },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof usePersonalGoal>);
    const user = userEvent.setup();
    renderRoute();

    await user.click(screen.getByRole("button", { name: "Share with Danfeng" }));
    expect(updateMutate).toHaveBeenCalledWith({ visibility: "SHARED_WITH_PARTNER" });
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument();
  });
});
