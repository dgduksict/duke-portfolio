import { readFileSync } from "node:fs";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroCat } from "@/components/cat/hero-cat";
import { useCatState } from "@/components/cat/use-cat-state";
import { WindowScene } from "@/components/scene/window-scene";
import { useNow } from "@/hooks/use-now";
import { PURR, UIIA, WAKE_MS } from "@/lib/cat";
import { dictionaries } from "@/lib/i18n";
import { LANGUAGES } from "@/types";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

const root = document.documentElement;
/** Noon in Ulaanbaatar (day) and midnight there (night), the same instants the sky tests use. */
const DAY = new Date("2026-10-05T04:50:00Z");
const NIGHT = new Date("2026-10-05T16:00:00Z");
const en = dictionaries.en;

/** cat.css with its comments removed, so the checks read rules, not prose. */
const css = readFileSync("src/components/cat/cat.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const heroSource = readFileSync("src/components/cat/hero-cat.tsx", "utf8");

function setLoader(value: string | null) {
  if (value === null) delete root.dataset.loader;
  else root.dataset.loader = value;
}

beforeEach(() => {
  vi.useFakeTimers();
  setLoader(null);
  resetPortfolioStore();
});

afterEach(() => {
  vi.useRealTimers();
  setLoader(null);
});

describe("useCatState", () => {
  it("is null until the time is known", () => {
    expect(renderHook(() => useCatState(null)).result.current).toBeNull();
  });

  it("follows the sky's phase: day at noon, night at midnight", () => {
    expect(renderHook(() => useCatState(DAY)).result.current).toBe("day");
    expect(renderHook(() => useCatState(NIGHT)).result.current).toBe("night");
  });
});

describe("HeroCat", () => {
  it("renders nothing while the time is unknown", () => {
    const { container } = render(<HeroCat now={null} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders nothing while the loading screen is up, then appears the moment it leaves", async () => {
    setLoader("run");
    const { container } = render(<HeroCat now={DAY} />);
    expect(container).toBeEmptyDOMElement();
    await act(async () => {
      setLoader("done");
    });
    expect(screen.getByRole("button", { name: en.cat.label })).toBeInTheDocument();
  });

  it("is a button named by the dictionary, holding a day cat at noon", () => {
    render(<HeroCat now={DAY} />);
    const button = screen.getByRole("button", { name: en.cat.label });
    expect(button).toHaveAttribute("type", "button");
    expect(button.querySelector('svg[data-state="day"]')).not.toBeNull();
    expect(button.querySelector('svg[data-state="night"]')).toBeNull();
  });

  it("holds a sleeping cat at night", () => {
    render(<HeroCat now={NIGHT} />);
    const button = screen.getByRole("button", { name: en.cat.label });
    expect(button.querySelector('svg[data-state="night"]')).not.toBeNull();
    expect(button.querySelector('svg[data-state="day"]')).toBeNull();
  });

  it("only lets the button take the pointer; the wrapper never blocks the page", () => {
    const { container } = render(<HeroCat now={DAY} />);
    expect(container.firstElementChild).toHaveClass("pointer-events-none");
    expect(screen.getByRole("button")).toHaveClass("pointer-events-auto");
  });

  it("shows at every width: no breakpoint hides him (phones get the window, the sill and the cat)", () => {
    const { container } = render(<HeroCat now={DAY} />);
    const wrapper = container.firstElementChild;
    expect(wrapper).not.toHaveClass("hidden");
    expect(wrapper?.className).not.toMatch(/(^|\s)(hidden|[\w[\]-]*:(block|hidden))(\s|$)/);
    expect(heroSource).not.toMatch(/min-\[760px\]/);
  });

  it("stands in the scene's cat slot when mounted as the window scene's child", () => {
    const { container } = render(
      <WindowScene now={DAY}>
        <HeroCat now={DAY} />
      </WindowScene>,
    );
    const slot = container.querySelector("[data-cat-slot]");
    expect(slot).not.toBeNull();
    expect(slot).toContainElement(screen.getByRole("button", { name: en.cat.label }));
    expect(slot).not.toHaveAttribute("aria-hidden");
  });

  it("keeps data-state=night on the sleeping cat: the scene hides its own mug by that mark", () => {
    const { container } = render(
      <WindowScene now={NIGHT}>
        <HeroCat now={NIGHT} />
      </WindowScene>,
    );
    expect(container.querySelector('[data-cat-slot] [data-state="night"]')).not.toBeNull();
    expect(container.querySelector('[data-cat-slot] [data-state="day"]')).toBeNull();
  });

  it("is placed by the slot's static CSS: no measured inline left, top or size, no ridge", () => {
    const { container } = render(<HeroCat now={DAY} />);
    expect(container.querySelectorAll("[style]")).toHaveLength(0);
    expect(heroSource).not.toMatch(/ridge|nearRidgeY|getBoundingClientRect|ANCHOR|NIGHT_SHIFT|fonts\.ready/i);
    expect(heroSource).not.toMatch(/addEventListener\(["']resize/);
  });

  it("speaks from a pixel box: stepped outline class, no radius, blur or shadow utilities", () => {
    render(<HeroCat now={DAY} />);
    const bubble = screen.getByRole("status");
    expect(bubble).toHaveClass("px-box", "hero-cat-bubble");
    expect(bubble.className).not.toMatch(/rounded|blur|shadow-/);
  });

  it("answers a click with the next smug line, rotating through all of them", () => {
    render(<HeroCat now={DAY} />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toBeEmptyDOMElement();

    const quotes = en.cat.quotes;
    const button = screen.getByRole("button");
    // Unhurried pokes (five quick ones are the easter egg, below).
    for (const quote of [...quotes, quotes[0]]) {
      fireEvent.click(button);
      expect(status).toHaveTextContent(quote);
      act(() => {
        vi.advanceTimersByTime(UIIA.windowMs);
      });
    }
  });

  it("says shh at night, not a clean-code line", () => {
    render(<HeroCat now={NIGHT} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("status")).toHaveTextContent(en.cat.sleeping);
  });

  it("speaks Mongolian when the site does", () => {
    usePortfolioStore.getState().setLanguage("mn");
    render(<HeroCat now={DAY} />);
    const mn = dictionaries.mn;
    fireEvent.click(screen.getByRole("button", { name: mn.cat.label }));
    expect(screen.getByRole("status")).toHaveTextContent(mn.cat.quotes[0]);
  });

  it("clears the line after about four seconds, and a fresh click restarts the wait", () => {
    render(<HeroCat now={DAY} />);
    const status = screen.getByRole("status");
    const button = screen.getByRole("button");

    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(status).not.toBeEmptyDOMElement();

    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(status).toHaveTextContent(en.cat.quotes[1]);

    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(status).toBeEmptyDOMElement();
  });

  it("leaves no timer running once it unmounts", () => {
    const { unmount } = render(<HeroCat now={DAY} />);
    fireEvent.click(screen.getByRole("button"));
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(10_000);
      });
    }).not.toThrow();
  });

  describe("the UIIA easter egg", () => {
    /** `count` pokes on his button, `gapMs` apart (the first one now). */
    function pokes(count: number, gapMs = 100) {
      const button = screen.getByRole("button");
      for (let i = 0; i < count; i += 1) {
        if (i > 0) {
          act(() => {
            vi.advanceTimersByTime(gapMs);
          });
        }
        fireEvent.click(button);
      }
    }
    const spinning = (container: HTMLElement) =>
      container.querySelector(".cat-art[data-uiia] .cat-spin") !== null;

    it("keeps today's lines for four quick pokes", () => {
      const { container } = render(<HeroCat now={DAY} />);
      pokes(4);
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.quotes[3]);
      expect(spinning(container)).toBe(false);
      expect(container.firstElementChild).not.toHaveAttribute("data-uiia");
    });

    it("spins on the fifth quick poke, saying UIIA UIIA in the polite status region instead of a line", () => {
      const { container } = render(<HeroCat now={DAY} />);
      pokes(5);
      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-live", "polite");
      expect(status).toHaveTextContent(en.cat.uiia);
      expect(spinning(container)).toBe(true);
      expect(container.firstElementChild).toHaveAttribute("data-uiia", "spin");
      // By day the laptop stays beside him.
      expect(container.querySelector('svg[data-state="day"] [data-layer="laptop"]')).not.toBeNull();
    });

    it("never spins for slow pokes", () => {
      const { container } = render(<HeroCat now={DAY} />);
      pokes(6, 400);
      expect(spinning(container)).toBe(false);
      expect(screen.getByRole("status")).not.toHaveTextContent(en.cat.uiia);
    });

    it("counts in a sliding window: the poke that brings five into 1.5 s starts it", () => {
      const { container } = render(<HeroCat now={DAY} />);
      pokes(5, 375); // 0 .. 1500: the first is 1500 ms old by the fifth, so only four count
      expect(spinning(container)).toBe(false);
      act(() => {
        vi.advanceTimersByTime(200);
      });
      fireEvent.click(screen.getByRole("button")); // 1700: the pokes from 375 on, plus this one
      expect(spinning(container)).toBe(true);
    });

    it("settles back into his pose after the spin, and the box clears", () => {
      const { container } = render(<HeroCat now={DAY} />);
      pokes(5);
      act(() => {
        vi.advanceTimersByTime(UIIA.durationMs - 1);
      });
      expect(spinning(container)).toBe(true);
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(spinning(container)).toBe(false);
      expect(container.firstElementChild).not.toHaveAttribute("data-uiia");
      expect(container.querySelector('svg[data-state="day"]')).not.toBeNull();
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });

    it("ignores pokes while he spins: no extension, no second spin, and the count starts over after", () => {
      const { container } = render(<HeroCat now={DAY} />);
      pokes(5);
      pokes(7, 100); // 600 ms of pokes during the spin
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.uiia);
      act(() => {
        vi.advanceTimersByTime(UIIA.durationMs - 600);
      });
      expect(spinning(container)).toBe(false);
      // The next poke is an ordinary one: the line after the four he said before the spin.
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.quotes[0]);
      expect(spinning(container)).toBe(false);
    });

    it("wakes the sleeping cat to spin by night, beside his mug, then lets him sleep again", () => {
      const { container } = render(<HeroCat now={NIGHT} />);
      pokes(5);
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.uiia);
      const svg = container.querySelector('svg[data-state="night"]');
      expect(svg).toHaveAttribute("data-uiia");
      expect(svg?.querySelector(".cat-spin")).not.toBeNull();
      expect(svg?.querySelector(".cat-zzz")).toBeNull();
      expect(svg?.querySelector('[data-layer="mug"]')).not.toBeNull();
      // Awake, the box takes its day place.
      expect(container.firstElementChild).toHaveAttribute("data-mood", "day");
      act(() => {
        vi.advanceTimersByTime(UIIA.durationMs);
      });
      expect(container.firstElementChild).toHaveAttribute("data-mood", "night");
      expect(container.querySelector('svg[data-state="night"] .cat-zzz')).not.toBeNull();
      expect(spinning(container)).toBe(false);
    });

    it("under reduced motion only speaks: no spin, no change of pose", () => {
      vi.spyOn(window, "matchMedia").mockImplementation(
        (query: string) => ({ matches: query.includes("reduce"), media: query }) as MediaQueryList,
      );
      const { container } = render(<HeroCat now={NIGHT} />);
      pokes(5);
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.uiia);
      expect(spinning(container)).toBe(false);
      expect(container.querySelector(".cat-spin")).toBeNull();
      expect(container.querySelector('svg[data-state="night"] .cat-zzz')).not.toBeNull();
      expect(container.firstElementChild).toHaveAttribute("data-uiia", "still");
      act(() => {
        vi.advanceTimersByTime(UIIA.durationMs);
      });
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
      expect(container.firstElementChild).not.toHaveAttribute("data-uiia");
    });

    it("leaves no timer running when he unmounts mid-spin", () => {
      const { unmount } = render(<HeroCat now={DAY} />);
      pokes(5);
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  it("day to night still cross-fades, then keeps only the new drawing", () => {
    const { rerender, container } = render(<HeroCat now={DAY} />);
    rerender(<HeroCat now={NIGHT} />);
    expect(container.querySelector('svg[data-state="day"]')).not.toBeNull();
    expect(container.querySelector('svg[data-state="night"]')).not.toBeNull();
    expect(container.querySelector('.hero-cat-layer[data-fade="out"]')).not.toBeNull();
    expect(container.querySelector(".cat-wake-frame")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(container.querySelector('svg[data-state="day"]')).toBeNull();
    expect(container.querySelector('svg[data-state="night"]')).not.toBeNull();
    expect(container.querySelector(".cat-wake-frame")).toBeNull();
  });

  describe("the sunrise wake", () => {
    const wakeFrames = (container: HTMLElement) => container.querySelectorAll(".cat-art[data-wake] .cat-wake-frame");
    /** The day drawing at rest: his typing paws are back. */
    const atRest = (container: HTMLElement) =>
      container.querySelector('svg[data-state="day"]:not([data-wake]) .cat-paw-l') !== null;

    /** HeroCat driven by the page's own clock, as the hero mounts him (so `?time=` previews drive him too). */
    function Clocked() {
      return <HeroCat now={useNow()} />;
    }

    afterEach(() => {
      window.history.replaceState(null, "", "/");
    });

    it("yawns and stretches when night turns to day", () => {
      const { rerender, container } = render(<HeroCat now={NIGHT} />);
      rerender(<HeroCat now={DAY} />);
      expect(wakeFrames(container)).toHaveLength(2);
      expect(container.querySelector('svg[data-state="day"]')).toHaveAttribute("data-wake");
      // The wake replaces the cross-fade: no fading layer, and the night drawing is gone at once.
      expect(container.querySelector("[data-fade]")).toBeNull();
      expect(container.querySelector('svg[data-state="night"]')).toBeNull();
      expect(container.querySelectorAll("svg.cat-art")).toHaveLength(1);
      act(() => {
        vi.advanceTimersByTime(WAKE_MS - 1);
      });
      expect(wakeFrames(container)).toHaveLength(2);
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(wakeFrames(container)).toHaveLength(0);
      expect(atRest(container)).toBe(true);
    });

    it("speaks normally when poked during the wake", () => {
      const { rerender, container } = render(<HeroCat now={NIGHT} />);
      rerender(<HeroCat now={DAY} />);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.quotes[0]);
      expect(wakeFrames(container)).toHaveLength(2);
    });

    it("wakes on arrival on a morning sky", () => {
      vi.setSystemTime(new Date("2026-10-05T04:00:00Z"));
      window.history.replaceState(null, "", "/?time=07:20"); // golden, the sun rising in the east
      const { container } = render(<Clocked />);
      expect(container.querySelector('svg[data-state="day"]')).not.toBeNull();
      // He hops in first (1000 ms), then yawns and stretches.
      act(() => {
        vi.advanceTimersByTime(999);
      });
      expect(wakeFrames(container)).toHaveLength(0);
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(wakeFrames(container)).toHaveLength(2);
      act(() => {
        vi.advanceTimersByTime(WAKE_MS);
      });
      expect(wakeFrames(container)).toHaveLength(0);
      expect(atRest(container)).toBe(true);
      // Once only.
      act(() => {
        vi.advanceTimersByTime(10_000);
      });
      expect(wakeFrames(container)).toHaveLength(0);
    });

    it("does not wake on arrival on an evening sky, or at noon", () => {
      vi.setSystemTime(new Date("2026-10-05T04:00:00Z"));
      for (const time of ["18:00", "12:50"]) {
        window.history.replaceState(null, "", `/?time=${time}`); // golden in the west; full day
        const { container, unmount } = render(<Clocked />);
        expect(container.querySelector('svg[data-state="day"]'), time).not.toBeNull();
        for (let ms = 0; ms < 1000 + WAKE_MS; ms += 100) {
          act(() => {
            vi.advanceTimersByTime(100);
          });
          expect(wakeFrames(container), `${time} +${ms}`).toHaveLength(0);
        }
        unmount();
      }
    });

    it("waits for the loading screen: the hop, then the wake, start when he first shows", async () => {
      vi.setSystemTime(new Date("2026-10-05T04:00:00Z"));
      window.history.replaceState(null, "", "/?time=07:20");
      setLoader("run");
      const { container } = render(<Clocked />);
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(container).toBeEmptyDOMElement();
      await act(async () => {
        setLoader("done");
      });
      act(() => {
        vi.advanceTimersByTime(999);
      });
      expect(wakeFrames(container)).toHaveLength(0);
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(wakeFrames(container)).toHaveLength(2);
    });

    it("no wake under reduced motion: a plain swap", () => {
      vi.spyOn(window, "matchMedia").mockImplementation(
        (query: string) => ({ matches: query.includes("reduce"), media: query }) as MediaQueryList,
      );
      const { rerender, container } = render(<HeroCat now={NIGHT} />);
      rerender(<HeroCat now={DAY} />);
      expect(wakeFrames(container)).toHaveLength(0);
      expect(container.querySelector(".cat-wake-frame")).toBeNull();
      expect(container.querySelector('.hero-cat-layer:not([data-fade="out"]) svg[data-state="day"]')).not.toBeNull();
      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(container.querySelector('svg[data-state="night"]')).toBeNull();
      expect(atRest(container)).toBe(true);
    });

    it("no wake on a morning arrival under reduced motion", () => {
      vi.spyOn(window, "matchMedia").mockImplementation(
        (query: string) => ({ matches: query.includes("reduce"), media: query }) as MediaQueryList,
      );
      vi.setSystemTime(new Date("2026-10-05T04:00:00Z"));
      window.history.replaceState(null, "", "/?time=07:20");
      const { container } = render(<Clocked />);
      act(() => {
        vi.advanceTimersByTime(1000 + WAKE_MS);
      });
      expect(container.querySelector(".cat-wake-frame")).toBeNull();
      expect(atRest(container)).toBe(true);
    });

    it("UIIA cancels a wake", () => {
      const { rerender, container } = render(<HeroCat now={NIGHT} />);
      rerender(<HeroCat now={DAY} />);
      expect(wakeFrames(container)).toHaveLength(2);
      const button = screen.getByRole("button");
      for (let i = 0; i < UIIA.clicks; i += 1) {
        if (i > 0) {
          act(() => {
            vi.advanceTimersByTime(100);
          });
        }
        fireEvent.click(button);
      }
      expect(container.querySelectorAll(".cat-spin-frame")).toHaveLength(4);
      expect(container.querySelector(".cat-wake-frame")).toBeNull();
      expect(container.querySelector("[data-wake]")).toBeNull();
      // The wake does not come back after the spin: he settles straight into his day pose.
      act(() => {
        vi.advanceTimersByTime(UIIA.durationMs);
      });
      expect(container.querySelector(".cat-spin-frame")).toBeNull();
      expect(container.querySelector(".cat-wake-frame")).toBeNull();
      expect(atRest(container)).toBe(true);
    });

    it("leaves no timer running when he unmounts mid-wake", () => {
      const { rerender, unmount } = render(<HeroCat now={NIGHT} />);
      rerender(<HeroCat now={DAY} />);
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    });

    it("leaves no timer running when he unmounts before a morning wake begins", () => {
      vi.setSystemTime(new Date("2026-10-05T04:00:00Z"));
      window.history.replaceState(null, "", "/?time=07:20");
      const { unmount } = render(<Clocked />);
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("hold to purr", () => {
    const advance = (ms: number) =>
      act(() => {
        vi.advanceTimersByTime(ms);
      });
    const hearts = (container: HTMLElement) => [...container.querySelectorAll(".hero-cat-heart")];
    const openEye = (container: HTMLElement) =>
      container.querySelectorAll('svg[data-state="day"] .cat-eye rect[fill="var(--cat-eye)"]').length > 0;
    const reduceMotion = () =>
      vi.spyOn(window, "matchMedia").mockImplementation(
        (query: string) => ({ matches: query.includes("reduce"), media: query }) as MediaQueryList,
      );
    /** `count` quick pokes (clicks only, as a keyboard or a quick tap gives them), 100 ms apart. */
    function pokes(count: number) {
      const button = screen.getByRole("button");
      for (let i = 0; i < count; i += 1) {
        if (i > 0) advance(100);
        fireEvent.click(button);
      }
    }

    it("purrs after a 500 ms hold", () => {
      const { container } = render(<HeroCat now={DAY} />);
      const status = screen.getByRole("status");
      fireEvent.pointerDown(screen.getByRole("button"));
      advance(PURR.holdMs - 1);
      expect(container.firstElementChild).not.toHaveAttribute("data-purr");
      expect(status).toBeEmptyDOMElement();
      expect(hearts(container)).toHaveLength(0);
      advance(1);
      expect(container.firstElementChild).toHaveAttribute("data-purr", "");
      expect(status).toHaveTextContent(en.cat.purr);
      expect(hearts(container)).toHaveLength(1);
      expect(container.querySelector(".hero-cat-hearts")).toHaveAttribute("aria-hidden", "true");
      expect(container.querySelector(".hero-cat-hearts")).toContainElement(hearts(container)[0] as HTMLElement);

      // Held on: a heart every 350 ms, never more than three at once, each gone 1200 ms after it came.
      const born = new Map<Element, number>();
      let removed = 0;
      for (let t = 0; t <= 4000; t += 50) {
        const now = hearts(container);
        expect(now.length, `+${t}`).toBeLessThanOrEqual(PURR.maxHearts);
        if (t === 0) expect(now).toHaveLength(1);
        if (t === PURR.heartEveryMs) expect(now).toHaveLength(2);
        if (t === PURR.heartEveryMs * 2) expect(now).toHaveLength(3);
        for (const heart of now) if (!born.has(heart)) born.set(heart, t);
        for (const [heart, at] of born) {
          if (at >= 0 && !now.includes(heart)) {
            expect(t - at, `heart born at +${at}`).toBe(PURR.heartLifeMs);
            born.set(heart, -1);
            removed += 1;
          }
        }
        advance(50);
      }
      expect(born.size).toBeGreaterThan(PURR.maxHearts);
      expect(removed).toBeGreaterThan(PURR.maxHearts);
      expect(status).toHaveTextContent(en.cat.purr);
    });

    it("a purr is not a poke", () => {
      const { container } = render(<HeroCat now={DAY} />);
      const button = screen.getByRole("button");
      fireEvent.pointerDown(button);
      advance(600);
      fireEvent.pointerUp(button);
      fireEvent.click(button);
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.purr);
      for (const quote of en.cat.quotes) expect(screen.getByRole("status")).not.toHaveTextContent(quote);
      // Four quick pokes right after: the purr's click was not counted, so no fifth.
      pokes(4);
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.quotes[3]);
      expect(container.firstElementChild).not.toHaveAttribute("data-uiia");
      expect(container.querySelector(".cat-spin")).toBeNull();
    });

    it("a click that lands mid-purr (Enter while the mouse holds) leaves the release click swallowed", () => {
      render(<HeroCat now={DAY} />);
      const button = screen.getByRole("button");
      fireEvent.pointerDown(button);
      advance(PURR.holdMs);
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.purr);
      // Enter on the focused button while still purring: the native button sends a click.
      fireEvent.keyDown(button, { key: "Enter" });
      fireEvent.click(button);
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.purr);
      // Letting go sends the purr's own click: still no poke.
      fireEvent.pointerUp(button);
      fireEvent.click(button);
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.purr);
    });

    it("a short press is a poke", () => {
      const { container } = render(<HeroCat now={DAY} />);
      const button = screen.getByRole("button");
      fireEvent.pointerDown(button);
      advance(300);
      fireEvent.pointerUp(button);
      fireEvent.click(button);
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.quotes[0]);
      advance(1000);
      expect(container.firstElementChild).not.toHaveAttribute("data-purr");
      expect(hearts(container)).toHaveLength(0);
    });

    it("a hold that turns into a scroll does nothing", () => {
      for (const end of ["pointerCancel", "pointerLeave"] as const) {
        const { container, unmount } = render(<HeroCat now={DAY} />);
        const button = screen.getByRole("button");
        fireEvent.pointerDown(button);
        advance(200);
        fireEvent[end](button);
        advance(1000);
        expect(container.firstElementChild, end).not.toHaveAttribute("data-purr");
        expect(screen.getByRole("status"), end).toBeEmptyDOMElement();
        expect(hearts(container), end).toHaveLength(0);
        unmount();
      }
    });

    it("stops new hearts on release", () => {
      const { container } = render(<HeroCat now={DAY} />);
      const button = screen.getByRole("button");
      fireEvent.pointerDown(button);
      advance(1000);
      const before = hearts(container);
      expect(before.length).toBeGreaterThan(0);
      fireEvent.pointerUp(button);
      fireEvent.click(button);
      expect(container.firstElementChild).not.toHaveAttribute("data-purr");
      // The hearts in flight finish; no new one comes.
      for (let t = 0; t < 1000; t += 50) {
        advance(50);
        for (const heart of hearts(container)) expect(before, `+${t}`).toContain(heart);
      }
      advance(PURR.heartLifeMs);
      expect(hearts(container)).toHaveLength(0);
      // The line clears like any other.
      advance(4000);
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });

    it("purrs asleep at night without opening his eye", () => {
      const { container } = render(<HeroCat now={NIGHT} />);
      const art = () => container.querySelector('svg[data-state="night"]')?.outerHTML;
      const asleep = art();
      expect(asleep).toBeDefined();
      fireEvent.pointerDown(screen.getByRole("button"));
      advance(PURR.holdMs);
      expect(container.firstElementChild).toHaveAttribute("data-purr", "");
      expect(container.firstElementChild).toHaveAttribute("data-mood", "night");
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.purr);
      expect(hearts(container)).toHaveLength(1);
      expect(art()).toBe(asleep);
      expect(container.querySelector("[data-content]")).toBeNull();
    });

    it("closes his eye contentedly by day", () => {
      const { container } = render(<HeroCat now={DAY} />);
      const button = screen.getByRole("button");
      expect(openEye(container)).toBe(true);
      fireEvent.pointerDown(button);
      advance(PURR.holdMs);
      const eye = container.querySelector('svg[data-state="day"] .cat-eye');
      expect(eye).not.toBeNull();
      expect(eye?.querySelectorAll('rect[fill="var(--cat-eye)"]')).toHaveLength(0);
      expect(openEye(container)).toBe(false);
      fireEvent.pointerUp(button);
      expect(openEye(container)).toBe(true);
    });

    it("purrs during a sunrise wake: hearts and prrr, the wake frames untouched", () => {
      const { rerender, container } = render(<HeroCat now={NIGHT} />);
      rerender(<HeroCat now={DAY} />);
      const frames = () => container.querySelector(".cat-art[data-wake]")?.outerHTML;
      const waking = frames();
      expect(waking).toBeDefined();
      fireEvent.pointerDown(screen.getByRole("button"));
      advance(PURR.holdMs);
      expect(container.firstElementChild).toHaveAttribute("data-purr", "");
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.purr);
      expect(hearts(container)).toHaveLength(1);
      expect(frames()).toBe(waking);
    });

    it("ignores holds during UIIA", () => {
      const { container } = render(<HeroCat now={DAY} />);
      pokes(5);
      expect(container.firstElementChild).toHaveAttribute("data-uiia", "spin");
      fireEvent.pointerDown(screen.getByRole("button"));
      advance(1000);
      expect(container.firstElementChild).not.toHaveAttribute("data-purr");
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.uiia);
      expect(hearts(container)).toHaveLength(0);
    });

    it("drops a hold still waiting for its purr when UIIA starts", () => {
      const { container } = render(<HeroCat now={DAY} />);
      fireEvent.pointerDown(screen.getByRole("button"));
      pokes(5); // keyboard pokes while the pointer is down: UIIA at +400, before the hold's +500
      expect(container.firstElementChild).toHaveAttribute("data-uiia", "spin");
      advance(1000);
      expect(container.firstElementChild).not.toHaveAttribute("data-purr");
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.uiia);
      expect(hearts(container)).toHaveLength(0);
    });

    it("keeps still under reduced motion", () => {
      reduceMotion();
      const { container } = render(<HeroCat now={DAY} />);
      fireEvent.pointerDown(screen.getByRole("button"));
      advance(PURR.holdMs);
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.purr);
      expect(hearts(container)).toHaveLength(0);
      expect(openEye(container)).toBe(true);
      advance(2000);
      expect(hearts(container)).toHaveLength(0);
      expect(openEye(container)).toBe(true);
    });

    it("blocks the long-press menu on the cat only", () => {
      render(<HeroCat now={DAY} />);
      expect(fireEvent.contextMenu(screen.getByRole("button"))).toBe(false);
      expect(fireEvent.contextMenu(screen.getByRole("status"))).toBe(true);
      expect(fireEvent.contextMenu(document.body)).toBe(true);
    });

    it("purrs for the primary button only", () => {
      const { container } = render(<HeroCat now={DAY} />);
      fireEvent.pointerDown(screen.getByRole("button"), { button: 2 });
      advance(1000);
      expect(container.firstElementChild).not.toHaveAttribute("data-purr");
      expect(hearts(container)).toHaveLength(0);
    });

    it("keyboard: no hold-to-purr; Enter pokes as today, however long it is held", () => {
      const { container } = render(<HeroCat now={DAY} />);
      const button = screen.getByRole("button");
      fireEvent.keyDown(button, { key: "Enter" });
      fireEvent.click(button); // the native button's click on Enter keydown
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.quotes[0]);
      advance(1000);
      fireEvent.keyUp(button, { key: "Enter" });
      expect(container.firstElementChild).not.toHaveAttribute("data-purr");
      expect(hearts(container)).toHaveLength(0);
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.quotes[0]);
    });

    it("a purr released off the cat does not swallow the next poke", () => {
      render(<HeroCat now={DAY} />);
      const button = screen.getByRole("button");
      fireEvent.pointerDown(button);
      advance(600);
      fireEvent.pointerLeave(button); // dragged off and let go elsewhere: no click on him
      advance(UIIA.windowMs);
      fireEvent.keyDown(button, { key: "Enter" });
      fireEvent.click(button);
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.quotes[0]);
      // And by pointer: a fresh short press pokes too.
      fireEvent.pointerDown(button);
      advance(600);
      fireEvent.pointerLeave(button);
      fireEvent.pointerDown(button);
      advance(100);
      fireEvent.pointerUp(button);
      fireEvent.click(button);
      expect(screen.getByRole("status")).toHaveTextContent(en.cat.quotes[1]);
    });

    it("leaves no timer running when he unmounts mid-purr", () => {
      const { container, unmount } = render(<HeroCat now={DAY} />);
      fireEvent.pointerDown(screen.getByRole("button"));
      advance(1200);
      expect(hearts(container).length).toBeGreaterThan(0);
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    });

    it("leaves no timer running when he unmounts mid-hold, before the purr", () => {
      const { unmount } = render(<HeroCat now={DAY} />);
      fireEvent.pointerDown(screen.getByRole("button"));
      advance(200);
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});

