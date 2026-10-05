import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNow } from "@/hooks/use-now";

afterEach(() => {
  vi.useRealTimers();
  window.history.replaceState(null, "", "/");
});

describe("useNow", () => {
  it("uses the real time and ignores a malformed override", () => {
    vi.useFakeTimers({ now: new Date("2026-10-05T03:00:00Z") });
    window.history.replaceState(null, "", "/?time=25:99");
    const { result } = renderHook(() => useNow());
    expect(result.current?.toISOString()).toBe("2026-10-05T03:00:00.000Z");
  });

  it("honours ?time= as Ulaanbaatar wall-clock time", () => {
    vi.useFakeTimers({ now: new Date("2026-10-05T03:00:00Z") });
    window.history.replaceState(null, "", "/?time=18:30");
    const { result } = renderHook(() => useNow());
    expect(result.current?.toISOString()).toBe("2026-10-05T10:30:00.000Z");
  });

  it("ticks on the minute", () => {
    vi.useFakeTimers({ now: new Date("2026-10-05T03:00:30Z") });
    const { result } = renderHook(() => useNow());
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current?.toISOString()).toBe("2026-10-05T03:01:00.000Z");
  });
});
