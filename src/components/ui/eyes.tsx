"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export interface EyesProps {
  readonly size?: number;
}

/**
 * Two pupils that follow the pointer — the one bit of personality kept from
 * the first version of the site. Pure CSS transforms driven by two custom
 * properties; nothing moves under reduced motion.
 */
export function Eyes({ size = 14 }: EyesProps) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const distance = Math.hypot(dx, dy) || 1;
        const reach = Math.min(distance, 240) / 240;
        element.style.setProperty("--look-x", ((dx / distance) * reach).toFixed(3));
        element.style.setProperty("--look-y", ((dy / distance) * reach).toFixed(3));
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span ref={ref} className="eyes" style={{ "--eye": `${size}px` } as CSSProperties} aria-hidden>
      <span className="eye">
        <span className="pupil" />
      </span>
      <span className="eye">
        <span className="pupil" />
      </span>
    </span>
  );
}
