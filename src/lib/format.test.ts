import { describe, expect, it } from "vitest";
import { USD_TO_MNT } from "@/data/services";
import {
  convertCurrency,
  formatCurrency,
  formatDateRange,
  formatMetric,
  formatMonth,
  formatMonthSpan,
  formatNumber,
  formatPercent,
  formatWeeks,
  initialsOf,
  monthsBetween,
  roundTo,
  toMonthKey,
} from "@/lib/format";

describe("roundTo", () => {
  it("rounds halves away from zero", () => {
    expect(roundTo(2.5)).toBe(3);
    expect(roundTo(-2.5)).toBe(-3);
    expect(roundTo(3.4)).toBe(3);
  });

  it("respects the requested precision", () => {
    expect(roundTo(1.2345, 2)).toBe(1.23);
    expect(roundTo(1.2355, 3)).toBe(1.236);
  });
});

describe("currency", () => {
  it("converts USD to MNT at the fixed display rate", () => {
    expect(convertCurrency(100, "USD")).toBe(100);
    expect(convertCurrency(100, "MNT")).toBe(100 * USD_TO_MNT);
  });

  it("formats both currencies with grouping", () => {
    expect(formatCurrency(1980, "USD")).toBe("$1,980");
    expect(formatCurrency(1000, "MNT")).toBe("3,450,000₮");
  });

  it("keeps the sign outside the symbol for credits", () => {
    expect(formatCurrency(-515, "USD")).toBe("-$515");
  });

  it("rounds to whole units", () => {
    expect(formatCurrency(1980.4, "USD")).toBe("$1,980");
    expect(formatCurrency(1980.5, "USD")).toBe("$1,981");
  });
});

describe("numbers", () => {
  it("formats with a fixed number of decimals", () => {
    expect(formatNumber(1234.567, 2)).toBe("1,234.57");
    expect(formatNumber(1234.567)).toBe("1,235");
  });

  it("appends metric suffixes", () => {
    expect(formatMetric(2.4, "M", 1)).toBe("2.4M");
    expect(formatMetric(99.95, "%", 2)).toBe("99.95%");
    expect(formatMetric(180, "ms")).toBe("180ms");
  });

  it("formats percentages from rates", () => {
    expect(formatPercent(0.2)).toBe("20%");
    expect(formatPercent(0.055, 1)).toBe("5.5%");
  });

  it("only shows a decimal on half weeks", () => {
    expect(formatWeeks(8)).toBe("8");
    expect(formatWeeks(8.5)).toBe("8.5");
  });
});

describe("dates", () => {
  it("formats a month key per language", () => {
    expect(formatMonth("2026-02", "en")).toBe("Feb 2026");
    expect(formatMonth("2026-02", "mn")).toBe("2026 оны 2-р сар");
  });

  it("returns the raw value for an unparseable month", () => {
    expect(formatMonth("not-a-month", "en")).toBe("not-a-month");
    expect(formatMonth("2026-19", "en")).toBe("2026-19");
  });

  it("labels an open-ended range with the present label", () => {
    expect(formatDateRange("2026-02", null, "en", "Present")).toBe("Feb 2026 — Present");
    expect(formatDateRange("2024-01", "2025-01", "en", "Present")).toBe("Jan 2024 — Jan 2025");
  });

  it("counts whole months between two keys", () => {
    expect(monthsBetween("2024-01", "2025-01")).toBe(12);
    expect(monthsBetween("2025-01", "2026-03")).toBe(14);
    expect(monthsBetween("2026-03", "2025-01")).toBe(0);
    expect(monthsBetween("bad", "2026-01")).toBe(0);
  });

  it("renders a span in years and months", () => {
    expect(formatMonthSpan(5, "en")).toBe("5 mos");
    expect(formatMonthSpan(1, "en")).toBe("1 mo");
    expect(formatMonthSpan(12, "en")).toBe("1 yr");
    expect(formatMonthSpan(14, "en")).toBe("1 yr 2 mos");
    expect(formatMonthSpan(14, "mn")).toBe("1 жил 2 сар");
  });

  it("derives a zero-padded month key from a date", () => {
    expect(toMonthKey(new Date(2026, 0, 15))).toBe("2026-01");
    expect(toMonthKey(new Date(2026, 10, 2))).toBe("2026-11");
  });
});

describe("initialsOf", () => {
  it("takes the first letter of the first two words", () => {
    expect(initialsOf("Dulguun Battulga")).toBe("DB");
    expect(initialsOf("  duke  ")).toBe("D");
    expect(initialsOf("")).toBe("");
  });
});
