import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Fragment, type ReactElement } from "react";
import { CatArt, hatFor } from "@/components/cat/cat-art";
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

/** A rect's box in its own coordinates (the x, y, width and height it carries). */
function localBox(rect: Element): Box {
  const x0 = Number(rect.getAttribute("x"));
  const y0 = Number(rect.getAttribute("y"));
  return { x0, y0, x1: x0 + Number(rect.getAttribute("width")), y1: y0 + Number(rect.getAttribute("height")) };
}

/** A rect's box in the svg's own units: every `translate` and `scale` on the groups above it, applied in turn. */
function svgBox(rect: Element): Box {
  let { x0, y0, x1, y1 } = localBox(rect);
  for (let el = rect.parentElement; el !== null && el.tagName.toLowerCase() !== "svg"; el = el.parentElement) {
    const ops = [...(el.getAttribute("transform") ?? "").matchAll(/(translate|scale)\(([^)]*)\)/g)].reverse();
    for (const [, op, args = ""] of ops) {
      const [a = 0, b] = args.trim().split(/[\s,]+/).map(Number);
      if (op === "translate") {
        x0 += a;
        x1 += a;
        y0 += b ?? 0;
        y1 += b ?? 0;
      } else {
        const sy = b ?? a;
        [x0, x1] = [Math.min(x0 * a, x1 * a), Math.max(x0 * a, x1 * a)];
        [y0, y1] = [Math.min(y0 * sy, y1 * sy), Math.max(y0 * sy, y1 * sy)];
      }
    }
  }
  return { x0, y0, x1, y1 };
}

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const union = (boxes: readonly Box[]): Box => ({
  x0: Math.min(...boxes.map((b) => b.x0)),
  y0: Math.min(...boxes.map((b) => b.y0)),
  x1: Math.max(...boxes.map((b) => b.x1)),
  y1: Math.max(...boxes.map((b) => b.y1)),
});

const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

/** The cat's own rects under `root` (ink and rim), never the hat's. */
const catInk = (root: Element) =>
  [...root.querySelectorAll('rect[fill="var(--cat-ink)"], rect[fill="var(--cat-rim)"]')].filter((r) => r.closest(".cat-hat") === null);

/**
 * Where the head is in the drawings that are whole pictures with no `cat-head` group (the spin's front and back, the
 * wake's yawn and stretch), in cells of their 28-cell grid: the box round the ears and the skull.
 */
const WHOLE_HEADS: Readonly<Record<string, Box>> = {
  front: { x0: 3, y0: 3, x1: 18, y1: 13 },
  back: { x0: 3, y0: 3, x1: 18, y1: 13 },
  yawn: { x0: 5, y0: 3, x1: 16, y1: 11 },
  stretch: { x0: 12, y0: 15, x1: 20, y1: 20 },
};

/**
 * The top rows of the head (its first four cells), in the coordinates the head's own rects carry: the `cat-head` group
 * where the drawing has one, else the cat's ink inside the drawing's WHOLE_HEADS box.
 */
function headTop(root: Element, cell: number, whole?: string): Box {
  let head: Box;
  if (whole === undefined) {
    const group = root.querySelector(".cat-head");
    expect(group).not.toBeNull();
    head = union([...(group?.querySelectorAll("rect") ?? [])].filter((r) => r.closest(".cat-hat") === null).map(localBox));
  } else {
    const cells = WHOLE_HEADS[whole] as Box;
    const area = { x0: cells.x0 * cell, y0: cells.y0 * cell, x1: cells.x1 * cell, y1: cells.y1 * cell };
    const inside = catInk(root).map(localBox).filter((b) => overlaps(b, area));
    const ink = union(inside);
    head = { x0: Math.max(ink.x0, area.x0), y0: Math.max(ink.y0, area.y0), x1: Math.min(ink.x1, area.x1), y1: Math.min(ink.y1, area.y1) };
  }
  return { ...head, y1: Math.min(head.y1, head.y0 + 4 * cell) };
}

