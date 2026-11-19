import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reveal } from "@/components/reveal/reveal";
import { Section } from "@/components/ui/section";
import { REVEAL } from "@/lib/reveal";

const root = document.documentElement;

/** A stand-in IntersectionObserver that records what it watches and lets a test deliver entries. */
class MockObserver {
  static instances: MockObserver[] = [];
  readonly observed = new Set<Element>();
  disconnected = false;

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    MockObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observed.add(element);
  }

  unobserve(element: Element) {
    this.observed.delete(element);
  }

  disconnect() {
    this.observed.clear();
    this.disconnected = true;
  }

  takeRecords() {
    return [];
  }

  /** Delivers entries: `top`/`bottom` stand for the block's rect in the viewport. */
  fire(entries: { target: Element; isIntersecting: boolean; top: number; bottom?: number }[]) {
    this.callback(
      entries.map(({ target, isIntersecting, top, bottom = top + 100 }) => ({
        target,
        isIntersecting,
        boundingClientRect: { top, bottom, left: 0 },
      })) as unknown as IntersectionObserverEntry[],
      this as unknown as IntersectionObserver,
    );
  }
}

const live = () => MockObserver.instances.filter((o) => !o.disconnected);

function Blocks({ count, label = "block" }: { count: number; label?: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} {...reveal} data-testid={`b${i}`}>
          {label} {i}
        </div>
      ))}
    </>
  );
}

const block = (i: number) => screen.getByTestId(`b${i}`);

/** Where each block sits for the observer's sweep (jsdom has no layout): below the viewport unless a test moves it. */
const rects = new Map<Element, number>();
const placeAt = (element: Element, top: number) => rects.set(element, top);

beforeEach(() => {
  rects.clear();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const top = rects.get(this) ?? 2000;
    return { top, bottom: top + 100, left: 0, right: 100, width: 100, height: 100, x: 0, y: top } as DOMRect;
  });
  MockObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", MockObserver);
  root.dataset.reveal = "on";
  delete window.__revealLive;
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete root.dataset.reveal;
  delete window.__revealLive;
});

