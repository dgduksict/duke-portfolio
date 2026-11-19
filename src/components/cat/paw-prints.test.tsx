import { readFileSync } from "node:fs";
import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PawPrints } from "@/components/cat/paw-prints";
import { PAWS } from "@/lib/cat";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

const css = readFileSync("src/components/cat/cat.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

function setReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

/** A real mouse click: a pointer click always has a position and a detail of 1 (a keyboard one has neither). */
function click(target: Element | Document, x = 10, y = 10, init: MouseEventInit = {}) {
  fireEvent.click(target, { clientX: x, clientY: y, detail: 1, ...init });
}

const pairs = (container: HTMLElement) => container.querySelectorAll(".paw-pair");
const lefts = (container: HTMLElement) => [...pairs(container)].map((pair) => (pair as HTMLElement).style.left);

beforeEach(() => {
  vi.useFakeTimers();
  route.pathname = "/";
  setReducedMotion(false);
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("PawPrints", () => {
  it("renders an inert, print-hidden layer with no pairs at first", () => {
    const { container } = render(<PawPrints />);
    const layer = container.querySelector(".paw-layer");
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveAttribute("data-print", "hide");
    expect(pairs(container)).toHaveLength(0);
  });

  it("drops a pair of prints where you click", () => {
    const { container } = render(<PawPrints />);
    click(document.body, 100, 200);
    const found = pairs(container);
    expect(found).toHaveLength(1);
    const pair = found[0] as HTMLElement;
    expect(pair.style.left).toBe("100px");
    expect(pair.style.top).toBe("200px");
    expect(pair.querySelectorAll("svg")).toHaveLength(2);
  });

  it("snaps a fractional tap to whole pixels", () => {
    const { container } = render(<PawPrints />);
    click(document.body, 100.6, 200.4);
    const pair = pairs(container)[0] as HTMLElement;
    expect(pair.style.left).toBe("101px");
    expect(pair.style.top).toBe("200px");
  });

  it("draws each print as four-by-four cells", () => {
    const { container } = render(<PawPrints />);
    click(document.body);
    for (const svg of container.querySelectorAll(".paw-pair svg")) {
      expect(svg).toHaveAttribute("viewBox", "0 0 4 4");
      expect(svg.querySelectorAll("rect").length).toBeGreaterThan(0);
    }
  });

  it("keeps at most four pairs, the newest ones", () => {
    const { container } = render(<PawPrints />);
    for (let i = 0; i < 6; i += 1) click(document.body, 10 * (i + 1), 5);
    expect(lefts(container)).toHaveLength(PAWS.maxPairs);
    expect(lefts(container)).toEqual(["30px", "40px", "50px", "60px"]);
  });

  it("never blocks the page: a button and a link still work and nothing is cancelled", () => {
    const spy = vi.fn();
    const { container } = render(
      <>
        <PawPrints />
        <button type="button" onClick={spy}>
          press
        </button>
        <a href="#x">go</a>
      </>,
    );
    const button = container.querySelector("button") as HTMLButtonElement;
    const anchor = container.querySelector("a") as HTMLAnchorElement;

    // fireEvent returns false when something called preventDefault on the (cancelable) click.
    expect(fireEvent.click(button, { clientX: 20, clientY: 20, detail: 1 })).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);

    const seen: boolean[] = [];
    anchor.addEventListener("click", (event) => seen.push(event.defaultPrevented));
    expect(fireEvent.click(anchor, { clientX: 30, clientY: 30, detail: 1 })).toBe(true);
    expect(seen).toEqual([false]);

    // And both clicks still dropped their pairs.
    expect(pairs(container)).toHaveLength(2);
  });

  it("listens passively, so it can never cancel a click", () => {
    const add = vi.spyOn(document, "addEventListener");
    render(<PawPrints />);
    const call = add.mock.calls.find(([type]) => type === "click");
    expect(call?.[2]).toMatchObject({ passive: true });
    add.mockRestore();
  });

  it("takes no pointer: the layer is pointer-events none, above the ruler and below the loader", () => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    try {
      const { container } = render(<PawPrints />);
      const layer = container.querySelector(".paw-layer") as HTMLElement;
      const computed = getComputedStyle(layer);
      expect(computed.pointerEvents).toBe("none");
      expect(computed.position).toBe("fixed");
      expect(computed.zIndex).toBe("45");
    } finally {
      style.remove();
    }
    const rule = /\.paw-layer\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(rule).toMatch(/pointer-events:\s*none/);
    expect(rule).toMatch(/z-index:\s*45/);
  });

  it("fades each pair after a second", () => {
    const { container } = render(<PawPrints />);
    click(document.body);
    expect(pairs(container)).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(PAWS.lifeMs - 1);
    });
    expect(pairs(container)).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(pairs(container)).toHaveLength(0);
  });

  it("fades each pair on its own clock", () => {
    const { container } = render(<PawPrints />);
    click(document.body, 10, 10);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    click(document.body, 20, 20);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(lefts(container)).toEqual(["20px"]);
  });

  it("ignores clicks on the loader, the full ruler and the cat", () => {
    const { container } = render(
      <>
        <PawPrints />
        <div className="loader">
          <span data-testid="in-loader" />
        </div>
        <div className="ruler" data-mode="full">
          <span data-testid="in-ruler" />
        </div>
        <button type="button" className="hero-cat-button">
          <span data-testid="in-cat" />
        </button>
      </>,
    );
    for (const id of ["in-loader", "in-ruler", "in-cat"]) {
      click(container.querySelector(`[data-testid="${id}"]`) as Element, 40, 40);
    }
    click(container.querySelector(".loader") as Element, 40, 40);
    click(container.querySelector(".hero-cat-button") as Element, 40, 40);
    expect(pairs(container)).toHaveLength(0);
  });

  it("still prints over the compact ruler, which takes no clicks", () => {
    const { container } = render(
      <>
        <PawPrints />
        <div className="ruler" data-mode="compact" data-testid="compact" />
      </>,
    );
    click(container.querySelector('[data-testid="compact"]') as Element, 40, 40);
    expect(pairs(container)).toHaveLength(1);
  });

  it("ignores non-primary buttons", () => {
    const { container } = render(<PawPrints />);
    click(document.body, 10, 10, { button: 2 });
    click(document.body, 10, 10, { button: 1 });
    expect(pairs(container)).toHaveLength(0);
  });

  it("ignores a keyboard-made click, which has no position", () => {
    const { container } = render(<PawPrints />);
    fireEvent.click(document.body, { clientX: 0, clientY: 0, detail: 0 });
    expect(pairs(container)).toHaveLength(0);
  });

  it("is off under reduced motion", () => {
    setReducedMotion(true);
    const { container } = render(<PawPrints />);
    click(document.body, 100, 200);
    expect(pairs(container)).toHaveLength(0);
  });

  it("still works when matchMedia throws", () => {
    window.matchMedia = vi.fn(() => {
      throw new Error("no matchMedia");
    }) as unknown as typeof window.matchMedia;
    const { container } = render(<PawPrints />);
    click(document.body, 100, 200);
    expect(pairs(container)).toHaveLength(1);
  });

  it("is off away from the homepage", () => {
    route.pathname = "/missing";
    const { container } = render(<PawPrints />);
    click(document.body, 100, 200);
    expect(container.querySelector(".paw-layer")).toBeNull();
    expect(pairs(container)).toHaveLength(0);
  });

  it("removes its listener, and its timers, on unmount", () => {
    const add = vi.spyOn(document, "addEventListener");
    const remove = vi.spyOn(document, "removeEventListener");
    const { container, unmount } = render(<PawPrints />);
    const added = add.mock.calls.find(([type]) => type === "click");
    expect(added).toBeDefined();
    click(document.body);
    expect(pairs(container)).toHaveLength(1);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(remove).toHaveBeenCalledWith("click", added?.[1]);
    expect(vi.getTimerCount()).toBe(0);
    add.mockRestore();
    remove.mockRestore();
  });
});

describe("cat.css paw rules", () => {
  it("fades in four steps on opacity alone and stands still under reduced motion", () => {
    expect(css).toMatch(/\.paw-pair\s*\{[^}]*animation:[^;}]*1000ms steps\(4,\s*end\)/);
    expect(css).toMatch(/@keyframes paw-fade\s*\{[^}]*opacity/);
    expect(css).not.toMatch(/@keyframes paw-fade\s*\{[^}]*transform/);
    const reduced = /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g;
    expect([...css.matchAll(reduced)].some((block) => block[0].includes(".paw-pair"))).toBe(true);
  });

  it("paints the prints with the page's soft ink at half opacity", () => {
    expect(css).toMatch(/\.paw-pair\s*\{[^}]*opacity:\s*0\.5/);
    expect(css).toMatch(/\.paw-pair rect\s*\{[^}]*fill:\s*var\(--ink-soft\)/);
  });
});
