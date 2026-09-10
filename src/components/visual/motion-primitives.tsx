"use client";

import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ reveal */

export interface RevealProps {
  readonly children: ReactNode;
  readonly delay?: number;
  readonly y?: number;
  readonly className?: string;
  readonly once?: boolean;
}

export function Reveal({ children, delay = 0, y = 24, className, once = true }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export interface StaggerProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function Stagger({ children, className }: StaggerProps) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-70px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: StaggerProps) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

/* --------------------------------------------------------------- spotlight */

export interface SpotlightProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly accent?: string;
  readonly radius?: number;
}

/** Card surface with a cursor-following highlight and a lifting hover state. */
export function Spotlight({ children, className, accent, radius = 320 }: SpotlightProps) {
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const glow = accent ?? "var(--primary)";
  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${x}px ${y}px, color-mix(in oklab, ${glow} 22%, transparent), transparent 72%)`;

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  };

  const onPointerLeave = () => {
    x.set(-9999);
    y.set(-9999);
  };

  return (
    <div
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn("group/spot relative overflow-hidden", className)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{ background }}
        aria-hidden
      />
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- magnetic */

export interface MagneticProps {
  readonly children: ReactNode;
  readonly strength?: number;
  readonly className?: string;
}

export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const reduceMotion = useReducedMotion();
  const x = useSpring(0, { stiffness: 260, damping: 18, mass: 0.5 });
  const y = useSpring(0, { stiffness: 260, damping: 18, mass: 0.5 });

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.div>
  );
}

/* ----------------------------------------------------------------- counter */

export interface CounterProps {
  readonly value: number;
  readonly decimals?: number;
  readonly suffix?: string;
  readonly prefix?: string;
  readonly durationMs?: number;
  readonly className?: string;
}

/** Counts up to `value` the first time it scrolls into view. */
export function Counter({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  durationMs = 1400,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || reduceMotion) return;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, durationMs, reduceMotion]);

  // With reduced motion the final value is rendered straight away rather than
  // being counted up.
  const shown = reduceMotion ? (inView ? value : 0) : display;

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {formatNumber(shown, decimals)}
      {suffix}
    </span>
  );
}

/* ----------------------------------------------------------------- marquee */

export interface MarqueeProps {
  readonly children: ReactNode;
  readonly reverse?: boolean;
  readonly className?: string;
  readonly durationSeconds?: number;
}

/** Seamless ticker: the row is duplicated and translated by exactly -50%. */
export function Marquee({
  children,
  reverse = false,
  className,
  durationSeconds = 42,
}: MarqueeProps) {
  const style = { animationDuration: `${durationSeconds}s` } satisfies CSSProperties;

  return (
    <div className={cn("mask-fade-x group relative overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max items-center gap-3 group-hover:[animation-play-state:paused]",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
        )}
        style={style}
      >
        <div className="flex shrink-0 items-center gap-3">{children}</div>
        {/* Duplicate half of the loop: hidden from AT and taken out of the tab order. */}
        <div className="flex shrink-0 items-center gap-3" aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  );
}
