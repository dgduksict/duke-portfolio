// Decides, before React runs, whether the homepage shows the ruler scrollbar. The decision lands on
// `document.documentElement.dataset.ruler`, which CSS reads to hide the native scrollbar. The life cycle:
//   1. "on"  set by the gate script (rulerGateScript, inlined in the page) on a wide, fine-pointer homepage visit
//   2. the Ruler component mounts and sets `window.__rulerLive = true`
//   3. if nothing has done so after `RULER_SAFETY_MS`, the gate removes the attribute so the native scrollbar returns
import { RULER_MIN_WIDTH } from "./ruler";

/** How long the gate waits for the ruler to take over before it gives the native scrollbar back. */
const RULER_SAFETY_MS = 5000;

/**
 * The inline script that runs while the HTML is parsed: it sets `document.documentElement.dataset.ruler` to "on" only
 * on the homepage (`/`) and only when the viewport is at least `RULER_MIN_WIDTH` wide with a fine pointer. It then
 * schedules a safety release: after `RULER_SAFETY_MS` it removes the attribute unless `window.__rulerLive` is true,
 * so slow or failing JavaScript never leaves the page without any scrollbar. Any error leaves the page untouched.
 *
 * It is an IIFE that reaches only the bare globals `document`, `location`, `matchMedia`, `setTimeout` and `window`,
 * so a test can run it with stand-ins. The width and the timeout come from the constants above.
 */
export function rulerGateScript(): string {
  return `(function () {
  try {
    if (location.pathname !== "/") return;
    if (!matchMedia("(min-width: ${RULER_MIN_WIDTH}px) and (pointer: fine)").matches) return;
    var root = document.documentElement;
    root.dataset.ruler = "on";
    setTimeout(function () {
      if (window.__rulerLive !== true) delete root.dataset.ruler;
    }, ${RULER_SAFETY_MS});
  } catch (e) {}
})();`;
}
