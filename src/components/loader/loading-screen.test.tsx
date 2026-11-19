import { readFileSync } from "node:fs";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoadingScreen } from "@/components/loader/loading-screen";
import { useLoaderDone } from "@/components/loader/use-loader-done";
import { dictionaries } from "@/lib/i18n";
import { displayedProgress, LOADER } from "@/lib/loader";
import { YARN } from "@/lib/yarn";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

const root = document.documentElement;
const BLOCKS = 20;
const FRAME_MS = 16;
/** The overlay leaves the DOM this long after it starts to leave (loading-screen.tsx). */
const REMOVE_AFTER_MS = 1000;

/** How many of the progress blocks are marked on. */
const filledBlocks = (container: HTMLElement) =>
  container.querySelectorAll('[data-loader-block][data-on="true"]').length;

function setMarker(value: string | null) {
  if (value === null) delete root.dataset.loader;
  else root.dataset.loader = value;
}

function reduceMotion() {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

/** Stands in for a font that never loads. */
function hangFonts() {
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: new Promise<void>(() => undefined) },
  });
}

/** Stands in for a window load that has not happened; the returned spy can let it happen. */
function stallLoad() {
  return vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
}

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-10-05T03:00:00Z") });
  setMarker(null);
  root.style.overflow = "";
  window.sessionStorage.clear();
  window.history.replaceState(null, "", "/");
  resetPortfolioStore();
});

afterEach(() => {
  vi.useRealTimers();
  setMarker(null);
  root.style.overflow = "";
  Reflect.deleteProperty(document, "fonts");
});

