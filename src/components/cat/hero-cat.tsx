"use client";

import { useEffect, useRef, useState } from "react";
import { CatArt } from "@/components/cat/cat-art";
import { useCatState } from "@/components/cat/use-cat-state";
import { useLoaderDone } from "@/components/loader/use-loader-done";
import { useI18n } from "@/hooks/use-i18n";
import { type CatState, countPoke, UIIA } from "@/lib/cat";
import { cn } from "@/lib/utils";

/** How long a line stays up, and the cross-fade between day and night (ms; cat.css steps the fade over the same time). */
const BUBBLE_MS = 4000;
const FADE_MS = 600;
const REDUCED = "(prefers-reduced-motion: reduce)";

/** Whether the visitor asks for less motion; a browser without matchMedia (or one that throws) counts as no. */
function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia(REDUCED).matches;
  } catch {
    return false;
  }
}

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
 *
 * The easter egg: five pokes within 1.5 s (lib/cat.ts, `UIIA`) and he becomes the spinning "UIIA" cat for 3.2 s, awake
 * even at night, turning on the spot in four drawn frames (cat.css) while the box says "UIIA UIIA"; then he settles
 * back into his pose. Pokes while he spins do nothing. Under reduced motion he does not move or change pose: only the
 * box speaks.
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

  // The easter egg: recent poke times, and while it runs, whether he spins ("spin") or only speaks ("still", reduced
  // motion). One timer ends it; a ref mirrors the state so a poke in the same frame as the trigger is ignored too.
  const pokes = useRef<number[]>([]);
  const [uiia, setUiia] = useState<"spin" | "still" | null>(null);
  const uiiaOn = useRef(false);
  const uiiaTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(lineTimer.current);
      clearTimeout(uiiaTimer.current);
    },
    [],
  );

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

  const startUiia = () => {
    uiiaOn.current = true;
    clearTimeout(lineTimer.current);
    setLine(dict.cat.uiia);
    setUiia(prefersReducedMotion() ? "still" : "spin");
    uiiaTimer.current = setTimeout(() => {
      uiiaOn.current = false;
      setUiia(null);
      setLine("");
    }, UIIA.durationMs);
  };

  const poke = () => {
    if (uiiaOn.current) return;
    const counted = countPoke(pokes.current, Date.now());
    pokes.current = counted.recent;
    if (counted.uiia) startUiia();
    else speak();
  };

  if (state === null || !loaderDone) return null;

  const fading = leaving !== null;
  const spinning = uiia === "spin";
  const layer = (kind: CatState, role: "in" | "out") => (
    <div
      key={`${kind}-${role}`}
      className={cn("hero-cat-layer", role === "out" ? "absolute inset-0" : "relative size-full")}
      data-fade={role === "out" ? "out" : fading ? "in" : undefined}
    >
      <CatArt variant="hero" state={kind} uiia={role === "in" && spinning} className="size-full" />
    </div>
  );

  return (
    <div
      className="hero-cat pointer-events-none absolute inset-0"
      // Spinning, he is awake: the speech box takes its day place, left of his head.
      data-mood={spinning ? "day" : state}
      data-uiia={uiia ?? undefined}
      data-print="hide"
    >
      <div className="hero-cat-hop size-full">
        <button
          type="button"
          className="hero-cat-button pointer-events-auto relative block size-full cursor-pointer"
          aria-label={dict.cat.label}
          onClick={poke}
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
