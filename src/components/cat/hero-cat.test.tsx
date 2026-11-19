import { readFileSync } from "node:fs";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroCat } from "@/components/cat/hero-cat";
import { useCatState } from "@/components/cat/use-cat-state";
import { WindowScene } from "@/components/scene/window-scene";
import { UIIA } from "@/lib/cat";
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

  it("cross-fades when the sky flips from day to night, then keeps only the new drawing", () => {
    const { rerender, container } = render(<HeroCat now={DAY} />);
    rerender(<HeroCat now={NIGHT} />);
    expect(container.querySelector('svg[data-state="day"]')).not.toBeNull();
    expect(container.querySelector('svg[data-state="night"]')).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(container.querySelector('svg[data-state="day"]')).toBeNull();
    expect(container.querySelector('svg[data-state="night"]')).not.toBeNull();
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
    // The one turn is the easter egg's spin (its own keyframes), never a part's move.
    expect(css.match(/rotate\(/g)).toHaveLength(1);
    expect(css).toMatch(/@keyframes cat-uiia\s*\{\s*to\s*\{\s*transform:\s*rotate\(360deg\);\s*\}\s*\}/);
  });

  it("spins the easter-egg cat in four 90-degree frames about his own centre, parts held still", () => {
    const spin = /\.hero-cat \.cat-art\[data-uiia\] \.cat-spin\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(spin).toMatch(/animation:\s*cat-uiia 400ms steps\(4, end\) infinite;/);
    expect(spin).toMatch(/transform-box:\s*fill-box;/);
    expect(spin).toMatch(/transform-origin:\s*center;/);
    expect(css).toMatch(/\.hero-cat \.cat-art\[data-uiia\] \.cat-spin \*\s*\{\s*animation:\s*none;\s*\}/);
    // The hold comes after the day and night part loops, so it wins their equal specificity.
    expect(css.indexOf(".cat-art[data-uiia] .cat-spin *")).toBeGreaterThan(
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

  it("switches every hero animation off under reduced motion", () => {
    const block = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(block).toContain("animation: none !important");
    for (const selector of [".hero-cat-hop", ".hero-cat-layer", ".hero-cat .cat-art"]) {
      expect(block).toContain(selector);
    }
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

  it("keeps Cyrillic out of the English copy", () => {
    const { label, sleeping, quotes } = en.cat;
    for (const text of [label, sleeping, ...quotes]) expect(text).not.toMatch(/[Ѐ-ӿ]/);
  });

  it("writes the Mongolian copy in Cyrillic", () => {
    const { label, sleeping, quotes } = dictionaries.mn.cat;
    for (const text of [label, sleeping, ...quotes]) expect(text).toMatch(/[Ѐ-ӿ]/);
  });
});
