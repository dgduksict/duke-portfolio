"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Building2, CalendarRange, MapPin } from "lucide-react";
import { useRef } from "react";
import { Badge, Panel } from "@/components/ui/primitives";
import { Reveal, Spotlight } from "@/components/visual/motion-primitives";
import { Section, SectionHeading } from "@/components/visual/section";
import { experience } from "@/data/experience";
import { useI18n } from "@/hooks/use-i18n";
import { formatDateRange, formatMonthSpan, monthsBetween, toMonthKey } from "@/lib/format";

const CURRENT_MONTH = toMonthKey(new Date());

export function Experience() {
  const { dict, t, language } = useI18n();
  const railRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 65%", "end 55%"],
  });
  const railProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <Section id="experience">
      <SectionHeading
        eyebrow={dict.experience.eyebrow}
        title={dict.experience.title}
        subtitle={dict.experience.subtitle}
      />

      <div ref={railRef} className="relative">
        <div
          className="absolute top-2 bottom-2 left-[7px] w-px bg-border md:left-[calc(11rem+7px)]"
          aria-hidden
        />
        <motion.div
          className="absolute top-2 left-[7px] w-px origin-top bg-gradient-to-b from-primary via-cyan-accent to-violet-accent md:left-[calc(11rem+7px)]"
          style={{ scaleY: railProgress, height: "calc(100% - 1rem)" }}
          aria-hidden
        />

        <ol className="space-y-8">
          {experience.map((entry, index) => {
            const months = monthsBetween(entry.start, entry.end ?? CURRENT_MONTH);
            return (
              <li key={entry.id} className="relative md:grid md:grid-cols-[11rem_1fr] md:gap-8">
                <div className="mb-3 hidden text-right md:block">
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatDateRange(entry.start, entry.end, language, dict.experience.present)}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground/70">
                    {formatMonthSpan(months, language)}
                  </p>
                </div>

                <Reveal delay={index * 0.05} className="relative pl-8 md:pl-8">
                  <span
                    className="absolute top-6 left-0 flex size-3.5 items-center justify-center rounded-full border-2 border-background bg-primary md:-left-[calc(0.4375rem+1px)]"
                    aria-hidden
                  >
                    {entry.end === null ? (
                      <span className="absolute size-3.5 animate-pulse-ring rounded-full bg-primary" />
                    ) : null}
                  </span>

                  <Spotlight className="rounded-2xl">
                    <Panel className="p-6 transition-colors duration-300 hover:border-border-strong">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold tracking-tight">{t(entry.role)}</h3>
                          <a
                            href={entry.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary transition-opacity hover:opacity-80"
                          >
                            <Building2 className="size-3.5" />
                            {entry.company}
                            <ArrowUpRight className="size-3" />
                          </a>
                        </div>
                        {entry.end === null ? (
                          <Badge tone="primary">{dict.experience.present}</Badge>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground md:hidden">
                        <span className="flex items-center gap-1.5">
                          <CalendarRange className="size-3" />
                          {formatDateRange(entry.start, entry.end, language, dict.experience.present)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-3" />
                          {t(entry.location)}
                        </span>
                      </div>

                      <p className="mt-4 leading-relaxed text-pretty text-muted-foreground">
                        {t(entry.summary)}
                      </p>

                      <h4 className="mt-5 mb-2 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                        {dict.experience.highlights}
                      </h4>
                      <ul className="space-y-2">
                        {t(entry.highlights).map((highlight) => (
                          <li key={highlight} className="flex gap-2.5 text-sm leading-relaxed">
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
                            <span className="text-muted-foreground">{highlight}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {entry.stack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-md border border-border bg-surface-muted/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </Panel>
                  </Spotlight>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
