import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShootingStar } from "@/components/scene/shooting-star";
import { WindowScene } from "@/components/scene/window-scene";
import { nextShootingStarDelay } from "@/lib/season";

/** With `Math.random` at 0 the streak is at (0, 0), runs right and is three cells long, after the shortest delay. */
const DELAY = nextShootingStarDelay(() => 0);
const STREAK_MS = 600;

const renderStar = (active: boolean) =>
  render(
    <svg>
      <ShootingStar active={active} />
    </svg>,
  );
const layer = (container: HTMLElement) => container.querySelector('[data-layer="shooting-star"]');
const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe("ShootingStar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) => ({ matches: false, media: query }) as MediaQueryList,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
  });

  it("draws nothing until the first delay", () => {
    const { container } = renderStar(true);
    expect(layer(container)).toBeNull();
    advance(DELAY - 1);
    expect(layer(container)).toBeNull();
  });

  it("draws one streak after nextShootingStarDelay and clears it after 600 ms", () => {
    const { container } = renderStar(true);
    advance(DELAY);
    expect(layer(container)).not.toBeNull();
    expect(container.querySelectorAll('[data-streak=""]')).toHaveLength(1);
    const rects = [...container.querySelectorAll("rect")];
    expect(rects).toHaveLength(1 + 3);
    const opacities = rects.map((rect) => Number(rect.getAttribute("opacity")));
    expect(opacities[0]).toBe(1);
    for (let i = 1; i < opacities.length; i += 1) {
      expect(opacities[i]).toBeGreaterThan(0);
      expect(opacities[i]).toBeLessThan(opacities[i - 1] as number);
    }
    advance(STREAK_MS - 1);
    expect(layer(container)).not.toBeNull();
    advance(1);
    expect(layer(container)).toBeNull();
  });

  it("never schedules while inactive", () => {
    const { container } = renderStar(false);
    expect(vi.getTimerCount()).toBe(0);
    advance(120_000);
    expect(layer(container)).toBeNull();
  });

  it("stays dark under reduced motion", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) => ({ matches: query.includes("reduce"), media: query }) as MediaQueryList,
    );
    const { container } = renderStar(true);
    advance(120_000);
    expect(layer(container)).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("skips a streak while the tab is hidden, but schedules the next one", () => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    const { container } = renderStar(true);
    advance(DELAY);
    expect(layer(container)).toBeNull();
    expect(vi.getTimerCount()).toBe(1);
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    advance(DELAY);
    expect(layer(container)).not.toBeNull();
  });

  it("stops and clears when the night ends", () => {
    const { container, rerender } = renderStar(true);
    advance(DELAY);
    expect(layer(container)).not.toBeNull();
    rerender(
      <svg>
        <ShootingStar active={false} />
      </svg>,
    );
    expect(layer(container)).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears its timers on unmount", () => {
    const { unmount } = renderStar(true);
    advance(DELAY);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("flies in the window's night sky but not its day sky", () => {
    const night = render(<WindowScene now={new Date("2026-10-05T16:00:00Z")} />);
    advance(DELAY);
    expect(night.container.querySelector('svg [data-layer="shooting-star"]')).not.toBeNull();
    night.unmount();
    const day = render(<WindowScene now={new Date("2026-10-05T04:50:00Z")} />);
    advance(DELAY);
    expect(day.container.querySelector('[data-layer="shooting-star"]')).toBeNull();
  });
});
