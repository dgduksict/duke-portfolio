"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CatArt } from "@/components/cat/cat-art";
import { useCatState } from "@/components/cat/use-cat-state";
import { useLoaderDone } from "@/components/loader/use-loader-done";
import { profile } from "@/data/profile";
import { useI18n } from "@/hooks/use-i18n";
import { type CatState, countPoke, UIIA, WAKE_MS, wakesOnArrival } from "@/lib/cat";
import { skyAt } from "@/lib/sky";
import { sunPosition } from "@/lib/sun";
import { cn } from "@/lib/utils";

/**
 * How long a line stays up, the cross-fade between day and night, and the hop-in (ms; cat.css steps the fade and the
 * hop over the same times).
 */
const BUBBLE_MS = 4000;
const FADE_MS = 600;
const HOP_MS = 1000;
const REDUCED = "(prefers-reduced-motion: reduce)";

/** Whether the visitor asks for less motion; a browser without matchMedia (or one that throws) counts as no. */
function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia(REDUCED).matches;
  } catch {
    return false;
  }
}

/** Whether the sky at `now` is a morning one that wakes him on arrival (lib/cat.ts, the same sky `Sky` paints). */
function morningAt(now: Date | null): boolean {
  if (now === null) return false;
  const { latitude, longitude } = profile.coordinates;
  const sun = sunPosition(now, latitude, longitude);
  return wakesOnArrival(sun, skyAt(sun).phase);
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
 * Sunrise: when night turns to day under the open page he does not cross-fade but wakes, a yawn and then a stretch in
 * drawn frames (WAKE_MS), and settles into his day pose. He does the same once on arrival, right after the hop, when he
 * first shows under a morning twilight or golden sky (lib/cat.ts, `wakesOnArrival`). Day to night stays the
 * cross-fade. Pokes during a wake speak as usual; reduced motion never wakes him (a plain swap).
 *
 * The easter egg: five pokes within 1.5 s (lib/cat.ts, `UIIA`) and he becomes the spinning "UIIA" cat for 3.2 s, awake
 * even at night, turning on the spot in four drawn frames (cat.css) while the box says "UIIA UIIA"; then he settles
 * back into his pose. It cuts a wake short. Pokes while he spins do nothing. Under reduced motion he does not move or
 * change pose: only the box speaks.
 */
export function HeroCat({ now }: { readonly now: Date | null }) {
  const { dict } = useI18n();
  const state = useCatState(now);
  const loaderDone = useLoaderDone();

  // The easter egg: recent poke times, and while it runs, whether he spins ("spin") or only speaks ("still", reduced
  // motion). One timer ends it; a ref mirrors the state so a poke in the same frame as the trigger is ignored too.
  const pokes = useRef<number[]>([]);
  const [uiia, setUiia] = useState<"spin" | "still" | null>(null);
  const uiiaOn = useRef(false);
  const uiiaTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // A flip between day and night keeps the old drawing under the new one for the length of the cross-fade, except
  // night to day with motion allowed (and no spin on): then he wakes instead, and the night drawing goes at once.
  const [shown, setShown] = useState<CatState | null>(state);
  const [leaving, setLeaving] = useState<CatState | null>(null);
  const [wake, setWake] = useState(false);
  if (state !== null && state !== shown) {
    const wakes = shown === "night" && state === "day" && uiia === null && !prefersReducedMotion();
    setShown(state);
    setWake(wakes);
    setLeaving(wakes ? null : shown);
  }
  useEffect(() => {
    if (leaving === null) return;
    const timer = setTimeout(() => setLeaving(null), FADE_MS);
    return () => clearTimeout(timer);
  }, [leaving]);
  useEffect(() => {
    if (!wake) return;
    const timer = setTimeout(() => setWake(false), WAKE_MS);
    return () => clearTimeout(timer);
  }, [wake]);

  // On arrival: once the hop that follows his first appearance is over, a morning sky wakes him. Only the first
  // appearance counts; the ref is set when the hop ends, so a re-run effect (Strict Mode) re-arms the same wait.
  const visible = state !== null && loaderDone;
  const morning = useMemo(() => morningAt(now), [now]);
  const arrived = useRef(false);
  useEffect(() => {
    if (!visible || arrived.current) return;
    const timer = setTimeout(() => {
      arrived.current = true;
      if (morning && !uiiaOn.current && !prefersReducedMotion()) setWake(true);
    }, HOP_MS);
    return () => clearTimeout(timer);
  }, [visible, morning]);

  // What he says when poked: one timer for the line's life, replaced by a new click and gone on unmount.
  const [line, setLine] = useState("");
  const nextQuote = useRef(0);
  const lineTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
    setWake(false);
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

  if (!visible) return null;

  const fading = leaving !== null;
  const spinning = uiia === "spin";
  const waking = wake && !spinning;
  const layer = (kind: CatState, role: "in" | "out") => (
    <div
      key={`${kind}-${role}`}
      className={cn("hero-cat-layer", role === "out" ? "absolute inset-0" : "relative size-full")}
      data-fade={role === "out" ? "out" : fading ? "in" : undefined}
    >
      <CatArt
        variant="hero"
        state={kind}
        uiia={role === "in" && spinning}
        wake={role === "in" && waking}
        className="size-full"
      />
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
