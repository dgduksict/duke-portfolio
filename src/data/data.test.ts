import { describe, expect, it } from "vitest";
import { experience } from "@/data/experience";
import { navItems, SECTION_IDS } from "@/data/navigation";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";
import { testimonials } from "@/data/testimonials";
import { buildEvidence, normalizeTool } from "@/lib/evidence";
import { LANGUAGES, SKILL_GROUPS } from "@/types";
import type { Localized } from "@/types";

function expectLocalized(value: Localized, label: string): void {
  for (const language of LANGUAGES) {
    expect(value[language].trim(), `${label} (${language})`).not.toBe("");
  }
}

function expectLocalizedList(value: Localized<readonly string[]>, label: string): void {
  expect(value.mn.length, `${label}: both languages list the same items`).toBe(value.en.length);
  for (const language of LANGUAGES) {
    for (const [index, item] of value[language].entries()) {
      expect(item.trim(), `${label}[${index}] (${language})`).not.toBe("");
    }
  }
}

function ids<T extends { id: string }>(list: readonly T[]): string[] {
  return list.map((entry) => entry.id);
}

function expectUnique(list: readonly string[], label: string): void {
  expect(new Set(list).size, `${label} must be unique`).toBe(list.length);
}

const isHttps = (url: string) => /^https:\/\/\S+$/.test(url);

describe("profile", () => {
  it("has copy in both languages", () => {
    expectLocalized(profile.name, "name");
    expectLocalized(profile.shortName, "shortName");
    expectLocalized(profile.headline, "headline");
    expectLocalized(profile.intro, "intro");
    expectLocalized(profile.location, "location");
    expectLocalizedList(profile.bio, "bio");
    expect(profile.bio.en.length).toBeGreaterThan(0);
    if (profile.availability !== null) expectLocalized(profile.availability, "availability");
  });

  it("has unique, absolute links and a plausible email", () => {
    expectUnique(ids(profile.socials), "social ids");
    for (const social of profile.socials) expect(isHttps(social.href), social.href).toBe(true);
    expect(isHttps(profile.sourceUrl)).toBe(true);
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
    if (profile.resumeUrl !== null) expect(profile.resumeUrl).toMatch(/^(https:\/\/|\/)/);
  });

  it("is placed in Ulaanbaatar", () => {
    expect(profile.timeZone).toBe("Asia/Ulaanbaatar");
    expect(profile.coordinates.latitude).toBeCloseTo(47.92, 1);
    expect(profile.coordinates.longitude).toBeCloseTo(106.92, 1);
  });
});

describe("experience", () => {
  it("has unique ids and translated copy", () => {
    expectUnique(ids(experience), "experience ids");
    for (const entry of experience) {
      expectLocalized(entry.role, `${entry.id}.role`);
      expectLocalized(entry.location, `${entry.id}.location`);
      expectLocalized(entry.summary, `${entry.id}.summary`);
      if (entry.highlights) expectLocalizedList(entry.highlights, `${entry.id}.highlights`);
      expect(entry.stack.length, `${entry.id}.stack`).toBeGreaterThan(0);
    }
  });

  it("uses month keys that run forwards, newest first", () => {
    const monthKey = /^\d{4}-(0[1-9]|1[0-2])$/;
    for (const entry of experience) {
      expect(entry.start).toMatch(monthKey);
      if (entry.end !== null) {
        expect(entry.end).toMatch(monthKey);
        expect(entry.end >= entry.start, `${entry.id} ends before it starts`).toBe(true);
      }
    }
    const starts = experience.map((entry) => entry.start);
    expect([...starts].sort().reverse()).toEqual(starts);
  });

  it("only links company sites over https", () => {
    for (const entry of experience) {
      if (entry.companyUrl !== null) expect(isHttps(entry.companyUrl), entry.companyUrl).toBe(true);
    }
  });
});

describe("projects", () => {
  it("has unique ids and translated copy", () => {
    expectUnique(ids(projects), "project ids");
    for (const project of projects) {
      expectLocalized(project.name, `${project.id}.name`);
      expectLocalized(project.tagline, `${project.id}.tagline`);
      expectLocalized(project.description, `${project.id}.description`);
      expectLocalized(project.part, `${project.id}.part`);
      if (project.outcomes) expectLocalizedList(project.outcomes, `${project.id}.outcomes`);
      for (const metric of project.metrics ?? []) expectLocalized(metric.label, `${project.id}.${metric.id}`);
    }
  });

  it("explains how each one works in at least three stages", () => {
    for (const project of projects) {
      expect(project.stages.length, `${project.id} stages`).toBeGreaterThanOrEqual(3);
      expectUnique(ids(project.stages), `${project.id} stage ids`);
      for (const stage of project.stages) {
        expectLocalized(stage.label, `${project.id}.${stage.id}`);
        if (stage.detail) expectLocalized(stage.detail, `${project.id}.${stage.id}.detail`);
      }
    }
  });

  it("links only over https, and only to roles that exist", () => {
    const roleIds = new Set(ids(experience));
    for (const project of projects) {
      for (const link of project.links) expect(isHttps(link.href), link.href).toBe(true);
      if (project.roleId !== null) expect(roleIds.has(project.roleId), project.id).toBe(true);
    }
  });
});

describe("skills and evidence", () => {
  it("has unique tools in known groups, and no empty group", () => {
    expectUnique(ids(skills), "skill ids");
    expectUnique(
      skills.map((skill) => normalizeTool(skill.name)),
      "skill names",
    );
    for (const skill of skills) expect(SKILL_GROUPS).toContain(skill.group);
    for (const group of SKILL_GROUPS) {
      expect(skills.some((skill) => skill.group === group), group).toBe(true);
    }
  });

  it("knows every tool a role or project lists, so the stack misses nothing", () => {
    const known = new Set(
      skills.flatMap((skill) => [skill.name, ...(skill.aliases ?? [])]).map(normalizeTool),
    );
    const listed = [...experience.flatMap((entry) => entry.stack), ...projects.flatMap((entry) => entry.stack)];
    expect(listed.filter((tool) => !known.has(normalizeTool(tool)))).toEqual([]);
  });

  it("points every piece of evidence at a role or project that exists", () => {
    const anchors = new Set([
      ...experience.map((entry) => `#role-${entry.id}`),
      ...projects.map((entry) => `#project-${entry.id}`),
    ]);
    for (const { places } of buildEvidence(skills, experience, projects)) {
      for (const place of places) expect(anchors.has(place.href), place.href).toBe(true);
    }
  });
});

describe("navigation and testimonials", () => {
  it("keeps nav items aligned with the section ids", () => {
    expect(navItems.map((item) => item.id)).toEqual([...SECTION_IDS]);
    for (const item of navItems) expectLocalized(item.label, `nav.${item.id}`);
  });

  it("has translated testimonials with unique ids", () => {
    expectUnique(ids(testimonials), "testimonial ids");
    for (const testimonial of testimonials) {
      expectLocalized(testimonial.quote, `${testimonial.id}.quote`);
      expectLocalized(testimonial.role, `${testimonial.id}.role`);
      expect(testimonial.author.trim()).not.toBe("");
    }
  });
});