describe("CatArt hats", () => {
  const HATS = ["santa", "party"] as const;

  it("wears no hat on an ordinary day", () => {
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
    expect(container.querySelector(".cat-hat, [data-hat]")).toBeNull();
    expect(container.querySelector('rect[fill^="var(--cat-santa"]')).toBeNull();
  });

  it("maps the holiday to his hat: a Santa hat for Christmas, a party hat for the birthday, none otherwise", () => {
    expect(hatFor("christmas")).toBe("santa");
    expect(hatFor("birthday")).toBe("party");
    expect(hatFor(null)).toBeUndefined();
    expect(hatFor(undefined)).toBeUndefined();
  });

  it("wears a santa hat in every hero drawing", () => {
    for (const state of ["day", "night"] as const) {
      const { container, unmount } = render(<CatArt variant="hero" state={state} hat="santa" />);
      const hats = container.querySelectorAll(".cat-hat");
      expect(hats, state).toHaveLength(1);
      expect(hats[0]).toHaveAttribute("data-hat", "santa");
      // In the head group, so it breathes and glances with his head.
      expect(hats[0]?.parentElement).toHaveClass("cat-head");
      expect(hats[0]?.querySelector('rect[fill="var(--cat-santa)"]')).not.toBeNull();
      expect(hats[0]?.querySelector('rect[fill="var(--cat-white)"]'), "the brim").not.toBeNull();
      unmount();
    }
    for (const state of ["day", "night"] as const) {
      const { container, unmount } = render(<CatArt variant="hero" state={state} uiia hat="santa" />);
      const frames = [...container.querySelectorAll(".cat-spin-frame")];
      expect(frames).toHaveLength(4);
      for (const frame of frames) {
        const hats = frame.querySelectorAll('.cat-hat[data-hat="santa"]');
        expect(hats, `${state} ${frame.getAttribute("data-frame")}`).toHaveLength(1);
      }
      // The side frames wear it in their head group; the mirror's is mirrored with him.
      expect(container.querySelector('.cat-spin-frame[data-frame="mirror"] > g[transform] .cat-head > .cat-hat')).not.toBeNull();
      unmount();
    }
    const { container } = render(<CatArt variant="hero" state="day" wake hat="santa" />);
    const frames = [...container.querySelectorAll(".cat-wake-frame")];
    expect(frames).toHaveLength(2);
    for (const frame of frames) expect(frame.querySelectorAll('.cat-hat[data-hat="santa"]')).toHaveLength(1);
  });

  it("droops the santa hat over his ear at night, and keeps the party hat upright", () => {
    /** The hat's cells relative to its own top left, so two hats in different places compare by shape. */
    const shape = (node: ReactElement) => {
      const { container, unmount } = render(node);
      const boxes = [...container.querySelectorAll(".cat-hat rect")].map(localBox);
      unmount();
      const at = union(boxes);
      return boxes.map((b) => `${b.x0 - at.x0},${b.y0 - at.y0},${b.x1 - b.x0},${b.y1 - b.y0}`).sort();
    };
    const santaDay = shape(<CatArt variant="hero" state="day" hat="santa" />);
    expect(santaDay.length).toBeGreaterThan(0);
    expect(shape(<CatArt variant="hero" state="night" hat="santa" />)).not.toEqual(santaDay);
    expect(shape(<CatArt variant="hero" state="night" hat="party" />)).toEqual(shape(<CatArt variant="hero" state="day" hat="party" />));
  });

  it("wears a party hat on the birthday", () => {
    const { container } = render(
      <>
        <CatArt variant="hero" state="day" hat="party" />
        <CatArt variant="hero" state="night" hat="party" />
        <CatArt variant="hero" state="day" uiia hat="party" />
        <CatArt variant="hero" state="day" wake hat="party" />
        {POSES.map((pose) => (
          <CatArt key={pose} variant="mini" pose={pose} hat="party" />
        ))}
      </>,
    );
    const hats = [...container.querySelectorAll(".cat-hat")];
    expect(hats).toHaveLength(2 + 4 + 2 + POSES.length);
    for (const hat of hats) {
      expect(hat).toHaveAttribute("data-hat", "party");
      // Amber stripes with the pink, no Santa red.
      expect(hat.querySelector('rect[fill="var(--cat-amber)"]')).not.toBeNull();
      expect(hat.querySelector('rect[fill^="var(--cat-santa"]')).toBeNull();
    }
  });

  /** Every drawing a hat sits in: where to look for it and its head, and the drawing's cell and box size. */
  const drawings: { name: string; node: (hat: "santa" | "party") => ReactElement; frame?: string; whole?: string; cell: number; size: number }[] = [
    { name: "hero day", node: (hat) => <CatArt variant="hero" state="day" hat={hat} />, cell: 6, size: 168 },
    { name: "hero night", node: (hat) => <CatArt variant="hero" state="night" hat={hat} />, cell: 6, size: 168 },
    ...(["day", "night"] as const).flatMap((state) =>
      (["side", "front", "mirror", "back"] as const).map((frame) => ({
        name: `hero ${state} spin, ${frame}`,
        node: (hat: "santa" | "party") => <CatArt variant="hero" state={state} uiia hat={hat} />,
        frame: `.cat-spin-frame[data-frame="${frame}"]`,
        whole: frame === "front" || frame === "back" ? frame : undefined,
        cell: 6,
        size: 168,
      })),
    ),
    ...(["yawn", "stretch"] as const).map((frame) => ({
      name: `hero wake, ${frame}`,
      node: (hat: "santa" | "party") => <CatArt variant="hero" state="day" wake hat={hat} />,
      frame: `.cat-wake-frame[data-frame="${frame}"]`,
      whole: frame,
      cell: 6,
      size: 168,
    })),
    ...POSES.map((pose) => ({ name: `mini ${pose}`, node: (hat: "santa" | "party") => <CatArt variant="mini" pose={pose} hat={hat} />, cell: 3, size: 48 })),
  ];

  it.each(drawings.flatMap((d) => HATS.map((hat) => ({ ...d, hat }))))("puts the $hat hat on his head: $name", ({ node, hat, frame, whole, cell, size }) => {
    const { container } = render(node(hat));
    const root = frame === undefined ? container.querySelector("svg") : container.querySelector(frame);
    expect(root).not.toBeNull();
    const hats = root?.querySelectorAll(".cat-hat") ?? [];
    expect(hats).toHaveLength(1);
    const rects = [...(hats[0]?.querySelectorAll("rect") ?? [])];
    expect(rects.length).toBeGreaterThan(0);
    // On his head: the hat covers some of the head's top four rows (in the coordinates they share).
    const top = headTop(root as Element, cell, whole);
    expect(overlaps(union(rects.map(localBox)), top), `hat ${JSON.stringify(union(rects.map(localBox)))} head ${JSON.stringify(top)}`).toBe(true);
    // And every cell of it inside the drawing's box, once the mirror, the lift and the night shift are applied.
    for (const rect of rects) {
      const b = svgBox(rect);
      expect(b.x0, "left").toBeGreaterThanOrEqual(0);
      expect(b.y0, "top").toBeGreaterThanOrEqual(0);
      expect(b.x1, "right").toBeLessThanOrEqual(size);
      expect(b.y1, "bottom").toBeLessThanOrEqual(size);
    }
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
        {(["santa", "party"] as const).map((hat) => (
          <Fragment key={hat}>
            <CatArt variant="hero" state="day" hat={hat} />
            <CatArt variant="hero" state="night" hat={hat} />
            <CatArt variant="hero" state="day" uiia hat={hat} />
            <CatArt variant="hero" state="night" uiia hat={hat} />
            <CatArt variant="hero" state="day" wake hat={hat} />
            {POSES.map((pose) => (
              <CatArt key={pose} variant="mini" pose={pose} hat={hat} />
            ))}
          </Fragment>
        ))}
      </>,
    );
    expect(container.querySelectorAll(".cat-hat")).toHaveLength(2 * (2 + 4 + 4 + 2 + POSES.length));
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
    // Dressed up for the holidays: a hat in every drawing (and every frame). A resting or waking drawing keeps its
    // 15 KB with a hat on (about 1 KB a hat, 2 KB for the wake); the spin wears four, one per frame (about 4.5 KB), so
    // dressed it gets 26 KB. It is still client-only, drawn after five pokes, never in the page HTML.
    ...(["santa", "party"] as const).flatMap((hat) => [
      { name: `hero day, ${hat} hat`, kb: 15, node: <CatArt variant="hero" state="day" hat={hat} /> },
      { name: `hero night, ${hat} hat`, kb: 15, node: <CatArt variant="hero" state="night" hat={hat} /> },
      { name: `hero day, spinning, ${hat} hat`, kb: 26, node: <CatArt variant="hero" state="day" uiia hat={hat} /> },
      { name: `hero night, spinning, ${hat} hat`, kb: 26, node: <CatArt variant="hero" state="night" uiia hat={hat} /> },
      { name: `hero day, waking, ${hat} hat`, kb: 15, node: <CatArt variant="hero" state="day" wake hat={hat} /> },
      ...POSES.map((pose) => ({ name: `mini ${pose}, ${hat} hat`, kb: 15, node: <CatArt variant="mini" pose={pose} hat={hat} /> })),
    ]),
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
