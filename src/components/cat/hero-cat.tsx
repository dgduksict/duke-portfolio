"use client";

import { useEffect, useRef, useState } from "react";
import { CatArt } from "@/components/cat/cat-art";
import { useCatState } from "@/components/cat/use-cat-state";
import { useLoaderDone } from "@/components/loader/use-loader-done";
import { useI18n } from "@/hooks/use-i18n";
import type { CatState } from "@/lib/cat";
import { cn } from "@/lib/utils";

/** How long a line stays up, and the cross-fade between day and night (ms; cat.css steps the fade over the same time). */
const BUBBLE_MS = 4000;
const FADE_MS = 600;

/**
 * The programmer cat on the window sill: awake and typing at his pixel laptop under a day sky, asleep beside his mug
 * under a night one. It renders nothing until the client knows the time and the loading screen is gone, then hops in
 * once (in frames) and settles into the loop (the motion is in cat.css, scoped to `.hero-cat`, `steps()` only; reduced
 * motion keeps him still). He shows at every width: below 760 px the scene keeps only its window and sill, and the slot
 * shrinks with it (scene.css picks `--cat-size`, always a whole multiple of his 28-cell grid).
 *
 * Nothing is measured: mount it as the `WindowScene`'s child and it fills the scene's cat slot, a `--cat-size` square
 * whose bottom edge is the sill's top, so his feet (row 27 of both drawings) stand on it. The layer itself ignores the
 * pointer; only the button takes it, and a click answers with a short line in a polite status region (the next
 * clean-code line by day, "shh" at night) shown as a pixel speech box that clears after a few seconds.
 */
export function HeroCat({ now }: { readonly now: Date | null }) {
  const { dict } = useI18n();
  const state = useCatState(now);
  const loaderDone = useLoaderDone();

  // A flip between day and night keeps the old drawing under the new one for the length of the cross-fade.
  const [shown, setShown] = useState<CatState | null>(state);
  const [leaving, setLeaving] = useState<CatState | null>(null);
  if (state !== null && state !== shown) {
    setShown(state);
    setLeaving(shown);
  }
  useEffect(() => {
    if (leaving === null) return;
    const timer = setTimeout(() => setLeaving(null), FADE_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  // What he says when poked: one timer for the line's life, replaced by a new click and gone on unmount.
  const [line, setLine] = useState("");
  const nextQuote = useRef(0);
  const lineTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(lineTimer.current), []);

  const speak = () => {
    let text = dict.cat.sleeping;
    if (state !== "night") {
      const quotes = dict.cat.quotes;
      text = quotes[nextQuote.current % quotes.length] ?? dict.cat.sleeping;
      nextQuote.current += 1;
    }
    setLine(text);
    clearTimeout(lineTimer.current);
    lineTimer.current = setTimeout(() => setLine(""), BUBBLE_MS);
  };

  if (state === null || !loaderDone) return null;

  const fading = leaving !== null;
  const layer = (kind: CatState, role: "in" | "out") => (
    <div
      key={`${kind}-${role}`}
      className={cn("hero-cat-layer", role === "out" ? "absolute inset-0" : "relative size-full")}
      data-fade={role === "out" ? "out" : fading ? "in" : undefined}
    >
      <CatArt variant="hero" state={kind} className="size-full" />
    </div>
  );

  return (
    <div
      className="hero-cat pointer-events-none absolute inset-0"
      data-mood={state}
      data-print="hide"
    >
      <div className="hero-cat-hop size-full">
        <button
          type="button"
          className="hero-cat-button pointer-events-auto relative block size-full cursor-pointer"
          aria-label={dict.cat.label}
          onClick={speak}
        >
          {leaving !== null ? layer(leaving, "out") : null}
          {layer(state, "in")}
        </button>
      </div>
      <div role="status" aria-live="polite" className="hero-cat-bubble px-box">
        {line}
      </div>
    </div>
  );
}
