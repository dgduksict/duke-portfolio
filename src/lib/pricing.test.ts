import { describe, expect, it } from "vitest";
import { MAX_DISCOUNT_RATE, MAX_INTEGRATIONS } from "@/data/services";
import {
  buildQuote,
  defaultQuoteInput,
  estimateWeeks,
  getService,
  normaliseSupportMonths,
  resolveQuoteInput,
  volumeDiscountRate,
  type QuoteInput,
} from "@/lib/pricing";

const minimal: QuoteInput = {
  serviceId: "landing",
  screens: 4,
  integrations: 0,
  addOnIds: [],
  timelineId: "standard",
  supportMonths: 0,
  discountIds: [],
  currency: "USD",
};

describe("resolveQuoteInput", () => {
  it("clamps screens up to the included minimum", () => {
    const resolved = resolveQuoteInput({ ...minimal, screens: 1 });
    expect(resolved.screens).toBe(getService("landing").includedScreens);
  });

  it("clamps screens down to the service maximum", () => {
    const resolved = resolveQuoteInput({ ...minimal, screens: 999 });
    expect(resolved.screens).toBe(getService("landing").maxScreens);
  });

  it("clamps integrations into range and rounds fractional input", () => {
    expect(resolveQuoteInput({ ...minimal, integrations: -3 }).integrations).toBe(0);
    expect(resolveQuoteInput({ ...minimal, integrations: 99 }).integrations).toBe(
      MAX_INTEGRATIONS,
    );
    expect(resolveQuoteInput({ ...minimal, integrations: 2.4 }).integrations).toBe(2);
  });

  it("de-duplicates add-ons and discounts", () => {
    const resolved = resolveQuoteInput({
      ...minimal,
      addOnIds: ["i18n", "i18n", "cms"],
      discountIds: ["nonprofit", "nonprofit"],
    });
    expect(resolved.addOnIds).toEqual(["i18n", "cms"]);
    expect(resolved.discountIds).toEqual(["nonprofit"]);
  });
});

describe("normaliseSupportMonths", () => {
  it("snaps to the nearest offered retainer length", () => {
    expect(normaliseSupportMonths(0)).toBe(0);
    expect(normaliseSupportMonths(2)).toBe(3);
    expect(normaliseSupportMonths(5)).toBe(6);
    expect(normaliseSupportMonths(11)).toBe(12);
    expect(normaliseSupportMonths(40)).toBe(12);
  });

  it("resolves a tie towards the longer retainer", () => {
    expect(normaliseSupportMonths(4.5)).toBe(6);
  });

  it("treats negative and non-finite input as no retainer", () => {
    expect(normaliseSupportMonths(-4)).toBe(0);
    expect(normaliseSupportMonths(Number.NaN)).toBe(0);
  });
});

describe("volumeDiscountRate", () => {
  it("applies the highest reached tier and never stacks tiers", () => {
    expect(volumeDiscountRate(9_999)).toBe(0);
    expect(volumeDiscountRate(10_000)).toBe(0.05);
    expect(volumeDiscountRate(19_999)).toBe(0.05);
    expect(volumeDiscountRate(20_000)).toBe(0.1);
    expect(volumeDiscountRate(120_000)).toBe(0.1);
  });
});

