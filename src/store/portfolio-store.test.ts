import { beforeEach, describe, expect, it } from "vitest";
import { defaultProjectFilter } from "@/lib/projects";
import { defaultQuoteInput, getService } from "@/lib/pricing";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

const state = () => usePortfolioStore.getState();

beforeEach(() => {
  resetPortfolioStore();
});

describe("language", () => {
  it("starts in English and toggles between the two languages", () => {
    expect(state().language).toBe("en");
    state().toggleLanguage();
    expect(state().language).toBe("mn");
    state().toggleLanguage();
    expect(state().language).toBe("en");
  });

  it("can be set directly", () => {
    state().setLanguage("mn");
    expect(state().language).toBe("mn");
  });
});

describe("chrome", () => {
  it("toggles the command palette", () => {
    expect(state().commandOpen).toBe(false);
    state().toggleCommand();
    expect(state().commandOpen).toBe(true);
    state().setCommandOpen(false);
    expect(state().commandOpen).toBe(false);
  });

  it("tracks the active section and the mobile nav", () => {
    state().setActiveSection("pricing");
    expect(state().activeSection).toBe("pricing");
    state().setMobileNavOpen(true);
    expect(state().mobileNavOpen).toBe(true);
  });
});

describe("project filters", () => {
  it("updates each facet independently", () => {
    state().setQuery("gogo");
    state().setCategory("platform");
    state().setSort("newest");

    expect(state().projectFilter).toEqual({
      ...defaultProjectFilter,
      query: "gogo",
      category: "platform",
      sort: "newest",
    });
  });

  it("treats the stack filter as a single toggle", () => {
    state().toggleStack("Redis");
    expect(state().projectFilter.stack).toBe("Redis");

    state().toggleStack("PostgreSQL");
    expect(state().projectFilter.stack).toBe("PostgreSQL");

    state().toggleStack("PostgreSQL");
    expect(state().projectFilter.stack).toBeNull();
  });

  it("resets every facet at once", () => {
    state().setQuery("x");
    state().setCategory("ai");
    state().toggleStack("Redis");
    state().resetFilters();
    expect(state().projectFilter).toEqual(defaultProjectFilter);
  });

  it("opens and closes a project", () => {
    state().openProject("gogo");
    expect(state().selectedProjectId).toBe("gogo");
    state().closeProject();
    expect(state().selectedProjectId).toBeNull();
  });
});

describe("estimator", () => {
  it("keeps screens within the new service bounds when switching", () => {
    state().setScreens(30);
    state().setServiceId("audit");

    const audit = getService("audit");
    expect(state().quote.serviceId).toBe("audit");
    expect(state().quote.screens).toBe(audit.maxScreens);
  });

  it("raises screens to the included minimum when switching up", () => {
    state().setServiceId("audit");
    state().setScreens(3);
    state().setServiceId("blockchain");

    expect(state().quote.screens).toBe(getService("blockchain").includedScreens);
  });

  it("toggles add-ons on and off", () => {
    const before = state().quote.addOnIds;
    state().toggleAddOn("cms");
    expect(state().quote.addOnIds).toEqual([...before, "cms"]);
    state().toggleAddOn("cms");
    expect(state().quote.addOnIds).toEqual(before);
  });

  it("toggles eligibility discounts", () => {
    state().toggleDiscount("nonprofit");
    state().toggleDiscount("openSource");
    expect(state().quote.discountIds).toEqual(["nonprofit", "openSource"]);
    state().toggleDiscount("nonprofit");
    expect(state().quote.discountIds).toEqual(["openSource"]);
  });

  it("stores pace, support and currency choices", () => {
    state().setTimelineId("rush");
    state().setSupportMonths(12);
    state().setCurrency("MNT");
    state().setIntegrations(5);

    expect(state().quote.timelineId).toBe("rush");
    expect(state().quote.supportMonths).toBe(12);
    expect(state().quote.currency).toBe("MNT");
    expect(state().quote.integrations).toBe(5);
  });

  it("restores the default configuration", () => {
    state().setTimelineId("rush");
    state().toggleAddOn("cms");
    state().resetQuote();
    expect(state().quote).toEqual(defaultQuoteInput);
  });
});

describe("brief draft", () => {
  it("carries a generated brief across to the contact form", () => {
    expect(state().briefDraft).toBe("");
    state().setBriefDraft("Estimated total: $18,508");
    expect(state().briefDraft).toContain("18,508");
    state().setBriefDraft("");
    expect(state().briefDraft).toBe("");
  });
});
