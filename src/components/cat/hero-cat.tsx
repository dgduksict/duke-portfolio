"use client";

import { type PointerEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { CatArt, hatFor } from "@/components/cat/cat-art";
import { PixelSprite } from "@/components/cat/pixel-sprite";
import { HEART } from "@/components/cat/sprites";
import { useCatState } from "@/components/cat/use-cat-state";
import { useLoaderDone } from "@/components/loader/use-loader-done";
import { profile } from "@/data/profile";
import { useHoliday } from "@/hooks/use-holiday";
import { useI18n } from "@/hooks/use-i18n";
import { type CatState, countPoke, PURR, UIIA, WAKE_MS, wakesOnArrival } from "@/lib/cat";
import { furthestHint, HINT, type HintProgress, hintStage, loadHint, saveHint } from "@/lib/cat-hint";
import type { Holiday } from "@/lib/holiday";
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
const COARSE = "(pointer: coarse)";

type Timer = ReturnType<typeof setTimeout>;

/** One purr heart in flight: `id` keys it (and picks its lane, cat.css), `bornAt` is when it set off (ms). */
interface Heart {
  readonly id: number;
  readonly bornAt: number;
}

/** Whether the visitor asks for less motion; a browser without matchMedia (or one that throws) counts as no. */
function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia(REDUCED).matches;
  } catch {
    return false;
  }
}

