import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Stack } from "@/components/sections/stack";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { resetPortfolioStore } from "@/store/portfolio-store";

beforeEach(() => {
  resetPortfolioStore();
});

describe("Stack", () => {
  it("backs every tool with links to where it was used", () => {
    render(<Stack />);
    const anchors = new Set([
      ...experience.map((entry) => `#role-${entry.id}`),
      ...projects.map((entry) => `#project-${entry.id}`),
    ]);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(anchors.has(link.getAttribute("href") ?? "")).toBe(true);
  });

  it("shows where a tool was used", () => {
    render(<Stack />);
    const qdrant = screen.getByText("Qdrant").closest("div");
    expect(qdrant).not.toBeNull();
    expect(qdrant?.querySelector('a[href="#project-newsletter"]')).not.toBeNull();
  });

  it("lists tools without evidence plainly instead of linking them nowhere", () => {
    render(<Stack />);
    expect(screen.getByText(/Also worked with LangChain/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "LangChain" })).not.toBeInTheDocument();
  });
});
