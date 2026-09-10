"use client";

import { Blocks, Brain, Server, Sparkles } from "lucide-react";
import Image from "next/image";
import type { ComponentType } from "react";
import { Panel } from "@/components/ui/primitives";
import { Reveal, Spotlight, Stagger, StaggerItem } from "@/components/visual/motion-primitives";
import { Section, SectionHeading } from "@/components/visual/section";
import { profile } from "@/data/profile";
import { useI18n } from "@/hooks/use-i18n";
import type { FocusArea } from "@/types";

const FOCUS_ICONS: Record<FocusArea["icon"], ComponentType<{ className?: string }>> = {
  brain: Brain,
  blocks: Blocks,
  server: Server,
  sparkles: Sparkles,
};

export function About() {
  const { dict, t } = useI18n();

  return (
    <Section id="about">
      <SectionHeading eyebrow={dict.about.eyebrow} title={dict.about.title} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <Reveal>
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[2rem] opacity-60 blur-2xl"
              style={{
                background:
                  "conic-gradient(from 140deg, var(--glow-a), var(--glow-b), var(--glow-c), var(--glow-a))",
              }}
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-3xl border border-border">
              <Image
                src="/professional-developer-portrait.png"
                alt={t(profile.name)}
                width={640}
                height={800}
                priority
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/90 to-transparent"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium">{t(profile.name)}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {t(profile.location)} · {profile.timezone}
                  </p>
                </div>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] tracking-wider text-primary uppercase">
                  {profile.yearsExperience}+ yrs
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="flex flex-col gap-8">
          <Reveal delay={0.08}>
            <div className="space-y-4">
              {t(profile.bio).map((paragraph, index) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className={
                    index === 0
                      ? "text-lg leading-relaxed text-pretty text-foreground"
                      : "leading-relaxed text-pretty text-muted-foreground"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          <div>
            <h3 className="mb-4 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
              {dict.about.focusTitle}
            </h3>
            <Stagger className="grid gap-3 sm:grid-cols-2">
              {profile.focusAreas.map((area) => {
                const Icon = FOCUS_ICONS[area.icon];
                return (
                  <StaggerItem key={area.id}>
                    <Spotlight className="h-full rounded-2xl">
                      <Panel className="h-full p-5 transition-colors duration-300 hover:border-border-strong">
                        <Icon className="size-5 text-primary" />
                        <h4 className="mt-3 font-medium">{t(area.title)}</h4>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {t(area.description)}
                        </p>
                      </Panel>
                    </Spotlight>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>

          <Reveal delay={0.12}>
            <div>
              <h3 className="mb-4 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                {dict.about.principlesTitle}
              </h3>
              <ul className="space-y-2.5">
                {dict.about.principles.map((principle, index) => (
                  <li key={principle} className="flex gap-3 text-sm leading-relaxed">
                    <span className="mt-0.5 font-mono text-xs text-primary tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-muted-foreground">{principle}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
