"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/hooks/use-i18n";

export function BackToTop() {
  const { dict } = useI18n();
  const { scrollYProgress } = useScroll();
  const dash = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ duration: 0.22 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={dict.nav.backToTop}
          title={dict.nav.backToTop}
          className="surface-panel fixed right-5 bottom-5 z-40 flex size-12 items-center justify-center rounded-full text-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:right-8 sm:bottom-8"
        >
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden>
            <motion.circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="4"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="100"
              style={{ strokeDashoffset: dash }}
              opacity={0.9}
            />
          </svg>
          <ArrowUp className="relative size-4" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
