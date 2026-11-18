import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Testimonials } from "@/components/sections/testimonials";
import { resetPortfolioStore } from "@/store/portfolio-store";

beforeEach(() => {
  resetPortfolioStore();
});

const items = [
  {
    id: "editor",
    quote: { en: "Ships calmly.", mn: "Тайван хүргэдэг." },
    author: "A. Person",
    role: { en: "Editor", mn: "Редактор" },
    company: "Example Co",
  },
] as const;

describe("Testimonials", () => {
  it("renders nothing without quotes", () => {
    const { container } = render(<Testimonials items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows each quote with its author", () => {
    render(<Testimonials items={items} />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/Ships calmly\./)).toBeInTheDocument();
    expect(screen.getByText("A. Person")).toBeInTheDocument();
    expect(screen.getByText(/Editor, Example Co/)).toBeInTheDocument();
  });
});
