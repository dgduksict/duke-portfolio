import { describe, expect, it } from "vitest";
import {
  fireflies,
  nextShootingStarDelay,
  parseSeasonParam,
  seasonAt,
  shootingStarPath,
  snowflakes,
} from "@/lib/season";

describe("seasonAt", () => {
  it("is winter from November to March by the Ulaanbaatar calendar", () => {
    expect(seasonAt(new Date("2026-11-19T12:00:00+08:00"))).toBe("winter");
    expect(seasonAt(new Date("2026-03-31T23:30:00+08:00"))).toBe("winter");
  });

  it("uses Ulaanbaatar's month, not the viewer's or UTC's", () => {
    // April 1, 00:30 in Ulaanbaatar, still March 31 in UTC.
    expect(seasonAt(new Date("2026-03-31T16:30:00Z"))).toBeNull();
  });

  it("is summer from June to August", () => {
    expect(seasonAt(new Date("2026-07-10T12:00:00+08:00"))).toBe("summer");
  });

  it("is neither in spring or autumn", () => {
    expect(seasonAt(new Date("2026-05-15T12:00:00+08:00"))).toBeNull();
    expect(seasonAt(new Date("2026-09-15T12:00:00+08:00"))).toBeNull();
  });
});

describe("parseSeasonParam", () => {
  it("reads the two seasons and none", () => {
    expect(parseSeasonParam("winter")).toBe("winter");
    expect(parseSeasonParam("summer")).toBe("summer");
    expect(parseSeasonParam("none")).toBe("none");
  });

  it("ignores anything else", () => {
    expect(parseSeasonParam("spring")).toBeNull();
    expect(parseSeasonParam(null)).toBeNull();
  });
});

describe("snowflakes", () => {
  const flakes = snowflakes(1, 36, 128, 64);

  it("makes the requested count inside the glass, on whole cells", () => {
    expect(flakes).toHaveLength(36);
    for (const flake of flakes) {
      expect(Number.isInteger(flake.x)).toBe(true);
      expect(Number.isInteger(flake.y)).toBe(true);
      expect(flake.x).toBeGreaterThanOrEqual(0);
      expect(flake.x).toBeLessThan(128);
      expect(flake.y).toBeGreaterThanOrEqual(0);
      expect(flake.y).toBeLessThan(64);
    }
  });

  it("spreads flakes over both depths", () => {
    const depths = new Set(flakes.map((flake) => flake.depth));
    expect(depths.has(0)).toBe(true);
    expect(depths.has(1)).toBe(true);
  });

  it("is deterministic for the same seed", () => {
    expect(snowflakes(1, 36, 128, 64)).toEqual(flakes);
  });
});

describe("fireflies", () => {
  it("keeps every firefly in the bottom third of the glass", () => {
    const found = fireflies(1, 7, 128, 64);
    expect(found).toHaveLength(7);
    for (const cell of found) {
      expect(cell.y).toBeGreaterThanOrEqual(42);
      expect(cell.y).toBeLessThan(64);
      expect(cell.x).toBeGreaterThanOrEqual(0);
      expect(cell.x).toBeLessThan(128);
    }
  });
});

describe("shootingStarPath", () => {
  it.each([0, 0.999])("starts inside the upper glass at random %s", (value) => {
    const path = shootingStarPath(() => value, 128, 64);
    expect(path.x).toBeGreaterThanOrEqual(0);
    expect(path.x).toBeLessThan(128);
    expect(path.y).toBeGreaterThanOrEqual(0);
    expect(path.y).toBeLessThan(25.6);
    expect([1, -1]).toContain(path.dx);
    expect(path.length).toBeGreaterThanOrEqual(3);
    expect(path.length).toBeLessThanOrEqual(5);
  });
});

describe("nextShootingStarDelay", () => {
  it("waits between 25 and 70 seconds", () => {
    expect(nextShootingStarDelay(() => 0)).toBe(25_000);
    expect(nextShootingStarDelay(() => 1)).toBe(70_000);
  });
});
