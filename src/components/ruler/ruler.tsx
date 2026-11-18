"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { RulerCat } from "@/components/cat/ruler-cat";
import { useCatState } from "@/components/cat/use-cat-state";
import { navItems } from "@/data/navigation";
import { useI18n } from "@/hooks/use-i18n";
import { useNow } from "@/hooks/use-now";
import { GROOM_AFTER_MS, type RulerPose, rulerCatPose, TYPING_WINDOW_MS } from "@/lib/cat";
import {
  RAIL_BOTTOM,
  RAIL_TOP,
  RULER_MIN_WIDTH,
  buildTicks,
  markerProgress,
  needleVisible,
  pointerToProgress,
  progressToScrollTop,
  railBox,
  scrollProgress,
} from "@/lib/ruler";

declare global {
  interface Window {
    /** True while the Ruler draws the scrollbar; the gate's safety release reads it (lib/ruler-gate.ts). */
    __rulerLive?: boolean;
  }
}

/** Where the ruler shows: the same query as the gate script. */
const QUERY = `(min-width: ${RULER_MIN_WIDTH}px) and (pointer: fine)`;
const REDUCED = "(prefers-reduced-motion: reduce)";

const TICKS = buildTicks();
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
const COLUMNS = [0, 1, 2] as const;

/** The sections the markers point at, top to bottom: the hero, then every nav section. */
const SECTION_IDS: readonly string[] = ["top", ...navItems.map((item) => item.id)];

/** A press that travels less than this (px) before it is released is a click, not a drag. */
const DRAG_SLOP = 3;
/** A marker shows its label while the needle is within this many px of it. */
const NEAR_PX = 22;
/** A document must be taller than the viewport by this much (px) to go live, and only taller to stay live. */
const LIVE_SLACK_PX = 1;
/** The site header's height (px): nothing of the cat may ever reach above its bottom edge. */
const HEADER_PX = 64;
/**
 * How far the cat's box reaches above the needle's line (px): the readout plate's top edge (26) and his 32 px box on
 * it, plus the 4 px apex of his arrival hop (cat.css). Under the page's first few percent the needle is too close to
 * the header for that, so he stays away until his top clears the header with a little air (CAT_MIN_Y, in needle px).
 */
const CAT_REACH_PX = 62;
const CAT_MIN_Y = HEADER_PX + CAT_REACH_PX - RAIL_TOP + 4;
/** A pause longer than this counts as this long: the pose maths only ever sees a finite number. */
const IDLE_CAP_MS = 60_000;

type Behavior = "smooth" | "instant";

/** What the last pass wrote, so a pass only touches the DOM where something changed. */
interface Written {
  pct: number;
  needleY: number;
  shown: boolean | null;
  hidden: boolean | null;
  marks: string[];
}

/** What the cat's props were when his pose last changed: the only thing React ever hears from the scroll. */
interface CatSnapshot {
  ms: number;
  progress: number;
}

const freshWritten = (): Written => ({
  pct: -1,
  needleY: Number.NaN,
  shown: null,
  hidden: null,
  marks: SECTION_IDS.map(() => ""),
});

/** Where a press on the rail started, and whether it has turned into a drag. */
interface Press {
  id: number;
  startY: number;
  dragging: boolean;
  /** Index into SECTION_IDS when the press started on a section marker. */
  mark: number | null;
}

/** `smooth` for a click, unless the visitor prefers reduced motion. */
const clickBehavior = (): Behavior => (window.matchMedia(REDUCED).matches ? "instant" : "smooth");

/** What the last measuring pass found (the pointer handlers reuse it instead of asking the layout again). */
interface Metrics {
  viewport: number;
  docHeight: number;
}

/** Scrolls the page to the point of the rail under `clientY`, on the cached measurements. */
function scrollToRail(clientY: number, behavior: Behavior, metrics: Metrics) {
  const vh = metrics.viewport > 0 ? metrics.viewport : window.innerHeight;
  const docHeight = metrics.viewport > 0 ? metrics.docHeight : document.documentElement.scrollHeight;
  const top = progressToScrollTop(pointerToProgress(clientY, railBox(vh)), docHeight, vh);
  window.scrollTo({ top, behavior });
}

/** Scrolls the page so the section's top edge is at the top of the viewport (where its marker meets the needle). */
function scrollToSection(index: number) {
  const section = document.getElementById(SECTION_IDS[index] ?? "");
  if (!section) return;
  window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY, behavior: clickBehavior() });
}

