import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import XiaoBaoPage from "./XiaoBaoPage";

vi.mock("@/components/xiaobao/XiaoBaoChat", () => ({
  XiaoBaoChat: () => <div>Full-screen Xiao Bao chat</div>,
}));

const viewportState = { isMobile: false };
const setIsOpen = vi.fn();

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => viewportState.isMobile,
}));

vi.mock("@/hooks/use-xiaobao", () => ({
  useXiaoBao: () => ({ setIsOpen }),
}));

describe("XiaoBaoPage", () => {
  afterEach(() => {
    viewportState.isMobile = false;
    vi.clearAllMocks();
  });

  it("offers a visible return to the page that opened full-screen chat", () => {
    render(
      <MemoryRouter
        initialEntries={[{
          pathname: "/xiaobao",
          state: { xiaoBaoReturnTo: "/relationship-context?from=xiaobao" },
        }]}
      >
        <XiaoBaoPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Back to BIBI Dairy" })).toHaveAttribute(
      "href",
      "/relationship-context?from=xiaobao",
    );
  });

  it("returns to the home page when full-screen chat was opened directly", () => {
    render(
      <MemoryRouter initialEntries={["/xiaobao"]}>
        <XiaoBaoPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Back to BIBI Dairy" })).toHaveAttribute("href", "/");
  });

  it("uses the full-screen drawer instead of the roomy page on mobile", async () => {
    viewportState.isMobile = true;
    render(
      <MemoryRouter initialEntries={["/xiaobao"]}>
        <Routes>
          <Route path="/xiaobao" element={<XiaoBaoPage />} />
          <Route path="/" element={<div>Main BIBI Dairy site</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Main BIBI Dairy site")).toBeInTheDocument());
    expect(setIsOpen).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Full-screen Xiao Bao chat")).not.toBeInTheDocument();
  });
});
