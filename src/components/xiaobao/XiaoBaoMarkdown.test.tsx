import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { XiaoBaoMarkdown } from "./XiaoBaoMarkdown";

describe("Xiao Bao Markdown", () => {
  it("renders assistant emphasis, lists, and links as formatted content", () => {
    render(
      <XiaoBaoMarkdown
        content={"Try **The Hobbit**:\n\n- First idea\n- [Second idea](https://example.com)"}
      />,
    );

    expect(screen.getByText("The Hobbit").tagName).toBe("STRONG");
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Second idea" })).toHaveAttribute(
      "target",
      "_blank",
    );
  });

  it("does not render raw HTML from model output", () => {
    const { container } = render(
      <XiaoBaoMarkdown content={'Hello <script data-testid="unsafe">alert(1)</script> world'} />,
    );

    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(screen.queryByTestId("unsafe")).not.toBeInTheDocument();
  });
});
