import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoadingScreen } from "@/components/loader/loading-screen";
import { useLoaderDone } from "@/components/loader/use-loader-done";
import { LOADER } from "@/lib/loader";
import { dictionaries } from "@/lib/i18n";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

const root = document.documentElement;

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
  it("stays hidden and locks nothing when the gate has not marked the page", () => {
    const { container } = render(<LoadingScreen />);
    const overlay = container.querySelector(".loader");
    expect(overlay).toHaveAttribute("data-phase", "idle");
    expect(overlay).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(root.style.overflow).toBe("");
    expect(window.sessionStorage.getItem(LOADER.sessionKey)).toBeNull();
    act(() => {
      vi.advanceTimersByTime(LOADER.maxMs + 2000);
    });
    expect(root.style.overflow).toBe("");
    expect(container.querySelector(".loader")).toBeInTheDocument();
  });

  it("takes over a first visit: session key set, scroll locked, an English status label", () => {
    setMarker("on");
    const { container } = render(<LoadingScreen />);
    expect(window.sessionStorage.getItem(LOADER.sessionKey)).not.toBeNull();
    expect(root.style.overflow).toBe("hidden");
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    const overlay = container.querySelector(".loader");
    expect(overlay).toHaveAttribute("data-phase", "run");
    expect(overlay).not.toHaveAttribute("aria-hidden");
    expect(overlay).toHaveAttribute("data-print", "hide");
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

  it("is quick with reduced motion and fades instead of lifting", () => {
    reduceMotion();
    setMarker("on");
    const { container } = render(<LoadingScreen />);
    // No draw animation: the line is drawn in full from the start.
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
