import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { getAddOn, getDiscountRule, getTimeline, type QuoteLineSource } from "@/lib/pricing";
import { formatPercent } from "@/lib/format";
import type { Language } from "@/types";

/**
 * Turns a quote line back into display copy. Keeping this out of the pricing
 * engine means the engine stays language-agnostic and unit-testable.
 */
export function describeQuoteLine(
  source: QuoteLineSource,
  dict: Dictionary,
  language: Language,
): { readonly label: string; readonly detail: string | null } {
  switch (source.kind) {
    case "base":
      return { label: dict.pricing.baseFee, detail: null };
    case "screens":
      return { label: dict.pricing.extraScreens, detail: `+${source.count}` };
    case "integrations":
      return { label: dict.pricing.integrationsLine, detail: `×${source.count}` };
    case "addOn":
      return { label: pick(getAddOn(source.addOnId).name, language), detail: null };
    case "speed":
      return {
        label: dict.pricing.speedAdjustment,
        detail: pick(getTimeline(source.timelineId).name, language),
      };
    case "discount": {
      // With no eligibility rules selected the saving can only be the volume tier.
      const names =
        source.discountIds.length > 0
          ? source.discountIds.map((id) => pick(getDiscountRule(id).name, language)).join(" + ")
          : dict.pricing.volumeDiscount;
      return {
        label: dict.pricing.discount,
        detail: `${formatPercent(source.rate)} · ${names}`,
      };
    }
    case "support":
      return {
        label: dict.pricing.supportLine,
        detail: `${source.months} ${dict.pricing.months}`,
      };
    case "vat":
      return { label: dict.pricing.vat, detail: null };
  }
}

export function describeSegment(id: string, dict: Dictionary): string {
  switch (id) {
    case "base":
      return dict.pricing.baseFee;
    case "screens":
      return dict.pricing.extraScreens;
    case "integrations":
      return dict.pricing.integrationsLine;
    case "addOns":
      return dict.pricing.addOns;
    case "speed":
      return dict.pricing.speedAdjustment;
    case "support":
      return dict.pricing.supportLine;
    case "vat":
      return dict.pricing.vat;
    default:
      return id;
  }
}
