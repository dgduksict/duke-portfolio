import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Contact } from "@/components/sections/contact";
import { Testimonials } from "@/components/sections/testimonials";
import { profile } from "@/data/profile";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

beforeEach(() => {
  resetPortfolioStore();
});

describe("Contact", () => {
  it("offers the address as a mail link and a copy button", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });

    render(<Contact />);
    expect(screen.getByRole("link", { name: profile.email })).toHaveAttribute(
      "href",
      `mailto:${profile.email}`,
    );
    await user.click(screen.getByRole("button", { name: /copy email/i }));
    expect(writeText).toHaveBeenCalledWith(profile.email);
    expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
  });

  it("shows the avatar with honest alt text", () => {
    render(<Contact />);
    expect(screen.getByRole("img", { name: /cat in sunglasses/i })).toBeInTheDocument();
  });

  it("links every profile elsewhere", () => {
    render(<Contact />);
    for (const social of profile.socials) {
      expect(screen.getByRole("link", { name: new RegExp(`^${social.label}`) })).toHaveAttribute(
        "href",
        social.href,
      );
    }
  });

  it("speaks Mongolian", () => {
    usePortfolioStore.getState().setLanguage("mn");
    render(<Contact />);
    expect(screen.getByRole("heading", { level: 2, name: "Холбоо барих" })).toBeInTheDocument();
    expect(screen.getByText(profile.bio.mn[0]!)).toBeInTheDocument();
  });
});

describe("Testimonials", () => {
  it("renders nothing while there are none", () => {
    const { container } = render(<Testimonials items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a quote with its author when one is added", () => {
    render(
      <Testimonials
        items={[
          {
            id: "lead",
            quote: { en: "Ships carefully.", mn: "Болгоомжтой гаргадаг." },
            author: "A. Person",
            role: { en: "Engineering lead", mn: "Ахлах инженер" },
            company: "Example",
          },
        ]}
      />,
    );
    expect(screen.getByText(/Ships carefully\./)).toBeInTheDocument();
    expect(screen.getByText("A. Person")).toBeInTheDocument();
  });
});
