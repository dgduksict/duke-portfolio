import { describe, expect, it } from "vitest";
import {
  buildTicks,
  markerProgress,
  needleVisible,
  pointerToProgress,
  progressToScrollTop,
  railBox,
  scrollProgress,
} from "./ruler";

describe("scrollProgress", () => {
  it("maps the scroll position to 0..1 over the scrollable distance", () => {
    expect(scrollProgress(0, 3000, 900)).toBe(0);
    expect(scrollProgress(2100, 3000, 900)).toBe(1);
    expect(scrollProgress(1050, 3000, 900)).toBe(0.5);
  });

  it("clamps overscroll", () => {
    expect(scrollProgress(5000, 3000, 900)).toBe(1);
    expect(scrollProgress(-50, 3000, 900)).toBe(0);
  });

  it("is 0, never NaN, when the page is not taller than the viewport", () => {
    expect(scrollProgress(0, 500, 900)).toBe(0);
    expect(scrollProgress(10, 900, 900)).toBe(0);
    const empty = scrollProgress(0, 0, 0);
    expect(empty).toBe(0);
    expect(Number.isNaN(empty)).toBe(false);
  });
});

describe("buildTicks", () => {
  it("has a tick every 2 % with a major one every 10 %", () => {
    const ticks = buildTicks();
    expect(ticks).toHaveLength(51);
    expect(ticks[0]?.pct).toBe(0);
    expect(ticks[ticks.length - 1]?.pct).toBe(100);
    const majors = ticks.filter((t) => t.major);
    expect(majors).toHaveLength(11);
    expect(majors.every((t) => t.pct % 10 === 0)).toBe(true);
  });
});

describe("needleVisible", () => {
  it("hides the needle below 3 %", () => {
    expect(needleVisible(0.029)).toBe(false);
    expect(needleVisible(0.03)).toBe(true);
  });
});

describe("railBox and pointerToProgress", () => {
  it("leaves 76 px above and 24 px below the rail", () => {
    expect(railBox(1000)).toEqual({ top: 76, height: 900 });
  });

  it("clamps the pointer to the rail", () => {
    const rail = { top: 100, height: 400 };
    expect(pointerToProgress(50, rail)).toBe(0);
    expect(pointerToProgress(900, rail)).toBe(1);
    expect(pointerToProgress(300, rail)).toBe(0.5);
  });

  it("keeps the rail box finite for a non-finite viewport", () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const box = railBox(bad);
      expect(Number.isFinite(box.top)).toBe(true);
      expect(Number.isFinite(box.height)).toBe(true);
      expect(box.height).toBeGreaterThanOrEqual(0);
    }
    expect(railBox(50).height).toBe(0);
  });

  it("never returns NaN for a zero-height rail", () => {
    expect(pointerToProgress(10, { top: 0, height: 0 })).toBe(0);
  });
});

describe("progressToScrollTop and markerProgress", () => {
  it("converts progress to a scroll position and back", () => {
    expect(progressToScrollTop(0.5, 3000, 900)).toBe(1050);
    expect(scrollProgress(progressToScrollTop(0.5, 3000, 900), 3000, 900)).toBe(0.5);
    expect(progressToScrollTop(0.5, 500, 900)).toBe(0);
  });

  it("stays finite for non-finite sizes", () => {
    expect(progressToScrollTop(0.5, Number.NaN, 900)).toBe(0);
    expect(progressToScrollTop(Number.NaN, 3000, 900)).toBe(0);
    expect(scrollProgress(Number.NaN, 3000, 900)).toBe(0);
    expect(scrollProgress(100, 3000, Number.NaN)).toBe(0);
    expect(markerProgress(100, Number.NaN, Number.NaN)).toBe(0);
    expect(needleVisible(Number.NaN)).toBe(false);
  });

  it("places a section marker with the same clamp", () => {
    expect(markerProgress(1050, 3000, 900)).toBe(0.5);
    expect(markerProgress(9999, 3000, 900)).toBe(1);
    expect(markerProgress(100, 500, 900)).toBe(0);
  });
});
