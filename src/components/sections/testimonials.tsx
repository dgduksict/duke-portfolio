"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/primitives";
import { Reveal } from "@/components/visual/motion-primitives";
import { testimonials } from "@/data/testimonials";
import { useI18n } from "@/hooks/use-i18n";
import { initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 7000;

export function Testimonials() {
  const { dict, t } = useI18n();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    setDirection(next > 0 ? 1 : -1);
    setIndex((current) => (current + next + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [go, paused]);

  const active = testimonials[index] ?? testimonials[0];
  if (!active) return null;

  return (
    <section className="relative px-5 py-20 sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <Reveal>
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <Panel className="relative overflow-hidden p-7 sm:p-10">
              <Quote
                className="absolute -top-2 -left-2 size-24 text-primary/8"
                aria-hidden
                strokeWidth={1}
              />

              <p className="mb-6 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {dict.testimonials.eyebrow}
              </p>

              <div className="relative min-h-40 sm:min-h-32">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.blockquote
                    key={active.id}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -28 }}
                    transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="text-lg leading-relaxed text-pretty sm:text-xl">
                      “{t(active.quote)}”
                    </p>
                    <footer className="mt-6 flex items-center gap-3">
                      <span
                        className="flex size-10 items-center justify-center rounded-full border border-border font-mono text-xs"
                        style={{ backgroundColor: `${active.accent}1f`, color: active.accent }}
                        aria-hidden
                      >
                        {initialsOf(active.author)}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{active.author}</span>
                        <span className="block text-xs text-muted-foreground">
                          {t(active.role)} · {active.company}
                        </span>
                      </span>
                    </footer>
                  </motion.blockquote>
                </AnimatePresence>
              </div>

              <div className="mt-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5" role="tablist" aria-label={dict.testimonials.title}>
                  {testimonials.map((entry, dotIndex) => (
                    <button
                      key={entry.id}
                      type="button"
                      role="tab"
                      aria-selected={dotIndex === index}
                      aria-label={entry.author}
                      onClick={() => {
                        setDirection(dotIndex > index ? 1 : -1);
                        setIndex(dotIndex);
                      }}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        dotIndex === index
                          ? "w-8 bg-primary"
                          : "w-1.5 bg-border-strong hover:bg-muted-foreground",
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => go(-1)}
                    aria-label={dict.testimonials.previous}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => go(1)}
                    aria-label={dict.testimonials.next}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </Panel>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
