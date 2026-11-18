import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroCat } from "@/components/cat/hero-cat";
import { useCatState } from "@/components/cat/use-cat-state";
import { dictionaries } from "@/lib/i18n";
import { LANGUAGES } from "@/types";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

const root = document.documentElement;
/** Noon in Ulaanbaatar (day) and midnight there (night), the same instants the sky tests use. */
const DAY = new Date("2026-10-05T04:50:00Z");
const NIGHT = new Date("2026-10-05T16:00:00Z");
const en = dictionaries.en;

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
    expect(container.firstElementChild).toHaveClass("pointer-events-none", "hidden", "min-[760px]:block");
    expect(screen.getByRole("button")).toHaveClass("pointer-events-auto");
  });

  it("answers a click with the next smug line, rotating through all of them", () => {
    render(<HeroCat now={DAY} />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toBeEmptyDOMElement();

    const quotes = en.cat.quotes;
    const button = screen.getByRole("button");
    for (const quote of [...quotes, quotes[0]]) {
      fireEvent.click(button);
      expect(status).toHaveTextContent(quote);
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

describe("dictionary: cat", () => {
  it.each(LANGUAGES)("has a label, a sleeping line and four non-empty quotes in %s", (language) => {
    const { label, sleeping, quotes } = dictionaries[language].cat;
    expect(label.trim()).not.toBe("");
    expect(sleeping.trim()).not.toBe("");
    expect(quotes).toHaveLength(4);
    for (const quote of quotes) expect(quote.trim().length).toBeGreaterThan(0);
    expect(new Set(quotes).size).toBe(4);
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
