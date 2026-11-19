import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isBlank, pickColours, splitParts, spriteRects } from "@/components/cat/pixel-sprite";
import {
  CROUCH_1,
  CROUCH_2,
  HERO_BACK,
  HERO_DAY,
  HEART,
  HERO_FRONT,
  HERO_STRETCH,
  HERO_YAWN,
  PALETTE,
  POUNCE,
  PROUD,
  RUN_1,
  RUN_2,
  SPIN_BODY,
  SPRITES,
  TUMBLE,
  YARN_BALL,
  YARN_SIT,
} from "@/components/cat/sprites";

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
      "heroYawn",
      "heroStretch",
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
      "yarnSit",
      "run1",
      "run2",
      "crouch1",
      "crouch2",
      "pounce",
      "tumble",
      "proud",
      "yarnBall",
      "heart",
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

  it.each([
    ["yawn", HERO_YAWN],
    ["stretch", HERO_STRETCH],
  ] as const)("draws the sunrise %s as the same black cat, 28 x 28, feet on row 27, beside his laptop", (name, map) => {
    expect(map).toHaveLength(28);
    for (const row of map) expect(row).toHaveLength(28);
    expect(map[27]).toMatch(/[^.]/);
    // Ink, rim and his eye; the yawn's open mouth may add coffee (the inside) and cream (a fang). Nothing else.
    expect(map.join("")).toMatch(/^[.krecw]+$/);
    expect(map.join("")).toContain("k");
    // The day cat's own span (SPIN_BODY), so the laptop at column 17 stays in view.
    for (const row of map) expect(row.slice(SPIN_BODY.x1 + 1), name).toMatch(/^\.*$/);
    // Nothing under him: a rim pixel over empty space always meets the outside on its left, right or top too.
    const at = (x: number, y: number) => map[y]?.[x] ?? ".";
    map.forEach((row, y) =>
      [...row].forEach((pixel, x) => {
        if (pixel !== "r" || at(x, y + 1) !== "." || y === 27) return;
        expect([at(x - 1, y), at(x + 1, y), at(x, y - 1)], `${name} rim under him at ${x},${y}`).toContain(".");
      }),
    );
  });

  it("opens the yawn's mouth and keeps the stretch's eye", () => {
    expect(HERO_YAWN.join("")).toContain("c");
    expect(HERO_STRETCH.join("")).toContain("e");
  });

  it.each([
    ["yarnSit", YARN_SIT],
    ["run1", RUN_1],
    ["run2", RUN_2],
    ["crouch1", CROUCH_1],
    ["crouch2", CROUCH_2],
    ["pounce", POUNCE],
    ["tumble", TUMBLE],
    ["proud", PROUD],
  ] as const)("draws the yarn cat's %s on the shared 20 x 16 grid, standing on row 15", (_name, map) => {
    expect(map).toHaveLength(16);
    for (const row of map) expect(row).toHaveLength(20);
    // Every frame touches the floor, so swapping frames never makes him hop or sink.
    expect(map[15]).toMatch(/[^.]/);
    // The same black cat: ink, a rim and his half-lidded eye, nothing else.
    expect(map.join("")).toMatch(/^[.kre]+$/);
    expect(map.join("")).toContain("k");
  });

  it("draws a 7 x 7 ball of wound yarn in its two tones", () => {
    expect(YARN_BALL).toHaveLength(7);
    for (const row of YARN_BALL) expect(row).toHaveLength(7);
    const all = YARN_BALL.join("");
    expect(all).toContain("y");
    expect(all).toContain("h");
    expect(all).toMatch(/^[.yh]+$/);
  });

  it("draws a 5 x 5 purr heart in its own pink only", () => {
    expect(HEART).toHaveLength(5);
    for (const row of HEART) expect(row).toHaveLength(5);
    expect(HEART.join("")).toMatch(/^[.p]+$/);
    expect(HEART.join("")).toContain("p");
    expect(PALETTE.p).toBe("--cat-heart");
    // A heart, not a blob: two lobes on top, a single point at the bottom.
    expect(HEART[0]).toMatch(/^p+\.p+$/);
    expect(HEART[4]).toBe("..p..");
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
