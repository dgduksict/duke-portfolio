import { describe, expect, it } from "vitest";
import { REVEAL, revealDelay, revealGateScript, shouldReveal } from "./reveal";

describe("REVEAL", () => {
  it("holds the agreed numbers: 480 ms frames, an 80 ms stagger capped at 240 ms, a 4.5 s safety release", () => {
    expect(REVEAL).toEqual({
      durationMs: 480,
      staggerMs: 80,
      maxDelayMs: 240,
      rootMargin: "0px 0px -6% 0px",
      safetyMs: 4500,
    });
  });
});

describe("shouldReveal", () => {
  it("reveals a block in view", () => {
    expect(shouldReveal({ isIntersecting: true, boundingClientRect: { bottom: 300 } })).toBe(true);
  });

  it("reveals a block wholly above the viewport (restored scroll, a jump past it)", () => {
    expect(shouldReveal({ isIntersecting: false, boundingClientRect: { bottom: -40 } })).toBe(true);
    expect(shouldReveal({ isIntersecting: false, boundingClientRect: { bottom: 0 } })).toBe(true);
  });

  it("keeps a block below the viewport waiting", () => {
    expect(shouldReveal({ isIntersecting: false, boundingClientRect: { bottom: 1600 } })).toBe(false);
  });
});

describe("revealDelay", () => {
  it("staggers by 80 ms and never waits more than 240 ms", () => {
    expect([0, 1, 2, 3, 4, 10].map(revealDelay)).toEqual([0, 80, 160, 240, 240, 240]);
  });

  it("treats a negative or non-finite index as the first", () => {
    expect(revealDelay(-1)).toBe(0);
    expect(revealDelay(Number.NaN)).toBe(0);
    expect(revealDelay(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("revealGateScript", () => {
  interface GateOptions {
    observer?: boolean;
    reduced?: boolean | "throw";
    hash?: string;
  }

  /** Runs the script with stand-ins for the browser globals it uses; returns the html dataset, timers and window. */
  function runGate({ observer = true, reduced = false, hash = "" }: GateOptions = {}) {
    const dataset: Record<string, string> = {};
    const timers: { fn: () => void; ms: number }[] = [];
    const win: { __revealLive?: boolean } = {};
    const queries: string[] = [];
    const env = {
      IntersectionObserver: observer ? class {} : undefined,
      document: { documentElement: { dataset } },
      location: { hash },
      matchMedia: (query: string) => {
        queries.push(query);
        if (reduced === "throw") throw new Error("unsupported");
        return { matches: reduced };
      },
      setTimeout: (fn: () => void, ms: number) => timers.push({ fn, ms }),
      window: win,
    };
    new Function(...Object.keys(env), revealGateScript())(...Object.values(env));
    return { dataset, timers, win, queries };
  }

  it("turns the reveal on when the browser can observe and motion is welcome", () => {
    const run = runGate();
    expect(run.dataset.reveal).toBe("on");
    expect(run.queries).toEqual(["(prefers-reduced-motion: reduce)"]);
  });

  it("leaves the page alone without IntersectionObserver: no hiding, no timer", () => {
    const run = runGate({ observer: false });
    expect(run.dataset.reveal).toBeUndefined();
    expect(run.timers).toHaveLength(0);
  });

  it("leaves the page alone under reduced motion", () => {
    const run = runGate({ reduced: true });
    expect(run.dataset.reveal).toBeUndefined();
    expect(run.timers).toHaveLength(0);
  });

  it("leaves the page alone on a deep link, which lands mid-page", () => {
    expect(runGate({ hash: "#contact" }).dataset.reveal).toBeUndefined();
    // A bare "#" is no deep link.
    expect(runGate({ hash: "#" }).dataset.reveal).toBe("on");
  });

  it("lets every block show after 4.5 s unless the client took over", () => {
    const dead = runGate();
    expect(dead.timers[0]?.ms).toBe(4500);
    dead.timers[0]?.fn();
    expect(dead.dataset.reveal).toBeUndefined();

    const live = runGate();
    live.win.__revealLive = true;
    live.timers[0]?.fn();
    expect(live.dataset.reveal).toBe("on");
  });

  it("never throws: a failing matchMedia leaves the page untouched", () => {
    const run = runGate({ reduced: "throw" });
    expect(run.dataset.reveal).toBeUndefined();
    expect(run.timers).toHaveLength(0);
  });

  it("is safe in a real browser global scope without IntersectionObserver", () => {
    // typeof on an undeclared global never throws, so an old browser just skips the gate.
    expect(revealGateScript()).toContain('typeof IntersectionObserver !== "function"');
  });
});
