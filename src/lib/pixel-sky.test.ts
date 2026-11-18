import { describe, expect, it } from "vitest";
import {
  blockWindows,
  moonSpot,
  pixelStars,
  quantizeBands,
  ridgeSteps,
  skylineBlocks,
  snap,
  windowLights,
} from "@/lib/pixel-sky";
import { skyAt } from "@/lib/sky";

const HEX = /^#[0-9a-f]{6}$/;
const south = (elevation: number) => skyAt({ elevation, azimuth: 180 });

/** How far apart two colours are, channel by channel (the largest gap). */
function distance(a: string, b: string): number {
  const ca = [1, 3, 5].map((i) => Number.parseInt(a.slice(i, i + 2), 16));
  const cb = [1, 3, 5].map((i) => Number.parseInt(b.slice(i, i + 2), 16));
  return Math.max(...ca.map((v, i) => Math.abs(v - (cb[i] ?? 0))));
}

describe("quantizeBands", () => {
  it("returns exactly the asked number of flat #rrggbb colours", () => {
    for (const n of [2, 5, 12, 16]) {
      const bands = quantizeBands(south(30), n);
      expect(bands).toHaveLength(n);
      for (const band of bands) expect(band).toMatch(HEX);
    }
  });

  it("runs from the zenith at the top to the horizon at the bottom", () => {
    for (const elevation of [-20, -8, -3, 4, 30]) {
      const sky = south(elevation);
      const bands = quantizeBands(sky, 12);
      expect(distance(bands[0]!, sky.zenith)).toBeLessThanOrEqual(1);
      expect(distance(bands.at(-1)!, sky.horizon)).toBeLessThanOrEqual(1);
    }
  });

  it("passes through the mid colour and is deterministic", () => {
    const sky = south(4);
    const bands = quantizeBands(sky, 12);
    expect(Math.min(...bands.map((band) => distance(band, sky.mid)))).toBeLessThanOrEqual(24);
    expect(quantizeBands(sky, 12)).toEqual(bands);
  });
});

describe("snap", () => {
  it("rounds to the nearest whole unit", () => {
    expect(snap(13, 4)).toBe(12);
    expect(snap(14, 4)).toBe(16);
    expect(snap(16, 4)).toBe(16);
    expect(snap(0.4, 1)).toBe(0);
    expect(snap(7.6, 1)).toBe(8);
    expect(Object.is(snap(-1, 4), 0)).toBe(true);
  });
});

describe("pixelStars", () => {
  it("is deterministic for a seed and changes with it", () => {
    expect(pixelStars(7, 40, 128, 40)).toEqual(pixelStars(7, 40, 128, 40));
    expect(pixelStars(8, 40, 128, 40)).not.toEqual(pixelStars(7, 40, 128, 40));
  });

  it("puts every star on its own whole cell inside the box", () => {
    const stars = pixelStars(7, 40, 128, 40);
    expect(stars).toHaveLength(40);
    const cells = new Set(stars.map((star) => `${star.x}:${star.y}`));
    expect(cells.size).toBe(stars.length);
    for (const star of stars) {
      expect(Number.isInteger(star.x) && Number.isInteger(star.y)).toBe(true);
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThan(128);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeLessThan(40);
    }
  });

  it("never asks for more cells than the box has", () => {
    expect(pixelStars(3, 50, 4, 4)).toHaveLength(16);
  });
});

describe("skylineBlocks", () => {
  it("is deterministic for a seed", () => {
    expect(skylineBlocks(11, 128)).toEqual(skylineBlocks(11, 128));
    expect(skylineBlocks(12, 128)).not.toEqual(skylineBlocks(11, 128));
  });

  it("stands its blocks side by side inside the columns without overlapping", () => {
    for (const cols of [40, 96, 128]) {
      const blocks = skylineBlocks(11, cols);
      expect(blocks.length).toBeGreaterThan(2);
      let right = 0;
      for (const block of blocks) {
        expect(Number.isInteger(block.x) && Number.isInteger(block.w) && Number.isInteger(block.h)).toBe(true);
        expect(block.x).toBeGreaterThanOrEqual(right);
        expect(block.w).toBeGreaterThan(0);
        expect(block.h).toBeGreaterThan(0);
        expect(block.x + block.w).toBeLessThanOrEqual(cols);
        right = block.x + block.w;
      }
    }
  });

  it("gives each block window cells that sit inside it", () => {
    for (const block of skylineBlocks(11, 128)) {
      const windows = blockWindows(block);
      for (const index of block.lit) {
        const cell = windows[index];
        expect(cell).toBeDefined();
        expect(cell!.x).toBeGreaterThan(0);
        expect(cell!.x).toBeLessThan(block.w - 1);
        expect(cell!.y).toBeGreaterThan(0);
        expect(cell!.y).toBeLessThan(block.h);
      }
    }
  });
});

describe("windowLights", () => {
  const blocks = skylineBlocks(11, 128);
  const block = blocks.reduce((best, b) => (b.lit.length > best.lit.length ? b : best));

  it("lights nothing by day", () => {
    for (const b of blocks) expect(windowLights("day", b, 5)).toEqual([]);
  });

  it("lights more at night than at twilight, and only the block's own windows", () => {
    const night = windowLights("night", block, 5);
    const twilight = windowLights("twilight", block, 5);
    expect(night.length).toBeGreaterThan(twilight.length);
    expect(twilight.length).toBeGreaterThan(0);
    for (const index of night) expect(block.lit).toContain(index);
    expect(windowLights("night", block, 5)).toEqual(night);
  });

  it("lights most windows of the whole skyline at night", () => {
    const total = blocks.reduce((sum, b) => sum + b.lit.length, 0);
    const lit = blocks.reduce((sum, b) => sum + windowLights("night", b, 5).length, 0);
    expect(lit / total).toBeGreaterThan(0.5);
  });
});

describe("moonSpot", () => {
  it("rises opposite the sun and stays inside the glass", () => {
    const spot = moonSpot({ elevation: -45, azimuth: 0 });
    expect(spot).not.toBeNull();
    expect(spot!.x).toBeCloseTo(0.5, 5);
    expect(spot!.y).toBeGreaterThan(0);
    expect(spot!.y).toBeLessThan(0.6);
  });

  it("is gone while the sun is up or the moon would sit outside the window", () => {
    expect(moonSpot({ elevation: 20, azimuth: 180 })).toBeNull();
    expect(moonSpot({ elevation: -3, azimuth: 300 })).toBeNull();
    expect(moonSpot({ elevation: -30, azimuth: 120 })).toBeNull();
  });
});

describe("ridgeSteps", () => {
  it("is a stepped silhouette within the height, one entry per column", () => {
    const steps = ridgeSteps(128, 16);
    expect(steps).toHaveLength(128);
    expect(ridgeSteps(128, 16)).toEqual(steps);
    for (const h of steps) {
      expect(Number.isInteger(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(16);
    }
    // Stepped: plateaus, not a new height every column.
    const changes = steps.filter((h, i) => i > 0 && h !== steps[i - 1]).length;
    expect(changes).toBeLessThan(64);
    expect(new Set(steps).size).toBeGreaterThan(3);
  });
});
