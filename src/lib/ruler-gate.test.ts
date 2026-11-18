import { describe, expect, it } from "vitest";
import { rulerGateScript } from "./ruler-gate";

describe("rulerGateScript", () => {
  /** Runs the script with stand-ins for the browser globals it uses; returns the html dataset, timers and window. */
  function runGate(pathname: string, matches: boolean | "throw") {
    const dataset: Record<string, string> = {};
    const timers: { fn: () => void; ms: number }[] = [];
    const win: { __rulerLive?: boolean } = {};
    const queries: string[] = [];
    const env = {
      document: { documentElement: { dataset } },
      location: { pathname },
      matchMedia: (query: string) => {
        queries.push(query);
        if (matches === "throw") throw new Error("unsupported");
        return { matches };
      },
      setTimeout: (fn: () => void, ms: number) => timers.push({ fn, ms }),
      window: win,
    };
    new Function(...Object.keys(env), rulerGateScript())(...Object.values(env));
    return { dataset, timers, win, queries };
  }

  it("turns the ruler on for a wide, fine-pointer visitor on the homepage", () => {
    expect(runGate("/", true).dataset.ruler).toBe("on");
  });

  it("leaves other paths and narrow or coarse-pointer devices alone", () => {
    const other = runGate("/x", true);
    expect(other.dataset.ruler).toBeUndefined();
    expect(other.timers).toHaveLength(0);
    expect(runGate("/", false).dataset.ruler).toBeUndefined();
  });

  it("queries the wide, fine-pointer media condition", () => {
    expect(runGate("/", true).queries).toEqual([
      "(min-width: 900px) and (pointer: fine)",
    ]);
  });

  it("removes the attribute after 5 s unless the ruler took over", () => {
    const dead = runGate("/", true);
    expect(dead.timers[0]?.ms).toBe(5000);
    dead.timers[0]?.fn();
    expect(dead.dataset.ruler).toBeUndefined();

    const live = runGate("/", true);
    live.win.__rulerLive = true;
    live.timers[0]?.fn();
    expect(live.dataset.ruler).toBe("on");
  });

  it("never throws: a failing matchMedia leaves the page untouched", () => {
    const run = runGate("/", "throw");
    expect(run.dataset.ruler).toBeUndefined();
    expect(run.timers).toHaveLength(0);
  });
});
