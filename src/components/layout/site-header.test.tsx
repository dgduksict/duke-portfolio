import { act, render, screen } from "@testing-library/react";
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

  it("keeps the brand link square and the header row gap responsive", () => {
    render(<SiteHeader />);
    const brand = screen.getByRole("link", { name: "Duke, back to the top" });
    expect(brand.className).not.toMatch(/rounded/);
    const row = brand.parentElement;
    expect(row).toHaveClass("gap-1", "min-[23rem]:gap-4");
    expect(row).not.toHaveClass("gap-4");
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

  it("sits bare on the hero's wall until the window scene's top has scrolled under it", () => {
    let observed: Element | null = null;
    let notify: IntersectionObserverCallback = () => undefined;
    const Original = window.IntersectionObserver;
    window.IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        notify = callback;
      }
      observe(target: Element) {
        observed = target;
      }
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;
    try {
      const { container } = render(
        <>
          <SiteHeader />
          <section id="top">
            <div data-header-zone="" />
          </section>
        </>,
      );
      const zone = container.querySelector("#top [data-header-zone]");
      const header = container.querySelector("header");
      expect(observed).toBe(zone);
      expect(header).toHaveAttribute("data-over-sky", "true");
      act(() => notify([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
      expect(header).toHaveAttribute("data-over-sky", "false");
    } finally {
      window.IntersectionObserver = Original;
    }
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

  it("closes the phone menu with Escape and returns focus to its button", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(usePortfolioStore.getState().mobileNavOpen).toBe(true);
    await user.keyboard("{Escape}");
    expect(usePortfolioStore.getState().mobileNavOpen).toBe(false);
    expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus();
  });
});
