import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isBlank, pickColours, splitParts, spriteRects } from "@/components/cat/pixel-sprite";
import { HERO_BACK, HERO_DAY, HERO_FRONT, PALETTE, SPIN_BODY, SPRITES } from "@/components/cat/sprites";

describe("spriteRects", () => {
  it("merges horizontal runs of one colour, skips empty pixels and keeps rows and columns", () => {
    expect(spriteRects(["kk.a", ".kkk", "....", "rkkr"])).toEqual([
      { x: 0, y: 0, w: 2, h: 1, c: "k" },
      { x: 3, y: 0, w: 1, h: 1, c: "a" },
      { x: 1, y: 1, w: 3, h: 1, c: "k" },
      { x: 0, y: 3, w: 1, h: 1, c: "r" },
      { x: 1, y: 3, w: 2, h: 1, c: "k" },
      { x: 3, y: 3, w: 1, h: 1, c: "r" },
    ]);
  });

  it("grows a run that repeats exactly on the rows below into one taller rect", () => {
    expect(spriteRects(["rkk.", "rkk.", "rkkk", "r..."])).toEqual([
      { x: 0, y: 0, w: 1, h: 4, c: "r" },
      { x: 1, y: 0, w: 2, h: 2, c: "k" },
      { x: 1, y: 2, w: 3, h: 1, c: "k" },
    ]);
  });

  it("returns nothing for an empty map", () => {
    expect(spriteRects([])).toEqual([]);
    expect(spriteRects(["...", "..."])).toEqual([]);
  });
});

describe("splitParts", () => {
  it("gives each pixel to the first box that holds it, eye-coloured pixels to the eye, the rest to the body", () => {
    const parts = splitParts(["kkk", "kek", "kkk"], [
      { part: "head", x0: 0, y0: 0, x1: 2, y1: 1 },
      { part: "tail", x0: 0, y0: 0, x1: 0, y1: 2 },
    ]);
    expect(parts.head).toEqual(["kkk", "k.k", "..."]);
    expect(parts.eye).toEqual(["...", ".e.", "..."]);
    expect(parts.tail).toEqual(["...", "...", "k.."]);
    expect(parts.body).toEqual(["...", "...", ".kk"]);
  });
});

describe("pickColours and isBlank", () => {
  it("keeps or drops the pixels of the given colours", () => {
    expect(pickColours(["msa.", "mmgs"], "sag")).toEqual([".sa.", "..gs"]);
    expect(pickColours(["msa.", "mmgs"], "sag", false)).toEqual(["m...", "mm.."]);
  });

  it("tells an empty map from a drawn one", () => {
    expect(isBlank(["...", "..."])).toBe(true);
    expect(isBlank(["...", ".k."])).toBe(false);
  });
});

describe("sprite maps", () => {
  const entries = Object.entries(SPRITES);

  it("has the hero, prop and mini sprites", () => {
    for (const name of [
      "heroDay",
      "heroNight",
      "heroFront",
      "heroBack",
      "laptop",
      "mug",
      "steam1",
      "steam2",
      "zBig",
      "zSmall",
      "miniType",
      "miniSit",
      "miniGroom",
      "miniSleep",
      "miniNap",
    ]) {
      expect(SPRITES, name).toHaveProperty(name);
    }
  });

  it.each(entries)("%s is a non-empty rectangle drawn only in legend colours", (_name, map) => {
    expect(map.length).toBeGreaterThan(0);
    const width = map[0]?.length ?? 0;
    expect(width).toBeGreaterThan(0);
    for (const row of map) {
      expect(row.length).toBe(width);
      for (const pixel of row) {
        if (pixel !== ".") expect(PALETTE, `"${pixel}" is not in the legend`).toHaveProperty(pixel);
      }
    }
  });

  it("draws the front and back on the side view's footing", () => {
    /** The rows that hold any ink. */
    const inked = (map: readonly string[]) => map.flatMap((row, y) => (/[^.]/.test(row) ? [y] : []));
    for (const [name, map] of [
      ["front", HERO_FRONT],
      ["back", HERO_BACK],
    ] as const) {
      expect(map, name).toHaveLength(28);
      map.forEach((row, y) => {
        expect(row, `${name} row ${y}`).toHaveLength(28);
        // Only on the side view's body columns, so the turn happens on the spot.
        expect(row.slice(SPIN_BODY.x1 + 1), `${name} row ${y}`).toMatch(/^\.*$/);
      });
      // Feet on the same row as the side view's, ears as high: the same sitting height.
      expect(map[27], name).toMatch(/[^.]/);
      expect(inked(map)[0], name).toBe(inked(HERO_DAY)[0]);
    }
    expect(HERO_FRONT.join("")).toContain("e");
    expect(HERO_BACK.join("")).not.toContain("e");
    // The side view itself fits the same span: the mirror about it is pixel-exact.
    for (const row of HERO_DAY) expect(row.slice(SPIN_BODY.x1 + 1)).toMatch(/^\.*$/);
    expect(SPIN_BODY.x0).toBe(0);
  });

  it("maps every legend colour to a --cat-* variable defined in the base .cat-art block", () => {
    const css = readFileSync("src/components/cat/cat.css", "utf8");
    const base = /^\.cat-art \{([^}]*)\}/m.exec(css)?.[1] ?? "";
    for (const [pixel, variable] of Object.entries(PALETTE)) {
      expect(pixel).toMatch(/^[a-z]$/);
      expect(variable).toMatch(/^--cat-[a-z0-9-]+$/);
      expect(base, `${variable} is not defined`).toMatch(new RegExp(`${variable}\\s*:`));
    }
  });
});
