import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Experience } from "@/components/sections/experience";
import { experience } from "@/data/experience";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

beforeEach(() => {
  resetPortfolioStore();
});

describe("Experience", () => {
  it("lists every role newest first with years", () => {
    render(<Experience />);
    const rows = screen.getAllByRole("listitem", { name: /.+/ });
    expect(rows).toHaveLength(experience.length);
    expect(within(rows[0]!).getByText(/2026 – now/)).toBeInTheDocument();
    expect(within(rows[rows.length - 1]!).getByText("2024 – 2025")).toBeInTheDocument();
  });

  it("marks the roles that are still running", () => {
    render(<Experience />);
    const current = experience.filter((entry) => entry.end === null);
    expect(screen.getAllByText("Current role")).toHaveLength(current.length);
  });

  it("links companies only when they have a working site", () => {
    render(<Experience />);
    for (const entry of experience) {
      const link = screen.queryByRole("link", { name: new RegExp(`^${escape(entry.company)}`) });
      if (entry.companyUrl !== null) expect(link).toHaveAttribute("href", entry.companyUrl);
      else expect(link).not.toBeInTheDocument();
    }
  });

  it("points from a role to the work done there", () => {
    render(<Experience />);
    expect(screen.getByRole("link", { name: "Gogo.mn" })).toHaveAttribute("href", "#project-gogo");
  });

  it("renders Mongolian copy", () => {
    usePortfolioStore.getState().setLanguage("mn");
    render(<Experience />);
    expect(screen.getByRole("heading", { level: 2, name: "Туршлага" })).toBeInTheDocument();
    const current = experience.filter((entry) => entry.end === null);
    expect(screen.getAllByText(/2026 – одоо/)).toHaveLength(current.length);
  });
});
