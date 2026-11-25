import { afterEach, describe, expect, it } from "vitest";
import { furthestHint, HINT, hintStage, loadHint, saveHint } from "./cat-hint";

/** Puts a throwing `localStorage` on the window (a browser that blocks storage) and returns the undo. */
function blockStorage(mode: "getter" | "setItem"): () => void {
  const own = Object.getOwnPropertyDescriptor(window, "localStorage");
  if (mode === "getter") {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  } else {
    const broken = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    } as unknown as Storage;
    Object.defineProperty(window, "localStorage", { configurable: true, get: () => broken });
  }
  return () => {
    if (own) Object.defineProperty(window, "localStorage", own);
    else delete (window as { localStorage?: Storage }).localStorage;
  };
}

describe("the pet hint's rules", () => {
  it("holds the agreed numbers: 1.5 s after he shows, remembered under duke:cat-hint", () => {
    expect(HINT).toEqual({ delayMs: 1500, storageKey: "duke:cat-hint" });
  });

  it("maps what is stored to the stage: nothing or junk → pet, poked → hold, purred → no hint", () => {
    expect(hintStage(null)).toBe("pet");
    expect(hintStage("")).toBe("pet");
    expect(hintStage("junk")).toBe("pet");
    expect(hintStage("poked")).toBe("hold");
    expect(hintStage("purred")).toBeNull();
  });

  it("only ever moves forward: the furthest of two progresses wins, junk counts as none", () => {
    expect(furthestHint(null, null)).toBeNull();
    expect(furthestHint("junk", null)).toBeNull();
    expect(furthestHint(null, "poked")).toBe("poked");
    expect(furthestHint("poked", null)).toBe("poked");
    expect(furthestHint("purred", "poked")).toBe("purred");
    expect(furthestHint("poked", "purred")).toBe("purred");
  });
});

describe("the pet hint's memory", () => {
  let undo: (() => void) | undefined;
  afterEach(() => {
    undo?.();
    undo = undefined;
  });

  it("reads and writes localStorage under its key", () => {
    expect(loadHint()).toBeNull();
    saveHint("poked");
    expect(window.localStorage.getItem(HINT.storageKey)).toBe("poked");
    expect(loadHint()).toBe("poked");
    window.localStorage.setItem(HINT.storageKey, "junk");
    expect(loadHint()).toBeNull();
  });

  it("never throws when storage is blocked or full", () => {
    for (const mode of ["getter", "setItem"] as const) {
      undo = blockStorage(mode);
      expect(() => saveHint("purred"), mode).not.toThrow();
      expect(loadHint(), mode).toBeNull();
      undo();
      undo = undefined;
    }
  });
});
