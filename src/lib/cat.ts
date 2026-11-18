// Pure rules for the programmer cat: whether it is awake (from the sky phase) and which pose the ruler cat takes.
// No DOM in here, so it is unit-tested.
import type { SkyPhase } from "@/lib/sky";

/** Whether the cat is awake at its desk (day) or asleep (night). */
export type CatState = "day" | "night";

/** The pose of the cat that rides the ruler. */
export type RulerPose = "type" | "sit" | "groom" | "sleep" | "nap";

/** A scroll this recent (ms) still counts as "scrolling now": the cat types. */
export const TYPING_WINDOW_MS = 150;
/** After this long (ms) without scrolling the idle cat starts grooming instead of just sitting. */
export const GROOM_AFTER_MS = 1200;
/** Scroll progress (0..1) from which the day cat curls up for a nap at the bottom of the page. */
export const NAP_FROM = 0.98;

/**
 * The cat's state for a sky phase: asleep only when the sky is "night", awake for every other phase. An unknown
 * (`undefined`) phase counts as day, so a missing sky never leaves the cat asleep.
 */
export function catStateForPhase(phase: SkyPhase | undefined): CatState {
  return phase === "night" ? "night" : "day";
}

/**
 * The ruler cat's pose. Precedence: night always sleeps; otherwise near the bottom of the page (progress >=
 * NAP_FROM) it naps; otherwise it types while scrolling (under TYPING_WINDOW_MS since the last scroll), sits for a
 * short while after, and grooms once GROOM_AFTER_MS or more have passed. A non-finite `progress` counts as 0 and a
 * NaN `msSinceScroll` as 0 (just scrolled), so the result is always a defined pose.
 */
export function rulerCatPose(input: {
  state: CatState;
  msSinceScroll: number;
  progress: number;
}): RulerPose {
  if (input.state === "night") return "sleep";
  const progress = Number.isFinite(input.progress) ? input.progress : 0;
  const msSinceScroll = Number.isNaN(input.msSinceScroll)
    ? 0
    : input.msSinceScroll;
  if (progress >= NAP_FROM) return "nap";
  if (msSinceScroll < TYPING_WINDOW_MS) return "type";
  if (msSinceScroll < GROOM_AFTER_MS) return "sit";
  return "groom";
}