describe("reveal (gate on)", () => {
  it("hands every block to one shared observer, hidden until it comes into view, and confirms the gate", () => {
    render(<Blocks count={3} />);
    expect(live()).toHaveLength(1);
    const observer = live()[0]!;
    expect(observer.options?.rootMargin).toBe(REVEAL.rootMargin);
    expect(observer.observed.size).toBe(3);
    for (const i of [0, 1, 2]) {
      expect(block(i)).toHaveAttribute("data-reveal");
      expect(block(i)).not.toHaveAttribute("data-revealed");
    }
    expect(window.__revealLive).toBe(true);
  });

  it("reveals blocks that come into view, staggered top to bottom, and stops watching them", () => {
    render(<Blocks count={3} />);
    const observer = live()[0]!;
    observer.fire([
      { target: block(1), isIntersecting: true, top: 400 },
      { target: block(0), isIntersecting: true, top: 100 },
      { target: block(2), isIntersecting: false, top: 1400 },
    ]);
    expect(block(0)).toHaveAttribute("data-revealed");
    expect(block(0).style.getPropertyValue("--reveal-delay")).toBe("");
    expect(block(1)).toHaveAttribute("data-revealed");
    expect(block(1).style.getPropertyValue("--reveal-delay")).toBe("80ms");
    expect(block(2)).not.toHaveAttribute("data-revealed");
    expect([...observer.observed]).toEqual([block(2)]);
  });

  it("never staggers a group by more than 240 ms", () => {
    render(<Blocks count={6} />);
    live()[0]!.fire([0, 1, 2, 3, 4, 5].map((i) => ({ target: block(i), isIntersecting: true, top: i * 50 })));
    expect([0, 1, 2, 3, 4, 5].map((i) => block(i).style.getPropertyValue("--reveal-delay"))).toEqual([
      "",
      "80ms",
      "160ms",
      "240ms",
      "240ms",
      "240ms",
    ]);
  });

  it("reveals at once, without delay, a block already above the viewport", () => {
    render(<Blocks count={2} />);
    live()[0]!.fire([
      { target: block(0), isIntersecting: false, top: -900, bottom: -700 },
      { target: block(1), isIntersecting: true, top: 200 },
    ]);
    expect(block(0)).toHaveAttribute("data-revealed");
    expect(block(0).style.getPropertyValue("--reveal-delay")).toBe("");
    // The first block in view still starts at once: the one above does not count towards the stagger.
    expect(block(1).style.getPropertyValue("--reveal-delay")).toBe("");
  });

  it("shows the blocks a jump carried past the viewport the next time the observer reports anything", () => {
    render(<Blocks count={3} />);
    // A jump to the end: blocks 0 and 1 went from below the viewport to above it without crossing it (no entry).
    placeAt(block(0), -3000);
    placeAt(block(1), -1500);
    placeAt(block(2), 200);
    live()[0]!.fire([{ target: block(2), isIntersecting: true, top: 200 }]);
    for (const i of [0, 1, 2]) expect(block(i)).toHaveAttribute("data-revealed");
    expect(block(0).style.getPropertyValue("--reveal-delay")).toBe("");
  });

  it("drops the observer once every block has revealed", () => {
    render(<Blocks count={2} />);
    const observer = live()[0]!;
    observer.fire([
      { target: block(0), isIntersecting: true, top: 0 },
      { target: block(1), isIntersecting: true, top: 200 },
    ]);
    expect(observer.disconnected).toBe(true);
  });

  it("disconnects on unmount and starts afresh on the next mount (a trip to the 404 page and back)", () => {
    const first = render(<Blocks count={2} />);
    const observer = live()[0]!;
    first.unmount();
    expect(observer.disconnected).toBe(true);
    expect(observer.observed.size).toBe(0);

    render(<Blocks count={2} />);
    expect(live()).toHaveLength(1);
    expect(live()[0]).not.toBe(observer);
    expect(live()[0]!.observed.size).toBe(2);
  });

  it("survives StrictMode's double mount: each block watched once, nothing left after unmount", () => {
    const { unmount } = render(
      <StrictMode>
        <Blocks count={2} />
      </StrictMode>,
    );
    expect(live()).toHaveLength(1);
    expect(live()[0]!.observed.size).toBe(2);
    unmount();
    expect(live()).toHaveLength(0);
  });

  it("keeps a revealed block revealed through a re-render (a language or theme switch), without replaying it", () => {
    const { rerender } = render(<Blocks count={2} />);
    const observer = live()[0]!;
    observer.fire([{ target: block(0), isIntersecting: true, top: 0 }]);
    rerender(<Blocks count={2} label="блок" />);
    expect(block(0)).toHaveTextContent("блок 0");
    expect(block(0)).toHaveAttribute("data-revealed");
    expect(observer.observed.has(block(0))).toBe(false);
    expect(MockObserver.instances).toHaveLength(1);
  });
});

describe("reveal (gate off)", () => {
  it("never hides anything when the gate is absent: blocks are revealed at once, nothing is observed", () => {
    delete root.dataset.reveal;
    render(<Blocks count={2} />);
    expect(block(0)).toHaveAttribute("data-revealed");
    expect(block(1)).toHaveAttribute("data-revealed");
    expect(MockObserver.instances).toHaveLength(0);
    expect(window.__revealLive).toBeUndefined();
  });

  it("reveals at once when IntersectionObserver is missing, even with the gate on", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Blocks count={1} />);
    expect(block(0)).toHaveAttribute("data-revealed");
  });
});

