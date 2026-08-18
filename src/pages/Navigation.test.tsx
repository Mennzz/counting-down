import { render, screen } from "@testing-library/react";
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
