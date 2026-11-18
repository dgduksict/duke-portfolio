import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CatArt } from "@/components/cat/cat-art";
import { PALETTE } from "@/components/cat/sprites";
import type { RulerPose } from "@/lib/cat";

const POSES: readonly RulerPose[] = ["type", "sit", "groom", "sleep", "nap"];
const DAY_PARTS = ["cat-head", "cat-eye", "cat-ear-l", "cat-ear-r", "cat-tail", "cat-paw-l", "cat-paw-r", "cat-body"];

/** The reference site's brand colours; the portfolio's cat must never wear them. */
const FOREIGN_PAINT = ["#ef4445", "#eb4397", "#8253a2", "#3f5fac", "#3ea3db", "--c-pink", "--grad"];

describe("CatArt (hero)", () => {
  it("types by day, with no zzz", () => {
    const { container } = render(<CatArt variant="hero" state="day" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("data-state", "day");
    expect(container.querySelector(".cat-zzz")).toBeNull();
    expect(container.querySelector(".cat-screen")).not.toBeNull();
    for (const part of DAY_PARTS) {
      expect(container.querySelector(`.${part}`), part).not.toBeNull();
    }
  });

  it("sleeps at night, with a zzz and a steaming mug", () => {
    const { container } = render(<CatArt variant="hero" state="night" />);
    expect(container.querySelector("svg")).toHaveAttribute("data-state", "night");
    expect(container.querySelector(".cat-zzz")).not.toBeNull();
    expect(container.querySelector(".cat-screen")).toBeNull();
    expect(container.querySelector('[data-layer="mug"]')).not.toBeNull();
    expect(container.querySelectorAll(".cat-steam").length).toBeGreaterThan(1);
    for (const part of ["cat-head", "cat-ear-l", "cat-ear-r", "cat-tail", "cat-body"]) {
      expect(container.querySelector(`.${part}`), part).not.toBeNull();
    }
  });

  it("is decorative", () => {
    const { container } = render(<CatArt variant="hero" state="day" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).toHaveClass("cat-art");
  });
});

describe("CatArt (mini)", () => {
  it.each(POSES)("renders the %s pose", (pose) => {
    const { container } = render(<CatArt variant="mini" pose={pose} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("data-pose", pose);
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(container.querySelector(".cat-head")).not.toBeNull();
    expect(container.querySelector(".cat-body")).not.toBeNull();
  });

  it("types at a glowing screen, and only the sleeping pose has a zzz", () => {
    for (const pose of POSES) {
      const { container, unmount } = render(<CatArt variant="mini" pose={pose} />);
      expect(container.querySelector(".cat-screen") !== null, pose).toBe(pose === "type");
      expect(container.querySelector(".cat-zzz") !== null, pose).toBe(pose === "sleep");
      unmount();
    }
  });

  it("keeps an extra class name", () => {
    const { container } = render(<CatArt variant="mini" pose="sit" className="ruler-cat-art" />);
    expect(container.querySelector("svg")).toHaveClass("cat-art", "ruler-cat-art");
  });
});

describe("CatArt markup", () => {
  it("gives every instance its own ids", () => {
    const { container } = render(
      <>
        <CatArt variant="hero" state="day" />
        <CatArt variant="hero" state="night" />
        <CatArt variant="mini" pose="type" />
        <CatArt variant="mini" pose="type" />
      </>,
    );
    const ids = [...container.querySelectorAll("[id]")].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never carries a transform on an animated part", () => {
    const { container } = render(
      <>
        <CatArt variant="hero" state="day" />
        <CatArt variant="hero" state="night" />
        {POSES.map((pose) => (
          <CatArt key={pose} variant="mini" pose={pose} />
        ))}
      </>,
    );
    const parts = container.querySelectorAll("[class^='cat-'], [class*=' cat-']");
    expect(parts.length).toBeGreaterThan(0);
    for (const part of parts) {
      if (part.tagName.toLowerCase() === "svg") continue;
      expect(part.hasAttribute("transform")).toBe(false);
    }
  });

  const variants = [
    { name: "hero day", node: <CatArt variant="hero" state="day" /> },
    { name: "hero night", node: <CatArt variant="hero" state="night" /> },
    ...POSES.map((pose) => ({ name: `mini ${pose}`, node: <CatArt variant="mini" pose={pose} /> })),
  ];

  it.each(variants)("paints $name in the portfolio palette only, under 15 KB", ({ node }) => {
    const { container } = render(node);
    const markup = container.innerHTML;
    for (const foreign of FOREIGN_PAINT) {
      expect(markup).not.toContain(foreign);
    }
    expect(markup).not.toMatch(/gradient/i);
    expect(markup.length).toBeLessThan(15 * 1024);
  });

  it.each(variants)("draws $name in hard pixels only: crisp rects in --cat-* colours", ({ node }) => {
    const { container } = render(node);
    expect(container.querySelector("path, circle, ellipse, line, polygon, polyline, image")).toBeNull();
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBeGreaterThan(0);
    for (const rect of rects) {
      expect(rect.getAttribute("fill")).toMatch(/^var\(--cat-[a-z0-9-]+\)$/);
      expect(rect.closest('[shape-rendering="crispEdges"]')).not.toBeNull();
    }
  });
});

describe("cat.css (where every colour lives)", () => {
  const css = readFileSync("src/components/cat/cat.css", "utf8");
  /** The declarations of the base `.cat-art { ... }` rule (the light-theme variable set). */
  const base = /^\.cat-art \{([^}]*)\}/m.exec(css)?.[1] ?? "";

  it("holds no foreign brand paint", () => {
    for (const foreign of FOREIGN_PAINT) {
      expect(css.toLowerCase()).not.toContain(foreign.toLowerCase());
    }
    expect(css).not.toMatch(/gradient\(/);
  });

  it("defines every --cat-* variable the CSS or the sprite palette uses in the base .cat-art block", () => {
    const defined = new Set([...base.matchAll(/(--cat-[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
    const used = new Set([
      ...[...css.matchAll(/var\((--cat-[a-z0-9-]+)\)/g)].map((match) => match[1]),
      ...Object.values(PALETTE),
    ]);
    expect(defined.size).toBeGreaterThan(0);
    expect(used.size).toBeGreaterThan(0);
    for (const name of used) {
      expect(defined, `${name} is used but not defined in the base block`).toContain(name);
    }
  });

  it("leaves display and overflow to the component, so consumer utilities can override them", () => {
    expect(base).not.toBe("");
    expect(base).not.toMatch(/(display|overflow)\s*:/);
    const { container } = render(<CatArt variant="mini" pose="sit" className="hidden overflow-hidden" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("cat-art", "hidden", "overflow-hidden");
    expect(svg).not.toHaveClass("block");
    expect(svg).not.toHaveClass("overflow-visible");
  });
});
