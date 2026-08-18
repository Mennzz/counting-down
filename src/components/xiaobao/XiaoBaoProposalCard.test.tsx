import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { XiaoBaoProposal } from "@/types/xiaobao";
import { XiaoBaoProposalCard } from "./XiaoBaoProposalCard";

const updateProposal = vi.fn();
const acceptProposal = vi.fn();
const rejectProposal = vi.fn();

vi.mock("@/hooks/use-xiaobao", () => ({
  useXiaoBao: () => ({ updateProposal, acceptProposal, rejectProposal }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const baseProposal = {
  id: "64b64c8f2f3f6d1f7a8b9001",
  conversationId: "64b64c8f2f3f6d1f7a8b9002",
  messageId: "64b64c8f2f3f6d1f7a8b9003",
  ownerUserType: "Joris",
  status: "PENDING",
  revision: 1,
  createdAt: "2026-08-18T10:00:00.000Z",
  updatedAt: "2026-08-18T10:00:00.000Z",
} satisfies Partial<XiaoBaoProposal>;

describe("Xiao Bao mediation proposal cards", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the immutable mediation target and shared Xiao Bao warning", () => {
    const proposal: XiaoBaoProposal = {
      ...baseProposal,
      ownerUserType: "Joris",
      status: "PENDING",
      type: "MEDIATION_COMMENT",
      payload: { content: "Could we each name one priority?" },
      target: {
        type: "MEDIATION_SESSION",
        id: "64b64c8f2f3f6d1f7a8b9004",
        title: "Weekend planning",
      },
    } as XiaoBaoProposal;

    render(
      <MemoryRouter>
        <XiaoBaoProposalCard proposal={proposal} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Weekend planning")).toBeInTheDocument();
    expect(screen.getByText(/posts this exact text.*as Xiao Bao/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByLabelText("Comment")).toHaveValue(
      "Could we each name one priority?",
    );
    expect(screen.queryByLabelText(/session/i)).not.toBeInTheDocument();
  });

  it("links an accepted mediation session to the private perspective editor", () => {
    const proposal: XiaoBaoProposal = {
      ...baseProposal,
      ownerUserType: "Joris",
      status: "ACCEPTED",
      type: "MEDIATION_SESSION",
      payload: { title: "Weekend planning", description: "Plan calmly" },
      createdEntityId: "64b64c8f2f3f6d1f7a8b9004",
    } as XiaoBaoProposal;

    render(
      <MemoryRouter>
        <XiaoBaoProposalCard proposal={proposal} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Add my perspective" })).toHaveAttribute(
      "href",
      "/mediation/64b64c8f2f3f6d1f7a8b9004/perspective",
    );
  });

  it("states that a perspective proposal stays private and unsubmitted", () => {
    const proposal: XiaoBaoProposal = {
      ...baseProposal,
      ownerUserType: "Joris",
      status: "PENDING",
      type: "MEDIATION_PERSPECTIVE_DRAFT",
      payload: { whatHappened: "We rushed the plan" },
      target: {
        type: "MEDIATION_SESSION",
        id: "64b64c8f2f3f6d1f7a8b9004",
        title: "Weekend planning",
      },
    } as XiaoBaoProposal;

    render(
      <MemoryRouter>
        <XiaoBaoProposalCard proposal={proposal} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/private draft.*not submit or share/i)).toBeInTheDocument();
  });

  it("plays success once when a proposal has just been accepted", async () => {
    const pending: XiaoBaoProposal = {
      ...baseProposal,
      ownerUserType: "Joris",
      status: "PENDING",
      type: "TOGETHER_LIST_ITEM",
      payload: { title: "Watch a movie", category: "Movie" },
    } as XiaoBaoProposal;
    const { container, rerender } = render(
      <MemoryRouter>
        <XiaoBaoProposalCard proposal={pending} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /accept/i }));
    await waitFor(() => expect(acceptProposal).toHaveBeenCalledWith(pending));
    rerender(
      <MemoryRouter>
        <XiaoBaoProposalCard proposal={{ ...pending, status: "ACCEPTED" }} />
      </MemoryRouter>,
    );

    expect(container.querySelector('[data-state="success"]')).toHaveAttribute(
      "data-animated",
      "true",
    );
  });
});
