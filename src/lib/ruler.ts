// The maths behind the ruler scrollbar: the tick rail on the right edge that replaces the native scrollbar on the
// homepage. Everything here is pure and NaN-safe, so the component only has to measure the page and draw.

/** One tick on the rail: where it sits (0 to 100 percent of the page) and whether it is a labelled major tick. */
export interface Tick {
  pct: number;
  major: boolean;
}

/** A tick every this many percent. */
export const MINOR_STEP = 2;

/** A labelled major tick every this many percent. */
export const MAJOR_STEP = 10;

/** The compact ruler (narrow or touch screens) is calmer: a tick every this many percent... */
export const COMPACT_MINOR_STEP = 5;

/** ...and a major one every quarter of the page. */
export const COMPACT_MAJOR_STEP = 25;

/** The needle stays hidden until the page has scrolled this far (0..1), so it does not sit on the first tick. */
export const NEEDLE_FADE_BELOW = 0.03;

/** Pixels between the top of the viewport and the top of the rail (clears the site bar). */
export const RAIL_TOP = 76;

/** Pixels between the bottom of the rail and the bottom of the viewport. */
export const RAIL_BOTTOM = 24;

/**
 * The full ruler (it replaces the native scrollbar and takes clicks and drags) only shows from this viewport width (px)
 * and up, with a fine pointer; narrower or touch screens get the compact, passive one beside the native scrollbar.
 */
export const RULER_MIN_WIDTH = 900;

/** The compact ruler fades away once the page has been still for this long (ms); the next scroll brings it back. */
export const IDLE_AFTER_MS = 1500;

/** Clamps a number to 0..1, and turns NaN and infinities into 0. */
function clamp01(n: number): number {
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
}

/** The scrollable distance of the page: its height minus the viewport, never negative, 0 if either is non-finite. */
function scrollable(docHeight: number, viewportHeight: number): number {
  const range = docHeight - viewportHeight;
  return Number.isFinite(range) ? Math.max(0, range) : 0;
}

/**
 * How far the page has scrolled, from 0 (top) to 1 (bottom). A page no taller than the viewport, a zero-height
 * document or a non-finite size gives 0; the result is never `NaN`, and overscroll is clamped.
 */
export function scrollProgress(
  scrollY: number,
  docHeight: number,
  viewportHeight: number,
): number {
  const range = scrollable(docHeight, viewportHeight);
  if (range <= 0) return 0;
  return clamp01(scrollY / range);
}

/**
 * The rail's ticks: by default 51 of them, every `MINOR_STEP` percent from 0 to 100, every `MAJOR_STEP` one marked
 * major (the compact ruler passes `COMPACT_MINOR_STEP` and `COMPACT_MAJOR_STEP`: 21 ticks, 5 major). A step that is not
 * a positive finite number falls back to the default, so the loop always ends.
 */
export function buildTicks(minorStep: number = MINOR_STEP, majorStep: number = MAJOR_STEP): Tick[] {
  const minor = Number.isFinite(minorStep) && minorStep > 0 ? minorStep : MINOR_STEP;
  const major = Number.isFinite(majorStep) && majorStep > 0 ? majorStep : MAJOR_STEP;
  const ticks: Tick[] = [];
  for (let pct = 0; pct <= 100; pct += minor) {
    ticks.push({ pct, major: pct % major === 0 });
  }
  return ticks;
}

/** Whether the needle shows at this scroll progress: hidden below `NEEDLE_FADE_BELOW` (and for NaN). */
export function needleVisible(progress: number): boolean {
  return progress >= NEEDLE_FADE_BELOW;
}

/**
 * The rail's box in viewport pixels: `RAIL_TOP` from the top, `RAIL_BOTTOM` from the bottom. A non-finite viewport
 * height gives a zero-height rail, so both numbers are always finite.
 */
export function railBox(viewportHeight: number): {
  top: number;
  height: number;
} {
  const height = viewportHeight - RAIL_TOP - RAIL_BOTTOM;
  return {
    top: RAIL_TOP,
    height: Number.isFinite(height) ? Math.max(0, height) : 0,
  };
}

/** Maps a pointer's vertical position to a position along the rail, 0 at its top and 1 at its bottom, clamped. */
export function pointerToProgress(
  clientY: number,
  rail: { top: number; height: number },
): number {
  if (!(rail.height > 0)) return 0;
  return clamp01((clientY - rail.top) / rail.height);
}

/** The scroll position (px) that puts the page at this progress; the inverse of `scrollProgress`. */
export function progressToScrollTop(
  progress: number,
  docHeight: number,
  viewportHeight: number,
): number {
  return clamp01(progress) * scrollable(docHeight, viewportHeight);
}

/** Where a section whose top edge is `sectionTop` px down the document sits on the rail (0..1, same clamp). */
export function markerProgress(
  sectionTop: number,
  docHeight: number,
  viewportHeight: number,
): number {
  return scrollProgress(sectionTop, docHeight, viewportHeight);
}
