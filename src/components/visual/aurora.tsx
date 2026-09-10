"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const NOISE_URI =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E";

/**
 * Fixed backdrop: three drifting colour fields, a hairline grid, a vignette and
 * a film-grain layer. Pointer-inert and hidden from assistive tech.
 */
export function Aurora() {
  const reduceMotion = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.35 });

  useEffect(() => {
    if (reduceMotion) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setPointer({
          x: event.clientX / window.innerWidth,
          y: event.clientY / window.innerHeight,
        });
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      <motion.div
        className="absolute -top-[22%] -left-[12%] size-[46rem] rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, var(--glow-a), transparent 66%)" }}
        animate={
          reduceMotion
            ? undefined
            : { x: [0, 60, -20, 0], y: [0, 40, 80, 0], scale: [1, 1.12, 0.96, 1] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[6%] -right-[14%] size-[40rem] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--glow-b), transparent 68%)" }}
        animate={
          reduceMotion
            ? undefined
            : { x: [0, -50, 20, 0], y: [0, 70, 20, 0], scale: [1, 0.94, 1.1, 1] }
        }
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-18%] left-[26%] size-[38rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, var(--glow-c), transparent 70%)" }}
        animate={
          reduceMotion ? undefined : { x: [0, 40, -40, 0], y: [0, -30, 20, 0] }
        }
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="grid-backdrop absolute inset-0 mask-fade-b" />

      <div
        className="absolute inset-0 transition-[background] duration-500"
        style={{
          background: `radial-gradient(60rem 40rem at ${pointer.x * 100}% ${pointer.y * 100}%, color-mix(in oklab, var(--primary) 8%, transparent), transparent 70%)`,
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay dark:opacity-[0.06]"
        style={{ backgroundImage: `url("${NOISE_URI}")`, backgroundSize: "160px 160px" }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, transparent 45%, color-mix(in oklab, var(--background) 85%, transparent) 100%)",
        }}
      />
    </div>
  );
}
