import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NEAR_RIDGE_EDGE, RIDGE_HEIGHT, RIDGE_WIDTH, Ridges, nearRidgeY } from "@/components/sky/ridges";

describe("near ridge edge", () => {
  it("is an open path along the ridge top", () => {
    expect(NEAR_RIDGE_EDGE.startsWith("M")).toBe(true);
    expect(NEAR_RIDGE_EDGE).not.toMatch(/Z/i);
  });

  it("gives a finite height inside the viewBox at both ends", () => {
    for (const x of [0, RIDGE_WIDTH]) {
      const y = nearRidgeY(x);
      expect(Number.isFinite(y)).toBe(true);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(RIDGE_HEIGHT);
    }
  });

  it("clamps x outside the ridge and stays finite for junk input", () => {
    expect(nearRidgeY(-500)).toBe(nearRidgeY(0));
    expect(nearRidgeY(RIDGE_WIDTH + 500)).toBe(nearRidgeY(RIDGE_WIDTH));
    expect(Number.isFinite(nearRidgeY(Number.NaN))).toBe(true);
  });

  it("follows the edge path where it starts", () => {
    const [, y] = /^M0 ([\d.]+)/.exec(NEAR_RIDGE_EDGE) ?? [];
    expect(nearRidgeY(0)).toBeCloseTo(Number(y), 0);
  });

  it("still renders the far and near ridges as closed shapes", () => {
    const { container } = render(<Ridges />);
    const near = container.querySelector(".ridge-near");
    expect(near?.getAttribute("d")).toMatch(/Z$/);
    expect(container.querySelector(".ridge-far")).not.toBeNull();
  });
});
