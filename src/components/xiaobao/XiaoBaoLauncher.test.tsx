import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { XiaoBaoLauncher, XIAOBAO_SLEEP_DELAY_MS } from "./XiaoBaoLauncher";

const setIsOpen = vi.fn();
const unreadState = { count: 0 };
const backendState = { ready: true };
const launcherState = { isOpen: false };

vi.mock("@/hooks/use-backend-ready", () => ({
  useBackendReady: () => ({ data: backendState.ready }),
}));

vi.mock("@/hooks/use-xiaobao", () => ({
  useXiaoBao: () => ({
    isOpen: launcherState.isOpen,
    setIsOpen,
    conversations: [],
    isLoading: false,
    isStreaming: false,
    startNewChat: vi.fn(),
    deleteConversation: vi.fn(),
    sendMessage: vi.fn(),
    cancel: vi.fn(),
    retry: vi.fn(),
    updateProposal: vi.fn(),
    acceptProposal: vi.fn(),
    rejectProposal: vi.fn(),
    selectConversation: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-xiaobao-routines", () => ({
  useXiaoBaoInboxUnreadCount: () => ({ data: { unreadCount: unreadState.count } }),
}));

vi.mock("./XiaoBaoChat", () => ({
  XiaoBaoChat: ({ headerAction }: { headerAction?: ReactNode }) => <>{headerAction}</>,
}));

describe("Xiao Bao launcher", () => {
  afterEach(() => {
    vi.clearAllMocks();
    unreadState.count = 0;
    backendState.ready = true;
    launcherState.isOpen = false;
    vi.useRealTimers();
  });

  it("stays hidden until the backend is ready", () => {
    backendState.ready = false;
    render(
      <MemoryRouter>
        <TooltipProvider><XiaoBaoLauncher /></TooltipProvider>
      </MemoryRouter>,
    );

    expect(screen.queryByRole("button", { name: "Open Xiao Bao relationship assistant" })).not.toBeInTheDocument();
  });

  it("is globally discoverable through an accessible control", () => {
    render(
      <MemoryRouter>
        <TooltipProvider>
          <XiaoBaoLauncher />
        </TooltipProvider>
      </MemoryRouter>,
    );

    const launcher = screen.getByRole("button", { name: "Open Xiao Bao relationship assistant" });
    fireEvent.click(launcher);
    expect(setIsOpen).toHaveBeenCalledWith(true);
  });

  it("stays hidden on the full-screen Xiao Bao chat route", () => {
    render(
      <MemoryRouter initialEntries={["/xiaobao"]}>
        <TooltipProvider><XiaoBaoLauncher /></TooltipProvider>
      </MemoryRouter>,
    );

    expect(screen.queryByRole("button", { name: "Open Xiao Bao relationship assistant" })).not.toBeInTheDocument();
  });

  it("shows private inbox unread count without opening the inbox", () => {
    unreadState.count = 3;
    render(
      <MemoryRouter>
        <TooltipProvider><XiaoBaoLauncher /></TooltipProvider>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("3 unread Xiao Bao messages")).toHaveTextContent("3");
  });

  it("only offers full-screen expansion above the mobile breakpoint", () => {
    launcherState.isOpen = true;
    render(
      <MemoryRouter>
        <TooltipProvider><XiaoBaoLauncher /></TooltipProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Expand Xiao Bao", hidden: true })).toHaveClass(
      "hidden",
      "md:inline-flex",
    );
  });

  it("sleeps after two minutes and wakes immediately on interaction", () => {
    vi.useFakeTimers();
    const { container } = render(
      <MemoryRouter>
        <TooltipProvider>
          <XiaoBaoLauncher />
        </TooltipProvider>
      </MemoryRouter>,
    );
    const launcher = screen.getByRole("button", { name: "Open Xiao Bao relationship assistant" });

    expect(container.querySelector('[data-state="idle"]')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(XIAOBAO_SLEEP_DELAY_MS));
    expect(container.querySelector('[data-state="sleep"]')).toBeInTheDocument();

    fireEvent.pointerEnter(launcher);
    expect(container.querySelector('[data-state="hello"]')).toHaveAttribute("data-animated", "true");
    fireEvent.pointerLeave(launcher);
    expect(container.querySelector('[data-state="idle"]')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(XIAOBAO_SLEEP_DELAY_MS - 1));
    expect(container.querySelector('[data-state="idle"]')).toBeInTheDocument();

    fireEvent.focus(launcher);
    expect(container.querySelector('[data-state="hello"]')).toHaveAttribute("data-animated", "true");
    fireEvent.blur(launcher);
    expect(container.querySelector('[data-state="idle"]')).toBeInTheDocument();
    fireEvent.click(launcher);
    expect(container.querySelector('[data-state="idle"]')).toBeInTheDocument();
  });
});
