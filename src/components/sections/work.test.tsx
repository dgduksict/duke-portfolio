import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Work } from "@/components/sections/work";
import { projects } from "@/data/projects";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

beforeEach(() => {
  resetPortfolioStore();
});

describe("Work", () => {
  it("shows every project with how it works", () => {
    render(<Work />);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(projects.length);
    for (const [index, project] of projects.entries()) {
      const article = articles[index]!;
      expect(within(article).getByRole("heading", { name: project.name.en })).toBeInTheDocument();
      const diagram = within(article).getByRole("figure");
      expect(within(diagram).getAllByRole("listitem")).toHaveLength(project.stages.length);
      for (const stage of project.stages) {
        expect(within(diagram).getByText(stage.label.en)).toBeInTheDocument();
      }
    }
  });

  it("links live projects and labels internal ones instead of linking nowhere", () => {
    render(<Work />);
    expect(screen.getByRole("link", { name: /gogo\.mn/i })).toHaveAttribute("href", "https://gogo.mn");
    const internal = projects.filter((project) => project.links.length === 0);
    expect(screen.getAllByText("Internal tool")).toHaveLength(internal.length);
  });

  it("says what Duke did on each project", () => {
    render(<Work />);
    expect(screen.getAllByText("My part")).toHaveLength(projects.length);
    expect(screen.getByText(projects[0]!.part.en)).toBeInTheDocument();
  });

  it("renders no results block while no results have been added", () => {
    render(<Work />);
    expect(screen.queryByText("Results")).not.toBeInTheDocument();
  });

  it("renders Mongolian copy", () => {
    usePortfolioStore.getState().setLanguage("mn");
    render(<Work />);
    expect(screen.getByText(projects[0]!.tagline.mn)).toBeInTheDocument();
  });
});
