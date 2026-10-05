import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { SiteHeader } from "@/components/layout/site-header";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

beforeEach(() => {
  resetPortfolioStore();
});

describe("SiteHeader", () => {
  it("links to every section", () => {
    render(<SiteHeader />);
    for (const name of ["Experience", "Work", "Stack", "Contact"]) {
      expect(screen.getAllByRole("link", { name })[0]).toHaveAttribute("href", `#${name.toLowerCase()}`);
    }
  });

  it("offers a way past the navigation", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
  });

  it("switches language from the toggle", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "МН" }));
    expect(usePortfolioStore.getState().language).toBe("mn");
    expect(screen.getByRole("button", { name: "МН" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("link", { name: "Туршлага" })[0]).toHaveAttribute("href", "#experience");
  });

  it("opens and closes the phone menu", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    const toggle = screen.getByRole("button", { name: "Menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getAllByRole("link", { name: "Work" }).at(-1)!);
    expect(usePortfolioStore.getState().mobileNavOpen).toBe(false);
  });
});
