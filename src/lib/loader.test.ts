import { describe, expect, it } from "vitest";
import { displayedProgress, LOADER, loaderGateScript } from "./loader";

describe("LOADER", () => {
  it("holds the agreed timings and session key", () => {
    expect(LOADER).toEqual({
      minMs: 1400,
      maxMs: 3500,
      reducedMinMs: 600,
      safetyMs: 3000,
      sessionKey: "duke:loader-seen",
    });
  });
});

describe("displayedProgress", () => {
  it("starts at 0 and finishes at minMs when everything is loaded", () => {
    expect(displayedProgress(0, 1)).toBe(0);
    expect(displayedProgress(1400, 1)).toBe(1);
  });

  it("eases out over the minimum time", () => {
    expect(displayedProgress(700, 1)).toBe(0.875);
  });

  it("is full from maxMs whatever has loaded", () => {
    expect(displayedProgress(5000, 0)).toBe(1);
    expect(displayedProgress(3500, 0)).toBe(1);
  });

  it("never runs ahead of what has loaded", () => {
    expect(displayedProgress(1400, 0.25)).toBe(0.25);
  });

  it("clamps negative time and counts NaN as 0", () => {
    expect(displayedProgress(-50, 1)).toBe(0);
    expect(displayedProgress(Number.NaN, Number.NaN)).toBe(0);
    expect(displayedProgress(1400, Number.NaN)).toBe(0);
    expect(displayedProgress(Number.NaN, 1)).toBe(0);
  });

  it("takes a shorter minimum for reduced motion", () => {
    expect(displayedProgress(300, 1, LOADER.reducedMinMs)).toBe(0.875);
  });
});

describe("loaderGateScript", () => {
  interface Options {
    pathname: string;
    seen?: boolean;
    getItemThrows?: boolean;
  }

  /** Runs the script with stand-ins for the browser globals it uses; returns the html dataset and the timers. */
  function runGate({ pathname, seen = false, getItemThrows = false }: Options) {
    const dataset: Record<string, string> = {};
    const timers: { fn: () => void; ms: number }[] = [];
    const env = {
      document: { documentElement: { dataset } },
      location: { pathname },
      sessionStorage: {
        getItem: (key: string) => {
          if (getItemThrows) throw new Error("blocked");
          return seen && key === "duke:loader-seen" ? "1" : null;
        },
      },
      setTimeout: (fn: () => void, ms: number) => timers.push({ fn, ms }),
    };
    new Function(...Object.keys(env), loaderGateScript())(
      ...Object.values(env),
    );
    return { dataset, timers };
  }

  it("marks the page on the first visit and releases it after the safety timeout", () => {
    const run = runGate({ pathname: "/" });
    expect(run.dataset.loader).toBe("on");
    expect(run.timers).toHaveLength(1);
    expect(run.timers[0]?.ms).toBe(3000);
    run.timers[0]?.fn();
    expect(run.dataset.loader).toBe("done");
  });

  it("leaves a value that something else set", () => {
    const run = runGate({ pathname: "/" });
    run.dataset.loader = "running";
    run.timers[0]?.fn();
    expect(run.dataset.loader).toBe("running");
  });

  it("does nothing once the loader has been seen this session", () => {
    const run = runGate({ pathname: "/", seen: true });
    expect(run.dataset.loader).toBeUndefined();
    expect(run.timers).toHaveLength(0);
  });

  it("does nothing off the homepage", () => {
    const run = runGate({ pathname: "/x" });
    expect(run.dataset.loader).toBeUndefined();
    expect(run.timers).toHaveLength(0);
  });

  it("treats unreadable storage as a first visit", () => {
    const run = runGate({ pathname: "/", getItemThrows: true });
    expect(run.dataset.loader).toBe("on");
    expect(run.timers).toHaveLength(1);
  });

  it("never throws: a failing document leaves the page untouched", () => {
    const timers: unknown[] = [];
    const brokenDocument = new Proxy(
      {},
      {
        get() {
          throw new Error("no document");
        },
      },
    );
    const env = {
      document: brokenDocument,
      location: { pathname: "/" },
      sessionStorage: { getItem: () => null },
      setTimeout: (...args: unknown[]) => timers.push(args),
    };
    const run = () =>
      new Function(...Object.keys(env), loaderGateScript())(
        ...Object.values(env),
      );
    expect(run).not.toThrow();
    expect(timers).toHaveLength(0);
  });
});
