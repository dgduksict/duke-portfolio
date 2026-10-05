/** Rounds half away from zero so 2.5 -> 3 and -2.5 -> -3, unlike Math.round. */
export function roundTo(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  const scaled = value * factor;
  const rounded = scaled < 0 ? -Math.round(-scaled) : Math.round(scaled);
  return rounded / factor;
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

/** `YYYY-MM` keys to a years-only range: `2024 – 2025`, `2026 – now`, or `2025`. */
export function formatYearRange(start: string, end: string | null, presentLabel: string): string {
  const from = start.slice(0, 4);
  const to = end === null ? presentLabel : end.slice(0, 4);
  return from === to ? from : `${from} – ${to}`;
}
