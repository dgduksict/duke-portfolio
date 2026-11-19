"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { GLASS_COLS, GLASS_ROWS } from "@/components/scene/pixel-sky";
import { nextShootingStarDelay, type StreakPath, shootingStarPath } from "@/lib/season";

/** How long one streak crosses the glass; scene.css steps its flight over the same time. */
const STREAK_MS = 600;
const REDUCED = "(prefers-reduced-motion: reduce)";
const STAR = "#fff8e0";
/** The head is full strength; each cell behind it is dimmer, in flat steps (never a gradient). */
const TRAIL_OPACITY = [1, 0.7, 0.45, 0.25, 0.12, 0.06] as const;

/** Whether the visitor asks for less motion; a browser without matchMedia (or one that throws) counts as no. */
function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia(REDUCED).matches;
  } catch {
    return false;
  }
}

/** The head cell, then `length` trail cells behind it (opposite to `dx`), each dimmer, sloping down with the flight. */
function Streak({ path }: { path: StreakPath }) {
  const cells = Array.from({ length: path.length + 1 }, (_, i) => ({
    x: path.x - path.dx * i,
    y: path.y - Math.floor(i / 2),
    opacity: TRAIL_OPACITY[Math.min(i, TRAIL_OPACITY.length - 1)] ?? 0.06,
  }));
  return (
    <g data-streak="" className="scene-shooting-star" fill={STAR} style={{ "--streak-dx": path.dx } as CSSProperties}>
      {cells.map((cell, i) => (
        <rect key={i} x={cell.x} y={cell.y} width={1} height={1} opacity={cell.opacity} />
      ))}
    </g>
  );
}

/**
 * A rare shooting star on a night sky: every 25 to 70 seconds one short streak crosses the upper glass for 600 ms.
 * The timing and path are random, so both are chosen in an effect after mount, never during render. It stays dark
 * under reduced motion and skips a streak while the tab is hidden (the next one is still scheduled).
 */
export function ShootingStar({ active }: { readonly active: boolean }) {
  const [path, setPath] = useState<StreakPath | null>(null);

  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    let wait: ReturnType<typeof setTimeout> | undefined;
    let clear: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      wait = setTimeout(() => {
        if (!document.hidden) {
          setPath(shootingStarPath(Math.random, GLASS_COLS, GLASS_ROWS));
          clear = setTimeout(() => setPath(null), STREAK_MS);
        }
        schedule();
      }, nextShootingStarDelay(Math.random));
    };
    schedule();
    return () => {
      clearTimeout(wait);
      clearTimeout(clear);
      setPath(null);
    };
  }, [active]);

  if (!active || path === null) return null;
  return (
    <g data-layer="shooting-star">
      <Streak path={path} />
    </g>
  );
}
