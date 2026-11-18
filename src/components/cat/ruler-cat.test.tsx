import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RulerCat } from "@/components/cat/ruler-cat";
import { GROOM_AFTER_MS, NAP_FROM, type RulerPose, TYPING_WINDOW_MS } from "@/lib/cat";

const pose = (container: HTMLElement) => container.querySelector("svg")?.getAttribute("data-pose");

describe("RulerCat: which pose", () => {
  it.each<[string, { state: "day" | "night"; msSinceScroll: number; progress: number }, RulerPose]>([
    ["types while scrolling (0 ms)", { state: "day", msSinceScroll: 0, progress: 0.4 }, "type"],
    ["still types just inside the window", { state: "day", msSinceScroll: TYPING_WINDOW_MS - 1, progress: 0.4 }, "type"],
    ["sits shortly after (200 ms)", { state: "day", msSinceScroll: 200, progress: 0.4 }, "sit"],
    ["sits up to the grooming threshold", { state: "day", msSinceScroll: GROOM_AFTER_MS - 1, progress: 0.4 }, "sit"],
    ["grooms after 1300 ms", { state: "day", msSinceScroll: 1300, progress: 0.4 }, "groom"],
    ["naps at the bottom of the page (0.99)", { state: "day", msSinceScroll: 0, progress: 0.99 }, "nap"],
    ["naps from NAP_FROM on", { state: "day", msSinceScroll: 5000, progress: NAP_FROM }, "nap"],
    ["sleeps at night", { state: "night", msSinceScroll: 5000, progress: 0.4 }, "sleep"],
    ["sleeps at night even while scrolling", { state: "night", msSinceScroll: 0, progress: 0.4 }, "sleep"],
    ["sleeps at night even at the bottom", { state: "night", msSinceScroll: 0, progress: 0.99 }, "sleep"],
  ])("%s", (_name, props, expected) => {
    const { container } = render(<RulerCat {...props} />);
    expect(pose(container)).toBe(expected);
  });

  it("still renders a defined pose for non-finite numbers", () => {
    for (const msSinceScroll of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      for (const progress of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
        const { container, unmount } = render(<RulerCat state="day" msSinceScroll={msSinceScroll} progress={progress} />);
        expect(["type", "sit", "groom", "sleep", "nap"]).toContain(pose(container));
        unmount();
      }
    }
  });

  it("renders nothing while the cat's state is unknown", () => {
    const { container } = render(<RulerCat state={null} msSinceScroll={0} progress={0.5} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("RulerCat: markup", () => {
  it("wraps the mini art in a wrapper that faces left and ignores the pointer", () => {
    const { container } = render(<RulerCat state="day" msSinceScroll={0} progress={0.4} />);
    const wrapper = container.querySelector<HTMLElement>(".ruler-cat");
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute("data-facing", "left");
    expect(wrapper).toHaveClass("pointer-events-none");
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(wrapper?.querySelector("svg.cat-art")).not.toBeNull();
  });

  it("never flips or moves a cat-* part itself: no transform attribute anywhere in the drawing", () => {
    for (const pose of ["type", "sit", "groom", "sleep", "nap"] as const) {
      const state = pose === "sleep" ? "night" : "day";
      const progress = pose === "nap" ? 0.99 : 0.4;
      const { container, unmount } = render(<RulerCat state={state} msSinceScroll={pose === "groom" ? 2000 : 0} progress={progress} />);
      expect(container.querySelector("svg [transform]")).toBeNull();
      expect(container.querySelector(".cat-art")).not.toHaveAttribute("transform");
      unmount();
    }
  });
});

describe("cat.css: the mini (ruler cat) rules", () => {
  const raw = readFileSync("src/components/cat/cat.css", "utf8");
  const start = raw.indexOf("MINI-CAT-RULES");
  const mini = raw.slice(start).replace(/\/\*[\s\S]*?\*\//g, "");

  it("has a marked mini section", () => {
    expect(start).toBeGreaterThan(0);
    expect(mini).toContain(".ruler-cat");
  });

  it("flips the facing on the wrapper and counter-flips the z's so they stay readable", () => {
    expect(mini).toMatch(/\.ruler-cat\s*\{[^}]*transform:\s*scaleX\(-1\)/);
    expect(mini).toMatch(/\.ruler-cat\s+\.cat-zzz\s*>\s*g\s*\{[^}]*transform:\s*scaleX\(-1\)/);
    // No cat part is flipped itself.
    for (const part of ["head", "eye", "ear-l", "ear-r", "tail", "paw-l", "paw-r", "screen", "body"]) {
      expect(mini).not.toMatch(new RegExp(`\\.cat-${part}\\s*\\{[^}]*scaleX`));
    }
  });

  it("takes no pointer events and fits the 40 px rail lane in whole pixels", () => {
    expect(mini).toMatch(/\.ruler-cat\s*\{[^}]*pointer-events:\s*none/);
    expect(mini).toMatch(/\.ruler-cat\s+\.cat-art\s*\{[^}]*width:\s*32px[^}]*height:\s*32px/);
  });

  it("animates in steps only: no easing curves, gradients or transitions", () => {
    expect(mini).not.toMatch(/\b(ease|ease-in|ease-out|ease-in-out|linear|cubic-bezier)\b/);
    expect(mini).not.toMatch(/gradient\(/);
    expect(mini).not.toMatch(/\btransition\s*:/);
    const animations = mini.match(/\banimation\s*:[^;]+;/g) ?? [];
    expect(animations.length).toBeGreaterThan(6);
    for (const rule of animations) {
      if (/none/.test(rule)) continue;
      expect(rule, rule).toMatch(/steps\(/);
    }
  });

  it("moves only by whole cells (a --cu or --hu multiple, never a loose pixel count) and animates only transform and opacity", () => {
    for (const [, body] of mini.matchAll(/@keyframes\s+[\w-]+\s*\{([\s\S]*?\n\})/g)) {
      for (const declaration of (body ?? "").matchAll(/([\w-]+)\s*:\s*([^;}]+)[;}]/g)) {
        const [, property] = declaration;
        if (property && /^\d|^from$|^to$/.test(property)) continue;
        expect(["transform", "opacity"], `${property}`).toContain(property);
      }
    }
    const moves = mini.match(/translate[XY]?\([^)]*\)/g) ?? [];
    expect(moves.length).toBeGreaterThan(5);
    for (const move of moves) {
      if (/^translate[XY]?\(0(, 0)?\)$/.test(move)) continue;
      expect(move, move).toMatch(/var\(--(cu|hu)\)/);
      expect(move).not.toMatch(/\d+px/);
    }
    expect(mini).not.toMatch(/rotate\(/);
  });

  it("has a loop for every pose and tolerates poses that lack a part (no :has, no required child)", () => {
    for (const pose of ["type", "sit", "groom", "sleep", "nap"]) {
      expect(mini, pose).toMatch(new RegExp(`\\.cat-art\\[data-pose="${pose}"\\]`));
    }
    expect(mini).not.toMatch(/:has\(/);
  });

  it("switches every mini animation off under reduced motion, leaving a static pose per data-pose", () => {
    const at = mini.lastIndexOf("@media (prefers-reduced-motion: reduce)");
    expect(at).toBeGreaterThan(-1);
    const block = mini.slice(at);
    expect(block).toContain("animation: none !important");
    for (const selector of [".ruler-cat-hop", ".ruler-cat .cat-art", ".ruler-cat .cat-art *"]) {
      expect(block).toContain(selector);
    }
  });
});
