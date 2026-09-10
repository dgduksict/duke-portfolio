import {
  DEPOSIT_RATE,
  MAX_DISCOUNT_RATE,
  MAX_INTEGRATIONS,
  MIN_PROJECT_WEEKS,
  PRICE_PER_INTEGRATION,
  SUPPORT_MONTHLY_MINIMUM,
  SUPPORT_MONTHLY_RATE,
  SUPPORT_MONTH_OPTIONS,
  VAT_RATE,
  WEEKS_PER_INTEGRATION,
  addOns,
  discountRules,
  services,
  timelineOptions,
  volumeTiers,
} from "@/data/services";
import { roundTo } from "@/lib/format";
import type { AddOnId, CurrencyCode, DiscountId, ServiceId, TimelineId } from "@/types";

export interface QuoteInput {
  readonly serviceId: ServiceId;
  readonly screens: number;
  readonly integrations: number;
  readonly addOnIds: readonly AddOnId[];
  readonly timelineId: TimelineId;
  readonly supportMonths: number;
  readonly discountIds: readonly DiscountId[];
  readonly currency: CurrencyCode;
}

export type QuoteLineSource =
  | { readonly kind: "base" }
  | { readonly kind: "screens"; readonly count: number }
  | { readonly kind: "integrations"; readonly count: number }
  | { readonly kind: "addOn"; readonly addOnId: AddOnId }
  | { readonly kind: "speed"; readonly timelineId: TimelineId }
  | { readonly kind: "discount"; readonly rate: number; readonly discountIds: readonly DiscountId[] }
  | { readonly kind: "support"; readonly months: number; readonly monthly: number }
  | { readonly kind: "vat"; readonly rate: number };

export interface QuoteLine {
  readonly id: string;
  readonly source: QuoteLineSource;
  /** Amount in USD. Negative for discounts. */
  readonly amount: number;
}

export interface QuoteSegment {
  readonly id: string;
  readonly amount: number;
  readonly accent: string;
}

export interface Quote {
  readonly input: QuoteInput;
  /** Input after clamping — this is what the numbers were actually computed from. */
  readonly resolved: QuoteInput;
  readonly lines: readonly QuoteLine[];
  readonly segments: readonly QuoteSegment[];
  readonly baseFee: number;
  readonly screensFee: number;
  readonly integrationsFee: number;
  readonly addOnsFee: number;
  readonly speedAdjustment: number;
  readonly subtotal: number;
  readonly eligibilityDiscountRate: number;
  readonly volumeDiscountRate: number;
  readonly discountRate: number;
  readonly discountAmount: number;
  readonly projectTotal: number;
  readonly supportMonthly: number;
  readonly supportTotal: number;
  readonly taxable: number;
  readonly vat: number;
  readonly total: number;
  readonly deposit: number;
  readonly balance: number;
  readonly weeks: number;
}

const SEGMENT_ACCENTS: Readonly<Record<string, string>> = {
  base: "#34d399",
  screens: "#22d3ee",
  integrations: "#60a5fa",
  addOns: "#a78bfa",
  speed: "#f472b6",
  support: "#f59e0b",
  vat: "#94a3b8",
};

export const defaultQuoteInput: QuoteInput = {
  serviceId: "webapp",
  screens: 10,
  integrations: 2,
  addOnIds: ["designSystem"],
  timelineId: "standard",
  supportMonths: 6,
  discountIds: [],
  currency: "USD",
};

export function getService(serviceId: ServiceId) {
  const service = services.find((entry) => entry.id === serviceId);
  if (!service) {
    throw new Error(`Unknown service: ${serviceId}`);
  }
  return service;
}

export function getTimeline(timelineId: TimelineId) {
  const timeline = timelineOptions.find((entry) => entry.id === timelineId);
  if (!timeline) {
    throw new Error(`Unknown timeline: ${timelineId}`);
  }
  return timeline;
}

export function getAddOn(addOnId: AddOnId) {
  const addOn = addOns.find((entry) => entry.id === addOnId);
  if (!addOn) {
    throw new Error(`Unknown add-on: ${addOnId}`);
  }
  return addOn;
}

