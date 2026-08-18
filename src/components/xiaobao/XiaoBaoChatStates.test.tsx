import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { XiaoBaoMessage } from "@/types/xiaobao";
import { XiaoBaoChat } from "./XiaoBaoChat";

const useXiaoBaoMock = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-xiaobao", () => ({ useXiaoBao: useXiaoBaoMock }));

const baseMessage: XiaoBaoMessage = {
  id: "64b64c8f2f3f6d1f7a8b9002",
  conversationId: "64b64c8f2f3f6d1f7a8b9001",
  role: "ASSISTANT",
  status: "COMPLETE",
  content: "I’m here with you.",
  mascotMood: "IDLE",
  contextReferences: [],
  proposalIds: [],
  completedActions: [],
  createdAt: "2026-08-18T10:00:00.000Z",
  updatedAt: "2026-08-18T10:00:00.000Z",
};

function renderChat(message: XiaoBaoMessage, isStreaming: boolean, live = true) {
  useXiaoBaoMock.mockReturnValue({
    isOpen: true,
    setIsOpen: vi.fn(),
    activeConversationId: message.conversationId,
    conversations: [],
    detail: {
      conversation: {
        id: message.conversationId,
        ownerUserType: "Joris",
        title: "A chat",
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      },
      messages: [message],
      proposals: [],
      hasMoreMessages: false,
    },
    isLoading: false,
    isStreaming,
    liveMessageId: live ? message.id : undefined,
    startNewChat: vi.fn(),
    selectConversation: vi.fn(),
    deleteConversation: vi.fn(),
    sendMessage: vi.fn(),
    cancel: vi.fn(),
    retry: vi.fn(),
    updateProposal: vi.fn(),
    acceptProposal: vi.fn(),
    rejectProposal: vi.fn(),
  });

  return render(
    <MemoryRouter>
      <XiaoBaoChat />
    </MemoryRouter>,
  );
}

describe("Xiao Bao chat mascot states", () => {
  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("shows thinking motion while retaining explanatory text", () => {
    const { container } = renderChat(
      { ...baseMessage, status: "GENERATING", content: "" },
      true,
    );

    expect(screen.getByText("Xiao Bao is thinking…", { selector: "span[aria-hidden]" }))
      .toBeInTheDocument();
    expect(container.querySelector("header [data-state]")).toHaveAttribute(
      "data-state",
      "thinking",
    );
    expect(
      container.querySelector(".xiaobao-message-assistant-enter [data-state]"),
    ).toHaveAttribute("data-state", "thinking");
  });

  it("animates a model-selected live mood once", () => {
    const { container } = renderChat(
      { ...baseMessage, mascotMood: "LOVE" },
      false,
    );

    const mascot = container.querySelector(
      ".xiaobao-message-assistant-enter [data-state]",
    );
    expect(mascot).toHaveAttribute("data-state", "love");
    expect(mascot).toHaveAttribute("data-animated", "true");
  });

  it.each(["FAILED", "CANCELLED"] as const)(
    "shows a concerned reaction and retry control for %s output",
    (status) => {
      const { container } = renderChat(
        { ...baseMessage, status, content: "" },
        false,
      );

      expect(
        container.querySelector(".xiaobao-message-assistant-enter [data-state]"),
      ).toHaveAttribute("data-state", "concerned");
      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByText("No response was saved.")).toBeInTheDocument();
    },
  );
});
