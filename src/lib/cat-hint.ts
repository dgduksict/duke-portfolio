// The hero cat's pet hint: a quiet label that teaches a visitor to poke him ("click to pet" / "tap to pet"), then to
// hold him ("hold to purr"), and is gone for good once he has purred. The rules are pure; the two storage helpers are
// for the client only (call them from effects, timers and handlers, never during render) and never throw.

/** Which hint shows: "pet" before the first poke, "hold" after it, `null` once he has purred. */
export type HintStage = "pet" | "hold" | null;

/** How far a visitor has got, as it is stored: poked him, then purred him. */
export type HintProgress = "poked" | "purred";

/** The hint shows `delayMs` after he first shows; progress is kept in localStorage under `storageKey`. */
export const HINT = { delayMs: 1500, storageKey: "duke:cat-hint" } as const;

/** The step `stored` stands for: 0 nothing (or junk), 1 poked, 2 purred. */
function rank(stored: string | null): 0 | 1 | 2 {
  if (stored === "purred") return 2;
  if (stored === "poked") return 1;
  return 0;
}

/** The stage for what is stored: nothing or anything unknown → "pet", "poked" → "hold", "purred" → no hint. */
export function hintStage(stored: string | null): HintStage {
  const step = rank(stored);
  if (step === 2) return null;
  return step === 1 ? "hold" : "pet";
}

/** The further of two progresses (junk counts as none), so the hint only ever moves forward. */
export function furthestHint(a: string | null, b: string | null): HintProgress | null {
  const step = Math.max(rank(a), rank(b));
  if (step === 2) return "purred";
  return step === 1 ? "poked" : null;
}

/** What this browser remembers, or `null` when it remembers nothing or storage is blocked (it never throws). */
export function loadHint(): HintProgress | null {
  try {
    return furthestHint(window.localStorage.getItem(HINT.storageKey), null);
  } catch {
    return null;
  }
}

/** Remembers `progress`; a blocked or full storage is ignored (the caller keeps it in memory for this view). */
export function saveHint(progress: HintProgress): void {
  try {
    window.localStorage.setItem(HINT.storageKey, progress);
  } catch {
    // Storage is off or full: the page view still knows.
  }
}
