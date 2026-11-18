import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixelDivider } from "@/components/ui/pixel-divider";
import { Section } from "@/components/ui/section";

describe("PixelDivider", () => {
  it("is a decorative, textless strip", () => {
    const { container } = render(<PixelDivider />);
    const strip = container.firstElementChild;
    expect(strip).not.toBeNull();
    expect(strip).toHaveAttribute("aria-hidden", "true");
    expect(strip).toHaveAttribute("data-print", "hide");
    expect(container).toHaveTextContent("");
  });
});

describe("Section", () => {
  it("is a labelled region with a pixel divider and no flat rule", () => {
    const { container } = render(
      <Section id="demo" title="Demo title">
        <p>Body</p>
      </Section>,
    );
    const section = container.querySelector("section#demo");
    expect(section).not.toBeNull();
    const heading = screen.getByRole("heading", { level: 2, name: "Demo title" });
    expect(section).toHaveAttribute("aria-labelledby", heading.id);
    expect(heading.id).toBe("demo-title");
    expect(section?.querySelector("[data-pixel-divider]")).not.toBeNull();
    expect(section?.className).not.toMatch(/border-t/);
    expect(container.querySelector(".border-t")).toBeNull();
    expect(screen.getByRole("region", { name: "Demo title" })).toBe(section);
  });

  it("keeps the sticky title modifier for wide screens", () => {
    render(
      <Section id="demo" title="Demo title">
        <p>Body</p>
      </Section>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("type-title-sticky", "lg:sticky");
  });
});