describe("LoadingScreen", () => {
  it("is hidden in the server markup: aria-hidden, idle, an empty status region outside it", () => {
    const host = document.createElement("div");
    host.innerHTML = renderToString(<LoadingScreen />);
    const overlay = host.querySelector(".loader");
    expect(overlay).toHaveAttribute("data-phase", "idle");
    expect(overlay).toHaveAttribute("aria-hidden", "true");
    expect(overlay).toHaveAttribute("data-print", "hide");
    // The live region is outside the hidden layer and empty, so the later label is announced reliably.
    const status = host.querySelector('[role="status"]');
    expect(status).not.toBeNull();
    expect(status).toHaveTextContent("");
    expect(overlay?.contains(status)).toBe(false);
  });

  it("locks nothing and mounts nothing when the gate has not marked the page", () => {
    const { container } = render(<LoadingScreen />);
    expect(root.style.overflow).toBe("");
    expect(window.sessionStorage.getItem(LOADER.sessionKey)).toBeNull();
    expect(root.dataset.loader).toBeUndefined();
    act(() => {
      vi.advanceTimersByTime(LOADER.maxMs + 2000);
    });
    expect(root.style.overflow).toBe("");
    expect(container.querySelector(".loader")).not.toBeInTheDocument();
  });

  it("ends a repeat visit with the overlay unmounted and no timers left", () => {
    window.sessionStorage.setItem(LOADER.sessionKey, "1");
    const { container } = render(<LoadingScreen />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    expect(root.dataset.loader).toBeUndefined();
    expect(root.style.overflow).toBe("");
  });

  it("unmounts when the gate's safety release already marked the page done", () => {
    setMarker("done");
    const { container } = render(<LoadingScreen />);
    expect(container).toBeEmptyDOMElement();
    expect(vi.getTimerCount()).toBe(0);
    expect(root.dataset.loader).toBe("done");
  });

  it("takes over a first visit: session key set, scroll locked, an English status label", () => {
    setMarker("on");
    const { container } = render(<LoadingScreen />);
    expect(window.sessionStorage.getItem(LOADER.sessionKey)).not.toBeNull();
    expect(root.style.overflow).toBe("hidden");
    expect(root.dataset.loader).toBe("run");
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    const overlay = container.querySelector(".loader");
    expect(overlay).toHaveAttribute("data-phase", "run");
    expect(overlay).not.toHaveAttribute("aria-hidden");
    expect(overlay).toHaveAttribute("data-print", "hide");
    // Pinned to the night tokens by the shared dark block, not a copy of them.
    expect(overlay).toHaveClass("loader", "dark");
    // The live region sits outside the overlay, so it is never inside an aria-hidden layer.
    expect(overlay?.contains(screen.getByRole("status"))).toBe(false);
    // The percent is the only visible text and is hidden from assistive tech.
    expect(container.querySelector("[data-loader-percent]")).toHaveAttribute("aria-hidden", "true");
  });

  it("shows no window scene", () => {
    setMarker("on");
    const { container } = render(<LoadingScreen />);
    expect(container.querySelector(".loader .scene")).toBeNull();
    // The yarn stage stands directly on the bar instead: before the meter, in the overlay.
    const stage = container.querySelector(".loader > .yarn-stage");
    expect(stage).not.toBeNull();
    expect(stage?.nextElementSibling).toHaveClass("loader-meter");
  });

  it("picks a yarn colour and ending on the client", () => {
    const host = document.createElement("div");
    host.innerHTML = renderToString(<LoadingScreen />);
    const idle = host.querySelector(".loader");
    expect(idle).not.toHaveAttribute("data-yarn-colour");
    expect(idle).not.toHaveAttribute("data-yarn-ending");

    vi.spyOn(Math, "random").mockReturnValueOnce(0.5).mockReturnValueOnce(0.99);
    setMarker("on");
    const { container } = render(<LoadingScreen />);
    const overlay = container.querySelector(".loader");
    expect(overlay).toHaveAttribute("data-yarn-colour", "rose");
    expect(overlay).toHaveAttribute("data-yarn-ending", "sit");
  });

  it("moves the ball and cat with the lit blocks", () => {
    setMarker("on");
    // The load event never comes: the bar stops at half, ten lit blocks.
    stallLoad();
    const { container } = render(<LoadingScreen />);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(filledBlocks(container)).toBe(10);
    const stage = container.querySelector<HTMLElement>(".yarn-stage");
    expect(stage?.style.getPropertyValue("--ball")).toBe("10");
    expect(stage?.style.getPropertyValue("--cat")).toBe("6");
  });

  it("crouches when progress stalls and runs again when it moves", () => {
    setMarker("on");
    // Neither signal: the bar holds at no blocks from the first frame on.
    hangFonts();
    const load = stallLoad();
    const { container } = render(<LoadingScreen />);
    const overlay = container.querySelector(".loader");
    expect(overlay).toHaveAttribute("data-yarn-motion", "run");
    act(() => {
      vi.advanceTimersByTime(YARN.stallMs - 100);
    });
    expect(overlay).toHaveAttribute("data-yarn-motion", "run");
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(filledBlocks(container)).toBe(0);
    expect(overlay).toHaveAttribute("data-yarn-motion", "stall");
    // The page loads: half the signals are in, new blocks light, and the chase is back on.
    load.mockReturnValue("complete");
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(filledBlocks(container)).toBeGreaterThan(0);
    expect(overlay).toHaveAttribute("data-yarn-motion", "run");
  });

  it("plays the ending for YARN.endingMs before the wipe", () => {
    setMarker("on");
    const { container } = render(<LoadingScreen />);
    const overlay = container.querySelector(".loader");
    act(() => {
      vi.advanceTimersByTime(LOADER.minMs + 20);
    });
    expect(filledBlocks(container)).toBe(BLOCKS);
    expect(overlay).toHaveAttribute("data-yarn-motion", "end");
    expect(overlay).toHaveAttribute("data-phase", "run");
    act(() => {
      vi.advanceTimersByTime(YARN.endingMs - 50);
    });
    expect(overlay).toHaveAttribute("data-phase", "run");
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(overlay).toHaveAttribute("data-phase", "exit");
  });

  it("skips the ending when forced to finish at maxMs", () => {
    root.style.overflow = "scroll";
    setMarker("on");
    hangFonts();
    stallLoad();
    const { container } = render(<LoadingScreen />);
    const overlay = container.querySelector(".loader");
    expect(overlay).not.toBeNull();
    const seen = new MutationObserver(() => undefined);
    seen.observe(overlay as Element, { attributes: true, attributeFilter: ["data-yarn-motion"], attributeOldValue: true });
    const motions = () => [
      ...seen.takeRecords().map((record) => record.oldValue),
      overlay?.getAttribute("data-yarn-motion"),
    ];
    const history: (string | null | undefined)[] = [];

    act(() => {
      vi.advanceTimersByTime(LOADER.maxMs - 1);
    });
    expect(overlay).toHaveAttribute("data-phase", "run");
    history.push(...motions());
    act(() => {
      vi.advanceTimersByTime(1);
    });
    // Forced: the bar is full and the wipe starts at once, without an ending.
    history.push(...motions());
    expect(filledBlocks(container)).toBe(BLOCKS);
    expect(overlay).toHaveAttribute("data-phase", "exit");
    act(() => {
      vi.advanceTimersByTime(REMOVE_AFTER_MS);
    });
    history.push(...motions());
    seen.disconnect();
    expect(history).not.toContain("end");
    expect(container.querySelector(".loader")).not.toBeInTheDocument();
    expect(root.style.overflow).toBe("scroll");
    expect(root.dataset.loader).toBe("done");
  });

  it("keeps still under reduced motion", () => {
    reduceMotion();
    setMarker("on");
    const { container } = render(<LoadingScreen />);
    const overlay = container.querySelector(".loader");
    const stage = container.querySelector<HTMLElement>(".yarn-stage");
    expect(overlay).toHaveAttribute("data-yarn-motion", "still");
    // From one lit block (the ball still at its start) to most of the bar.
    for (const step of [20, 80, 150, 150]) {
      act(() => {
        vi.advanceTimersByTime(step);
      });
      expect(overlay).toHaveAttribute("data-yarn-motion", "still");
      const filled = filledBlocks(container);
      expect(stage?.style.getPropertyValue("--ball"), `${filled} lit`).toBe(String(Math.max(filled, YARN.ballStart)));
    }
    // Full and then leaving: still no ending.
    act(() => {
      vi.advanceTimersByTime(LOADER.reducedMinMs);
    });
    expect(filledBlocks(container)).toBe(BLOCKS);
    expect(overlay).toHaveAttribute("data-phase", "exit");
    expect(overlay).toHaveAttribute("data-yarn-motion", "still");
    expect(stage?.style.getPropertyValue("--ball")).toBe(String(BLOCKS));
  });

  it("draws progress as a row of blocks that follows the displayed progress", () => {
    setMarker("on");
    const { container } = render(<LoadingScreen />);
    const bar = container.querySelector("[data-loader-bar]");
    expect(bar).not.toBeNull();
    expect(bar).toHaveAttribute("aria-hidden", "true");
    expect(bar?.querySelectorAll("[data-loader-block]")).toHaveLength(BLOCKS);
    expect(filledBlocks(container)).toBe(0);

    let elapsed = 0;
    let previous = 0;
    // Checkpoints at fractions of the minimum time, the last still short of it, so the bar is partly filled.
    for (const target of [0.15, 0.3, 0.55, 0.8].map((f) => f * LOADER.minMs)) {
      act(() => {
        vi.advanceTimersByTime(target - elapsed);
      });
      elapsed = target;
      // The last frame ran at most one frame before this instant; everything has loaded in jsdom.
      const low = Math.floor(displayedProgress(elapsed - FRAME_MS, 1) * BLOCKS);
      const high = Math.floor(displayedProgress(elapsed, 1) * BLOCKS);
      const filled = filledBlocks(container);
      expect(filled, `at ${elapsed} ms`).toBeGreaterThanOrEqual(low);
      expect(filled, `at ${elapsed} ms`).toBeLessThanOrEqual(high);
      expect(filled).toBeGreaterThanOrEqual(previous);
      previous = filled;
    }
    expect(previous).toBeGreaterThan(0);
    expect(previous).toBeLessThan(BLOCKS);

    // The filled blocks are always the first ones: a bar, not scattered cells.
    const flags = [...container.querySelectorAll("[data-loader-block]")].map(
      (block) => block.getAttribute("data-on") === "true",
    );
    expect(flags.indexOf(false)).toBe(previous);
    expect(flags.slice(previous).every((on) => !on)).toBe(true);

    act(() => {
      vi.advanceTimersByTime(LOADER.minMs);
    });
    expect(filledBlocks(container)).toBe(BLOCKS);
  });

  it("holds the bar back while a signal is missing, then fills it at maxMs", () => {
    setMarker("on");
    hangFonts();
    const { container } = render(<LoadingScreen />);
    act(() => {
      vi.advanceTimersByTime(LOADER.minMs + 500);
    });
    // Fonts are one of the two signals: the bar waits halfway.
    expect(filledBlocks(container)).toBe(Math.floor((1 / 2) * BLOCKS));
    // Just past maxMs (still wiping, not yet removed): the bar is full whatever has not loaded.
    act(() => {
      vi.advanceTimersByTime(LOADER.maxMs - (LOADER.minMs + 500) + 10);
    });
    expect(container.querySelector(".loader")).toHaveAttribute("data-phase", "exit");
    expect(filledBlocks(container)).toBe(BLOCKS);
  });

  it("keeps per-frame progress off the overlay root", () => {
    setMarker("on");
    const { container } = render(<LoadingScreen />);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    const overlay = container.querySelector<HTMLElement>(".loader");
    expect(overlay?.getAttribute("style") ?? "").not.toContain("--loader");
  });

  it("fills the percent as it loads and leaves once it is done", () => {
    setMarker("on");
    const { container } = render(<LoadingScreen />);
    const percent = container.querySelector("[data-loader-percent]");
    act(() => {
      vi.advanceTimersByTime(LOADER.minMs / 2);
    });
    const half = Number.parseInt(percent?.textContent ?? "", 10);
    expect(half).toBeGreaterThan(0);
    expect(half).toBeLessThan(100);
    act(() => {
      vi.advanceTimersByTime(LOADER.minMs);
    });
    expect(percent).toHaveTextContent("100%");
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(root.dataset.loader).toBe("done");
    expect(root.style.overflow).toBe("");
    expect(container.querySelector(".loader")).not.toBeInTheDocument();
  });

  it("gives up waiting at maxMs even if fonts and the load event never arrive", () => {
    root.style.overflow = "scroll";
    setMarker("on");
    hangFonts();
    stallLoad();
    render(<LoadingScreen />);
    expect(root.style.overflow).toBe("hidden");
    act(() => {
      vi.advanceTimersByTime(LOADER.maxMs - 100);
    });
    expect(root.dataset.loader).not.toBe("done");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(root.dataset.loader).toBe("done");
    expect(root.style.overflow).toBe("scroll");
  });

  it("releases everything when it unmounts mid-load", () => {
    root.style.overflow = "auto";
    setMarker("on");
    const { unmount } = render(<LoadingScreen />);
    expect(root.style.overflow).toBe("hidden");
    const pending = vi.getTimerCount();
    expect(pending).toBeGreaterThan(0);
    unmount();
    expect(root.style.overflow).toBe("auto");
    expect(root.dataset.loader).toBe("done");
    expect(vi.getTimerCount()).toBe(0);
    const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
    act(() => {
      vi.advanceTimersByTime(LOADER.maxMs + 2000);
    });
    expect(errors).not.toHaveBeenCalled();
    expect(root.style.overflow).toBe("auto");
  });

  it("still loads when sessionStorage throws", () => {
    setMarker("on");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(window.sessionStorage, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => render(<LoadingScreen />)).not.toThrow();
    expect(root.style.overflow).toBe("hidden");
    act(() => {
      vi.advanceTimersByTime(LOADER.maxMs + 2000);
    });
    expect(root.dataset.loader).toBe("done");
    expect(root.style.overflow).toBe("");
  });

  it("releases the scroll and does not strand the marker when the setup throws", () => {
    root.style.overflow = "auto";
    setMarker("on");
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => {
      throw new Error("no frames");
    });
    const { container } = render(<LoadingScreen />);
    expect(root.style.overflow).toBe("auto");
    expect(root.dataset.loader).toBe("done");
    expect(container.querySelector(".loader")).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("still loads with full motion when matchMedia throws", () => {
    setMarker("on");
    vi.spyOn(window, "matchMedia").mockImplementation(() => {
      throw new Error("no matchMedia");
    });
    const { container } = render(<LoadingScreen />);
    expect(container.querySelector(".loader")).toHaveAttribute("data-motion", "full");
    expect(root.dataset.loader).toBe("run");
    expect(root.style.overflow).toBe("hidden");
  });

  it("is quick with reduced motion and fades instead of wiping", () => {
    reduceMotion();
    setMarker("on");
    const { container } = render(<LoadingScreen />);
    expect(container.querySelector(".loader")).toHaveAttribute("data-motion", "reduced");
    act(() => {
      vi.advanceTimersByTime(LOADER.reducedMinMs - 50);
    });
    expect(container.querySelector(".loader")).toHaveAttribute("data-phase", "run");
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(container.querySelector(".loader")).toHaveAttribute("data-phase", "exit");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(root.dataset.loader).toBe("done");
    expect(root.style.overflow).toBe("");
    expect(container.querySelector(".loader")).not.toBeInTheDocument();
  });

  it("labels the status in Mongolian", () => {
    usePortfolioStore.getState().setLanguage("mn");
    setMarker("on");
    render(<LoadingScreen />);
    expect(screen.getByRole("status")).toHaveTextContent(dictionaries.mn.loader.label);
    expect(dictionaries.mn.loader.label).toBe("Ачаалж байна");
  });
});

describe("loader.css", () => {
  const css = readFileSync("src/components/loader/loader.css", "utf8");
  const code = css.replace(/\/\*[\s\S]*?\*\//g, "");

  it("draws with hard pixels only: no easing curves, gradients, rounding or blur", () => {
    expect(code).not.toMatch(/\bease/);
    expect(code).not.toMatch(/\blinear\b/);
    expect(code).not.toMatch(/cubic-bezier/);
    expect(code).not.toMatch(/gradient\(/);
    expect(code).not.toMatch(/border-radius:\s*(?!0\s*;)/);
    expect(code).not.toMatch(/blur/);
    // Any shadow is a hard offset: its third length (the blur radius) is 0.
    for (const [, value] of code.matchAll(/box-shadow:([^;]+);/g)) {
      for (const shadow of (value ?? "").split(/,(?![^(]*\))/)) {
        const lengths = shadow
          .trim()
          .split(/\s+(?![^(]*\))/)
          .filter((part) => /^-?[\d.]/.test(part) || part.startsWith("calc("));
        expect(lengths[2] ?? "0", shadow).toMatch(/^0(px)?$/);
      }
    }
  });

  it("moves in steps only", () => {
    const motions = [...code.matchAll(/(?:animation|transition):([^;]+);/g)].map((m) => m[1] ?? "");
    expect(motions.length).toBeGreaterThan(0);
    for (const value of motions) expect(value).toMatch(/steps\(|^\s*none\s*$/);
  });

  it("locks the page before hydration and is hidden without the marker", () => {
    expect(code).toMatch(/html\[data-loader="on"\]\s*\{[^}]*overflow:\s*hidden/);
    expect(code).toMatch(/\.loader\s*\{[^}]*display:\s*none/);
  });

  it("does not repeat the night tokens: the overlay wears the shared .dark block", () => {
    expect(code).not.toMatch(/--ground:|--ink:|--ink-soft:|--accent:|--rule:/);
  });

  it("lights the blocks in the yarn's colour, one fill and shade pair per yarn", () => {
    expect(code).toMatch(/\.loader-block\[data-on="true"\]\s*\{[^}]*background-color:\s*var\(--cat-yarn\)/);
    for (const colour of ["amber", "rose", "sky"]) {
      const rule = new RegExp(`\\[data-yarn-colour="${colour}"\\][^{]*\\{([^}]*)\\}`).exec(code);
      expect(rule, colour).not.toBeNull();
      expect(rule?.[1], colour).toMatch(/--cat-yarn:\s*#[0-9a-f]{6};/);
      expect(rule?.[1], colour).toMatch(/--cat-yarn-shade:\s*#[0-9a-f]{6};/);
    }
    // Amber is the cat's own default pair (cat.css).
    expect(code).toMatch(/\[data-yarn-colour="amber"\][^{]*\{[^}]*--cat-yarn:\s*#e9a420;[^}]*--cat-yarn-shade:\s*#b9770f;/);
  });

  it("has no window scene left in it", () => {
    expect(code).not.toMatch(/\.scene\b/);
    expect(code).not.toMatch(/data-cat-slot/);
  });
});

describe("useLoaderDone", () => {
  it("is true with no marker, false while it is on, true once it is done", async () => {
    vi.useRealTimers();
    const { result } = renderHook(() => useLoaderDone());
    expect(result.current).toBe(true);
    act(() => setMarker("on"));
    await waitFor(() => expect(result.current).toBe(false));
    act(() => setMarker("run"));
    await waitFor(() => expect(result.current).toBe(false));
    act(() => setMarker("done"));
    await waitFor(() => expect(result.current).toBe(true));
  });

  it("starts false when the page is already marked", () => {
    setMarker("on");
    const { result } = renderHook(() => useLoaderDone());
    expect(result.current).toBe(false);
  });
});
