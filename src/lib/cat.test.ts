import { describe, expect, it } from "vitest";
import {
  addPaw,
  catStateForPhase,
  countPoke,
  GROOM_AFTER_MS,
  NAP_FROM,
  type Paw,
  PAWS,
  PURR,
  rulerCatPose,
  TYPING_WINDOW_MS,
  UIIA,
  WAKE_MS,
  wakesOnArrival,
} from "./cat";

/** Feeds pokes at the given times through countPoke; returns whether each one triggered the spin. */
function poke(times: readonly number[]): boolean[] {
  let recent: number[] = [];
  return times.map((at) => {
    const result = countPoke(recent, at);
    recent = result.recent;
    return result.uiia;
  });
}

describe("countPoke (the UIIA easter egg)", () => {
  it("holds the agreed numbers: five pokes in 1.5 s, a 3.2 s spin", () => {
    expect(UIIA).toEqual({ clicks: 5, windowMs: 1500, durationMs: 3200 });
  });

  it("does not trigger on four fast pokes", () => {
    expect(poke([0, 100, 200, 300])).toEqual([false, false, false, false]);
  });

  it("triggers on the fifth fast poke", () => {
    expect(poke([0, 100, 200, 300, 400])).toEqual([false, false, false, false, true]);
  });

  it("never triggers on slow pokes, however many", () => {
    expect(poke([0, 400, 800, 1200, 1600, 2000, 2400, 2800]).some(Boolean)).toBe(false);
  });

  it("slides the window: an old poke drops out, the next fast one fills it again", () => {
    // 0 is 1500 ms old at 1500, so only four count; at 1700 the four from 400 on plus this one make five.
    expect(poke([0, 400, 800, 1200, 1500, 1700])).toEqual([false, false, false, false, false, true]);
  });

  it("starts over after a trigger", () => {
    expect(poke([0, 1, 2, 3, 4, 5, 6, 7, 8])).toEqual([false, false, false, false, true, false, false, false, false]);
    expect(poke([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).filter(Boolean)).toHaveLength(2);
  });

  it("leaves the list it was given alone", () => {
    const recent = [0, 100];
    countPoke(recent, 200);
    expect(recent).toEqual([0, 100]);
  });
});

describe("catStateForPhase", () => {
  it("sleeps only at night", () => {
    expect(catStateForPhase("night")).toBe("night");
    expect(catStateForPhase("twilight")).toBe("day");
    expect(catStateForPhase("golden")).toBe("day");
    expect(catStateForPhase("day")).toBe("day");
  });

  it("is awake when the phase is unknown", () => {
    expect(catStateForPhase(undefined)).toBe("day");
  });
});

describe("wakesOnArrival (the sunrise yawn)", () => {
  it("holds the agreed length: 1.6 s, yawn then stretch", () => {
    expect(WAKE_MS).toBe(1600);
  });

  it("wakes on a morning golden sky, the sun in the east", () => {
    expect(wakesOnArrival({ elevation: 2, azimuth: 110 }, "golden")).toBe(true);
    expect(wakesOnArrival({ elevation: -6, azimuth: 95 }, "twilight")).toBe(true);
  });

  it("never wakes in the evening, the sun in the west", () => {
    expect(wakesOnArrival({ elevation: 2, azimuth: 250 }, "golden")).toBe(false);
    expect(wakesOnArrival({ elevation: -6, azimuth: 265 }, "twilight")).toBe(false);
  });

  it("never wakes by full day or by night", () => {
    expect(wakesOnArrival({ elevation: 30, azimuth: 150 }, "day")).toBe(false);
    expect(wakesOnArrival({ elevation: -20, azimuth: 60 }, "night")).toBe(false);
  });
});

describe("PURR (hold him to purr)", () => {
  it("holds the agreed numbers: a 500 ms hold, a heart every 350 ms, at most 3, each 1.2 s", () => {
    expect(PURR).toEqual({ holdMs: 500, heartEveryMs: 350, maxHearts: 3, heartLifeMs: 1200 });
  });
});

describe("constants", () => {
  it("holds the agreed thresholds", () => {
    expect(TYPING_WINDOW_MS).toBe(150);
    expect(GROOM_AFTER_MS).toBe(1200);
    expect(NAP_FROM).toBe(0.98);
  });
});

describe("rulerCatPose", () => {
  const day = (msSinceScroll: number, progress = 0.5) =>
    rulerCatPose({ state: "day", msSinceScroll, progress });

  it("sleeps all night, even while scrolling or at the bottom", () => {
    expect(rulerCatPose({ state: "night", msSinceScroll: 0, progress: 0.5 })).toBe("sleep");
    expect(rulerCatPose({ state: "night", msSinceScroll: 5000, progress: 1 })).toBe("sleep");
  });

  it("naps from 98 % in the day, even while scrolling", () => {
    expect(day(0, 0.98)).toBe("nap");
    expect(day(0, 1)).toBe("nap");
    expect(day(0, 0.979)).toBe("type");
  });

  it("types while scrolling, sits briefly, then grooms", () => {
    expect(day(0)).toBe("type");
    expect(day(149)).toBe("type");
    expect(day(150)).toBe("sit");
    expect(day(1199)).toBe("sit");
    expect(day(1200)).toBe("groom");
    expect(day(60_000)).toBe("groom");
  });

  it("gives a defined pose for non-finite inputs", () => {
    const poses = ["type", "sit", "groom", "sleep", "nap"];
    expect(poses).toContain(day(Number.NaN));
    expect(poses).toContain(day(0, Number.NaN));
    expect(poses).toContain(day(Number.POSITIVE_INFINITY, Number.NaN));
    expect(poses).toContain(
      rulerCatPose({ state: "night", msSinceScroll: Number.NaN, progress: Number.NaN }),
    );
    expect(day(Number.NaN, Number.NaN)).toBe("type");
  });
});

describe("PAWS and addPaw (paw prints on click)", () => {
  const paw = (id: number): Paw => ({ id, x: id * 10, y: id * 20 });

  it("holds at most four pairs for a second", () => {
    expect(PAWS).toEqual({ maxPairs: 4, lifeMs: 1000 });
  });

  it("appends a pair and keeps the order", () => {
    expect(addPaw([paw(0)], paw(1))).toEqual([paw(0), paw(1)]);
    expect(addPaw([], paw(0))).toEqual([paw(0)]);
  });

  it("caps at four, keeping the newest four", () => {
    let list: Paw[] = [];
    for (let id = 0; id < 6; id += 1) list = addPaw(list, paw(id));
    expect(list.map((p) => p.id)).toEqual([2, 3, 4, 5]);
  });

  it("takes its own cap", () => {
    const list = [paw(0), paw(1), paw(2)];
    expect(addPaw(list, paw(3), 2).map((p) => p.id)).toEqual([2, 3]);
    expect(addPaw(list, paw(3), 0)).toEqual([]);
  });

  it("leaves the input untouched", () => {
    const list = Object.freeze([paw(0), paw(1), paw(2), paw(3)]);
    const next = addPaw(list, paw(4));
    expect(next).not.toBe(list);
    expect(list.map((p) => p.id)).toEqual([0, 1, 2, 3]);
    expect(next.map((p) => p.id)).toEqual([1, 2, 3, 4]);
  });
});