/**
 * The pixel ruler scrollbar: on a wide, fine-pointer homepage visit it replaces the native scrollbar (hidden through
 * `<html data-ruler="on">`, set before hydration by RulerGate) with a narrow panel on the right edge: square ticks, an
 * arrow needle with a blocky percent readout, and a square marker for the top and for each section that names itself
 * on hover or when the needle is near. A click or a drag on the panel scrolls the page there. Native scrolling is
 * never intercepted (no wheel, touch or key listeners); the ruler is a pointer convenience, hidden from assistive tech.
 *
 * The needle is one element moved with `transform`; the ruler cat (components/cat/ruler-cat.tsx) rides it, on top of
 * its readout. He shows with the needle but only once he would clear the header (CAT_MIN_Y), and by day his pose
 * follows the scroll: the same rAF pass notes when the page last moved (no second scroll listener) and one timeout,
 * re-armed after the last scroll, wakes the pass at the 150 ms and 1200 ms marks. React hears about the cat only when
 * his pose changes (or he shows or hides), never per frame.
 * All visible text (marker names, the readout's digits) is drawn by CSS from `data-*` attributes, so find-in-page
 * never lands on it.
 *
 * It renders nothing on the server, away from the homepage (the layout mounts it on every route), below 900px,
 * without a fine pointer, and on a page no taller than the window; in those cases it also removes `data-ruler`, so the native scrollbar comes back. It hides (visibility) while something
 * locks the page scroll with `overflow: hidden` on `<html>` (the loader).
 *
 * One passive scroll listener, one passive resize listener, a ResizeObserver on the body, a MutationObserver on
 * `<html>`'s style and the media query's change event do nothing but schedule one coalesced animation frame. That
 * frame measures only when something may have changed (the dirty flag), reads before it writes, and writes only what
 * differs from last time.
 */
