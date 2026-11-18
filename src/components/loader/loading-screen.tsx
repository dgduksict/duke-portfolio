"use client";

import { useEffect, useRef, useState } from "react";
import { CatArt } from "@/components/cat/cat-art";
import { WindowScene } from "@/components/scene/window-scene";
import { profile } from "@/data/profile";
import { useI18n } from "@/hooks/use-i18n";
import { useNow } from "@/hooks/use-now";
import { catStateForPhase } from "@/lib/cat";
import { displayedProgress, LOADER } from "@/lib/loader";
import { skyAt } from "@/lib/sky";
import { sunPosition } from "@/lib/sun";

/** Where the screen is: waiting in the server HTML, running, wiping away, or gone from the DOM. */
type Phase = "idle" | "run" | "exit" | "gone";

/** How long the full bar is held before the screen leaves (ms), and how long the leaving takes. */
const HOLD_MS = 260;
const HOLD_REDUCED_MS = 120;
const WIPE_MS = 520;
const FADE_MS = 220;
/** The layer leaves the DOM this long after it starts to leave. */
const REMOVE_AFTER_MS = 1000;

/** The progress bar is this many chunky blocks, filled from the left. */
const BLOCKS = 20;
const BLOCK_KEYS: readonly number[] = Array.from({ length: BLOCKS }, (_, i) => i);

const PREFERS_REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * The first-visit loading screen: a small pixel scene, the window of the hero (the live pixel sky over Ulaanbaatar,
 * the skyline, the sill and its plants) with the programmer cat standing on the sill (at his laptop by day, asleep
 * when the sky is in its night phase), and under it a row of chunky blocks that fills left to right with progress,
 * with a pixel percent beside it.
 *
 * The overlay is part of the server HTML. `loader.css` hides it unless the gate marked `<html data-loader="on">`
 * (and locks scrolling while it is only marked), so it is up before hydration and never shows without JavaScript.
 * Mounted with that mark it takes over (`data-loader="run"`), locks scrolling, shows the lesser of a clock easing over
 * `LOADER.minMs` and the share that has really loaded (fonts, the window load, the sky having a time), holds briefly
 * at 100 %, wipes away in steps, then marks `data-loader="done"` and removes itself. At `LOADER.maxMs` it finishes
 * whatever has not loaded. Scrolling is always released (leaving, unmounting, a failed setup). On a repeat visit or any
 * other route it removes itself at once. Progress never goes through React state: the blocks and the percent are
 * written to the DOM only when their value changes, and only transform and opacity animate.
 *
 * Its colours are the dark theme's (`className="dark"`), whatever the visitor's theme, like the sky.
 */
export function LoadingScreen() {
  const [phase, setPhase] = useState<Phase>("idle");
  // Once it is gone nothing of it stays mounted: not the scene, the cat, or the minute timer of `useNow`.
  if (phase === "gone") return null;
  return <Overlay phase={phase} onPhase={setPhase} />;
}

