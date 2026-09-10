import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { Pricing } from "@/components/sections/pricing";
import { formatCurrency } from "@/lib/format";
import { dictionaries } from "@/lib/i18n";
import { buildQuote, defaultQuoteInput } from "@/lib/pricing";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

const en = dictionaries.en;
const defaultQuote = buildQuote(defaultQuoteInput);

function totalNode(): HTMLElement {
  const [node] = screen.getAllByText(formatCurrency(defaultQuote.total, "USD"));
  if (!node) throw new Error("total not rendered");
  return node;
}

beforeEach(() => {
  resetPortfolioStore();
});

describe("Pricing", () => {
  it("shows the default estimate computed by the pricing engine", () => {
    render(<Pricing />);
    expect(totalNode()).toBeInTheDocument();
    expect(
      screen.getByText(`${defaultQuote.weeks} ${en.pricing.weeks}`),
    ).toBeInTheDocument();
  });

  it("recalculates when an add-on is switched on", async () => {
    const user = userEvent.setup();
    render(<Pricing />);

    await user.click(screen.getByRole("switch", { name: /headless cms/i }));

    const expected = buildQuote({
      ...defaultQuoteInput,
      addOnIds: [...defaultQuoteInput.addOnIds, "cms"],
    });
    expect(expected.total).toBeGreaterThan(defaultQuote.total);

    await waitFor(() => {
      expect(screen.getAllByText(formatCurrency(expected.total, "USD")).length).toBeGreaterThan(0);
    });
  });

  it("recalculates when the pace changes", async () => {
    const user = userEvent.setup();
    render(<Pricing />);

    await user.click(screen.getByRole("tab", { name: "Rush" }));

    const expected = buildQuote({ ...defaultQuoteInput, timelineId: "rush" });
    await waitFor(() => {
      expect(screen.getAllByText(formatCurrency(expected.total, "USD")).length).toBeGreaterThan(0);
    });
    expect(usePortfolioStore.getState().quote.timelineId).toBe("rush");
  });

  it("switches the whole summary into MNT", async () => {
    const user = userEvent.setup();
    render(<Pricing />);

    await user.click(screen.getByRole("tab", { name: "MNT ₮" }));

    await waitFor(() => {
      expect(
        screen.getAllByText(formatCurrency(defaultQuote.total, "MNT")).length,
      ).toBeGreaterThan(0);
    });
  });

  it("clamps the scope when a smaller engagement is selected", async () => {
    const user = userEvent.setup();
    render(<Pricing />);

    await user.click(screen.getByRole("button", { name: /architecture review/i }));

    await waitFor(() => {
      expect(usePortfolioStore.getState().quote.serviceId).toBe("audit");
    });
    expect(screen.getByLabelText(en.pricing.screens)).toHaveValue("10");
  });

  it("restores the default configuration", async () => {
    const user = userEvent.setup();
    render(<Pricing />);

    await user.click(screen.getByRole("tab", { name: "Rush" }));
    await user.click(screen.getByRole("button", { name: en.pricing.reset }));

    await waitFor(() => {
      expect(usePortfolioStore.getState().quote).toEqual(defaultQuoteInput);
    });
    expect(totalNode()).toBeInTheDocument();
  });

  it("hands the estimate to the contact form as a brief", async () => {
    const user = userEvent.setup();
    render(<Pricing />);

    await user.click(screen.getByRole("button", { name: new RegExp(en.pricing.sendBrief, "i") }));

    const draft = usePortfolioStore.getState().briefDraft;
    expect(draft).toContain(formatCurrency(defaultQuote.total, "USD"));
    expect(draft).toContain("Full-Stack Product Build");
  });
});
