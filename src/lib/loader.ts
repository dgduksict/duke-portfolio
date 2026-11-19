// Timing of the loading screen, as plain numbers, one pure function and the inline gate script. The component reads
// what has really loaded and draws; the gate (an inline script that runs before React) reads the constants, so they
// live in one place.

/**
 * The loader's timings (ms) and its session key.
 * - `minMs`: the bar takes at least this long to fill, even when everything is ready at once.
 * - `maxMs`: after this long the bar is full whatever has (not) loaded, so a slow asset can never trap the visitor.
 * - `reducedMinMs`: the shorter minimum for visitors who prefer reduced motion.
 * - `safetyMs`: the gate waits this long for React to take over before it lets the page show without the loader.
 * - `sessionKey`: the `sessionStorage` key set once the loader has been seen, so a reload in the same tab skips it.
 */
export const LOADER = {
  minMs: 1000,
  maxMs: 3500,
  reducedMinMs: 600,
  safetyMs: 3000,
  sessionKey: "duke:loader-seen",
} as const;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** `v` clamped to [0, 1]; NaN counts as 0. */
const clamp01 = (v: number) => (v > 0 ? (v < 1 ? v : 1) : 0);

/**
 * The progress the loader shows, from 0 to 1, `elapsedMs` after it started with `loadedFraction` (0 to 1) of its
 * assets ready. It is the lesser of two things: the clock, which eases out over `minMs` (so the bar never finishes
 * sooner than that), and the share that has really loaded (so it never runs ahead of the page). From `LOADER.maxMs`
 * on it is 1 regardless.
 *
 * Both inputs are clamped, so a frame timestamp that arrives a little before the start (negative time) or a share
 * outside 0..1 cannot push the result out of range. NaN, for either (a 0 / 0 share, say), counts as 0.
 */
export function displayedProgress(
  elapsedMs: number,
  loadedFraction: number,
  minMs: number = LOADER.minMs,
): number {
  if (elapsedMs >= LOADER.maxMs) return 1;
  const clock = easeOutCubic(clamp01(elapsedMs / minMs));
  return Math.min(clock, clamp01(loadedFraction));
}

/**
 * What the loader shows for `progress` (0 to 1): the whole percent and the number of lit blocks out of `blocks`, both
 * from one value so they cannot disagree. The percent is floored until `progress` reaches 1 (so 0.996 reads 99, never
 * 100), and the blocks follow the percent: all of them light only at 100.
 */
export function loaderReadout(progress: number, blocks: number): { percent: number; filled: number } {
  const p = clamp01(progress);
  const percent = p >= 1 ? 100 : Math.floor(p * 100);
  return { percent, filled: Math.floor((percent * blocks) / 100) };
}

/**
 * The inline script that runs while the HTML is parsed, before the page paints: on the homepage (`/`) and only when
 * the loader has not been seen this browser session, it sets `document.documentElement.dataset.loader` to "on", which
 * CSS reads to show the loader. It then schedules a safety release: after `LOADER.safetyMs`, if the value is still
 * exactly "on" (nothing has taken over), it sets "done" so the page shows without the loader. Storage that cannot be
 * read counts as a first visit; any other error leaves the page untouched.
 *
 * It is an IIFE that reaches only the bare globals `document`, `location`, `sessionStorage` and `setTimeout`, so a
 * test can run it with stand-ins. The session key and the timeout come from `LOADER`.
 */
export function loaderGateScript(): string {
  return `(function () {
  try {
    if (location.pathname !== "/") return;
    var seen = false;
    try {
      seen = sessionStorage.getItem(${JSON.stringify(LOADER.sessionKey)}) !== null;
    } catch (e) {}
    if (seen) return;
    var root = document.documentElement;
    root.dataset.loader = "on";
    setTimeout(function () {
      if (root.dataset.loader === "on") root.dataset.loader = "done";
    }, ${LOADER.safetyMs});
  } catch (e) {}
})();`;
}