function Overlay({ phase, onPhase }: { readonly phase: Phase; readonly onPhase: (phase: Phase) => void }) {
  const { dict } = useI18n();
  const now = useNow();

  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const hasTime = useRef(false);
  // Survive a simulated unmount (React strict mode) so the screen can pick up where it was.
  const started = useRef(false);
  const completed = useRef(false);

  const skyPhase =
    now === null
      ? undefined
      : skyAt(sunPosition(now, profile.coordinates.latitude, profile.coordinates.longitude)).phase;
  const catState = catStateForPhase(skyPhase);

  useEffect(() => {
    hasTime.current = now !== null;
  }, [now]);

  useEffect(() => {
    const html = document.documentElement;
    const root = rootRef.current;
    const bar = barRef.current;
    const percent = percentRef.current;
    if (root === null || bar === null || percent === null) return;

    const marker = html.dataset.loader;
    const resuming = started.current && !completed.current;
    if (marker !== "on" && marker !== "run" && !resuming) {
      // A repeat visit, another route, or the gate's safety release got here first: nothing to show.
      onPhase("gone");
      return;
    }
    started.current = true;

    const previousOverflow = html.style.overflow;
    let locked = false;
    const unlock = () => {
      if (!locked) return;
      locked = false;
      html.style.overflow = previousOverflow;
    };
    const timers: ReturnType<typeof setTimeout>[] = [];
    let raf = 0;
    let finishing = false;
    let lastFilled = -1;
    let lastPercent = -1;
    const blocks = Array.from(bar.children) as HTMLElement[];
    const teardown = () => {
      cancelAnimationFrame(raf);
      for (const timer of timers) clearTimeout(timer);
      unlock();
    };

    try {
      let reduced = false;
      try {
        reduced = window.matchMedia(PREFERS_REDUCED).matches;
      } catch {
        // No matchMedia: full motion.
      }
      root.dataset.motion = reduced ? "reduced" : "full";

      // What has loaded: fonts, the window load, and the sky having a time. Each is a third.
      const fonts = (document as { fonts?: FontFaceSet }).fonts;
      let fontsReady = fonts === undefined;
      if (fonts !== undefined) {
        const ready = () => {
          fontsReady = true;
        };
        fonts.ready.then(ready, ready);
      }
      const loaded = () =>
        ((fontsReady ? 1 : 0) + (document.readyState === "complete" ? 1 : 0) + (hasTime.current ? 1 : 0)) / 3;

      const minMs = reduced ? LOADER.reducedMinMs : LOADER.minMs;
      const paint = (progress: number) => {
        const value = Math.round(progress * 100);
        if (value !== lastPercent) {
          lastPercent = value;
          percent.textContent = `${value}%`;
        }
        // Whole blocks only; the small epsilon keeps 100 % from rounding down to 19 blocks.
        const filled = Math.min(BLOCKS, Math.floor(progress * BLOCKS + 1e-6));
        if (filled !== lastFilled) {
          lastFilled = filled;
          blocks.forEach((block, i) => {
            block.dataset.on = i < filled ? "true" : "false";
          });
        }
      };

      const leave = () => {
        // The layer still covers the viewport at this instant, so the reflow from the scrollbar returning is unseen.
        unlock();
        onPhase("exit");
        timers.push(
          setTimeout(
            () => {
              completed.current = true;
              html.dataset.loader = "done";
            },
            reduced ? FADE_MS : WIPE_MS,
          ),
          setTimeout(() => onPhase("gone"), REMOVE_AFTER_MS),
        );
      };
      const finish = (hold: number) => {
        if (finishing) return;
        finishing = true;
        cancelAnimationFrame(raf);
        paint(1);
        timers.push(setTimeout(leave, hold));
      };

      const start = performance.now();
      const tick = () => {
        const progress = displayedProgress(performance.now() - start, loaded(), minMs);
        paint(progress);
        if (progress >= 1) finish(reduced ? HOLD_REDUCED_MS : HOLD_MS);
        else raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      // A hidden tab pauses animation frames, and a stuck font or load holds the bar back; either way the screen
      // starts leaving at maxMs, without the hold, and the page is released then.
      timers.push(setTimeout(() => finish(0), LOADER.maxMs));

      // Everything that can throw has run: only now take the page over. "run" tells the gate's safety release that
      // React has taken over, and hands the scroll lock from CSS (`html[data-loader="on"]`) to this component.
      html.dataset.loader = "run";
      html.style.overflow = "hidden";
      locked = true;
      try {
        window.sessionStorage.setItem(LOADER.sessionKey, "1");
      } catch {
        // Storage that cannot be written: the loader simply shows again next time.
      }
      onPhase("run");
    } catch {
      // A setup that fails must not strand the page: no marker left on "run", no scroll lock, no overlay.
      teardown();
      completed.current = true;
      html.dataset.loader = "done";
      onPhase("gone");
      return;
    }

    return () => {
      teardown();
      // Gone mid-load: the page must not stay marked as loading.
      if (!completed.current) html.dataset.loader = "done";
    };
    // `onPhase` is a state setter: stable.
  }, [onPhase]);

  return (
    <>
      {/* Outside the aria-hidden overlay and present (empty) from the server HTML, so the label is announced when it appears. */}
      <p role="status" className="sr-only">
        {phase === "run" || phase === "exit" ? dict.loader.label : ""}
      </p>
      <div
        ref={rootRef}
        className="loader dark"
        data-phase={phase}
        data-ready={now === null ? "false" : "true"}
        data-print="hide"
        aria-hidden={phase === "idle" ? "true" : undefined}
      >
        <WindowScene now={now} compact>
          <CatArt variant="hero" state={catState} className="size-full" />
        </WindowScene>
        <div className="loader-meter">
          <div ref={barRef} className="loader-bar" data-loader-bar="" aria-hidden="true">
            {BLOCK_KEYS.map((i) => (
              <span key={i} className="loader-block" data-loader-block="" data-on="false" />
            ))}
          </div>
          <span ref={percentRef} className="loader-percent" data-loader-percent="" aria-hidden="true">
            0%
          </span>
        </div>
      </div>
    </>
  );
}
