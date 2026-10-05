import { beforeEach, describe, expect, it } from "vitest";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

const state = () => usePortfolioStore.getState();

beforeEach(() => {
  resetPortfolioStore();
});

describe("portfolio store", () => {
  it("toggles and sets the language", () => {
    expect(state().language).toBe("en");
    state().toggleLanguage();
    expect(state().language).toBe("mn");
    state().setLanguage("en");
    expect(state().language).toBe("en");
  });

  it("opens and closes the mobile nav", () => {
    state().setMobileNavOpen(true);
    expect(state().mobileNavOpen).toBe(true);
    state().setMobileNavOpen(false);
    expect(state().mobileNavOpen).toBe(false);
  });

  it("keeps the language from a v2 snapshot and drops everything else", async () => {
    window.localStorage.setItem(
      "duke-portfolio",
      JSON.stringify({
        state: { language: "mn", quote: { serviceId: "webapp" }, projectFilter: { query: "" } },
        version: 2,
      }),
    );
    await usePortfolioStore.persist.rehydrate();
    expect(state().language).toBe("mn");
    expect(state()).not.toHaveProperty("quote");
    expect(state()).not.toHaveProperty("projectFilter");
  });

  it("falls back to the current language when the stored one is unknown", async () => {
    window.localStorage.setItem(
      "duke-portfolio",
      JSON.stringify({ state: { language: "fr" }, version: 2 }),
    );
    await usePortfolioStore.persist.rehydrate();
    expect(state().language).toBe("en");
  });

  it("keeps a language picked before rehydration when nothing is stored", async () => {
    state().setLanguage("mn");
    window.localStorage.removeItem("duke-portfolio");
    await usePortfolioStore.persist.rehydrate();
    expect(state().language).toBe("mn");
  });
});
