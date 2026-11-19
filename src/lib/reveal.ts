// The pixel reveal-on-scroll: blocks below the hero appear in four stepped frames as they come into view. This file
// holds the numbers, the pure rules and the inline gate script; the observer lives in components/reveal/reveal.ts and
// the frames in components/reveal/reveal.css. The life cycle mirrors the ruler's gate (lib/ruler-gate.ts):
//   1. "on"  set by the gate script (revealGateScript, inlined in the page) when the browser has IntersectionObserver,
//            the visitor has not asked for reduced motion and the URL carries no #fragment; CSS then hides every
//            `[data-reveal]` block that is not yet `[data-revealed]`
//   2. the first block to mount on the client sets `window.__revealLive = true` and starts observing
//   3. if nothing has done so after `REVEAL.safetyMs`, the gate removes the attribute and every block shows as is
// Without JavaScript, without IntersectionObserver, under reduced motion and in print nothing is ever hidden.

/**
 * The reveal's numbers.
 * - `durationMs`: one reveal, four frames (reveal.css steps it; kept here for the tests and the docs).
 * - `staggerMs` / `maxDelayMs`: blocks that come into view together start one after another, 80 ms apart, the last
 *   at most 240 ms late.
 * - `rootMargin`: a block reveals once its top is about 6 % above the bottom of the viewport, so the frames play where
 *   they can be seen.
 * - `safetyMs`: how long the gate waits for the client to take over before it lets every block show.
 */
export const REVEAL = {
  durationMs: 480,
  staggerMs: 80,
  maxDelayMs: 240,
  rootMargin: "0px 0px -6% 0px",
  safetyMs: 4500,
} as const;

/** The part of an IntersectionObserver entry the rule reads. */
export interface RevealEntry {
  readonly isIntersecting: boolean;
  readonly boundingClientRect: { readonly bottom: number };
}

/**
 * Whether a block should reveal now: when it is in view, or when it is wholly above the viewport (a restored scroll
 * position, a jump to an anchor or a ruler marker went past it), so nothing above the reader stays hidden.
 */
export function shouldReveal(entry: RevealEntry): boolean {
  return entry.isIntersecting || entry.boundingClientRect.bottom <= 0;
}

/** The start delay (ms) of the `index`-th block (0-based) of a group that came into view together: capped. */
export function revealDelay(index: number): number {
  const n = Number.isFinite(index) && index > 0 ? Math.floor(index) : 0;
  return Math.min(n * REVEAL.staggerMs, REVEAL.maxDelayMs);
}

/**
 * The inline script that runs while the HTML is parsed, before the first paint: it sets
 * `document.documentElement.dataset.reveal` to "on" only when `IntersectionObserver` exists, the URL has no #fragment
 * (a deep link lands mid-page, so it shows everything at once rather than wait for the client) and the visitor has not
 * asked for reduced motion. It then schedules a safety release: after `REVEAL.safetyMs` it removes the attribute
 * unless `window.__revealLive` is true, so slow or failing JavaScript never leaves blocks hidden. Any error leaves the
 * page untouched.
 *
 * It is an IIFE that reaches only the bare globals `IntersectionObserver`, `document`, `location`, `matchMedia`,
 * `setTimeout` and `window`, so a test can run it with stand-ins.
 */
export function revealGateScript(): string {
  return `(function () {
  try {
    if (typeof IntersectionObserver !== "function") return;
    if (location.hash.length > 1) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var root = document.documentElement;
    root.dataset.reveal = "on";
    setTimeout(function () {
      if (window.__revealLive !== true) delete root.dataset.reveal;
    }, ${REVEAL.safetyMs});
  } catch (e) {}
})();`;
}
