"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Calculator, Clock, MapPin, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Counter, Magnetic, Marquee, Reveal } from "@/components/visual/motion-primitives";
import { headlineStats } from "@/data/metrics";
import { profile } from "@/data/profile";
import { marqueeSkills } from "@/data/skills";
import { useI18n } from "@/hooks/use-i18n";
import { useLocalTime } from "@/hooks/use-local-time";
import { scrollToSection } from "@/lib/utils";

function RoleRotator({ roles }: { readonly roles: readonly string[] }) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (roles.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % roles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [roles.length]);

  const current = roles[index] ?? roles[0] ?? "";

  return (
    <span className="relative inline-flex h-[1.15em] min-w-0 overflow-hidden align-bottom">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: "0.6em" }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: "-0.6em" }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="text-gradient bg-[length:220%_100%] whitespace-nowrap"
        >
          {current}
        </motion.span>
      </AnimatePresence>
      <span className="ml-1 inline-block w-[2px] animate-caret self-center bg-primary" style={{ height: "0.9em" }} aria-hidden />
    </span>
  );
}

export function Hero() {
  const { dict, t } = useI18n();
  const localTime = useLocalTime();
  const roles = t(profile.roleRotation);

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center px-5 pt-28 pb-14 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start gap-6"
        >
          <span className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/8 py-1.5 pr-4 pl-2.5 text-sm text-primary">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-2 animate-pulse-ring rounded-full bg-primary" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            {dict.hero.available}
          </span>

          <div className="w-full">
            <p className="font-mono text-sm tracking-wide text-muted-foreground">
              {dict.hero.greeting}{" "}
              <span className="text-foreground">{t(profile.name)}</span>
            </p>
            <h1 className="text-balance-tight mt-4 text-4xl leading-[1.05] font-semibold sm:text-6xl lg:text-7xl">
              <span className="block">{t(profile.shortName)} —</span>
              <RoleRotator roles={roles} />
            </h1>
          </div>

          <p className="max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
            {t(profile.tagline)}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Magnetic>
              <Button size="lg" onClick={() => scrollToSection("work")}>
                {dict.hero.viewWork}
                <ArrowDown className="size-4" />
              </Button>
            </Magnetic>
            <Magnetic>
              <Button variant="outline" size="lg" onClick={() => scrollToSection("pricing")}>
                <Calculator className="size-4" />
                {dict.hero.buildQuote}
              </Button>
            </Magnetic>
          </div>

          <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              <dt className="sr-only">{dict.hero.basedIn}</dt>
              <dd>{t(profile.location)}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <dt className="sr-only">{dict.hero.localTime}</dt>
              <dd className="tabular-nums">
                {localTime ?? "--:--"} {profile.timezone}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              <dt className="sr-only">{dict.about.focusTitle}</dt>
              <dd>{profile.focusAreas.map((area) => t(area.title)).join(" · ")}</dd>
            </div>
          </dl>
        </motion.div>

        <Reveal delay={0.15} className="mt-14">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
            {headlineStats.map((stat) => (
              <div key={stat.id} className="group bg-background/85 p-5 backdrop-blur-sm">
                <dt className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                  {t(stat.label)}
                </dt>
                <dd className="mt-2 text-3xl font-semibold tracking-tight">
                  <Counter value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                </dd>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {t(stat.caption)}
                </p>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.25} className="mt-10">
          <Marquee durationSeconds={46}>
            {marqueeSkills.map((skill) => (
              <a
                key={skill.id}
                href={skill.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:border-border-strong hover:text-foreground"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: skill.accent }}
                  aria-hidden
                />
                {skill.name}
              </a>
            ))}
          </Marquee>
        </Reveal>
      </div>

      <motion.button
        type="button"
        onClick={() => scrollToSection("about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="mx-auto mt-12 flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        {dict.hero.scroll}
        <motion.span
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex"
        >
          <ArrowDown className="size-3.5" />
        </motion.span>
      </motion.button>
    </section>
  );
}
