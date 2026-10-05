import { describe, expect, it } from "vitest";
import { formatMetric, formatNumber, formatYearRange, roundTo } from "@/lib/format";

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
});

describe("formatYearRange", () => {
  it("shows years only", () => {
    expect(formatYearRange("2024-01", "2025-01", "now")).toBe("2024 – 2025");
    expect(formatYearRange("2026-02", null, "now")).toBe("2026 – now");
    expect(formatYearRange("2025-03", "2025-11", "now")).toBe("2025");
  });
});
