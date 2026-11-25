import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { XiaoBaoChat } from "./XiaoBaoChat";

vi.mock("@/hooks/use-xiaobao", () => ({
  useXiaoBao: () => ({
    isOpen: true,
    setIsOpen: vi.fn(),
    activeConversationId: "64b64c8f2f3f6d1f7a8b9001",
    conversations: [],
    detail: {
      conversation: {
        id: "64b64c8f2f3f6d1f7a8b9001",
        ownerUserType: "Joris",
        title: "Mediation help",
        createdAt: "2026-08-18T10:00:00.000Z",
        updatedAt: "2026-08-18T10:00:00.000Z",
      },
      messages: [
        {
          id: "64b64c8f2f3f6d1f7a8b9010",
          conversationId: "64b64c8f2f3f6d1f7a8b9001",
          role: "ASSISTANT",
          status: "COMPLETE",
          content: "An earlier answer.",
          mascotMood: "CONCERNED",
          contextReferences: [],
          proposalIds: [],
          completedActions: [],
          createdAt: "2026-08-18T09:00:00.000Z",
          updatedAt: "2026-08-18T09:00:00.000Z",
        },
        {
          id: "64b64c8f2f3f6d1f7a8b9002",
          conversationId: "64b64c8f2f3f6d1f7a8b9001",
          role: "ASSISTANT",
          status: "COMPLETE",
          content: "The shared advice is ready.",
          mascotMood: "LOVE",
          contextReferences: [
            {
              key: "mediation_session:64b64c8f2f3f6d1f7a8b9004",
              type: "MEDIATION_SESSION",
              id: "64b64c8f2f3f6d1f7a8b9004",
              title: "Weekend planning",
            },
          ],
          proposalIds: [],
          completedActions: [],
          createdAt: "2026-08-18T10:00:00.000Z",
          updatedAt: "2026-08-18T10:00:00.000Z",
        },
      ],
      proposals: [],
      hasMoreMessages: false,
    },
    isLoading: false,
    isStreaming: false,
    startNewChat: vi.fn(),
    selectConversation: vi.fn(),
    deleteConversation: vi.fn(),
    sendMessage: vi.fn(),
    cancel: vi.fn(),
    retry: vi.fn(),
    updateProposal: vi.fn(),
    acceptProposal: vi.fn(),
    rejectProposal: vi.fn(),
  }),
}));

describe("Xiao Bao mediation references", () => {
  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("links a mediation context chip to its dashboard", () => {
    const { container } = render(
      <MemoryRouter>
        <XiaoBaoChat />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Weekend planning" })).toHaveAttribute(
      "href",
      "/mediation/64b64c8f2f3f6d1f7a8b9004",
    );
    const messageMascots = container.querySelectorAll(
      ".xiaobao-message-assistant-enter .xiaobao-mascot",
    );
    expect(messageMascots).toHaveLength(1);
    expect(messageMascots[0]).toHaveAttribute("data-state", "love");
    expect(messageMascots[0]).toHaveAttribute("data-animated", "false");
  });
});

describe("Xiao Bao header on small screens", () => {
  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
    HTMLElement.prototype.hasPointerCapture = vi.fn();
    HTMLElement.prototype.releasePointerCapture = vi.fn();
  });

  it("keeps every Xiao Bao page reachable from one menu so the header fits", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <XiaoBaoChat />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "More Xiao Bao pages" }));
    const menu = await screen.findByRole("menu");
    const items = within(menu).getAllByRole("menuitem");

    expect(items.map((item) => item.textContent)).toEqual([
      "Routines & reminders",
      "Inbox",
      "Notifications",
    ]);
    expect(items.map((item) => item.getAttribute("href"))).toEqual([
      "/xiaobao/routines",
      "/xiaobao/inbox",
      "/xiaobao/notifications",
    ]);
    // Wider screens keep the individual icon links.
    expect(screen.getByRole("link", { name: "Xiao Bao inbox", hidden: true })).toHaveAttribute(
      "href",
      "/xiaobao/inbox",
    );
  });
});
