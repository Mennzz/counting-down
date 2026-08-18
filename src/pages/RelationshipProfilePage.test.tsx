import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RelationshipProfile } from "@/types/relationship-profile";
import RelationshipProfilePage from "./RelationshipProfilePage";

const mutate = vi.fn();
const profile: RelationshipProfile = {
  relationshipMode: "LONG_DISTANCE",
  currentlyTogether: false,
  togetherThrough: null,
  relationshipNotes: "We are long-distance.",
  practicalNotes: "Remote plans while apart.",
  people: [
    {
      userType: "Joris",
      preferredName: "Joris",
      location: "Netherlands",
      timezone: "Europe/Amsterdam",
      personalityNotes: "Likes direct plans.",
      preferencesNotes: "Enjoys movies.",
    },
    {
      userType: "Danfeng",
      preferredName: "Dan",
      location: "Stockholm",
      timezone: "Europe/Stockholm",
      personalityNotes: "Likes thoughtful surprises.",
      preferencesNotes: "Enjoys cozy evenings.",
    },
  ],
};

vi.mock("@/hooks/use-relationship-profile", () => ({
  useRelationshipProfile: () => ({ data: profile, isLoading: false, isError: false }),
  useSaveRelationshipProfile: () => ({ mutate, isPending: false }),
}));

describe("RelationshipProfilePage", () => {
  beforeEach(() => mutate.mockReset());

  it("shows the shared long-distance context and saves visit state", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><RelationshipProfilePage /></MemoryRouter>);

    expect(screen.getByDisplayValue("Netherlands")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Stockholm")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Relationship settings" })).toBeInTheDocument();
    expect(screen.getByText(/Everything here is shared/)).toBeInTheDocument();

    await user.click(screen.getByRole("switch", { name: "Currently together" }));
    await user.click(screen.getByRole("button", { name: "Save context" }));

    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ currentlyTogether: true }));
  });
});
