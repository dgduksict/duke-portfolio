import { REVEAL, revealDelay, shouldReveal } from "@/lib/reveal";

declare global {
  interface Window {
    /** True once a block has been handed to the reveal observer; the gate's safety release reads it (lib/reveal.ts). */
    __revealLive?: boolean;
  }
}

/** One observer for every block on the page, made on first use and dropped when the last block leaves. */
let observer: IntersectionObserver | null = null;
const watched = new Set<Element>();

/** Marks a block revealed (reveal.css plays its frames from here), `delayMs` late. Only the DOM changes: no React. */
function show(element: Element, delayMs: number) {
  if (delayMs > 0 && element instanceof HTMLElement) {
    element.style.setProperty("--reveal-delay", `${delayMs}ms`);
  }
  element.setAttribute("data-revealed", "");
}

function release(element: Element) {
  if (!watched.delete(element)) return;
  observer?.unobserve(element);
  if (watched.size === 0) {
    observer?.disconnect();
    observer = null;
  }
}

/** Top to bottom, then left to right: the order a group that came into view together reveals in. */
function byPosition(a: IntersectionObserverEntry, b: IntersectionObserverEntry): number {
  return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left;
}

function onEntries(entries: IntersectionObserverEntry[]) {
  let inView = 0;
  for (const entry of entries.filter(shouldReveal).sort(byPosition)) {
    if (!watched.has(entry.target)) continue;
    // Blocks above the viewport show at once (nobody is looking); those in view step in, a little apart.
    show(entry.target, entry.isIntersecting ? revealDelay(inView++) : 0);
    release(entry.target);
  }
  // A jump (the end of the page, an anchor, a ruler marker) carries blocks from below the viewport to above it without
  // their ever crossing it, so the observer has nothing to report about them: whenever it reports anything, sweep the
  // rest and show the ones now above, so scrolling back up never meets a block that still has to appear.
  for (const element of [...watched]) {
    if (element.getBoundingClientRect().bottom <= 0) {
      show(element, 0);
      release(element);
    }
  }
}

/**
 * The ref of a block that reveals on scroll (spread `reveal` on it, which also sets `data-reveal`). While the gate is on
 * (lib/reveal.ts) it hands the block to the shared observer, which marks it `data-revealed` once it comes into view or
 * is found above the viewport, then forgets it. Without the gate (reduced motion, no IntersectionObserver, a deep link,
 * the safety release) it marks the block revealed at once. Its cleanup stops watching the block, so unmounting (a
 * client navigation, StrictMode's second pass) never leaks an observer. A block that is already revealed is left
 * alone, so a re-render (a language or theme switch) never hides or replays it.
 */
export function revealRef(element: HTMLElement | null): (() => void) | undefined {
  if (element === null || element.hasAttribute("data-revealed")) return undefined;
  if (document.documentElement.dataset.reveal !== "on" || typeof IntersectionObserver !== "function") {
    show(element, 0);
    return undefined;
  }
  window.__revealLive = true;
  observer ??= new IntersectionObserver(onEntries, { rootMargin: REVEAL.rootMargin });
  watched.add(element);
  observer.observe(element);
  return () => release(element);
}

/**
 * Spread on a block to make it reveal on scroll: `<li {...reveal}>`. Use it on leaf blocks (an entry, a card, the
 * words of a heading), never on an element that is or holds a sticky title: the frames move it by a transform.
 */
export const reveal = { ref: revealRef, "data-reveal": "" } as const;
