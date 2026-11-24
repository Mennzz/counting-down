import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import Navigation from "./Navigation";

describe("Navigation", () => {
  it("keeps relationship context behind a compact settings action", () => {
    render(
      <MemoryRouter>
        <Navigation activeSection="countdown" setActiveSection={vi.fn()} />
      </MemoryRouter>,
    );

    const settingsLinks = screen.getAllByRole("link", { name: "Relationship settings" });
    expect(settingsLinks).toHaveLength(2);
    settingsLinks.forEach((link) => expect(link).toHaveAttribute("href", "/relationship-context"));
    expect(screen.queryByText("Our Context")).not.toBeInTheDocument();
  });
});

describe("Navigation mobile menu", () => {
  it("opens a menu listing every section and switches sections", async () => {
    const user = userEvent.setup();
    const setActiveSection = vi.fn();
    render(
      <MemoryRouter>
        <Navigation activeSection="countdown" setActiveSection={setActiveSection} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("button", { name: "Boundaries & Agreements" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Countdown" })).toHaveAttribute("aria-current", "page");

    await user.click(within(dialog).getByRole("button", { name: "Our Photos" }));
    expect(setActiveSection).toHaveBeenCalledWith("gallery");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
