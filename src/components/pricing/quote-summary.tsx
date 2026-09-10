"use client";

import { motion } from "framer-motion";
import { Clock3, Info, RotateCcw, Send } from "lucide-react";
import { useMemo } from "react";
import { CostDonut } from "@/components/charts/cost-donut";
import { describeQuoteLine, describeSegment } from "@/components/pricing/quote-labels";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/primitives";
import { useI18n } from "@/hooks/use-i18n";
import { buildBriefMessage } from "@/lib/brief";
import { formatCurrency, formatWeeks } from "@/lib/format";
import { buildQuote } from "@/lib/pricing";
import { cn, scrollToSection } from "@/lib/utils";
import { usePortfolioStore } from "@/store/portfolio-store";

export function QuoteSummary() {
  const { dict, language } = useI18n();
  const input = usePortfolioStore((state) => state.quote);
  const resetQuote = usePortfolioStore((state) => state.resetQuote);
  const setBriefDraft = usePortfolioStore((state) => state.setBriefDraft);

  const quote = useMemo(() => buildQuote(input), [input]);
  const currency = quote.resolved.currency;

  const slices = useMemo(
    () =>
      quote.segments.map((segment) => ({
        id: segment.id,
        label: describeSegment(segment.id, dict),
        amount: segment.amount,
        accent: segment.accent,
      })),
    [quote.segments, dict],
  );

  const sendBrief = () => {
    setBriefDraft(buildBriefMessage(quote, language));
    scrollToSection("contact");
  };

  return (
    <Panel className="sticky top-24 overflow-hidden">
      <div className="border-b border-border p-5 sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          {dict.pricing.estimate}
        </p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <motion.p
            key={`${quote.total}-${currency}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="text-4xl font-semibold tracking-tight tabular-nums"
          >
            {formatCurrency(quote.total, currency)}
          </motion.p>
          <span className="flex items-center gap-1.5 pb-1.5 font-mono text-xs text-muted-foreground">
            <Clock3 className="size-3.5" aria-hidden />
            <span className="sr-only">{dict.pricing.duration}: </span>
            {formatWeeks(quote.weeks)} {dict.pricing.weeks}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-surface-muted/50 p-3">
            <p className="text-[11px] text-muted-foreground">{dict.pricing.deposit}</p>
            <p className="mt-1 font-mono text-lg font-medium tabular-nums">
              {formatCurrency(quote.deposit, currency)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface-muted/50 p-3">
            <p className="text-[11px] text-muted-foreground">{dict.pricing.balance}</p>
            <p className="mt-1 font-mono text-lg font-medium tabular-nums">
              {formatCurrency(quote.balance, currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-b border-border p-5 sm:grid-cols-[9rem_1fr] sm:p-6">
        <div className="mx-auto h-36 w-36">
          <CostDonut slices={slices} currency={currency} shareLabel={dict.pricing.shareOfTotal} />
        </div>
        <ul className="grid content-center gap-1.5">
          {slices.map((slice) => (
            <li key={slice.id} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.accent }}
                  aria-hidden
                />
                <span className="truncate">{slice.label}</span>
              </span>
              <span className="font-mono tabular-nums">
                {formatCurrency(slice.amount, currency)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          {dict.pricing.breakdown}
        </h3>
        <dl className="space-y-2">
          {quote.lines.map((line) => {
            const { label, detail } = describeQuoteLine(line.source, dict, language);
            const negative = line.amount < 0;
            return (
              <div key={line.id} className="flex items-baseline justify-between gap-4 text-sm">
                <dt className="flex min-w-0 flex-wrap items-baseline gap-2 text-muted-foreground">
                  <span className="truncate text-foreground">{label}</span>
                  {detail !== null ? (
                    <span className="font-mono text-[11px] text-muted-foreground">{detail}</span>
                  ) : null}
                </dt>
                <dd
                  className={cn(
                    "shrink-0 font-mono tabular-nums",
                    negative ? "text-primary" : "text-foreground",
                  )}
                >
                  {formatCurrency(line.amount, currency)}
                </dd>
              </div>
            );
          })}

          <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-border pt-3 text-sm">
            <dt className="text-muted-foreground">{dict.pricing.subtotal}</dt>
            <dd className="font-mono tabular-nums">{formatCurrency(quote.subtotal, currency)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">{dict.pricing.projectTotal}</dt>
            <dd className="font-mono tabular-nums">
              {formatCurrency(quote.projectTotal, currency)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
            <dt className="font-medium">{dict.pricing.total}</dt>
            <dd className="font-mono text-lg font-semibold tabular-nums">
              {formatCurrency(quote.total, currency)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={sendBrief}>
            <Send className="size-4" />
            {dict.pricing.sendBrief}
          </Button>
          <Button variant="secondary" onClick={resetQuote} aria-label={dict.pricing.reset}>
            <RotateCcw className="size-4" />
            <span className="sm:hidden">{dict.pricing.reset}</span>
          </Button>
        </div>

        <p className="mt-4 flex gap-2 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {dict.pricing.disclaimer}
        </p>
      </div>
    </Panel>
  );
}
