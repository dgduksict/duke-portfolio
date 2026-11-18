"use client";

import { useMemo } from "react";
import { profile } from "@/data/profile";
import { type CatState, catStateForPhase } from "@/lib/cat";
import { skyAt } from "@/lib/sky";
import { sunPosition } from "@/lib/sun";

/**
 * Whether the cat is awake or asleep, from the same sky the page paints: asleep exactly when `Sky` shows its night
 * phase for `now` (so `?time=HH:MM` previews drive him too). `null` until the client knows the time, so nothing is
 * drawn that would have to change right after hydration.
 */
export function useCatState(now: Date | null): CatState | null {
  return useMemo(() => {
    if (now === null) return null;
    const { latitude, longitude } = profile.coordinates;
    return catStateForPhase(skyAt(sunPosition(now, latitude, longitude)).phase);
  }, [now]);
}
