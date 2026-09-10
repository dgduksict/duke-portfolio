import { describe, expect, it } from "vitest";
import { projects } from "@/data/projects";
import {
  collectStacks,
  defaultProjectFilter,
  filterProjects,
  isFilterActive,
  projectCategoryLabels,
  type ProjectFilter,
} from "@/lib/projects";
import { PROJECT_CATEGORIES } from "@/types";

const base: ProjectFilter = defaultProjectFilter;

describe("filterProjects", () => {
  it("returns everything when no filter is applied", () => {
    expect(filterProjects(projects, base, "en")).toHaveLength(projects.length);
  });

  it("filters by category", () => {
    const result = filterProjects(projects, { ...base, category: "blockchain" }, "en");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((project) => project.category === "blockchain")).toBe(true);
  });

  it("filters by stack entry", () => {
    const result = filterProjects(projects, { ...base, stack: "PostgreSQL" }, "en");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((project) => project.stack.includes("PostgreSQL"))).toBe(true);
  });

  it("searches titles case-insensitively", () => {
    const result = filterProjects(projects, { ...base, query: "  gOgO " }, "en");
    expect(result.map((project) => project.id)).toEqual(["gogo"]);
  });

  it("searches inside stack entries and outcomes", () => {
    const byStack = filterProjects(projects, { ...base, query: "foundry" }, "en");
    expect(byStack.map((project) => project.id)).toEqual(["yield-optimizer"]);

    const byOutcome = filterProjects(projects, { ...base, query: "macro f1" }, "en");
    expect(byOutcome.map((project) => project.id)).toEqual(["article-monitor"]);
  });

  it("searches the active language only", () => {
    const mongolianTerm = "редакц";
    expect(filterProjects(projects, { ...base, query: mongolianTerm }, "mn").length).toBeGreaterThan(0);
    expect(filterProjects(projects, { ...base, query: mongolianTerm }, "en")).toHaveLength(0);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterProjects(projects, { ...base, query: "cobol mainframe" }, "en")).toHaveLength(0);
  });

  it("combines filters", () => {
    const result = filterProjects(
      projects,
      { ...base, category: "ai", stack: "FastAPI", query: "digest" },
      "en",
    );
    expect(result.map((project) => project.id)).toEqual(["newsletter"]);
  });

  it("sorts featured work first, then by year", () => {
    const result = filterProjects(projects, { ...base, sort: "featured" }, "en");
    const featuredCount = projects.filter((project) => project.featured).length;
    expect(result.slice(0, featuredCount).every((project) => project.featured)).toBe(true);
  });

  it("sorts by year descending", () => {
    const years = filterProjects(projects, { ...base, sort: "newest" }, "en").map(
      (project) => project.year,
    );
    expect([...years]).toEqual([...years].sort((a, b) => b - a));
  });

  it("sorts alphabetically", () => {
    const titles = filterProjects(projects, { ...base, sort: "name" }, "en").map(
      (project) => project.title,
    );
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
  });

  it("does not mutate the source list", () => {
    const before = projects.map((project) => project.id);
    filterProjects(projects, { ...base, sort: "name" }, "en");
    expect(projects.map((project) => project.id)).toEqual(before);
  });
});

describe("collectStacks", () => {
  it("returns unique entries ordered by frequency", () => {
    const stacks = collectStacks(projects);
    expect(new Set(stacks).size).toBe(stacks.length);

    const counts = stacks.map(
      (stack) => projects.filter((project) => project.stack.includes(stack)).length,
    );
    expect([...counts]).toEqual([...counts].sort((a, b) => b - a));
  });

  it("handles an empty source", () => {
    expect(collectStacks([])).toEqual([]);
  });
});

describe("isFilterActive", () => {
  it("is false for the default filter", () => {
    expect(isFilterActive(defaultProjectFilter)).toBe(false);
  });

  it("is true once anything is set", () => {
    expect(isFilterActive({ ...base, query: "x" })).toBe(true);
    expect(isFilterActive({ ...base, category: "ai" })).toBe(true);
    expect(isFilterActive({ ...base, stack: "Redis" })).toBe(true);
    expect(isFilterActive({ ...base, sort: "name" })).toBe(true);
  });

  it("ignores whitespace-only queries", () => {
    expect(isFilterActive({ ...base, query: "   " })).toBe(false);
  });
});

describe("projectCategoryLabels", () => {
  it("covers every category in both languages", () => {
    for (const category of PROJECT_CATEGORIES) {
      const label = projectCategoryLabels[category];
      expect(label.en.length).toBeGreaterThan(0);
      expect(label.mn.length).toBeGreaterThan(0);
    }
  });
});
