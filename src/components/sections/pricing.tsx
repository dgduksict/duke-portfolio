"use client";

import { Estimator } from "@/components/pricing/estimator";
import { QuoteSummary } from "@/components/pricing/quote-summary";
import { Reveal } from "@/components/visual/motion-primitives";
import { Section, SectionHeading } from "@/components/visual/section";
import { useI18n } from "@/hooks/use-i18n";

export function Pricing() {
  const { dict } = useI18n();

  return (
    <Section id="pricing">
      <div
        className="dot-backdrop pointer-events-none absolute inset-x-0 top-0 h-80 mask-fade-b"
        aria-hidden
      />

      <SectionHeading
        eyebrow={dict.pricing.eyebrow}
        title={dict.pricing.title}
        subtitle={dict.pricing.subtitle}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8">
        <Reveal>
          <Estimator />
        </Reveal>
        <Reveal delay={0.1}>
          <QuoteSummary />
        </Reveal>
      </div>
    </Section>
  );
}
