import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { XiaoBaoInboxMessage } from "@/types/xiaobao";
import XiaoBaoInboxPage from "./XiaoBaoInboxPage";

const markRead = vi.fn();
const fetchNextPage = vi.fn();
const useInbox = vi.fn();
const inboxState: { result: ReturnType<typeof inboxResult> } = { result: undefined as never };

vi.mock("@/hooks/use-xiaobao-routines", () => ({
  useXiaoBaoInbox: (routineId?: string) => {
    useInbox(routineId);
    return inboxState.result;
  },
  useXiaoBaoRoutines: () => ({
    data: [{ id: "routine-1", name: "Morning kindness" }],
  }),
  useMarkXiaoBaoInboxMessageRead: () => ({ mutate: markRead, isPending: false }),
}));

describe("Xiao Bao inbox page", () => {
  beforeEach(() => {
    markRead.mockReset();
    fetchNextPage.mockReset();
    useInbox.mockReset();
    inboxState.result = inboxResult([[message("message-1", "Leave a tiny note somewhere surprising.")]]);
  });

  it("shows unread routine messages, identifies their routine, and marks them as read", () => {
    render(<MemoryRouter><XiaoBaoInboxPage /></MemoryRouter>);

    expect(screen.getByText("1 unread message across your Xiao Bao inbox")).toBeInTheDocument();
    expect(screen.getByText("Leave a tiny note somewhere surprising.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Morning kindness" })).toHaveAttribute(
      "href",
      "/xiaobao/inbox?routineId=routine-1",
    );
    fireEvent.click(screen.getByRole("button", { name: "Mark as read" }));
    expect(markRead).toHaveBeenCalledWith("message-1");
  });

  it("passes the routine filter from the page URL to the inbox query", () => {
    render(
      <MemoryRouter initialEntries={["/xiaobao/inbox?routineId=routine-1"]}>
        <XiaoBaoInboxPage />
      </MemoryRouter>,
    );

    expect(useInbox).toHaveBeenCalledWith("routine-1");
    expect(screen.getByText(/private messages from “Morning kindness”/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Show all messages" })).toHaveAttribute("href", "/xiaobao/inbox");
  });

  it("loads older pages, deduplicates stable page boundaries, and exposes an old blocker", () => {
    inboxState.result = inboxResult([[message("new-message", "A fresh idea")]], true);
    const view = render(<MemoryRouter><XiaoBaoInboxPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Load older messages" }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);

    inboxState.result = inboxResult([
      [message("new-message", "A fresh idea")],
      [
        message("new-message", "A fresh idea"),
        message("old-blocker", "An older unread idea", "2026-08-10T08:00:00.000Z"),
      ],
    ]);
    view.rerender(<MemoryRouter><XiaoBaoInboxPage /></MemoryRouter>);

    expect(screen.getAllByText("A fresh idea")).toHaveLength(1);
    expect(screen.getByText("An older unread idea")).toBeInTheDocument();
    const readButtons = screen.getAllByRole("button", { name: "Mark as read" });
    fireEvent.click(readButtons[readButtons.length - 1]);
    expect(markRead).toHaveBeenLastCalledWith("old-blocker");
  });
});

function message(
  id: string,
  content: string,
  createdAt = "2026-08-24T08:00:00.000Z",
): XiaoBaoInboxMessage {
  return {
    id,
    content,
    routineId: "routine-1",
    routineRunId: `run-${id}`,
    readAt: null,
    createdAt,
    updatedAt: createdAt,
  };
}

function inboxResult(pageMessages: XiaoBaoInboxMessage[][], hasNextPage = false) {
  return {
    isLoading: false,
    isError: false,
    error: null,
    data: {
      pages: pageMessages.map((messages, index) => ({
        messages,
        unreadCount: 1,
        hasMoreMessages: index < pageMessages.length - 1 || hasNextPage,
        nextCursor: index < pageMessages.length - 1 || hasNextPage ? `cursor-${index}` : null,
      })),
      pageParams: pageMessages.map((_, index) => index ? `cursor-${index - 1}` : ""),
    },
    hasNextPage,
    isFetchingNextPage: false,
    fetchNextPage,
  };
}
