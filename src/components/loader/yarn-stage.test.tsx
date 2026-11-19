import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { YarnStage } from "@/components/loader/yarn-stage";

/** Every frame of the yarn cat, in the order the stage draws them. */
const FRAMES = ["sit", "run-1", "run-2", "crouch-1", "crouch-2", "pounce", "tumble", "proud"];

describe("YarnStage", () => {
  it("draws every cat frame once and the ball", () => {
    const { container } = render(<YarnStage />);
    const stage = container.querySelector(".yarn-stage");
    expect(stage).not.toBeNull();
    expect(stage).toHaveAttribute("aria-hidden", "true");

    const cat = stage?.querySelectorAll("[data-yarn-cat]");
    expect(cat).toHaveLength(1);
    expect(cat?.[0]).toHaveClass("yarn-cat");
    const catSvg = cat?.[0]?.querySelectorAll("svg.cat-art");
    expect(catSvg).toHaveLength(1);
    expect(catSvg?.[0]).toHaveAttribute("viewBox", "0 0 20 16");
    const frames = [...(catSvg?.[0]?.querySelectorAll("g[data-cat-frame]") ?? [])];
    expect(frames.map((frame) => frame.getAttribute("data-cat-frame"))).toEqual(FRAMES);
    for (const frame of frames) {
      expect(frame.querySelectorAll("rect").length, frame.getAttribute("data-cat-frame") ?? "").toBeGreaterThan(0);
    }

    const ball = stage?.querySelectorAll("[data-yarn-ball]");
    expect(ball).toHaveLength(1);
    expect(ball?.[0]).toHaveClass("yarn-ball");
    const ballSvg = ball?.[0]?.querySelectorAll("svg.cat-art");
    expect(ballSvg).toHaveLength(1);
    expect(ballSvg?.[0]).toHaveAttribute("viewBox", "0 0 7 7");
  });

  it("draws at one unit a cell, placed by the rects and never by a transform", () => {
    const { container } = render(<YarnStage />);
    for (const rect of container.querySelectorAll("rect")) {
      for (const attribute of ["x", "y", "width", "height"]) {
        expect(Number(rect.getAttribute(attribute))).toSatisfy(Number.isInteger);
      }
    }
    expect(container.querySelector("[transform]")).toBeNull();
  });

  it("paints yarn through the yarn variables", () => {
    const { container } = render(<YarnStage />);
    const fills = [...container.querySelectorAll("[data-yarn-ball] rect")].map((rect) => rect.getAttribute("fill"));
    expect(fills).toContain("var(--cat-yarn)");
    expect(fills).toContain("var(--cat-yarn-shade)");
    // The cat himself stays the black cat: no yarn paint on him.
    const catFills = [...container.querySelectorAll("[data-yarn-cat] rect")].map((rect) => rect.getAttribute("fill"));
    expect(catFills).not.toContain("var(--cat-yarn)");
  });
});