describe("buildQuote", () => {
  it("prices the smallest possible engagement exactly", () => {
    const quote = buildQuote(minimal);

    expect(quote.baseFee).toBe(1800);
    expect(quote.screensFee).toBe(0);
    expect(quote.integrationsFee).toBe(0);
    expect(quote.addOnsFee).toBe(0);
    expect(quote.speedAdjustment).toBe(0);
    expect(quote.subtotal).toBe(1800);
    expect(quote.discountAmount).toBe(0);
    expect(quote.projectTotal).toBe(1800);
    expect(quote.supportTotal).toBe(0);
    expect(quote.vat).toBe(180);
    expect(quote.total).toBe(1980);
    expect(quote.deposit).toBe(792);
    expect(quote.balance).toBe(1188);
    expect(quote.weeks).toBe(2);
  });

  it("prices the default configuration exactly", () => {
    const quote = buildQuote(defaultQuoteInput);

    // 7200 base + 2 extra screens (760) + 2 integrations (1040) + design system (1296)
    expect(quote.subtotal).toBe(10_296);
    // crosses the 10k tier, so 5% comes off before support is calculated
    expect(quote.volumeDiscountRate).toBe(0.05);
    expect(quote.discountAmount).toBe(515);
    expect(quote.projectTotal).toBe(9_781);
    expect(quote.supportMonthly).toBe(1_174);
    expect(quote.supportTotal).toBe(7_044);
    expect(quote.vat).toBe(1_683);
    expect(quote.total).toBe(18_508);
    expect(quote.deposit).toBe(7_403);
    expect(quote.balance).toBe(11_105);
    expect(quote.weeks).toBe(8);
  });

  it("keeps the rendered breakdown consistent with the rendered total", () => {
    const inputs: QuoteInput[] = [
      minimal,
      defaultQuoteInput,
      {
        serviceId: "blockchain",
        screens: 24,
        integrations: 8,
        addOnIds: ["designSystem", "i18n", "analytics", "cms", "handover"],
        timelineId: "rush",
        supportMonths: 12,
        discountIds: ["nonprofit", "openSource"],
        currency: "MNT",
      },
      {
        serviceId: "audit",
        screens: 5,
        integrations: 1,
        addOnIds: ["handover"],
        timelineId: "priority",
        supportMonths: 3,
        discountIds: ["openSource"],
        currency: "USD",
      },
    ];

    for (const input of inputs) {
      const quote = buildQuote(input);
      const summed = quote.lines.reduce((total, line) => total + line.amount, 0);
      expect(summed).toBe(quote.total);
      expect(quote.deposit + quote.balance).toBe(quote.total);
      expect(Number.isInteger(quote.total)).toBe(true);
    }
  });

  it("caps stacked discounts at the published ceiling", () => {
    const quote = buildQuote({
      serviceId: "blockchain",
      screens: 24,
      integrations: 8,
      addOnIds: ["designSystem", "i18n", "analytics", "cms", "handover"],
      timelineId: "rush",
      supportMonths: 12,
      discountIds: ["nonprofit", "openSource"],
      currency: "USD",
    });

    expect(quote.eligibilityDiscountRate).toBeCloseTo(0.25, 10);
    expect(quote.volumeDiscountRate).toBe(0.1);
    expect(quote.discountRate).toBe(MAX_DISCOUNT_RATE);
    expect(quote.discountAmount).toBe(Math.round(quote.subtotal * MAX_DISCOUNT_RATE));
  });

  it("charges the pace multiplier on the scoped subtotal only", () => {
    const base = buildQuote({ ...minimal, screens: 8 });
    const rushed = buildQuote({ ...minimal, screens: 8, timelineId: "rush" });

    const scoped = base.subtotal;
    expect(rushed.speedAdjustment).toBe(Math.round(scoped * 0.35));
    expect(rushed.subtotal).toBe(scoped + rushed.speedAdjustment);
  });

  it("applies the support floor for small projects", () => {
    const quote = buildQuote({ ...minimal, supportMonths: 3 });
    // 12% of 1800 is 216, below the 400 monthly minimum
    expect(quote.supportMonthly).toBe(400);
    expect(quote.supportTotal).toBe(1200);
  });

  it("omits zero-value lines and segments", () => {
    const quote = buildQuote(minimal);
    const ids = quote.lines.map((line) => line.id);

    expect(ids).toEqual(["base", "vat"]);
    expect(quote.segments.map((segment) => segment.id)).toEqual(["base", "vat"]);
  });

  it("adds one line per selected add-on", () => {
    const quote = buildQuote({ ...minimal, addOnIds: ["i18n", "handover"] });
    const addOnLines = quote.lines.filter((line) => line.source.kind === "addOn");

    expect(addOnLines).toHaveLength(2);
    expect(addOnLines.map((line) => line.amount)).toEqual([1100, 650]);
    expect(quote.addOnsFee).toBe(1750);
  });

  it("prices percentage add-ons against the service base fee", () => {
    const quote = buildQuote({ ...defaultQuoteInput, addOnIds: ["designSystem"] });
    expect(quote.addOnsFee).toBe(Math.round(getService("webapp").basePrice * 0.18));
  });

  it("reports the resolved input it actually priced", () => {
    const quote = buildQuote({ ...minimal, screens: 1, supportMonths: 5 });
    expect(quote.resolved.screens).toBe(4);
    expect(quote.resolved.supportMonths).toBe(6);
    expect(quote.input.screens).toBe(1);
  });

  it("is deterministic for identical input", () => {
    expect(buildQuote(defaultQuoteInput)).toEqual(buildQuote({ ...defaultQuoteInput }));
  });
});

describe("estimateWeeks", () => {
  it("never returns less than one week", () => {
    expect(estimateWeeks({ ...minimal, serviceId: "audit", timelineId: "rush" })).toBeGreaterThanOrEqual(1);
  });

  it("shortens the schedule as the pace increases", () => {
    const standard = estimateWeeks(defaultQuoteInput);
    const priority = estimateWeeks({ ...defaultQuoteInput, timelineId: "priority" });
    const rush = estimateWeeks({ ...defaultQuoteInput, timelineId: "rush" });

    expect(priority).toBeLessThan(standard);
    expect(rush).toBeLessThan(priority);
  });

  it("rounds to half weeks", () => {
    const weeks = estimateWeeks({ ...defaultQuoteInput, screens: 11, integrations: 3 });
    expect((weeks * 2) % 1).toBe(0);
  });
});
