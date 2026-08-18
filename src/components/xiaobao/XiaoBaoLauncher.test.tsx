import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { XiaoBaoLauncher, XIAOBAO_SLEEP_DELAY_MS } from "./XiaoBaoLauncher";

const setIsOpen = vi.fn();

vi.mock("@/hooks/use-xiaobao", () => ({
  useXiaoBao: () => ({
    isOpen: false,
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

describe("Xiao Bao launcher", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
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
