import { formatCurrency, formatWeeks } from "@/lib/format";
import { pick } from "@/lib/i18n";
import { getAddOn, getService, getTimeline, type Quote } from "@/lib/pricing";
import type { Language } from "@/types";

const COPY = {
  en: {
    intro: "Here is the estimate I put together on your site:",
    engagement: "Engagement",
    scope: "Scope",
    screens: "screens",
    integrations: "integrations",
    addOns: "Add-ons",
    pace: "Pace",
    support: "Support",
    months: "months",
    none: "none",
    duration: "Estimated duration",
    weeks: "weeks",
    total: "Estimated total",
    outro: "A few words about the project:",
  },
  mn: {
    intro: "Сайтаас тань дараах тооцоог гаргалаа:",
    engagement: "Ажлын төрөл",
    scope: "Хамрах хүрээ",
    screens: "дэлгэц",
    integrations: "холболт",
    addOns: "Нэмэлт",
    pace: "Хурд",
    support: "Дэмжлэг",
    months: "сар",
    none: "байхгүй",
    duration: "Тооцоолсон хугацаа",
    weeks: "долоо хоног",
    total: "Тооцоолсон нийт дүн",
    outro: "Төслийн талаар товчхон:",
  },
} as const;

/**
 * Renders a quote as the plain-text brief that pre-fills the contact form, so
 * the estimator and the contact section never disagree about the numbers.
 */
export function buildBriefMessage(quote: Quote, language: Language): string {
  const copy = COPY[language];
  const service = getService(quote.resolved.serviceId);
  const timeline = getTimeline(quote.resolved.timelineId);
  const addOnNames = quote.resolved.addOnIds.map((id) => pick(getAddOn(id).name, language));

  const lines = [
    copy.intro,
    "",
    `• ${copy.engagement}: ${pick(service.name, language)}`,
    `• ${copy.scope}: ${quote.resolved.screens} ${copy.screens}, ${quote.resolved.integrations} ${copy.integrations}`,
    `• ${copy.addOns}: ${addOnNames.length > 0 ? addOnNames.join(", ") : copy.none}`,
    `• ${copy.pace}: ${pick(timeline.name, language)}`,
    `• ${copy.support}: ${
      quote.resolved.supportMonths > 0
        ? `${quote.resolved.supportMonths} ${copy.months}`
        : copy.none
    }`,
    `• ${copy.duration}: ${formatWeeks(quote.weeks)} ${copy.weeks}`,
    `• ${copy.total}: ${formatCurrency(quote.total, quote.resolved.currency)}`,
    "",
    copy.outro,
    "",
  ];

  return lines.join("\n");
}
