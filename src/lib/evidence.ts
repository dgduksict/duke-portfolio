import type { ExperienceEntry, Localized, Project, Skill } from "@/types";

export interface EvidencePlace {
  readonly kind: "role" | "project";
  readonly id: string;
  readonly label: Localized;
  readonly href: string;
}

export interface SkillEvidence {
  readonly skill: Skill;
  /** Roles first, then projects, each in data order. */
  readonly places: readonly EvidencePlace[];
}

/** "Next.js", "NextJS" and "next js" are the same tool. */
export function normalizeTool(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * For each skill, the roles and projects whose stack lists it — so every tool
 * on the page links to the place it was actually used.
 */
export function buildEvidence(
  skills: readonly Skill[],
  roles: readonly ExperienceEntry[],
  projects: readonly Project[],
): SkillEvidence[] {
  return skills.map((skill) => {
    const names = new Set([skill.name, ...(skill.aliases ?? [])].map(normalizeTool));
    const uses = (stack: readonly string[]) => stack.some((tool) => names.has(normalizeTool(tool)));

    const places: EvidencePlace[] = [
      ...roles
        .filter((entry) => uses(entry.stack))
        .map((entry) => ({
          kind: "role" as const,
          id: entry.id,
          label: { en: entry.company, mn: entry.company },
          href: `#role-${entry.id}`,
        })),
      ...projects
        .filter((entry) => uses(entry.stack))
        .map((entry) => ({
          kind: "project" as const,
          id: entry.id,
          label: entry.name,
          href: `#project-${entry.id}`,
        })),
    ];

    return { skill, places };
  });
}
