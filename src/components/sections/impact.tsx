"use client";

import { useMemo, useState } from "react";
import { ActivityChart } from "@/components/charts/activity-chart";
import { DomainRadar } from "@/components/charts/domain-radar";
import { StackBars } from "@/components/charts/stack-bars";
import { Segmented } from "@/components/ui/controls";
import { Panel } from "@/components/ui/primitives";
import { Counter, Reveal } from "@/components/visual/motion-primitives";
import { Section, SectionHeading } from "@/components/visual/section";
import { activitySeries, domainScores, stackShare } from "@/data/metrics";
import { useI18n } from "@/hooks/use-i18n";
import { formatNumber } from "@/lib/format";

type RangeKey = "3" | "6" | "12";

const RANGE_MONTHS: Record<RangeKey, number> = { "3": 3, "6": 6, "12": 12 };

export function Impact() {
  const { dict, t } = useI18n();
  const [range, setRange] = useState<RangeKey>("12");

  const series = useMemo(
    () => activitySeries.slice(-RANGE_MONTHS[range]),
    [range],
  );

  const totals = useMemo(
    () =>
      series.reduce(
        (acc, point) => ({
          shipped: acc.shipped + point.shipped,
          reviewed: acc.reviewed + point.reviewed,
          automated: acc.automated + point.automated,
        }),
        { shipped: 0, reviewed: 0, automated: 0 },
      ),
    [series],
  );

  const radarData = useMemo(
    () => domainScores.map((entry) => ({ label: t(entry.label), score: entry.score })),
    [t],
  );

  const seriesLabels = {
    shipped: dict.impact.shipped,
    reviewed: dict.impact.reviewed,
    automated: dict.impact.automated,
  };

  const summaryCards = [
    { key: "shipped", label: dict.impact.shipped, value: totals.shipped, color: "var(--color-primary)" },
    { key: "reviewed", label: dict.impact.reviewed, value: totals.reviewed, color: "var(--color-cyan-accent)" },
    {
      key: "automated",
      label: dict.impact.automated,
      value: totals.automated,
      color: "var(--color-violet-accent)",
    },
  ] as const;

  return (
    <Section id="impact">
      <SectionHeading
        eyebrow={dict.impact.eyebrow}
        title={dict.impact.title}
        subtitle={dict.impact.subtitle}
        action={
          <Segmented
            ariaLabel={dict.impact.activityTitle}
            options={[
              { value: "3", label: dict.impact.range3 },
              { value: "6", label: dict.impact.range6 },
              { value: "12", label: dict.impact.range12 },
            ]}
            value={range}
            onChange={setRange}
            size="sm"
          />
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Panel className="flex h-full flex-col p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-medium">{dict.impact.activityTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{dict.impact.activityCaption}</p>
              </div>
              <dl className="flex gap-5">
                {summaryCards.map((card) => (
                  <div key={card.key}>
                    <dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: card.color }}
                        aria-hidden
                      />
                      {card.label}
                    </dt>
                    <dd className="mt-0.5 font-mono text-lg font-semibold tabular-nums">
                      <Counter value={card.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="h-72 w-full sm:h-80">
              <ActivityChart data={series} labels={seriesLabels} />
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.08}>
          <Panel className="flex h-full flex-col p-5 sm:p-6">
            <h3 className="font-medium">{dict.impact.radarTitle}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{dict.impact.radarCaption}</p>
            <div className="mt-2 h-72 w-full">
              <DomainRadar data={radarData} seriesLabel={dict.skills.proficiency} />
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.12} className="lg:col-span-3">
          <Panel className="p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h3 className="font-medium">{dict.impact.stackTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{dict.impact.stackCaption}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {formatNumber(stackShare.reduce((sum, entry) => sum + entry.share, 0))}%
              </span>
            </div>
            <div className="h-64 w-full">
              <StackBars data={stackShare} seriesLabel={dict.impact.stackTitle} />
            </div>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
}
