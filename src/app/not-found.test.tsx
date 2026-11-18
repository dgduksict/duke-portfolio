import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import NotFound, { metadata } from "@/app/not-found";
import { resetPortfolioStore } from "@/store/portfolio-store";

beforeEach(() => {
  resetPortfolioStore();
});

describe("NotFound", () => {
  it("keeps its title, its copy and the way home", () => {
    expect(metadata.title).toBe("Page not found");
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1, name: "Nothing here" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /portfolio/i })).toHaveAttribute("href", "/");
  });

  it("shows the pixel night window with the cat asleep, above the copy", () => {
    const { container } = render(<NotFound />);
    const scene = container.querySelector("[data-scene]");
    expect(scene).not.toBeNull();
    expect(scene).toHaveClass("scene-compact");
    expect(container.querySelector(".scene-sky")).toHaveAttribute("data-phase", "night");
    expect(scene?.querySelector("[data-cat-slot] [data-state='night']")).not.toBeNull();
    // The old smooth sky is gone.
    expect(container.querySelector(".sky")).toBeNull();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(scene!.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
