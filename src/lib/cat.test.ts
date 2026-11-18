import { describe, expect, it } from "vitest";
import {
  catStateForPhase,
  GROOM_AFTER_MS,
  NAP_FROM,
  rulerCatPose,
  TYPING_WINDOW_MS,
} from "./cat";

describe("catStateForPhase", () => {
  it("sleeps only at night", () => {
    expect(catStateForPhase("night")).toBe("night");
    expect(catStateForPhase("twilight")).toBe("day");
    expect(catStateForPhase("golden")).toBe("day");
    expect(catStateForPhase("day")).toBe("day");
  });

  it("is awake when the phase is unknown", () => {
    expect(catStateForPhase(undefined)).toBe("day");
  });
});

describe("constants", () => {
  it("holds the agreed thresholds", () => {
    expect(TYPING_WINDOW_MS).toBe(150);
    expect(GROOM_AFTER_MS).toBe(1200);
    expect(NAP_FROM).toBe(0.98);
  });
});

describe("rulerCatPose", () => {
  const day = (msSinceScroll: number, progress = 0.5) =>
    rulerCatPose({ state: "day", msSinceScroll, progress });

  it("sleeps all night, even while scrolling or at the bottom", () => {
    expect(rulerCatPose({ state: "night", msSinceScroll: 0, progress: 0.5 })).toBe("sleep");
    expect(rulerCatPose({ state: "night", msSinceScroll: 5000, progress: 1 })).toBe("sleep");
  });

  it("naps from 98 % in the day, even while scrolling", () => {
    expect(day(0, 0.98)).toBe("nap");
    expect(day(0, 1)).toBe("nap");
    expect(day(0, 0.979)).toBe("type");
  });

  it("types while scrolling, sits briefly, then grooms", () => {
    expect(day(0)).toBe("type");
    expect(day(149)).toBe("type");
    expect(day(150)).toBe("sit");
    expect(day(1199)).toBe("sit");
    expect(day(1200)).toBe("groom");
    expect(day(60_000)).toBe("groom");
  });

  it("gives a defined pose for non-finite inputs", () => {
    const poses = ["type", "sit", "groom", "sleep", "nap"];
    expect(poses).toContain(day(Number.NaN));
    expect(poses).toContain(day(0, Number.NaN));
    expect(poses).toContain(day(Number.POSITIVE_INFINITY, Number.NaN));
    expect(poses).toContain(
      rulerCatPose({ state: "night", msSinceScroll: Number.NaN, progress: Number.NaN }),
    );
    expect(day(Number.NaN, Number.NaN)).toBe("type");
  });
});
