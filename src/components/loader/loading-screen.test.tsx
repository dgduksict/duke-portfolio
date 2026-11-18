import { readFileSync } from "node:fs";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoadingScreen } from "@/components/loader/loading-screen";
import { useLoaderDone } from "@/components/loader/use-loader-done";
import { dictionaries } from "@/lib/i18n";
import { displayedProgress, LOADER } from "@/lib/loader";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

const root = document.documentElement;
const BLOCKS = 20;
const FRAME_MS = 16;

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

function stallLoad() {
  vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
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

  it("shows the cat awake by day and asleep when the sky phase is night", () => {
    setMarker("on");
    window.history.replaceState(null, "", "/?time=13:00");
    const day = render(<LoadingScreen />);
    expect(day.container.querySelector(".cat-art")).toHaveAttribute("data-state", "day");
    day.unmount();

    setMarker("on");
    window.history.replaceState(null, "", "/?time=01:30");
    const night = render(<LoadingScreen />);
    expect(night.container.querySelector(".cat-art")).toHaveAttribute("data-state", "night");
  });

  it("stands the cat in the window's cat slot on the sill, in a window and sill without the room", () => {
    setMarker("on");
    window.history.replaceState(null, "", "/?time=13:00");
    const { container } = render(<LoadingScreen />);
    const scene = container.querySelector(".loader .scene");
    expect(scene).not.toBeNull();
    expect(scene?.querySelector(".scene-sill")).not.toBeNull();
    expect(scene?.querySelector("[data-cat-slot] .cat-art")).toHaveAttribute("data-state", "day");
    expect(container.querySelector("[data-header-zone]")).toBeNull();
    expect(container.querySelector(".scene-left, .scene-right, .scene-radiator, .scene-wainscot")).toBeNull();
  });

  it("shows the live pixel sky for the previewed time", () => {
    setMarker("on");
    window.history.replaceState(null, "", "/?time=01:30");
    const night = render(<LoadingScreen />);
    expect(night.container.querySelector(".scene-sky")).toHaveAttribute("data-phase", "night");
    expect(night.container.querySelector("[data-star]")).not.toBeNull();
    night.unmount();

    setMarker("on");
    window.history.replaceState(null, "", "/?time=13:00");
    const day = render(<LoadingScreen />);
    expect(day.container.querySelector(".scene-sky")).toHaveAttribute("data-phase", "day");
    expect(day.container.querySelector("[data-sun]")).not.toBeNull();
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
    for (const target of [200, 450, 800, 1100]) {
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
    // Fonts are a third of the signals: the bar waits two thirds of the way.
    expect(filledBlocks(container)).toBe(Math.floor((2 / 3) * BLOCKS));
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