export function Ruler() {
  const { dict, language, t } = useI18n();
  const [live, setLive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const colRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const markRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const refreshRef = useRef<() => void>(() => {});
  const syncRef = useRef<() => void>(() => {});
  const press = useRef<Press | null>(null);
  const metrics = useRef<Metrics>({ viewport: 0, docHeight: 0 });
  const pathname = usePathname();

  // The cat: awake or asleep from the sky, and the snapshot the rendered cat works its pose out from (null = hidden).
  const catState = useCatState(useNow());
  const catStateRef = useRef(catState);
  const [cat, setCat] = useState<CatSnapshot | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia(QUERY);
    let raf = 0;
    let isLive = false;
    let dirty = true;
    let written = freshWritten();
    // Measured only when the layout may have changed (resize, body size, media query, language), not on every scroll.
    let viewport = 0;
    let docHeight = 0;
    let sectionTops: (number | null)[] = SECTION_IDS.map(() => null);
    // The cat: where the page was last time (to see it move), when it moved, the pose React last heard of, the one
    // timeout that wakes a pass at the next threshold.
    let lastY = window.scrollY;
    let movedAt = Number.NEGATIVE_INFINITY;
    let catPose: RulerPose | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const measure = () => {
      dirty = false;
      viewport = window.innerHeight;
      docHeight = root.scrollHeight;
      metrics.current = { viewport, docHeight };
      const y = window.scrollY;
      sectionTops = SECTION_IDS.map((id) => {
        const section = document.getElementById(id);
        return section ? section.getBoundingClientRect().top + y : null;
      });
    };

    // Going live needs a document a little taller than the viewport, staying live only a taller one: a page within a
    // pixel of the viewport (hiding the native bar can make it just fit) would otherwise flip between the two forever.
    const wanted = () =>
      window.location.pathname === "/" &&
      media.matches &&
      Number.isFinite(viewport) &&
      viewport > 0 &&
      docHeight > viewport + (isLive ? 0 : LIVE_SLACK_PX);

    // The attribute hides the native scrollbar; the flag tells the gate's safety release that the ruler took over.
    const claim = (on: boolean) => {
      window.__rulerLive = on;
      if (on && root.dataset.ruler !== "on") root.dataset.ruler = "on";
      if (!on && root.dataset.ruler !== undefined) delete root.dataset.ruler;
    };

    const clearTimer = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
    };

    // Called once per pass while the ruler shows: stamps a scroll, works the pose out from the clock (so a late timeout
    // is harmless), tells React only when it changed, and keeps at most one timeout pending for the next threshold.
    const updateCat = (progress: number, show: boolean) => {
      const now = performance.now();
      const y = window.scrollY;
      if (y !== lastY) {
        lastY = y;
        movedAt = now;
      }
      const ms = Math.min(now - movedAt, IDLE_CAP_MS);
      const state = catStateRef.current;
      const pose = show && state !== null ? rulerCatPose({ state, msSinceScroll: ms, progress }) : null;
      if (pose !== catPose) {
        catPose = pose;
        setCat(pose === null ? null : { ms, progress });
      }
      if (pose !== "type" && pose !== "sit") return clearTimer();
      if (timer !== undefined) return;
      const next = ms < TYPING_WINDOW_MS ? TYPING_WINDOW_MS - ms : GROOM_AFTER_MS - ms;
      timer = setTimeout(() => {
        timer = undefined;
        schedule();
      }, next + 1);
    };

    const pass = () => {
      raf = 0;
      if (dirty) measure();
      const on = wanted();
      claim(on);
      if (on !== isLive) {
        isLive = on;
        setLive(on);
      }
      if (!on) {
        clearTimer();
        if (catPose !== null) {
          catPose = null;
          setCat(null);
        }
      }
      const box = rootRef.current;
      const needle = needleRef.current;
      const readout = readoutRef.current;
      if (!on || !box || !needle || !readout) return;

      // Reads first (style only: the layout was measured above), then writes.
      const locked = getComputedStyle(root).overflow === "hidden";
      const progress = scrollProgress(window.scrollY, docHeight, viewport);
      const rail = railBox(viewport);
      const shown = needleVisible(progress);
      // Whole pixels, so the arrow and its line stay crisp.
      const needleY = Math.round(progress * rail.height);

      if (locked !== written.hidden) {
        written.hidden = locked;
        box.style.visibility = locked ? "hidden" : "";
      }
      if (locked) clearTimer();
      else updateCat(progress, shown && needleY >= CAT_MIN_Y);

      if (needleY !== written.needleY) {
        written.needleY = needleY;
        needle.style.transform = `translate3d(0,${needleY}px,0)`;
      }
      if (shown !== written.shown) {
        written.shown = shown;
        if (shown) needle.dataset.show = "";
        else delete needle.dataset.show;
      }

      const pct = Math.round(progress * 100);
      if (pct !== written.pct) {
        written.pct = pct;
        readout.dataset.value = String(pct);
        const digits = [Math.floor(pct / 100), Math.floor(pct / 10) % 10, pct % 10];
        colRefs.current.forEach((col, i) => {
          if (!col) return;
          const strip = col.firstElementChild as HTMLElement | null;
          if (strip) strip.style.transform = `translateY(${-(digits[i] ?? 0) * 10}%)`;
          // The hundreds column only exists at 100; below that the readout keeps two digits (07, 42).
          if (i === 0) {
            if (pct >= 100) col.dataset.on = "";
            else delete col.dataset.on;
          }
        });
      }

      SECTION_IDS.forEach((_, i) => {
        const el = markRefs.current[i];
        if (!el) return;
        const top = sectionTops[i] ?? null;
        const p = top === null ? null : markerProgress(top, docHeight, viewport);
        const passed = p !== null && progress >= p - 0.001;
        const near = p !== null && shown && Math.abs(p * rail.height - needleY) < NEAR_PX;
        const key = p === null ? "off" : `${p.toFixed(4)}|${passed}|${near}`;
        if (key === written.marks[i]) return;
        written.marks[i] = key;
        if (p === null) {
          delete el.dataset.on;
          return;
        }
        el.dataset.on = "";
        el.style.top = `${p * 100}%`;
        if (passed) el.dataset.passed = "";
        else delete el.dataset.passed;
        if (near) el.dataset.near = "";
        else delete el.dataset.near;
      });
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(pass);
    };
    const remeasure = () => {
      dirty = true;
      schedule();
    };
    // Called when the rendered DOM is new (the ruler just went live) or the sections may have moved (a language
    // switch reflows every one of them): measure and write everything again.
    refreshRef.current = () => {
      written = freshWritten();
      remeasure();
    };

    // Take over at once, before the next paint: a StrictMode remount or a client-side navigation must not flash the
    // native scrollbar for a frame.
    syncRef.current = () => {
      measure();
      claim(wanted());
      remeasure();
    };
    window.__rulerLive = true;
    measure();
    claim(wanted());
    schedule();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure, { passive: true });
    media.addEventListener("change", remeasure);
    // The page grows and shrinks without a resize: images load, fonts swap, a language switch reflows.
    const bodyObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(remeasure);
    bodyObserver?.observe(document.body);
    // The loader locks the scroll through <html style="overflow:hidden">, with no scroll or resize.
    const lockObserver = new MutationObserver(schedule);
    lockObserver.observe(root, { attributes: true, attributeFilter: ["style"] });

    return () => {
      cancelAnimationFrame(raf);
      clearTimer();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      media.removeEventListener("change", remeasure);
      bodyObserver?.disconnect();
      lockObserver.disconnect();
      refreshRef.current = () => {};
      syncRef.current = () => {};
      delete root.dataset.ruler;
      window.__rulerLive = false;
    };
  }, []);

  // The rail's DOM is new when it goes live; and a language switch moves the sections (and renames the markers).
  useEffect(() => {
    refreshRef.current();
  }, [live, language]);

  // The sky flipped (or the time became known): the pass works the cat's pose out again.
  useEffect(() => {
    catStateRef.current = catState;
    refreshRef.current();
  }, [catState]);

  // The layout mounts the ruler on every route, so a client navigation never remounts it: it takes the native bar
  // back, or claims it again, in the very commit that changes the page (before anything paints), not a frame later.
  useLayoutEffect(() => {
    syncRef.current();
  }, [pathname]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    // No text selection or focus change from a press on the ruler.
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // The pointer is already gone; the press still works without capture.
    }
    const markEl = (event.target as Element).closest<HTMLElement>("[data-mark]");
    const mark = markEl ? Number(markEl.dataset.mark) : null;
    press.current = { id: event.pointerId, startY: event.clientY, dragging: false, mark };
    if (mark === null) scrollToRail(event.clientY, clickBehavior(), metrics.current);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = press.current;
    if (!current || current.id !== event.pointerId) return;
    if (!current.dragging) {
      if (Math.abs(event.clientY - current.startY) < DRAG_SLOP) return;
      current.dragging = true;
      if (rootRef.current) rootRef.current.dataset.dragging = "";
    }
    scrollToRail(event.clientY, "instant", metrics.current);
  };

  const endPress = (event: ReactPointerEvent<HTMLDivElement>, released: boolean) => {
    const current = press.current;
    if (!current || current.id !== event.pointerId) return;
    press.current = null;
    if (rootRef.current) delete rootRef.current.dataset.dragging;
    if (released && !current.dragging && current.mark !== null) scrollToSection(current.mark);
  };

  if (!live) return null;

  const labels = [dict.ruler.top, ...navItems.map((item) => t(item.label))];

  return (
    <div ref={rootRef} className="ruler" aria-hidden="true" data-print="hide" style={{ top: RAIL_TOP, bottom: RAIL_BOTTOM }}>
      <div
        className="ruler-rail"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => endPress(event, true)}
        onPointerCancel={(event) => endPress(event, false)}
        onLostPointerCapture={(event) => endPress(event, false)}
      >
        <div className="ruler-track">
          {TICKS.map((tick) => (
            <span
              key={tick.pct}
              className="ruler-tick"
              data-major={tick.major ? "" : undefined}
              style={{ top: `${tick.pct}%` }}
            />
          ))}

          {SECTION_IDS.map((id, i) => (
            <span
              key={id}
              ref={(el) => {
                markRefs.current[i] = el;
              }}
              className="ruler-mark"
              data-mark={i}
            >
              <i className="ruler-mark-box" />
              <span className="ruler-mark-label" data-label={labels[i]} />
            </span>
          ))}

          <div ref={needleRef} className="ruler-needle">
            <span className="ruler-needle-line" />
            {cat !== null ? <RulerCat state={catState} msSinceScroll={cat.ms} progress={cat.progress} /> : null}
            <span ref={readoutRef} className="ruler-readout" data-value="0">
              {COLUMNS.map((i) => (
                <span
                  key={i}
                  ref={(el) => {
                    colRefs.current[i] = el;
                  }}
                  className="ruler-col"
                  data-col={i}
                >
                  <span className="ruler-strip">
                    {DIGITS.map((d) => (
                      <span key={d} data-d={d} />
                    ))}
                  </span>
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
