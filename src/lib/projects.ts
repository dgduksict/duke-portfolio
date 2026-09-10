import { pick } from "@/lib/i18n";
import type { Language, Localized, Project, ProjectCategory } from "@/types";

export const PROJECT_SORTS = ["featured", "newest", "name"] as const;
export type ProjectSort = (typeof PROJECT_SORTS)[number];

export type CategoryFilter = ProjectCategory | "all";

export interface ProjectFilter {
  readonly query: string;
  readonly category: CategoryFilter;
  readonly stack: string | null;
  readonly sort: ProjectSort;
}

export const defaultProjectFilter: ProjectFilter = {
  query: "",
  category: "all",
  stack: null,
  sort: "featured",
};

export const projectCategoryLabels: Readonly<Record<ProjectCategory, Localized>> = {
  fullstack: { en: "Full-stack", mn: "Full-stack" },
  ai: { en: "AI & ML", mn: "AI & ML" },
  blockchain: { en: "Blockchain", mn: "Блокчейн" },
  platform: { en: "Platform", mn: "Платформ" },
};

function searchableText(project: Project, language: Language): string {
  return [
    project.title,
    pick(project.tagline, language),
    pick(project.description, language),
    pick(project.role, language),
    ...pick(project.outcomes, language),
    ...project.stack,
    String(project.year),
  ]
    .join(" ")
    .toLowerCase();
}

function compareProjects(a: Project, b: Project, sort: ProjectSort): number {
  switch (sort) {
    case "newest":
      return b.year - a.year || a.title.localeCompare(b.title);
    case "name":
      return a.title.localeCompare(b.title);
    case "featured":
      return Number(b.featured) - Number(a.featured) || b.year - a.year;
  }
}

/** Pure filter + sort used by both the work grid and the command palette. */
export function filterProjects(
  source: readonly Project[],
  filter: ProjectFilter,
  language: Language,
): readonly Project[] {
  const query = filter.query.trim().toLowerCase();

  const matched = source.filter((project) => {
    if (filter.category !== "all" && project.category !== filter.category) return false;
    if (filter.stack !== null && !project.stack.includes(filter.stack)) return false;
    if (query.length > 0 && !searchableText(project, language).includes(query)) return false;
    return true;
  });

  return [...matched].sort((a, b) => compareProjects(a, b, filter.sort));
}

/** Every stack entry used across the given projects, sorted by frequency. */
export function collectStacks(source: readonly Project[]): readonly string[] {
  const counts = new Map<string, number>();
  for (const project of source) {
    for (const tech of project.stack) {
      counts.set(tech, (counts.get(tech) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tech]) => tech);
}

export function isFilterActive(filter: ProjectFilter): boolean {
  return (
    filter.query.trim().length > 0 ||
    filter.category !== "all" ||
    filter.stack !== null ||
    filter.sort !== defaultProjectFilter.sort
  );
}
