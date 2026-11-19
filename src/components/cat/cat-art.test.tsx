import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CatArt } from "@/components/cat/cat-art";
import { PALETTE, SPIN_BODY } from "@/components/cat/sprites";
import type { RulerPose } from "@/lib/cat";

const POSES: readonly RulerPose[] = ["type", "sit", "groom", "sleep", "nap"];
const DAY_PARTS = ["cat-head", "cat-eye", "cat-ear-l", "cat-ear-r", "cat-tail", "cat-paw-l", "cat-paw-r", "cat-body"];

/** The reference site's brand colours; the portfolio's cat must never wear them. */
const FOREIGN_PAINT = ["#ef4445", "#eb4397", "#8253a2", "#3f5fac", "#3ea3db", "--c-pink", "--grad"];

describe("CatArt (hero)", () => {
  it.each(["day", "night"] as const)("spins awake by %s: the sitting cat whole in the one cat-spin group", (state) => {
    const { container } = render(<CatArt variant="hero" state={state} uiia />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("data-state", state);
    expect(svg).toHaveAttribute("data-uiia");
    const spin = container.querySelectorAll(".cat-spin");
    expect(spin).toHaveLength(1);
    for (const part of DAY_PARTS) {
      expect(spin[0]?.querySelector(`.${part}`), part).not.toBeNull();
    }
    expect(container.querySelector(".cat-zzz")).toBeNull();
    // His props stay where they were: the laptop by day, the mug by night.
    expect(container.querySelector(state === "day" ? '[data-layer="laptop"]' : '[data-layer="mug"]')).not.toBeNull();
  });

  it.each(["day", "night"] as const)("turns the UIIA cat through four drawn frames by %s", (state) => {
    const { container } = render(<CatArt variant="hero" state={state} uiia />);
    const frames = [...container.querySelectorAll(".cat-spin > .cat-spin-frame")];
    expect(frames).toHaveLength(4);
    expect(container.querySelectorAll(".cat-spin-frame")).toHaveLength(4);
    expect(frames.map((frame) => frame.getAttribute("data-frame"))).toEqual(["side", "front", "mirror", "back"]);
    // Every frame is a whole drawing; only the front looks at you with his two eyes.
    for (const frame of frames) expect(frame.querySelector("rect"), frame.getAttribute("data-frame") ?? "").not.toBeNull();
    const eyes = (frame: Element) => frame.querySelectorAll('rect[fill="var(--cat-eye)"]').length;
    expect(eyes(frames[1] as Element)).toBe(2);
    expect(eyes(frames[3] as Element)).toBe(0);
  });

  it("mirrors the side frame about his own body", () => {
    const { container } = render(<CatArt variant="hero" state="day" uiia />);
    const wrapper = container.querySelector('.cat-spin-frame[data-frame="mirror"] > g');
    expect(wrapper).toHaveAttribute("transform", `translate(${(SPIN_BODY.x1 + 1) * 6} 0) scale(-1 1)`);
    expect(wrapper).toHaveAttribute("transform", "translate(126 0) scale(-1 1)");
    expect(wrapper?.querySelector(".cat-head")).not.toBeNull();
    // The side frame itself stands where he always sits.
    expect(container.querySelector('.cat-spin-frame[data-frame="side"] > .cat-head')).not.toBeNull();
  });

  it("lifts the front and back frames one cell", () => {
    const { container } = render(<CatArt variant="hero" state="day" uiia />);
    for (const frame of ["front", "back"]) {
      const wrapper = container.querySelector(`.cat-spin-frame[data-frame="${frame}"] > g`);
      expect(wrapper, frame).toHaveAttribute("transform", "translate(0 -6)");
    }
  });

  it("wakes at his laptop: the yawn, then the stretch, and no spin", () => {
    const { container } = render(<CatArt variant="hero" state="day" wake />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("data-state", "day");
    expect(svg).toHaveAttribute("data-wake");
    expect(svg).not.toHaveAttribute("data-uiia");
    const frames = [...container.querySelectorAll("g.cat-wake-frame")];
    expect(frames.map((frame) => frame.getAttribute("data-frame"))).toEqual(["yawn", "stretch"]);
    for (const frame of frames) expect(frame.querySelector("rect"), frame.getAttribute("data-frame") ?? "").not.toBeNull();
    expect(container.querySelector(".cat-spin")).toBeNull();
    expect(container.querySelector(".cat-spin-frame")).toBeNull();
    expect(container.querySelector('[data-layer="laptop"]')).not.toBeNull();
    expect(container.querySelector(".cat-screen")).not.toBeNull();
    expect(container.querySelector(".cat-zzz")).toBeNull();
    // Whole drawings, not the day cat's parts, so none of the typing loops run on them.
    expect(container.querySelector(".cat-paw-l, .cat-paw-r, .cat-head, .cat-tail")).toBeNull();
  });

  it("lets the spin win over a wake", () => {
    const { container } = render(<CatArt variant="hero" state="day" wake uiia />);
    expect(container.querySelectorAll(".cat-spin-frame")).toHaveLength(4);
    expect(container.querySelector(".cat-wake-frame")).toBeNull();
    expect(container.querySelector("svg")).not.toHaveAttribute("data-wake");
  });

  it("carries no data-wake and no wake frames when he is not waking", () => {
    for (const state of ["day", "night"] as const) {
      const { container, unmount } = render(<CatArt variant="hero" state={state} />);
      expect(container.querySelector("svg"), state).not.toHaveAttribute("data-wake");
      expect(container.querySelector(".cat-wake-frame"), state).toBeNull();
      unmount();
    }
  });

  it("closes his eye contentedly when he purrs by day: the eye layer in rim, a shut line", () => {
    const open = render(<CatArt variant="hero" state="day" />).container;
    expect(open.querySelectorAll('.cat-eye rect[fill="var(--cat-eye)"]').length).toBeGreaterThan(0);
    const { container } = render(<CatArt variant="hero" state="day" content />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("data-content");
    const eye = [...container.querySelectorAll(".cat-eye rect")];
    expect(eye.length).toBeGreaterThan(0);
    for (const rect of eye) expect(rect).toHaveAttribute("fill", "var(--cat-rim)");
    expect(container.querySelector('rect[fill="var(--cat-eye)"]')).toBeNull();
    // The same cells as the open eye: only the colour changes.
    const cells = (root: Element) =>
      [...root.querySelectorAll(".cat-eye rect")].map((r) => `${r.getAttribute("x")},${r.getAttribute("y")},${r.getAttribute("width")}`);
    expect(cells(container)).toEqual(cells(open));
    // Still the typing cat at his laptop.
    for (const part of DAY_PARTS) expect(container.querySelector(`.${part}`), part).not.toBeNull();
    expect(container.querySelector('[data-layer="laptop"]')).not.toBeNull();
  });

  it("changes nothing for content by night, while waking or while spinning", () => {
    const pairs = [
      [<CatArt key="a" variant="hero" state="night" />, <CatArt key="b" variant="hero" state="night" content />],
      [<CatArt key="a" variant="hero" state="day" wake />, <CatArt key="b" variant="hero" state="day" wake content />],
      [<CatArt key="a" variant="hero" state="day" uiia />, <CatArt key="b" variant="hero" state="day" uiia content />],
    ] as const;
    for (const [plain, content] of pairs) {
      const a = render(plain);
      const b = render(content);
      expect(b.container.innerHTML).toBe(a.container.innerHTML);
      a.unmount();
      b.unmount();
    }
  });

  it("carries no data-uiia and no cat-spin group outside the easter egg", () => {
    const { container } = render(<CatArt variant="hero" state="day" />);
    expect(container.querySelector("svg")).not.toHaveAttribute("data-uiia");
    expect(container.querySelector(".cat-spin")).toBeNull();
  });

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

  it("keeps the night tail to its curl: the belly stays in the body layer", () => {
    const { container } = render(<CatArt variant="hero" state="night" />);
    const tail = container.querySelector(".cat-tail");
    const xs = [...(tail?.querySelectorAll("rect") ?? [])].map((r) => Number(r.getAttribute("x")) / 6);
    expect(xs.length).toBeGreaterThan(0);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(26);
  });

  it("draws ink under the day eye, so a glance leaves no hole in the head", () => {
    const { container } = render(<CatArt variant="hero" state="day" />);
    const eye = container.querySelector(".cat-eye rect");
    const head = container.querySelector(".cat-head");
    expect(eye).not.toBeNull();
    const under = [...(head?.querySelectorAll(":scope > g:not(.cat-eye):not(.cat-ear-l):not(.cat-ear-r) rect") ?? [])].some(
      (r) => r.getAttribute("x") === eye?.getAttribute("x") && r.getAttribute("y") === eye?.getAttribute("y"),
    );
    expect(under).toBe(true);
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
        <CatArt variant="hero" state="day" uiia />
        <CatArt variant="hero" state="night" uiia />
        <CatArt variant="hero" state="day" wake />
        <CatArt variant="hero" state="day" content />
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

  /**
   * Every resting drawing stays under 15 KB of markup. The spin holds four whole drawings (side, front, side mirrored,
   * back) and only ever renders on the client after five pokes, never in the page's HTML, so it gets 24 KB. The wake
   * holds the laptop and two whole drawings (yawn, stretch) but no part groups, so it fits the resting 15 KB.
   */
  const variants = [
    { name: "hero day", kb: 15, node: <CatArt variant="hero" state="day" /> },
    { name: "hero night", kb: 15, node: <CatArt variant="hero" state="night" /> },
    { name: "hero day, spinning", kb: 24, node: <CatArt variant="hero" state="day" uiia /> },
    { name: "hero night, spinning", kb: 24, node: <CatArt variant="hero" state="night" uiia /> },
    { name: "hero day, waking", kb: 15, node: <CatArt variant="hero" state="day" wake /> },
    { name: "hero day, purring", kb: 15, node: <CatArt variant="hero" state="day" content /> },
    ...POSES.map((pose) => ({ name: `mini ${pose}`, kb: 15, node: <CatArt variant="mini" pose={pose} /> })),
  ];

  it.each(variants)("paints $name in the portfolio palette only, under $kb KB", ({ node, kb }) => {
    const { container } = render(node);
    const markup = container.innerHTML;
    for (const foreign of FOREIGN_PAINT) {
      expect(markup).not.toContain(foreign);
    }
    expect(markup).not.toMatch(/gradient/i);
    expect(markup.length).toBeLessThan(kb * 1024);
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
