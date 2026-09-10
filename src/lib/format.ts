import { USD_TO_MNT } from "@/data/services";
import type { CurrencyCode, Language } from "@/types";

const EN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const groupingFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Rounds half away from zero so 2.5 -> 3 and -2.5 -> -3, unlike Math.round. */
export function roundTo(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  const scaled = value * factor;
  const rounded = scaled < 0 ? -Math.round(-scaled) : Math.round(scaled);
  return rounded / factor;
}

export function convertCurrency(amountUsd: number, currency: CurrencyCode): number {
  return currency === "USD" ? amountUsd : amountUsd * USD_TO_MNT;
}

/**
 * Formats a USD amount in the requested display currency. MNT uses a fixed
 * conversion rate — this app never calls a live FX service.
 */
export function formatCurrency(amountUsd: number, currency: CurrencyCode): string {
  const converted = roundTo(convertCurrency(amountUsd, currency), 0);
  const isNegative = converted < 0;
  const digits = groupingFormatter.format(Math.abs(converted));
  const body = currency === "USD" ? `$${digits}` : `${digits}₮`;
  return isNegative ? `-${body}` : body;
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(roundTo(value, decimals));
}

/** Renders a metric as `value + suffix`, e.g. `2.4M`, `99.95%`, `180ms`. */
export function formatMetric(value: number, suffix: string, decimals = 0): string {
  return `${formatNumber(value, decimals)}${suffix}`;
}

export function formatPercent(rate: number, decimals = 0): string {
  return `${formatNumber(rate * 100, decimals)}%`;
}

export function formatWeeks(weeks: number): string {
  return formatNumber(weeks, Number.isInteger(weeks) ? 0 : 1);
}

/** Accepts `YYYY-MM` and renders a language-aware short label. */
export function formatMonth(value: string, language: Language): string {
  const [yearPart, monthPart] = value.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return value;
  }
  if (language === "mn") {
    return `${year} оны ${month}-р сар`;
  }
  return `${EN_MONTHS[month - 1]} ${year}`;
}

export function formatDateRange(
  start: string,
  end: string | null,
  language: Language,
  presentLabel: string,
): string {
  const from = formatMonth(start, language);
  const to = end === null ? presentLabel : formatMonth(end, language);
  return `${from} — ${to}`;
}

/** Whole months between two `YYYY-MM` values, inclusive of the starting month. */
export function monthsBetween(start: string, end: string): number {
  const [startYear, startMonth] = start.split("-").map(Number);
  const [endYear, endMonth] = end.split("-").map(Number);
  if (
    startYear === undefined ||
    startMonth === undefined ||
    endYear === undefined ||
    endMonth === undefined ||
    Number.isNaN(startYear) ||
    Number.isNaN(startMonth) ||
    Number.isNaN(endYear) ||
    Number.isNaN(endMonth)
  ) {
    return 0;
  }
  return Math.max(0, (endYear - startYear) * 12 + (endMonth - startMonth));
}

export function formatMonthSpan(months: number, language: Language): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (language === "mn") {
    if (years === 0) return `${rest} сар`;
    if (rest === 0) return `${years} жил`;
    return `${years} жил ${rest} сар`;
  }
  const yearLabel = years === 1 ? "yr" : "yrs";
  const monthLabel = rest === 1 ? "mo" : "mos";
  if (years === 0) return `${rest} ${monthLabel}`;
  if (rest === 0) return `${years} ${yearLabel}`;
  return `${years} ${yearLabel} ${rest} ${monthLabel}`;
}

/** `YYYY-MM` for a given date, used to close open-ended experience entries. */
export function toMonthKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
