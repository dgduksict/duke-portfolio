import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Hero } from "@/components/sections/hero";
import { Sky } from "@/components/sky/sky";
import { profile } from "@/data/profile";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

beforeEach(() => {
  resetPortfolioStore();
});

describe("Hero", () => {
  it("leads with the name and ways to get in touch", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1, name: profile.name.en })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /email me/i })).toHaveAttribute(
      "href",
      `mailto:${profile.email}`,
    );
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:/),
    );
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:/),
    );
  });

  it("hides the résumé link while there is no résumé", () => {
    render(<Hero />);
    expect(screen.queryByRole("link", { name: /résumé/i })).not.toBeInTheDocument();
  });

  it("tells the visitor what time it is in Ulaanbaatar", async () => {
    render(<Hero />);
    expect(await screen.findByText(/in Ulaanbaatar,/)).toBeInTheDocument();
  });

  it("switches to Mongolian", () => {
    usePortfolioStore.getState().setLanguage("mn");
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1, name: profile.name.mn })).toBeInTheDocument();
  });
});

describe("Sky", () => {
  it("waits for a time before painting", () => {
    const { container } = render(<Sky now={null} />);
    expect(container.firstElementChild).toHaveAttribute("data-ready", "false");
  });

  it("paints the night sky at midnight in Ulaanbaatar", () => {
    const { container } = render(<Sky now={new Date("2026-10-05T16:00:00Z")} />);
    const sky = container.firstElementChild as HTMLElement;
    expect(sky).toHaveAttribute("data-ready", "true");
    expect(sky).toHaveAttribute("data-phase", "night");
    expect(sky.style.getPropertyValue("--sky-zenith")).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("paints daylight at noon", () => {
    const { container } = render(<Sky now={new Date("2026-10-05T04:50:00Z")} />);
    expect(container.firstElementChild).toHaveAttribute("data-phase", "day");
  });
});
