"use client";

import { useEffect, useRef, useState } from "react";
import { YarnStage } from "@/components/loader/yarn-stage";
import { useI18n } from "@/hooks/use-i18n";
import { displayedProgress, LOADER, loaderReadout } from "@/lib/loader";
import { isStalled, pickYarn, YARN, type YarnColour, type YarnEnding, yarnPositions } from "@/lib/yarn";

/** Where the screen is: waiting in the server HTML, running, wiping away, or gone from the DOM. */
type Phase = "idle" | "run" | "exit" | "gone";

/**
 * What the yarn cat is doing (`data-yarn-motion` on the overlay, read by loader.css): sitting still (reduced motion),
 * chasing the ball, crouched because no new block has lit for a while, or playing this visit's ending at 100 %.
 */
type YarnMotion = "still" | "run" | "stall" | "end";

/**
 * How long the full bar is held before the screen leaves under reduced motion (ms; with full motion the ending's
 * `YARN.endingMs` is the hold), and how long the leaving takes.
 */
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
 * The first-visit loading screen: a plain wall with a row of chunky blocks in a wooden trough that fills left to right
 * with progress, a pixel percent under it, and on top of the trough the black pixel cat chasing a ball of yarn. The lit
 * blocks are the unwound yarn: the ball rides the leading edge of the fill and the cat runs a few blocks behind it
 * (`yarnPositions`); with no new block for a while he crouches, and at 100 % this visit's ending plays (he pounces on
 * the ball, tumbles over with it, or sits on it proudly) before the wipe. The yarn's colour and the ending are picked
 * per visit on the client (`pickYarn`), never during render.
 *
 * The overlay is part of the server HTML. `loader.css` hides it unless the gate marked `<html data-loader="on">`
 * (and locks scrolling while it is only marked), so it is up before hydration and never shows without JavaScript; until
 * React takes over it is a still picture (the cat sitting at the bar's left end, an amber ball just ahead). Mounted with
 * that mark it takes over (`data-loader="run"`), locks scrolling, shows the lesser of a clock easing over
 * `LOADER.minMs` and the share that has really loaded (fonts and the window load, half each), plays the ending at
 * 100 % for `YARN.endingMs`, wipes away in steps, then marks `data-loader="done"` and removes itself. At
 * `LOADER.maxMs` it finishes whatever has not loaded, without the ending, and starts leaving at once. Scrolling is
 * always released (leaving, unmounting, a failed setup). On a repeat visit or any other route it removes itself at
 * once. Progress never goes through React state: the blocks, the percent, the cat's and ball's places and the cat's
 * motion are written to the DOM only when their value changes, and only transform and opacity animate.
 *
 * Under reduced motion the cat sits still at the bar's left end, the ball jumps from block to block with the fill, no
 * ending plays and the exit is a short fade.
 *
 * Its colours are the dark theme's (`className="dark"`), whatever the visitor's theme.
 */
export function LoadingScreen() {
  const [phase, setPhase] = useState<Phase>("idle");
  // Once it is gone nothing of it stays mounted.
  if (phase === "gone") return null;
  return <Overlay phase={phase} onPhase={setPhase} />;
}

function Overlay({ phase, onPhase }: { readonly phase: Phase; readonly onPhase: (phase: Phase) => void }) {
  const { dict } = useI18n();

  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  // Survive a simulated unmount (React strict mode) so the screen can pick up where it was, with the same yarn.
  const started = useRef(false);
  const completed = useRef(false);
  const yarn = useRef<{ colour: YarnColour; ending: YarnEnding } | null>(null);

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
    let lastBlockAt = 0;
    const blocks = Array.from(bar.children) as HTMLElement[];
    const stage = root.querySelector<HTMLElement>(".yarn-stage");
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

      // This visit's yarn, decided here on the client (never during render) and kept across a strict-mode resume.
      yarn.current ??= pickYarn(Math.random);
      root.dataset.yarnColour = yarn.current.colour;
      root.dataset.yarnEnding = yarn.current.ending;
      let motion: YarnMotion = reduced ? "still" : "run";
      root.dataset.yarnMotion = motion;
      const setMotion = (next: YarnMotion) => {
        if (next === motion) return;
        motion = next;
        root.dataset.yarnMotion = next;
      };

      // What has loaded: fonts and the window load, half each.
      const fonts = (document as { fonts?: FontFaceSet }).fonts;
      let fontsReady = fonts === undefined;
      if (fonts !== undefined) {
        const ready = () => {
          fontsReady = true;
        };
        fonts.ready.then(ready, ready);
      }
      const loaded = () => ((fontsReady ? 1 : 0) + (document.readyState === "complete" ? 1 : 0)) / 2;

      const minMs = reduced ? LOADER.reducedMinMs : LOADER.minMs;
      const paint = (progress: number) => {
        // One value drives both, so the readout never says 100 % with a block still dark.
        const { percent: value, filled } = loaderReadout(progress, BLOCKS);
        if (value !== lastPercent) {
          lastPercent = value;
          percent.textContent = `${value}%`;
        }
        if (filled !== lastFilled) {
          lastFilled = filled;
          lastBlockAt = performance.now();
          blocks.forEach((block, i) => {
            block.dataset.on = i < filled ? "true" : "false";
          });
          // The ball rides the fill's leading edge and the cat runs behind it, in blocks (loader.css places them).
          const { ball, cat } = yarnPositions(filled, BLOCKS);
          stage?.style.setProperty("--ball", String(ball));
          stage?.style.setProperty("--cat", String(cat));
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
      /** Fills the bar, plays the ending if `ending` (the hold is then its length), and leaves after `hold` ms. */
      const finish = (hold: number, ending: boolean) => {
        if (finishing) return;
        finishing = true;
        cancelAnimationFrame(raf);
        paint(1);
        if (ending) setMotion("end");
        if (hold > 0) timers.push(setTimeout(leave, hold));
        else leave();
      };

      const start = performance.now();
      const tick = () => {
        const progress = displayedProgress(performance.now() - start, loaded(), minMs);
        paint(progress);
        if (progress >= 1) {
          if (reduced) finish(HOLD_REDUCED_MS, false);
          else finish(YARN.endingMs, true);
          return;
        }
        if (!reduced) setMotion(isStalled(performance.now() - lastBlockAt, lastFilled, BLOCKS) ? "stall" : "run");
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      // A hidden tab pauses animation frames, and a stuck font or load holds the bar back; either way the screen
      // starts leaving at maxMs, without the ending or a hold, and the page is released then.
      timers.push(setTimeout(() => finish(0, false), LOADER.maxMs));

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
        data-print="hide"
        aria-hidden={phase === "idle" ? "true" : undefined}
      >
        <YarnStage />
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
