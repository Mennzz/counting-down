import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { XiaoBaoMascot, type XiaoBaoMascotState } from "./XiaoBaoMascot";

const states: XiaoBaoMascotState[] = [
  "idle",
  "hello",
  "thinking",
  "love",
  "success",
  "concerned",
  "sleep",
];

const staticAssets: Record<XiaoBaoMascotState, string> = {
  idle: "directional/xiaobao-front.png",
  hello: "expressions/xiaobao-happy.png",
  thinking: "expressions/xiaobao-curious.png",
  love: "expressions/xiaobao-love.png",
  success: "expressions/xiaobao-excited.png",
  concerned: "expressions/xiaobao-sad.png",
  sleep: "expressions/xiaobao-sleepy.png",
};

describe("Xiao Bao mascot", () => {
  it.each(states)("maps %s to its canonical PNG fallback", (state) => {
    const { container } = render(<XiaoBaoMascot state={state} />);

    expect(container.querySelector(".xiaobao-mascot-static-source")).toHaveAttribute(
      "src",
      `/xiaobao/actual/${staticAssets[state]}`,
    );
    expect(container.firstChild).toHaveAttribute("data-state", state);
  });

  it.each([
    ["idle", "idle-sprite-strip.png"],
    ["hello", "jump-sprite-strip.png"],
    ["success", "jump-sprite-strip.png"],
    ["sleep", "sleep-sprite-strip.png"],
  ] as const)("uses the actual %s frame strip", (state, asset) => {
    const { container } = render(<XiaoBaoMascot state={state} />);

    const spriteViewport = container.querySelector<HTMLElement>(".xiaobao-mascot-sprite-source");
    expect(spriteViewport).toHaveStyle({
      backgroundImage: `url("/xiaobao/actual/animations/${asset}")`,
    });
    expect(spriteViewport?.querySelector("img")).not.toBeInTheDocument();
  });

  it.each(["thinking", "love", "concerned"] as const)(
    "animates the actual %s expression PNG",
    (state) => {
      const { container } = render(<XiaoBaoMascot state={state} />);

      expect(container.querySelector(".xiaobao-mascot-motion-source")).toHaveAttribute(
        "src",
        `/xiaobao/actual/${staticAssets[state]}`,
      );
    },
  );

  it("uses the supplied hero artwork for the launcher variant", () => {
    const { container } = render(<XiaoBaoMascot state="idle" variant="hero" />);

    expect(container.querySelector(".xiaobao-mascot-static-source")).toHaveAttribute(
      "src",
      "/xiaobao/actual/hero/xiaobao-hero.png",
    );
    expect(container.querySelector(".xiaobao-mascot-motion-source")).toHaveAttribute(
      "src",
      "/xiaobao/actual/hero/xiaobao-hero.png",
    );
  });

  it("supports a labeled accessibility mode", () => {
    render(
      <XiaoBaoMascot
        state="concerned"
        decorative={false}
        label="Xiao Bao looks concerned"
      />,
    );

    expect(screen.getByRole("img", { name: "Xiao Bao looks concerned" })).toBeInTheDocument();
  });

  it("uses only the static PNG when motion is disabled", () => {
    const { container } = render(<XiaoBaoMascot state="love" animated={false} />);

    expect(container.querySelector('[data-state="love"]')).toHaveAttribute(
      "data-animated",
      "false",
    );
    expect(container.querySelector(".xiaobao-mascot-animated-source")).not.toBeInTheDocument();
    expect(container.querySelector(".xiaobao-mascot-static-source")).toHaveAttribute(
      "src",
      "/xiaobao/actual/expressions/xiaobao-love.png",
    );
  });
});