export function getDiscountRule(discountId: DiscountId) {
  const rule = discountRules.find((entry) => entry.id === discountId);
  if (!rule) {
    throw new Error(`Unknown discount: ${discountId}`);
  }
  return rule;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function unique<T>(values: readonly T[]): readonly T[] {
  return Array.from(new Set(values));
}

/** Snaps an arbitrary month count onto the nearest offered retainer length. */
export function normaliseSupportMonths(months: number): number {
  if (!Number.isFinite(months) || months <= 0) return 0;
  return SUPPORT_MONTH_OPTIONS.reduce((closest, option) => {
    const currentDelta = Math.abs(option - months);
    const bestDelta = Math.abs(closest - months);
    if (currentDelta < bestDelta) return option;
    if (currentDelta === bestDelta) return Math.max(closest, option);
    return closest;
  }, 0);
}

/** Highest tier whose threshold the subtotal reaches. Tiers do not stack. */
export function volumeDiscountRate(subtotal: number): number {
  return volumeTiers.reduce(
    (rate, tier) => (subtotal >= tier.threshold ? Math.max(rate, tier.rate) : rate),
    0,
  );
}

export function resolveQuoteInput(input: QuoteInput): QuoteInput {
  const service = getService(input.serviceId);
  const knownAddOns = unique(input.addOnIds).filter((id) =>
    addOns.some((addOn) => addOn.id === id),
  );
  const knownDiscounts = unique(input.discountIds).filter((id) =>
    discountRules.some((rule) => rule.id === id),
  );

  return {
    serviceId: service.id,
    screens: clamp(Math.round(input.screens), service.includedScreens, service.maxScreens),
    integrations: clamp(Math.round(input.integrations), 0, MAX_INTEGRATIONS),
    addOnIds: knownAddOns,
    timelineId: getTimeline(input.timelineId).id,
    supportMonths: normaliseSupportMonths(input.supportMonths),
    discountIds: knownDiscounts,
    currency: input.currency,
  };
}

/** Estimated calendar duration in weeks, rounded to the nearest half week. */
export function estimateWeeks(input: QuoteInput): number {
  const resolved = resolveQuoteInput(input);
  const service = getService(resolved.serviceId);
  const timeline = getTimeline(resolved.timelineId);

  const extraScreens = resolved.screens - service.includedScreens;
  const addOnWeeks = resolved.addOnIds.reduce((sum, id) => sum + getAddOn(id).weeks, 0);

  const raw =
    service.baseWeeks +
    extraScreens * service.weeksPerScreen +
    resolved.integrations * WEEKS_PER_INTEGRATION +
    addOnWeeks;

  const adjusted = raw * timeline.durationMultiplier;
  return Math.max(MIN_PROJECT_WEEKS, roundTo(adjusted * 2, 0) / 2);
}

/**
 * The single source of truth for every figure in the estimator.
 *
 * Order of operations: base fee -> scope (screens, integrations, add-ons) ->
 * pace multiplier -> discounts (eligibility + volume, capped) -> support
 * retainer -> VAT. Every monetary field is rounded to whole USD as it is
 * produced, so the rendered breakdown always sums to the rendered total.
 */
export function buildQuote(input: QuoteInput): Quote {
  const resolved = resolveQuoteInput(input);
  const service = getService(resolved.serviceId);
  const timeline = getTimeline(resolved.timelineId);

  const baseFee = roundTo(service.basePrice, 0);
  const extraScreens = resolved.screens - service.includedScreens;
  const screensFee = roundTo(extraScreens * service.pricePerScreen, 0);
  const integrationsFee = roundTo(resolved.integrations * PRICE_PER_INTEGRATION, 0);
  const addOnsFee = roundTo(
    resolved.addOnIds.reduce((sum, id) => {
      const addOn = getAddOn(id);
      return sum + addOn.flatPrice + addOn.basePercent * service.basePrice;
    }, 0),
    0,
  );

  const scoped = baseFee + screensFee + integrationsFee + addOnsFee;
  const speedAdjustment = roundTo(scoped * (timeline.priceMultiplier - 1), 0);
  const subtotal = scoped + speedAdjustment;

  const eligibilityDiscountRate = resolved.discountIds.reduce(
    (sum, id) => sum + getDiscountRule(id).rate,
    0,
  );
  const volumeRate = volumeDiscountRate(subtotal);
  const discountRate = Math.min(eligibilityDiscountRate + volumeRate, MAX_DISCOUNT_RATE);
  const discountAmount = roundTo(subtotal * discountRate, 0);
  const projectTotal = subtotal - discountAmount;

  const supportMonthly =
    resolved.supportMonths > 0
      ? roundTo(Math.max(projectTotal * SUPPORT_MONTHLY_RATE, SUPPORT_MONTHLY_MINIMUM), 0)
      : 0;
  const supportTotal = supportMonthly * resolved.supportMonths;

  const taxable = projectTotal + supportTotal;
  const vat = roundTo(taxable * VAT_RATE, 0);
  const total = taxable + vat;
  const deposit = roundTo(total * DEPOSIT_RATE, 0);
  const balance = total - deposit;

  const lines: QuoteLine[] = [{ id: "base", source: { kind: "base" }, amount: baseFee }];

  if (screensFee > 0) {
    lines.push({
      id: "screens",
      source: { kind: "screens", count: extraScreens },
      amount: screensFee,
    });
  }
  if (integrationsFee > 0) {
    lines.push({
      id: "integrations",
      source: { kind: "integrations", count: resolved.integrations },
      amount: integrationsFee,
    });
  }
  for (const addOnId of resolved.addOnIds) {
    const addOn = getAddOn(addOnId);
    lines.push({
      id: `addOn:${addOnId}`,
      source: { kind: "addOn", addOnId },
      amount: roundTo(addOn.flatPrice + addOn.basePercent * service.basePrice, 0),
    });
  }
  if (speedAdjustment !== 0) {
    lines.push({
      id: "speed",
      source: { kind: "speed", timelineId: timeline.id },
      amount: speedAdjustment,
    });
  }
  if (discountAmount > 0) {
    lines.push({
      id: "discount",
      source: { kind: "discount", rate: discountRate, discountIds: resolved.discountIds },
      amount: -discountAmount,
    });
  }
  if (supportTotal > 0) {
    lines.push({
      id: "support",
      source: { kind: "support", months: resolved.supportMonths, monthly: supportMonthly },
      amount: supportTotal,
    });
  }
  lines.push({ id: "vat", source: { kind: "vat", rate: VAT_RATE }, amount: vat });

  const rawSegments: readonly QuoteSegment[] = [
    { id: "base", amount: baseFee, accent: SEGMENT_ACCENTS.base ?? "#34d399" },
    { id: "screens", amount: screensFee, accent: SEGMENT_ACCENTS.screens ?? "#22d3ee" },
    {
      id: "integrations",
      amount: integrationsFee,
      accent: SEGMENT_ACCENTS.integrations ?? "#60a5fa",
    },
    { id: "addOns", amount: addOnsFee, accent: SEGMENT_ACCENTS.addOns ?? "#a78bfa" },
    { id: "speed", amount: speedAdjustment, accent: SEGMENT_ACCENTS.speed ?? "#f472b6" },
    { id: "support", amount: supportTotal, accent: SEGMENT_ACCENTS.support ?? "#f59e0b" },
    { id: "vat", amount: vat, accent: SEGMENT_ACCENTS.vat ?? "#94a3b8" },
  ];

  return {
    input,
    resolved,
    lines,
    segments: rawSegments.filter((segment) => segment.amount > 0),
    baseFee,
    screensFee,
    integrationsFee,
    addOnsFee,
    speedAdjustment,
    subtotal,
    eligibilityDiscountRate,
    volumeDiscountRate: volumeRate,
    discountRate,
    discountAmount,
    projectTotal,
    supportMonthly,
    supportTotal,
    taxable,
    vat,
    total,
    deposit,
    balance,
    weeks: estimateWeeks(resolved),
  };
}
