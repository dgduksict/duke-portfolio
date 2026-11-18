"use client";

import { useEffect, useRef, useState } from "react";
import { CatArt } from "@/components/cat/cat-art";
import { NEAR_RIDGE_EDGE, nearRidgeY, RIDGE_HEIGHT, RIDGE_WIDTH } from "@/components/sky/ridges";
import { Sky } from "@/components/sky/sky";
import { profile } from "@/data/profile";
import { useI18n } from "@/hooks/use-i18n";
import { useNow } from "@/hooks/use-now";
import { catStateForPhase } from "@/lib/cat";
import { displayedProgress, LOADER } from "@/lib/loader";
import { skyAt } from "@/lib/sky";
import { sunPosition } from "@/lib/sun";

/** Where the screen is: waiting in the server HTML, running, lifting away, or gone from the DOM. */
type Phase = "idle" | "run" | "exit" | "gone";

/** How long the full line is held before the screen leaves (ms), and how long the leaving takes. */
const HOLD_MS = 260;
const HOLD_REDUCED_MS = 120;
const LIFT_MS = 520;
const FADE_MS = 220;
/** The layer leaves the DOM this long after it starts to leave. */
const REMOVE_AFTER_MS = 1000;

/**
 * The cat stands on the ridge's shoulder just before its summit (the near ridge peaks around 880): his x in the ridge's
 * own units, close enough to the middle that he and his zzz stay on screen on a phone, where the ridge is cropped to
 * its middle, and his scale (the art is 200 units wide). The anchor is the middle of the ground shadow under him,
 * which sits on the line.
 */
const CAT_X = 840;
const CAT_SCALE = 0.75;
const CAT_ANCHOR = { day: { x: 110, y: 193 }, night: { x: 100, y: 190 } } as const;

/** A little more of the line than the screen shows, so rounding in the arc length never leaves a gap at the edge. */
const LINE_OVERSCAN = 0.03;

const PREFERS_REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * The first-visit loading screen: the portfolio's own live sky fills the screen, the near ridge's top edge is drawn
 * as a line that fills left to right with progress, a small percent readout sits under it, and the programmer cat
 * stands on the ridge (typing by day, asleep when the sky is in its night phase).
 *
 * The overlay is part of the server HTML. `loader.css` hides it unless the gate marked `<html data-loader="on">`,
 * so it is up before hydration and never shows without JavaScript. Once mounted with that mark it takes over
 * (`data-loader="run"`), locks scrolling, shows the lesser of a clock easing over `LOADER.minMs` and the share that
 * has really loaded (fonts, the window load, the sky having a time), holds briefly at 100 %, lifts away, then marks
 * `data-loader="done"` and removes itself. At `LOADER.maxMs` it finishes whatever has not loaded. Scrolling is
 * always released (leaving, unmounting). Only transform, opacity and stroke-dashoffset animate, and progress goes
 * to a CSS custom property and a text node, never through React state.
 */
export function LoadingScreen() {
  const { dict } = useI18n();
  const now = useNow();
  const [phase, setPhase] = useState<Phase>("idle");

  const rootRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const edgeRef = useRef<SVGSVGElement>(null);
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
    const percent = percentRef.current;
    const edge = edgeRef.current;
    if (root === null || percent === null || edge === null) return;

    const marker = html.dataset.loader;
    const resuming = started.current && !completed.current;
    if (marker !== "on" && marker !== "run" && !resuming) return;
    started.current = true;

    let reduced = false;
    try {
      reduced = window.matchMedia(PREFERS_REDUCED).matches;
    } catch {
      // No matchMedia: full motion.
    }
    root.dataset.motion = reduced ? "reduced" : "full";

    // "run" tells the gate's safety release that React has taken over.
    html.dataset.loader = "run";
    try {
      window.sessionStorage.setItem(LOADER.sessionKey, "1");
    } catch {
      // Storage that cannot be written: the loader simply shows again next time.
    }

    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    let locked = true;
    const unlock = () => {
      if (!locked) return;
      locked = false;
      html.style.overflow = previousOverflow;
    };
    setPhase("run");

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

    // The ridge is cropped to its middle on screens narrower than its aspect (slice), so the line must reach the
    // screen's right edge at 100 %: draw only across the visible share of it, from where the screen's left edge is.
    const fit = () => {
      const width = root.clientWidth;
      const height = edge.clientHeight;
      if (!(width > 0 && height > 0)) return;
      const scale = Math.max(width / RIDGE_WIDTH, height / RIDGE_HEIGHT);
      const visible = Math.min(1, width / (RIDGE_WIDTH * scale));
      const from = (1 - visible) / 2;
      root.style.setProperty("--loader-from", from.toFixed(4));
      root.style.setProperty("--loader-span", Math.min(visible + LINE_OVERSCAN, 1 - from).toFixed(4));
    };
    fit();
    window.addEventListener("resize", fit);

    const minMs = reduced ? LOADER.reducedMinMs : LOADER.minMs;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let raf = 0;
    let finishing = false;
    let lastPercent = -1;
    const paint = (progress: number) => {
      const value = Math.round(progress * 100);
      if (value !== lastPercent) {
        lastPercent = value;
        percent.textContent = `${value}%`;
      }
      root.style.setProperty("--loader-p", progress.toFixed(4));
    };

    const leave = () => {
      // The layer still covers the viewport at this instant, so the reflow from the scrollbar returning is unseen.
      unlock();
      setPhase("exit");
      timers.push(
        setTimeout(
          () => {
            completed.current = true;
            html.dataset.loader = "done";
          },
          reduced ? FADE_MS : LIFT_MS,
        ),
        setTimeout(() => setPhase("gone"), REMOVE_AFTER_MS),
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
    // A hidden tab pauses animation frames, and a stuck font or load holds the bar back; either way the screen starts
    // leaving at maxMs, without the hold, and the page is released then.
    timers.push(setTimeout(() => finish(0), LOADER.maxMs));

    return () => {
      cancelAnimationFrame(raf);
      for (const timer of timers) clearTimeout(timer);
      window.removeEventListener("resize", fit);
      unlock();
      // Gone mid-load: the page must not stay marked as loading.
      if (!completed.current) html.dataset.loader = "done";
    };
  }, []);

  if (phase === "gone") return null;

  const anchor = CAT_ANCHOR[catState];
  const catTransform = `translate(${CAT_X - anchor.x * CAT_SCALE} ${nearRidgeY(CAT_X) - anchor.y * CAT_SCALE}) scale(${CAT_SCALE})`;

  return (
    <div
      ref={rootRef}
      className="loader"
      data-phase={phase}
      data-ready={now === null ? "false" : "true"}
      data-print="hide"
      aria-hidden={phase === "idle" ? "true" : undefined}
    >
      <p role="status" className="sr-only">
        {phase === "run" || phase === "exit" ? dict.loader.label : ""}
      </p>
      <div className="loader-stage">
        <Sky now={now} className="absolute inset-0 h-full" />
        <svg
          ref={edgeRef}
          className="loader-edge"
          viewBox={`0 0 ${RIDGE_WIDTH} ${RIDGE_HEIGHT}`}
          preserveAspectRatio="xMidYMax slice"
          aria-hidden="true"
          focusable="false"
        >
          <path className="loader-edge-line" d={NEAR_RIDGE_EDGE} pathLength={1} />
          <g className="loader-cat" transform={catTransform}>
            <CatArt variant="hero" state={catState} />
          </g>
        </svg>
      </div>
      <div className="loader-ground">
        <span ref={percentRef} className="loader-percent" data-loader-percent="" aria-hidden="true">
          0%
        </span>
      </div>
    </div>
  );
}
