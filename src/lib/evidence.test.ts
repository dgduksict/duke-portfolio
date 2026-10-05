import { describe, expect, it } from "vitest";
import { buildEvidence, normalizeTool } from "@/lib/evidence";
import type { ExperienceEntry, Project, Skill } from "@/types";

const l = (text: string) => ({ en: text, mn: text });

const role = (id: string, company: string, stack: string[]): ExperienceEntry => ({
  id,
  company,
  stack,
  role: l("Developer"),
  companyUrl: null,
  location: l("Ulaanbaatar"),
  start: "2024-01",
  end: null,
  summary: l("Summary"),
});

const project = (id: string, stack: string[]): Project => ({
  id,
  stack,
  name: l(id),
  year: 2026,
  roleId: null,
  tagline: l("Tagline"),
  description: l("Description"),
  part: l("Part"),
  stages: [],
  links: [],
});

describe("normalizeTool", () => {
  it("ignores case, spaces and punctuation", () => {
    expect(normalizeTool("Next.js")).toBe(normalizeTool("nextjs"));
    expect(normalizeTool("GitHub Actions")).toBe("githubactions");
  });
});

describe("buildEvidence", () => {
  const skills: Skill[] = [
    { id: "postgres", name: "PostgreSQL", group: "backend", aliases: ["Postgres"] },
    { id: "next", name: "Next.js", group: "frontend" },
    { id: "langchain", name: "LangChain", group: "ai" },
  ];
  const roles = [role("a", "Alpha", ["Postgres", "Next.js"]), role("b", "Beta", ["NEXTJS"])];
  const projects = [project("p1", ["PostgreSQL", "Postgres"])];

  it("matches names and aliases, roles first, in data order, without duplicates", () => {
    const [postgres, next] = buildEvidence(skills, roles, projects);
    expect(postgres?.places.map((place) => place.href)).toEqual(["#role-a", "#project-p1"]);
    expect(next?.places.map((place) => place.href)).toEqual(["#role-a", "#role-b"]);
    expect(postgres?.places[0]?.label.en).toBe("Alpha");
  });

  it("keeps tools nobody used, with no places", () => {
    expect(buildEvidence(skills, roles, projects)[2]?.places).toEqual([]);
  });
});
