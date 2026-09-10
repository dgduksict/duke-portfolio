"use client";

import { motion } from "framer-motion";
import { Blocks, Brain, Layers, LayoutTemplate, Search, Sparkles } from "lucide-react";
import type { ComponentType } from "react";
import { Segmented, Slider, Switch, ToggleChip } from "@/components/ui/controls";
import { Badge, Panel } from "@/components/ui/primitives";
import {
  MAX_INTEGRATIONS,
  SUPPORT_MONTH_OPTIONS,
  addOns,
  discountRules,
  services,
  timelineOptions,
} from "@/data/services";
import { useI18n } from "@/hooks/use-i18n";
import { getService, getTimeline } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { usePortfolioStore } from "@/store/portfolio-store";
import type { CurrencyCode, Service, TimelineId } from "@/types";

const SERVICE_ICONS: Record<Service["icon"], ComponentType<{ className?: string }>> = {
  layout: LayoutTemplate,
  layers: Layers,
  brain: Brain,
  blocks: Blocks,
  search: Search,
};

export function Estimator() {
  const { dict, t } = useI18n();
  const quote = usePortfolioStore((state) => state.quote);
  const setServiceId = usePortfolioStore((state) => state.setServiceId);
  const setScreens = usePortfolioStore((state) => state.setScreens);
  const setIntegrations = usePortfolioStore((state) => state.setIntegrations);
  const toggleAddOn = usePortfolioStore((state) => state.toggleAddOn);
  const setTimelineId = usePortfolioStore((state) => state.setTimelineId);
  const setSupportMonths = usePortfolioStore((state) => state.setSupportMonths);
  const toggleDiscount = usePortfolioStore((state) => state.toggleDiscount);
  const setCurrency = usePortfolioStore((state) => state.setCurrency);

  const service = getService(quote.serviceId);
  const timeline = getTimeline(quote.timelineId);
  const screens = Math.min(Math.max(quote.screens, service.includedScreens), service.maxScreens);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          {dict.pricing.service}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((entry) => {
            const Icon = SERVICE_ICONS[entry.icon];
            const active = entry.id === quote.serviceId;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setServiceId(entry.id)}
                aria-pressed={active}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  active
                    ? "border-primary/60 bg-primary/8"
                    : "border-border bg-surface/50 hover:border-border-strong hover:bg-surface",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="service-active"
                    className="absolute inset-0 -z-10 bg-primary/5"
                    transition={{ type: "spring", stiffness: 340, damping: 32 }}
                  />
                ) : null}
                <div className="flex items-start justify-between gap-2">
                  <Icon className={cn("size-5", active ? "text-primary" : "text-muted-foreground")} />
                  {entry.popular ? (
                    <Badge tone="primary" className="text-[10px]">
                      <Sparkles className="size-3" />
                      {dict.pricing.popular}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-3 text-sm font-medium">{t(entry.name)}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t(entry.summary)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <Panel className="space-y-6 p-5 sm:p-6">
        <h3 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          {dict.pricing.scope}
        </h3>

        <Slider
          label={dict.pricing.screens}
          value={screens}
          min={service.includedScreens}
          max={service.maxScreens}
          valueLabel={screens}
          onChange={setScreens}
          hint={`${service.includedScreens} ${dict.pricing.screensHint}`}
        />

        <Slider
          label={dict.pricing.integrations}
          value={Math.min(quote.integrations, MAX_INTEGRATIONS)}
          min={0}
          max={MAX_INTEGRATIONS}
          valueLabel={quote.integrations}
          onChange={setIntegrations}
          hint={dict.pricing.integrationsHint}
        />
      </Panel>

      <Panel className="space-y-4 p-5 sm:p-6">
        <h3 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          {dict.pricing.addOns}
        </h3>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {addOns.map((addOn) => (
            <Switch
              key={addOn.id}
              checked={quote.addOnIds.includes(addOn.id)}
              onChange={() => toggleAddOn(addOn.id)}
              label={t(addOn.name)}
              description={t(addOn.description)}
            />
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="space-y-4 p-5 sm:p-6">
          <h3 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            {dict.pricing.timeline}
          </h3>
          <Segmented
            ariaLabel={dict.pricing.timeline}
            options={timelineOptions.map((option) => ({
              value: option.id,
              label: t(option.name),
            }))}
            value={quote.timelineId}
            onChange={(value: TimelineId) => setTimelineId(value)}
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(timeline.description)}
          </p>
        </Panel>

        <Panel className="space-y-4 p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              {dict.pricing.support}
            </h3>
            <span className="font-mono text-xs text-muted-foreground">
              {dict.pricing.supportHint}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUPPORT_MONTH_OPTIONS.map((months) => (
              <ToggleChip
                key={months}
                active={quote.supportMonths === months}
                onClick={() => setSupportMonths(months)}
              >
                {months === 0 ? dict.pricing.noSupport : `${months} ${dict.pricing.months}`}
              </ToggleChip>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="space-y-4 p-5 sm:p-6">
          <h3 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            {dict.pricing.eligibility}
          </h3>
          <div className="space-y-2.5">
            {discountRules.map((rule) => (
              <Switch
                key={rule.id}
                checked={quote.discountIds.includes(rule.id)}
                onChange={() => toggleDiscount(rule.id)}
                label={t(rule.name)}
                description={t(rule.description)}
              />
            ))}
          </div>
        </Panel>

        <Panel className="space-y-4 p-5 sm:p-6">
          <h3 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            {dict.pricing.currency}
          </h3>
          <Segmented
            ariaLabel={dict.pricing.currency}
            options={[
              { value: "USD", label: "USD $" },
              { value: "MNT", label: "MNT ₮" },
            ]}
            value={quote.currency}
            onChange={(value: CurrencyCode) => setCurrency(value)}
          />
          <div>
            <h4 className="mb-2 text-sm font-medium">{dict.pricing.includes}</h4>
            <ul className="space-y-1.5">
              {t(service.deliverables).map((item) => (
                <li key={item} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>
    </div>
  );
}
