"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface EyesProps {
  readonly className?: string;
  readonly size?: number;
}

/**
 * Two pupils that track the pointer. Kept from the original portfolio because
 * it is the one bit of personality the logo needs.
 */
export function Eyes({ className, size = 14 }: EyesProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 220, damping: 20, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 220, damping: 20, mass: 0.4 });

  const travel = size * 0.22;
  const pupilX = useTransform(x, (value) => value * travel);
  const pupilY = useTransform(y, (value) => value * travel);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(distance, 220) / 220;
      rawX.set((dx / distance) * clamped);
      rawY.set((dy / distance) * clamped);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [rawX, rawY]);

  return (
    <span ref={ref} className={cn("inline-flex items-center gap-1", className)} aria-hidden>
      {[0, 1].map((index) => (
        <span
          key={index}
          className="relative inline-flex items-center justify-center rounded-full border border-border bg-surface"
          style={{ width: size, height: size }}
        >
          <motion.span
            className="rounded-full bg-primary"
            style={{ width: size * 0.42, height: size * 0.42, x: pupilX, y: pupilY }}
          />
        </span>
      ))}
    </span>
  );
}
