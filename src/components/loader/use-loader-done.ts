"use client";

import { useSyncExternalStore } from "react";

/**
 * The loader's life cycle lives on `<html data-loader>`:
 *   "on"   set by the gate while the HTML parses: a first visit, the loading screen is up or about to be
 *   "run"  set by the loading screen when it takes over; it keeps this value while it lifts away
 *   "done" set once it has left, or by the gate's safety release
 *   absent no loader on this page (a repeat visit, another route, a server render)
 */
const WORKING = new Set(["on", "run"]);

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-loader"] });
  return () => observer.disconnect();
}

const isDone = () => !WORKING.has(document.documentElement.dataset.loader ?? "");

/**
 * Whether the loading screen is out of the way: false while it is up or lifting away, true once it is done, or when
 * there is no loader at all. It follows the attribute live, so anything that waits for the loader (the hero cat)
 * starts the moment it leaves. It is `true` on the server and on the first client render, so nothing waits
 * needlessly and the markup agrees; the real value lands right after hydration.
 */
export function useLoaderDone(): boolean {
  return useSyncExternalStore(subscribe, isDone, () => true);
}