describe("cat.css", () => {
  it("animates in steps only: no easing curves, no gradients, no transitions", () => {
    expect(css).not.toMatch(/\b(ease|ease-in|ease-out|ease-in-out|linear|cubic-bezier)\b/);
    expect(css).not.toMatch(/gradient\(/);
    expect(css).not.toMatch(/\btransition\s*:/);
    expect(css).not.toMatch(/\b(blur|drop-shadow)\(/);
    expect(css).not.toMatch(/border-radius:\s*[1-9]/);
    const animations = css.match(/\banimation\s*:[^;]+;/g) ?? [];
    expect(animations.length).toBeGreaterThan(8);
    for (const rule of animations) {
      if (/none/.test(rule)) continue;
      expect(rule, rule).toMatch(/steps\(/);
    }
  });

  it("moves parts by whole sprite units (6px, never a fraction) with CSS transforms", () => {
    const moves = css.match(/translate[XY]?\([^)]*\)/g) ?? [];
    expect(moves.length).toBeGreaterThan(5);
    for (const move of moves) {
      if (move.includes("--cu")) continue;
      for (const n of move.match(/-?\d+(\.\d+)?px/g) ?? []) {
        expect(Math.abs(Number.parseFloat(n)) % 6, move).toBe(0);
      }
    }
    expect(css).not.toMatch(/scale\(/);
    // Nothing turns in the plane: the easter egg is drawn frames, not a rotation.
    expect(css).not.toMatch(/rotate\(/);
  });

  it("turns the easter-egg cat through its four drawn frames, 100 ms each, parts held still", () => {
    const uiia = css.slice(css.indexOf("[data-uiia]"), css.indexOf(".hero-cat-bubble"));
    expect(uiia).not.toBe("");
    expect(uiia).not.toMatch(/rotate\(/);
    expect(css).not.toMatch(/@keyframes cat-uiia\s*\{/);
    const delays = { side: 0, front: 100, mirror: 200, back: 300 };
    for (const [frame, delay] of Object.entries(delays)) {
      const rule = new RegExp(
        `\\.hero-cat \\.cat-art\\[data-uiia\\] \\.cat-spin-frame\\[data-frame="${frame}"\\]\\s*\\{([^}]*)\\}`,
      ).exec(css)?.[1];
      expect(rule, frame).toMatch(new RegExp(`animation:\\s*cat-uiia-frame 400ms steps\\(1, end\\) ${delay}ms infinite;`));
    }
    // One frame shows for the first quarter of each turn; the others wait hidden until their delay is up.
    expect(css).toMatch(/@keyframes cat-uiia-frame\s*\{\s*0%\s*\{\s*opacity:\s*1;\s*\}\s*25%,\s*100%\s*\{\s*opacity:\s*0;\s*\}\s*\}/);
    expect(css).toMatch(/\.cat-art\[data-uiia\] \.cat-spin-frame:not\(\[data-frame="side"\]\)\s*\{\s*opacity:\s*0;\s*\}/);
    expect(css).toMatch(/\.hero-cat \.cat-art\[data-uiia\] \.cat-spin-frame \*\s*\{\s*animation:\s*none;\s*\}/);
    // The hold comes after the day and night part loops, so it wins their equal specificity.
    expect(css.indexOf(".cat-art[data-uiia] .cat-spin-frame *")).toBeGreaterThan(
      css.lastIndexOf('[data-state="night"] .cat-steam'),
    );
  });

  it("keeps the speech box inside the page's left gutter on a narrow screen", () => {
    const bubble = /\.hero-cat-bubble\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    // The cap is the room left of the box's right edge: the slot's left edge (the scene's geometry, in cqw) plus
    // --reach cells, less the 1rem gutter and the outline unit.
    expect(bubble).toMatch(/max-width:\s*min\(\s*14rem,\s*calc\(50cqw \+ var\(--glass-w[^;]*- var\(--cat-size[^;]*- 1rem - var\(--px\)\)\s*\)/);
    expect(bubble).toMatch(/right:\s*calc\(100% - var\(--cu\) \* var\(--reach\)\)/);
    // On a phone the day box grows upwards from his head, so a longer line never runs off the bottom of the scene.
    const narrow = css.slice(css.indexOf("@media (width < 30rem)"));
    expect(narrow).toMatch(/\.hero-cat\[data-mood="day"\] \.hero-cat-bubble\s*\{[^}]*top:\s*auto;[^}]*bottom:/);
  });

  it("plays the wake in two drawn frames: the yawn for the first half of 1.6 s, the stretch for the second", () => {
    expect(css).toMatch(/\.cat-art\[data-wake\] \.cat-wake-frame\[data-frame="stretch"\]\s*\{\s*opacity:\s*0;\s*\}/);
    for (const frame of ["yawn", "stretch"]) {
      const rule = new RegExp(
        `\\.hero-cat \\.cat-art\\[data-wake\\] \\.cat-wake-frame\\[data-frame="${frame}"\\]\\s*\\{([^}]*)\\}`,
      ).exec(css)?.[1];
      expect(rule, frame).toMatch(new RegExp(`animation:\\s*cat-wake-${frame} ${WAKE_MS}ms steps\\(1, end\\) both;`));
    }
    expect(css).toMatch(/@keyframes cat-wake-yawn\s*\{\s*0%\s*\{\s*opacity:\s*1;\s*\}\s*50%,\s*100%\s*\{\s*opacity:\s*0;\s*\}\s*\}/);
    expect(css).toMatch(/@keyframes cat-wake-stretch\s*\{\s*0%\s*\{\s*opacity:\s*0;\s*\}\s*50%,\s*100%\s*\{\s*opacity:\s*1;\s*\}\s*\}/);
  });

  it("switches every hero animation off under reduced motion", () => {
    const block = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(block).toContain("animation: none !important");
    for (const selector of [".hero-cat-hop", ".hero-cat-layer", ".hero-cat .cat-art", ".hero-cat-heart"]) {
      expect(block).toContain(selector);
    }
  });

  it("keeps a long press on the cat from opening a callout or selecting text", () => {
    const button = /\.hero-cat-button\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(button).toMatch(/-webkit-touch-callout:\s*none;/);
    expect(button).toMatch(/(^|[^-])user-select:\s*none;/);
    expect(button).toMatch(/-webkit-user-select:\s*none;/);
  });

  it("floats each heart up four cells in four steps over its life, fading in the last", () => {
    const rule = /\.hero-cat-heart\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(rule).toMatch(/position:\s*absolute;/);
    expect(rule).toMatch(/width:\s*calc\(var\(--cu\) \* 5\);/);
    expect(rule).toMatch(/height:\s*calc\(var\(--cu\) \* 5\);/);
    expect(rule).toMatch(new RegExp(`animation:\\s*cat-heart-rise ${PURR.heartLifeMs}ms steps\\(4, start\\) both,\\s*cat-heart-fade ${PURR.heartLifeMs}ms steps\\(1, end\\) both;`));
    expect(css).toMatch(/@keyframes cat-heart-rise\s*\{\s*from\s*\{\s*transform:\s*translateY\(0\);\s*\}\s*to\s*\{\s*transform:\s*translateY\(calc\(var\(--cu\) \* -4\)\);\s*\}\s*\}/);
    // Full colour for the first three steps, then half on the last.
    expect(css).toMatch(/@keyframes cat-heart-fade\s*\{\s*0%\s*\{\s*opacity:\s*1;\s*\}\s*75%,\s*100%\s*\{\s*opacity:\s*0\.5;\s*\}\s*\}/);
    // The hearts never take the pointer.
    expect(/\.hero-cat-hearts\s*\{([^}]*)\}/.exec(css)?.[1]).toMatch(/pointer-events:\s*none;/);
  });

  it("hides the night z's while a heart is up, so the two never pile on each other", () => {
    expect(css).toMatch(/\.hero-cat\[data-mood="night"\]:has\(\.hero-cat-heart\) \.cat-zzz\s*\{\s*visibility:\s*hidden;\s*\}/);
  });

  it("holds his eye still while he purrs: no glance over the shut eye", () => {
    expect(css).toMatch(/\.hero-cat \.cat-art\[data-content\] \.cat-eye\s*\{\s*animation:\s*none;\s*\}/);
    expect(css.indexOf(".cat-art[data-content] .cat-eye")).toBeGreaterThan(css.indexOf('[data-state="day"] .cat-eye'));
  });
});

describe("dictionary: cat", () => {
  it.each(LANGUAGES)("has a label, a sleeping line and four non-empty quotes in %s", (language) => {
    const { label, sleeping, quotes } = dictionaries[language].cat;
    expect(label.trim()).not.toBe("");
    expect(sleeping.trim()).not.toBe("");
    expect(quotes).toHaveLength(4);
    for (const quote of quotes) expect(quote.trim().length).toBeGreaterThan(0);
    expect(new Set(quotes).size).toBe(4);
  });

  it.each(LANGUAGES)("says the same UIIA UIIA in %s", (language) => {
    expect(dictionaries[language].cat.uiia).toBe("UIIA UIIA");
  });

  it("purrs prrr in English and пүррр in Mongolian", () => {
    expect(en.cat.purr).toBe("prrr");
    expect(dictionaries.mn.cat.purr).toBe("пүррр");
  });

  it("keeps Cyrillic out of the English copy", () => {
    const { label, sleeping, purr, quotes } = en.cat;
    for (const text of [label, sleeping, purr, ...quotes]) expect(text).not.toMatch(/[Ѐ-ӿ]/);
  });

  it("writes the Mongolian copy in Cyrillic", () => {
    const { label, sleeping, purr, quotes } = dictionaries.mn.cat;
    for (const text of [label, sleeping, purr, ...quotes]) expect(text).toMatch(/[Ѐ-ӿ]/);
  });
});