/** Whether the visitor points with a finger (a coarse pointer); a browser without matchMedia counts as a mouse. */
function pointsByTouch(): boolean {
  try {
    return window.matchMedia(COARSE).matches;
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
 *
 * Hold him to purr (pointer only, lib/cat.ts `PURR`): a primary press held 500 ms purrs instead of poking. The box says
 * "prrr", by day his eye closes contentedly (not in the wake's frames, and not at night, where he sleeps on), and small
 * pixel hearts float up over his head, one every 350 ms while the hold lasts, at most three at once. Release, a
 * `pointercancel` (the finger scrolls) or the pointer leaving him ends the hold: before 500 ms it does nothing, after it
 * no new hearts come and the ones in flight finish. The click that ends a purr is swallowed, so a purr never speaks a
 * line or counts towards UIIA; a shorter press is an ordinary poke. No holds during UIIA. The keyboard keeps poking on
 * Enter and Space exactly as before (a native button clicks on keydown), so there is no keyboard purr. A long press
 * opens no menu or callout on the button. Under reduced motion only the box says "prrr".
 *
 * Holidays: he wears a Santa hat from 20 November to 31 December and a party hat on 5 January (lib/holiday.ts, by the
 * Ulaanbaatar calendar), in every drawing and frame. `holiday` is the one the page already worked out (the hero
 * passes it, so the scene and the cat agree); left out, he works it out himself from `now` and `?holiday=`
 * (useHoliday, read after mount, so the server HTML has no hat). `null` is an ordinary day. On a holiday his first
 * line awake is a festive one (the dictionary's `cat.festive`), then the usual quotes from the first; at night he
 * still says "shh". It is only the words: the poke still counts towards UIIA, and a purr's click still says nothing.
 *
 * The pet hint (lib/cat-hint.ts): HINT.delayMs after he first shows, a quiet label in the speech box's place teaches
 * the visitor to poke him ("click to pet", "tap to pet" with a coarse pointer), then after the first real poke (the
 * festive one and the one that starts UIIA included) to hold him ("hold to purr"); after the first purr it never shows
 * again. Progress lives in localStorage (`duke:cat-hint`) and only moves forward; storage, like the pointer type, is
 * read on the client after mount, and when it is blocked the page view keeps the progress in memory. The hint hides
 * while a line is up, during UIIA, a wake and a purr. At night it still says "click to pet" (pokes say "shh", purrs
 * work). The button points at it with `aria-describedby` while it shows; it never takes the pointer, and the layer
 * is hidden in print.
 */
export function HeroCat({ now, holiday }: { readonly now: Date | null; readonly holiday?: Holiday | null }) {
  const { dict } = useI18n();
  const state = useCatState(now);
  // The hook always runs (hooks never run conditionally); a holiday passed in wins over it.
  const ownHoliday = useHoliday(now);
  const today = holiday === undefined ? ownHoliday : holiday;
  const hat = hatFor(today);
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
  // On a holiday the first line he speaks awake is the festive one; the quotes then start from the first.
  const festiveSaid = useRef(false);
  const lineTimer = useRef<Timer | undefined>(undefined);

  // The purr: whether he purrs ("move", or "still" under reduced motion) and the hearts in flight. `held` is the
  // pointer holding him (one at a time), `holdTimer` waits out PURR.holdMs, `heartTimer` sends hearts while he purrs
  // and each heart leaves on its own timer in `heartLeaves`. `live` mirrors the hearts for the cap; `purred` swallows
  // the click that ends a purr.
  const [purr, setPurr] = useState<"move" | "still" | null>(null);
  const [hearts, setHearts] = useState<readonly Heart[]>([]);
  const live = useRef<readonly Heart[]>([]);
  const nextHeart = useRef(0);
  const held = useRef<number | null>(null);
  const purring = useRef(false);
  const purred = useRef(false);
  const holdTimer = useRef<Timer | undefined>(undefined);
  const heartTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const heartLeaves = useRef(new Set<Timer>());

  // The pet hint: how far this visitor has got (storage is read when the hint falls due and on every step, and the
  // furthest seen is kept here, so a blocked storage still works for the view), mirrored in state for the render,
  // whether its delay after his arrival is over, and the pointer type (read then too, never on the server).
  const hintId = useId();
  const hintProgress = useRef<HintProgress | null>(null);
  const [progress, setProgress] = useState<HintProgress | null>(null);
  const [hintDue, setHintDue] = useState(false);
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    if (!visible || hintDue) return;
    const timer = setTimeout(() => {
      hintProgress.current = furthestHint(loadHint(), hintProgress.current);
      setCoarse(pointsByTouch());
      setProgress(hintProgress.current);
      setHintDue(true);
    }, HINT.delayMs);
    return () => clearTimeout(timer);
  }, [visible, hintDue]);

  /** The visitor got as far as `step`: remembered (never backwards, so a poke after a purr changes nothing). */
  const reach = (step: HintProgress) => {
    const next = furthestHint(furthestHint(loadHint(), hintProgress.current), step);
    if (next === null) return;
    hintProgress.current = next;
    setProgress(next);
    saveHint(next);
  };

  useEffect(() => {
    const leaves = heartLeaves.current;
    return () => {
      clearTimeout(lineTimer.current);
      clearTimeout(uiiaTimer.current);
      clearTimeout(holdTimer.current);
      clearInterval(heartTimer.current);
      for (const timer of leaves) clearTimeout(timer);
      leaves.clear();
    };
  }, []);

  const speak = () => {
    let text = dict.cat.sleeping;
    if (state !== "night" && today !== null && !festiveSaid.current) {
      festiveSaid.current = true;
      text = dict.cat.festive[today];
    } else if (state !== "night") {
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
    // A hold still waiting for its purr gives up: no purr during UIIA (a purr itself blocks pokes, so none is running).
    clearTimeout(holdTimer.current);
    held.current = null;
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
    if (uiiaOn.current || purring.current) return;
    reach("poked");
    const counted = countPoke(pokes.current, Date.now());
    pokes.current = counted.recent;
    if (counted.uiia) startUiia();
    else speak();
  };

  /** One more heart over his head, unless three are up already; it leaves after PURR.heartLifeMs. */
  const addHeart = () => {
    if (live.current.length >= PURR.maxHearts) return;
    const heart: Heart = { id: nextHeart.current, bornAt: Date.now() };
    nextHeart.current += 1;
    live.current = [...live.current, heart];
    setHearts(live.current);
    const leave = setTimeout(() => {
      heartLeaves.current.delete(leave);
      live.current = live.current.filter((other) => other.id !== heart.id);
      setHearts(live.current);
    }, PURR.heartLifeMs);
    heartLeaves.current.add(leave);
  };

  const startPurr = () => {
    purring.current = true;
    purred.current = true;
    reach("purred");
    clearTimeout(lineTimer.current);
    setLine(dict.cat.purr);
    if (prefersReducedMotion()) {
      setPurr("still");
      return;
    }
    setPurr("move");
    addHeart();
    heartTimer.current = setInterval(addHeart, PURR.heartEveryMs);
  };

  /** The hold is over: a pending purr never starts; a purr stops sending hearts and its line clears like any other. */
  const endHold = () => {
    held.current = null;
    clearTimeout(holdTimer.current);
    clearInterval(heartTimer.current);
    if (!purring.current) return;
    purring.current = false;
    setPurr(null);
    clearTimeout(lineTimer.current);
    lineTimer.current = setTimeout(() => setLine(""), BUBBLE_MS);
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (held.current !== null) return;
    // A purr let go off the cat sends him no click; a fresh press starts clean.
    purred.current = false;
    if (event.button !== 0 || uiiaOn.current) return;
    held.current = event.pointerId;
    holdTimer.current = setTimeout(startPurr, PURR.holdMs);
  };

  const onPointerEnd = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerId === held.current) endHold();
  };

  const onClick = () => {
    // A click while he still purrs (Enter during a mouse hold) is no poke, and leaves the release's click to be eaten.
    if (purring.current) return;
    if (purred.current) {
      purred.current = false;
      return;
    }
    poke();
  };

  if (!visible) return null;

  const fading = leaving !== null;
  const spinning = uiia === "spin";
  const waking = wake && !spinning;
  const stage = hintDue ? hintStage(progress) : null;
  const hint =
    stage === null || line !== "" || uiia !== null || waking || purr !== null
      ? null
      : stage === "hold"
        ? dict.cat.holdHint
        : dict.cat.petHint[coarse ? "tap" : "click"];
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
        content={role === "in" && purr === "move"}
        hat={hat}
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
      data-purr={purr === null ? undefined : ""}
      data-print="hide"
    >
      <div className="hero-cat-hop size-full">
        <button
          type="button"
          className="hero-cat-button pointer-events-auto relative block size-full cursor-pointer"
          aria-label={dict.cat.label}
          aria-describedby={hint === null ? undefined : hintId}
          onClick={onClick}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onPointerLeave={onPointerEnd}
          // The keyboard pokes on keydown; a purr's click it never sends must not swallow that poke.
          onKeyDown={() => {
            if (!purring.current) purred.current = false;
          }}
          onContextMenu={(event) => event.preventDefault()}
        >
          {leaving !== null ? layer(leaving, "out") : null}
          {layer(state, "in")}
        </button>
      </div>
      {/* The hearts take their colour from the cat's palette (cat.css), so the layer carries `cat-art`. */}
      <div className="hero-cat-hearts cat-art" aria-hidden="true">
        {hearts.map((heart) => (
          <svg
            key={heart.id}
            className="hero-cat-heart"
            data-lane={heart.id % 3}
            viewBox="0 0 5 5"
            focusable="false"
            shapeRendering="crispEdges"
          >
            <PixelSprite map={HEART} scale={1} />
          </svg>
        ))}
      </div>
      <div role="status" aria-live="polite" className="hero-cat-bubble px-box">
        {line}
      </div>
      {hint === null ? null : (
        <div id={hintId} className="hero-cat-hint px-box">
          {hint}
        </div>
      )}
    </div>
  );
}