describe("where it is used", () => {
  it("reveals a section title's words, never the sticky h2 itself", () => {
    render(
      <Section id="demo" title="Demo">
        <p>body</p>
      </Section>,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "Demo" });
    expect(heading).toHaveClass("lg:sticky");
    expect(heading).not.toHaveAttribute("data-reveal");
    // (html carries the gate's own data-reveal="on"; the blocks are its descendants.)
    expect(heading.closest("body [data-reveal]")).toBeNull();
    const words = heading.querySelector("[data-reveal]");
    expect(words).toHaveTextContent("Demo");
    // A transform does nothing to an inline box: the words are a block.
    expect(words).toHaveClass("block");
  });

  it("is wired into the page: the gate in the layout, the frames in the global CSS, the blocks in the sections", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");
    expect(layout).toMatch(/<RulerGate \/>\s*<RevealGate \/>/);
    expect(readFileSync("src/app/globals.css", "utf8")).toContain('@import "../components/reveal/reveal.css";');
    for (const file of [
      "src/components/sections/experience.tsx",
      "src/components/sections/work.tsx",
      "src/components/sections/stack.tsx",
      "src/components/sections/testimonials.tsx",
      "src/components/sections/contact.tsx",
      "src/components/layout/site-footer.tsx",
      "src/components/ui/section.tsx",
    ]) {
      expect(readFileSync(file, "utf8"), file).toContain("{...reveal}");
    }
    // The hero has its own entrance and the header is fixed chrome: neither reveals.
    for (const file of ["src/components/sections/hero.tsx", "src/components/layout/site-header.tsx"]) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/reveal/);
    }
  });
});

describe("reveal.css", () => {
  /** reveal.css with its comments removed, so the checks read rules, not prose. */
  const css = readFileSync("src/components/reveal/reveal.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  /** The body of the first block that starts with `head`, braces balanced. */
  const block = (head: string) => {
    const start = css.indexOf(head);
    if (start < 0) return "";
    let depth = 0;
    for (let i = css.indexOf("{", start); i < css.length; i += 1) {
      if (css[i] === "{") depth += 1;
      if (css[i] === "}") depth -= 1;
      if (depth === 0) return css.slice(start, i + 1);
    }
    return "";
  };

  it("steps in four frames over 480 ms, both ways filled, only opacity and a three-unit lift, ending on none", () => {
    expect(css).toMatch(/animation:\s*reveal-in 480ms steps\(4, end\) var\(--reveal-delay, 0ms\) both;/);
    const frames = block("@keyframes reveal-in");
    expect(frames).toMatch(/from\s*\{\s*opacity:\s*0;\s*transform:\s*translateY\(calc\(var\(--px\) \* 3\)\);\s*\}/);
    expect(frames).toMatch(/to\s*\{\s*opacity:\s*1;\s*transform:\s*none;\s*\}/);
    const properties = [...frames.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
    expect(new Set(properties)).toEqual(new Set(["opacity", "transform"]));
  });

  it("uses steps alone: no easing curves, transitions, blur, gradients or rounding", () => {
    expect(css).not.toMatch(/\b(ease|ease-in|ease-out|ease-in-out|linear|cubic-bezier)\b/);
    expect(css).not.toMatch(/\btransition\s*:/);
    expect(css).not.toMatch(/\b(blur|drop-shadow)\(|gradient\(|border-radius/);
  });

  it("hides and animates only on screen, with motion welcome, under the gate", () => {
    const gated = block("@media screen and (prefers-reduced-motion: no-preference)");
    expect(gated).toContain('html[data-reveal="on"] [data-reveal]:not([data-revealed])');
    expect(gated).toMatch(/opacity:\s*0;/);
    // Outside that block nothing is ever made invisible or set moving.
    const rest = css.replace(gated, "").replace(block("@keyframes reveal-in"), "");
    expect(rest).not.toMatch(/opacity:\s*0\b/);
    expect(rest).not.toMatch(/animation:\s*reveal-in/);
  });

  it("shows every block, still, under reduced motion and in print", () => {
    const reduced = block("@media (prefers-reduced-motion: reduce)");
    expect(reduced).toMatch(/opacity:\s*1;/);
    expect(reduced).toMatch(/animation:\s*none;/);
    const print = block("@media print");
    expect(print).toMatch(/opacity:\s*1 !important;/);
    expect(print).toMatch(/animation:\s*none !important;/);
  });
});
