import { describe, expect, it } from "vitest";
import { buildBriefMessage } from "@/lib/brief";
import { formatCurrency } from "@/lib/format";
import { buildQuote, defaultQuoteInput } from "@/lib/pricing";

describe("buildBriefMessage", () => {
  const quote = buildQuote(defaultQuoteInput);

  it("includes the priced total, duration and scope", () => {
    const message = buildBriefMessage(quote, "en");

    expect(message).toContain(formatCurrency(quote.total, "USD"));
    expect(message).toContain("8 weeks");
    expect(message).toContain("10 screens, 2 integrations");
    expect(message).toContain("Full-Stack Product Build");
  });

  it("names the selected add-ons", () => {
    const message = buildBriefMessage(quote, "en");
    expect(message).toContain("Design system");
  });

  it("says so when nothing optional is selected", () => {
    const bare = buildQuote({
      ...defaultQuoteInput,
      addOnIds: [],
      supportMonths: 0,
    });
    const message = buildBriefMessage(bare, "en");
    expect(message).toContain("Add-ons: none");
    expect(message).toContain("Support: none");
  });

  it("renders in Mongolian when asked", () => {
    const message = buildBriefMessage(quote, "mn");
    expect(message).toContain("Ажлын төрөл");
    expect(message).toContain("долоо хоног");
  });

  it("uses the quote currency", () => {
    const mnt = buildQuote({ ...defaultQuoteInput, currency: "MNT" });
    expect(buildBriefMessage(mnt, "en")).toContain(formatCurrency(mnt.total, "MNT"));
  });
});
