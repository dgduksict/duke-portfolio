"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PixelSprite } from "@/components/cat/pixel-sprite";
import { PAW } from "@/components/cat/sprites";
import { addPaw, type Paw, PAWS } from "@/lib/cat";

const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Where a click leaves no print: inside the loading screen, on the desktop ruler (it takes clicks and drags) and on the
 * hero cat (he has his own poke and purr).
 */
const IGNORED = '.loader, .ruler[data-mode="full"], .hero-cat-button';

type Timer = ReturnType<typeof setTimeout>;

/** Whether the visitor asks for less motion; a browser without matchMedia (or one that throws) counts as no. */
function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia(REDUCED).matches;
  } catch {
    return false;
  }
}

/**
 * Tiny paw prints where you click or tap on the homepage: a pair of 4 x 4 prints, one a step ahead of the other, that
 * fades out in four steps over `PAWS.lifeMs` (cat.css). At most `PAWS.maxPairs` at once. One passive `click` listener
 * on the document does it all, so it never cancels or stops a click, and the layer ignores the pointer (cat.css), so
 * nothing underneath stops working.
 *
 * No prints for a click on the loader, the full ruler or the hero cat, a button other than the primary one, a click a
 * keyboard made (no position: `detail` 0 at the corner), under reduced motion (read at the click), or away from the
 * homepage (nothing renders there). Each pair has its own timer; they are all cleared on unmount.
 */
export function PawPrints() {
  const home = usePathname() === "/";
  const [paws, setPaws] = useState<readonly Paw[]>([]);
  const next = useRef(0);
  const timers = useRef(new Set<Timer>());

  useEffect(() => {
    const live = timers.current;
    return () => {
      for (const timer of live) clearTimeout(timer);
      live.clear();
    };
  }, []);

  useEffect(() => {
    if (!home) return;
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (event.detail === 0 && event.clientX === 0 && event.clientY === 0) return;
      if (event.target instanceof Element && event.target.closest(IGNORED) !== null) return;
      if (prefersReducedMotion()) return;
      const paw: Paw = { id: next.current, x: Math.round(event.clientX), y: Math.round(event.clientY) };
      next.current += 1;
      setPaws((list) => addPaw(list, paw));
      const gone = setTimeout(() => {
        timers.current.delete(gone);
        setPaws((list) => list.filter((other) => other.id !== paw.id));
      }, PAWS.lifeMs);
      timers.current.add(gone);
    };
    document.addEventListener("click", onClick, { passive: true });
    return () => document.removeEventListener("click", onClick);
  }, [home]);

  if (!home) return null;

  return (
    <div className="paw-layer" aria-hidden="true" data-print="hide">
      {paws.map((paw) => (
        <div key={paw.id} className="paw-pair" style={{ left: `${paw.x}px`, top: `${paw.y}px` }}>
          {/* The back foot is the lower, left one; the front foot a step up and ahead (cat.css). */}
          {(["back", "front"] as const).map((foot) => (
            <svg
              key={foot}
              className="paw-print"
              data-foot={foot}
              viewBox="0 0 4 4"
              focusable="false"
              shapeRendering="crispEdges"
            >
              <PixelSprite map={PAW} scale={1} />
            </svg>
          ))}
        </div>
      ))}
    </div>
  );
}
