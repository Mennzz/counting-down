import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RelationshipCareOverview } from "@/types/relationship-care";
import { RelationshipCareOverviewPage } from "../RelationshipCareOverview";

const mutate = vi.fn();
const overview: RelationshipCareOverview = {
  currentUserType: "Joris",
  partnerUserType: "Danfeng",
  agreementCounts: {
    DRAFT: 0,
    PROPOSED: 1,
    DISCUSSING: 0,
    AGREED: 1,
    REVISIT: 0,
    ARCHIVED: 0,
  },
  agreements: [
    {
      id: "64a7f0c2f1d2c4b5a6e7d8f1",
      status: "PROPOSED",
      title: "Protecting us during conflict",
      agreementText: "Either person may pause and commits to return later.",
      fairnessType: "SYMMETRIC",
      revisionNumber: 1,
      updatedAt: "2026-08-18T10:00:00Z",
      isCreator: false,
      hasMyAcceptance: false,
      hasPartnerAcceptance: false,
      needsMyResponse: true,
    },
  ],
  boundaries: [
    {
      id: "64a7f0c2f1d2c4b5a6e7d8f2",
      ownerUserType: "Joris",
      title: "Respectful pauses",
      whatINeed: "Conversations without insults.",
      whatIWillDo: "Pause and return later.",
      category: "CONFLICT",
      createdAt: "2026-08-18T10:00:00Z",
      updatedAt: "2026-08-18T10:00:00Z",
      isMine: true,
    },
    {
      id: "64a7f0c2f1d2c4b5a6e7d8f3",
      ownerUserType: "Danfeng",
      title: "Private messages",
      whatINeed: "Privacy around personal messages.",
      whatIWillDo: "Answer direct relationship questions honestly.",
      category: "PRIVACY",
      createdAt: "2026-08-18T10:00:00Z",
      updatedAt: "2026-08-18T10:00:00Z",
      isMine: false,
    },
  ],
  requests: [],
  archivedBoundaries: [],
  archivedRequests: [],
  goals: [
    {
      id: "64a7f0c2f1d2c4b5a6e7d8f4",
      ownerUserType: "Joris",
      title: "Pause before reacting",
      goal: "Take one breath before responding.",
      category: "EMOTIONAL_REGULATION",
      visibility: "PRIVATE",
      createdAt: "2026-08-18T10:00:00Z",
      updatedAt: "2026-08-18T10:00:00Z",
      isMine: true,
    },
    {
      id: "64a7f0c2f1d2c4b5a6e7d8f5",
      ownerUserType: "Danfeng",
      title: "Speak more directly",
      goal: "Say what I need with care.",
      category: "COMMUNICATION",
      visibility: "SHARED_WITH_PARTNER",
      createdAt: "2026-08-18T10:00:00Z",
      updatedAt: "2026-08-18T10:00:00Z",
      isMine: false,
    },
  ],
  archivedGoals: [],
};

vi.mock("@/hooks/use-relationship-care", () => ({
  useRelationshipCareOverview: vi.fn(),
  useArchiveBoundary: () => ({ mutate, isPending: false }),
  useArchiveRelationshipRequest: () => ({ mutate, isPending: false }),
  useArchivePersonalGoal: () => ({ mutate, isPending: false }),
  useRestoreBoundary: () => ({ mutate, isPending: false }),
  useRestoreRelationshipRequest: () => ({ mutate, isPending: false }),
  useRestorePersonalGoal: () => ({ mutate, isPending: false }),
  useSaveBoundary: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSaveRelationshipRequest: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSavePersonalGoal: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

import { useRelationshipCareOverview } from "@/hooks/use-relationship-care";

describe("RelationshipCareOverviewPage", () => {
  beforeEach(() => {
    mutate.mockReset();
    vi.mocked(useRelationshipCareOverview).mockReturnValue({
      data: overview,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useRelationshipCareOverview>);
  });

  it("uses dynamic partner names and marks partner content read-only", () => {
    render(<MemoryRouter><RelationshipCareOverviewPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "Me · Joris" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "My partner · Danfeng" })).toBeInTheDocument();
    expect(screen.getByText("Private messages")).toBeInTheDocument();
    expect(screen.getAllByText("Read only")).toHaveLength(2);
    expect(screen.queryByLabelText("Edit Private messages")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Shared growth goals" })).toBeInTheDocument();
    expect(screen.getByText("Speak more directly")).toBeInTheDocument();
  });

  it("defaults a new personal growth goal to Only me", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><RelationshipCareOverviewPage /></MemoryRouter>);

    await user.click(screen.getByRole("button", { name: "Add growth goal" }));
    expect(screen.getByRole("dialog", { name: "Add a personal growth goal" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Visibility" })).toHaveTextContent("Only me");
  });

  it("restores archived growth goals from the owner-only drawer", async () => {
    const archivedGoal = { ...overview.goals[0], archivedAt: "2026-08-18T11:00:00Z" };
    vi.mocked(useRelationshipCareOverview).mockReturnValue({
      data: { ...overview, archivedGoals: [archivedGoal] },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useRelationshipCareOverview>);
    const user = userEvent.setup();
    render(<MemoryRouter><RelationshipCareOverviewPage /></MemoryRouter>);

    await user.click(screen.getByRole("button", { name: "Show archived (1)" }));
    expect(screen.getByText("Growth goals")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Restore" }));
    expect(mutate).toHaveBeenCalledWith(archivedGoal.id);
  });

  it("surfaces agreements that need the current user’s response", () => {
    render(<MemoryRouter><RelationshipCareOverviewPage /></MemoryRouter>);

    expect(screen.getByText("Protecting us during conflict")).toBeInTheDocument();
    expect(screen.getByText("Needs your response")).toBeInTheDocument();
    expect(screen.getByText("Waiting for your partner")).toBeInTheDocument();
  });

  it("shows and restores the current user’s archived personal items", async () => {
    const archivedBoundary = { ...overview.boundaries[0], archivedAt: "2026-08-18T11:00:00Z" };
    vi.mocked(useRelationshipCareOverview).mockReturnValue({
      data: { ...overview, archivedBoundaries: [archivedBoundary] },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useRelationshipCareOverview>);
    const user = userEvent.setup();
    render(<MemoryRouter><RelationshipCareOverviewPage /></MemoryRouter>);

    await user.click(screen.getByRole("button", { name: "Show archived (1)" }));
    expect(screen.getByRole("heading", { name: "Archived personal items" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Restore" }));
    expect(mutate).toHaveBeenCalledWith(archivedBoundary.id);
  });
});
