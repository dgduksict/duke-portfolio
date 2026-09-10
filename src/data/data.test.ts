import { describe, expect, it } from "vitest";
import { experience } from "@/data/experience";
import { activitySeries, domainScores, headlineStats, stackShare } from "@/data/metrics";
import { projects } from "@/data/projects";
import {
  MAX_DISCOUNT_RATE,
  SUPPORT_MONTH_OPTIONS,
  addOns,
  discountRules,
  services,
  timelineOptions,
  volumeTiers,
} from "@/data/services";
import { marqueeSkills, skillGroups, skills } from "@/data/skills";
import { profile } from "@/data/profile";
import { testimonials } from "@/data/testimonials";
import { navItems, SECTION_IDS } from "@/data/navigation";
import { initialsOf, monthsBetween } from "@/lib/format";
import { ADD_ON_IDS, LANGUAGES, PROJECT_CATEGORIES, SERVICE_IDS, SKILL_DOMAINS } from "@/types";
import type { Localized } from "@/types";

function expectLocalized(value: Localized, label: string): void {
  for (const language of LANGUAGES) {
    expect(value[language].trim(), `${label} (${language})`).not.toBe("");
  }
}

function ids<T extends { id: string }>(list: readonly T[]): string[] {
  return list.map((entry) => entry.id);
}

function expectUnique(list: readonly string[], label: string): void {
  expect(new Set(list).size, `${label} must be unique`).toBe(list.length);
}

describe("profile", () => {
  it("has translated copy everywhere", () => {
    expectLocalized(profile.name, "name");
    expectLocalized(profile.role, "role");
    expectLocalized(profile.tagline, "tagline");
    expectLocalized(profile.location, "location");
    for (const language of LANGUAGES) {
      expect(profile.bio[language].length).toBeGreaterThan(0);
      expect(profile.roleRotation[language].length).toBeGreaterThan(1);
    }
  });

  it("has unique, absolute social links", () => {
    expectUnique(ids(profile.socials), "social ids");
    for (const social of profile.socials) {
      expect(social.href).toMatch(/^https:\/\//);
      expect(social.handle.length).toBeGreaterThan(0);
    }
  });

  it("has a plausible contact email", () => {
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });

  it("has unique focus areas with copy in both languages", () => {
    expectUnique(ids(profile.focusAreas), "focus area ids");
    for (const area of profile.focusAreas) {
      expectLocalized(area.title, `focus ${area.id} title`);
      expectLocalized(area.description, `focus ${area.id} description`);
    }
  });
});

describe("skills", () => {
  it("has unique ids and sane levels", () => {
    expectUnique(ids(skills), "skill ids");
    for (const skill of skills) {
      expect(skill.level).toBeGreaterThan(0);
      expect(skill.level).toBeLessThanOrEqual(100);
      expect(skill.years).toBeGreaterThan(0);
      expect(skill.url).toMatch(/^https:\/\//);
      expect(skill.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("groups every skill exactly once", () => {
    const grouped = skillGroups.flatMap((group) => group.skills);
    expect(grouped).toHaveLength(skills.length);
    expect(skillGroups.map((group) => group.domain)).toEqual([...SKILL_DOMAINS]);
  });

  it("only marquees the strongest tools", () => {
    expect(marqueeSkills.length).toBeGreaterThan(0);
    expect(marqueeSkills.every((skill) => skill.level >= 80)).toBe(true);
  });
});

describe("experience", () => {
  it("has unique ids and translated copy", () => {
    expectUnique(ids(experience), "experience ids");
    for (const entry of experience) {
      expectLocalized(entry.role, `${entry.id} role`);
      expectLocalized(entry.summary, `${entry.id} summary`);
      expect(entry.stack.length).toBeGreaterThan(0);
      for (const language of LANGUAGES) {
        expect(entry.highlights[language].length).toBeGreaterThan(0);
      }
    }
  });

  it("uses parseable month keys that run forwards", () => {
    for (const entry of experience) {
      expect(entry.start).toMatch(/^\d{4}-\d{2}$/);
      if (entry.end !== null) {
        expect(entry.end).toMatch(/^\d{4}-\d{2}$/);
        expect(monthsBetween(entry.start, entry.end)).toBeGreaterThan(0);
      }
    }
  });

  it("is ordered newest first", () => {
    const starts = experience.map((entry) => entry.start);
    expect([...starts]).toEqual([...starts].sort().reverse());
  });
});

describe("projects", () => {
  it("has unique ids and slugs", () => {
    expectUnique(ids(projects), "project ids");
    expectUnique(
      projects.map((project) => project.slug),
      "project slugs",
    );
  });

  it("uses known categories and local images", () => {
    for (const project of projects) {
      expect(PROJECT_CATEGORIES).toContain(project.category);
      expect(project.image).toMatch(/^\/[\w.-]+\.(png|jpg|jpeg|svg|webp)$/);
      expect(project.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("has exactly three metrics per project with unique ids", () => {
    for (const project of projects) {
      expect(project.metrics).toHaveLength(3);
      expectUnique(ids(project.metrics), `${project.id} metric ids`);
      for (const metric of project.metrics) {
        expectLocalized(metric.label, `${project.id}.${metric.id}`);
        expect(metric.decimals).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("has translated narrative copy", () => {
    for (const project of projects) {
      expectLocalized(project.tagline, `${project.id} tagline`);
      expectLocalized(project.description, `${project.id} description`);
      expectLocalized(project.role, `${project.id} role`);
      for (const language of LANGUAGES) {
        expect(project.outcomes[language].length).toBeGreaterThan(0);
      }
    }
  });

  it("uses absolute links when a link exists", () => {
    for (const project of projects) {
      if (project.demoUrl !== null) expect(project.demoUrl).toMatch(/^https:\/\//);
      if (project.repoUrl !== null) expect(project.repoUrl).toMatch(/^https:\/\//);
    }
  });

  it("features at least one project without featuring all of them", () => {
    const featured = projects.filter((project) => project.featured);
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.length).toBeLessThan(projects.length);
  });
});

describe("metrics", () => {
  it("covers twelve unique months", () => {
    expect(activitySeries).toHaveLength(12);
    expectUnique(
      activitySeries.map((point) => point.month),
      "activity months",
    );
  });

  it("keeps the language mix at one hundred percent", () => {
    expect(stackShare.reduce((sum, entry) => sum + entry.share, 0)).toBe(100);
  });

  it("scores every skill domain once", () => {
    expect(domainScores.map((entry) => entry.domain)).toEqual([...SKILL_DOMAINS]);
    for (const entry of domainScores) {
      expect(entry.score).toBeGreaterThan(0);
      expect(entry.score).toBeLessThanOrEqual(100);
      expectLocalized(entry.label, `domain ${entry.domain}`);
    }
  });

  it("has translated headline stats", () => {
    expectUnique(ids(headlineStats), "headline stat ids");
    for (const stat of headlineStats) {
      expectLocalized(stat.label, `${stat.id} label`);
      expectLocalized(stat.caption, `${stat.id} caption`);
    }
  });
});

describe("services catalogue", () => {
  it("exposes every declared service and add-on", () => {
    expect(ids(services)).toEqual([...SERVICE_IDS]);
    expect(ids(addOns)).toEqual([...ADD_ON_IDS]);
  });

  it("has coherent scope bounds and positive pricing", () => {
    for (const service of services) {
      expect(service.maxScreens).toBeGreaterThan(service.includedScreens);
      expect(service.basePrice).toBeGreaterThan(0);
      expect(service.pricePerScreen).toBeGreaterThan(0);
      expect(service.baseWeeks).toBeGreaterThan(0);
      expectLocalized(service.name, `${service.id} name`);
      expectLocalized(service.summary, `${service.id} summary`);
      for (const language of LANGUAGES) {
        expect(service.deliverables[language].length).toBeGreaterThan(0);
      }
    }
  });

  it("marks exactly one service as most requested", () => {
    expect(services.filter((service) => service.popular)).toHaveLength(1);
  });

  it("charges something for every add-on", () => {
    for (const addOn of addOns) {
      expect(addOn.flatPrice + addOn.basePercent).toBeGreaterThan(0);
      expect(addOn.weeks).toBeGreaterThan(0);
      expectLocalized(addOn.name, `${addOn.id} name`);
    }
  });

  it("keeps pace multipliers ordered and anchored at standard", () => {
    const standard = timelineOptions.find((option) => option.id === "standard");
    expect(standard?.priceMultiplier).toBe(1);
    expect(standard?.durationMultiplier).toBe(1);

    const prices = timelineOptions.map((option) => option.priceMultiplier);
    const durations = timelineOptions.map((option) => option.durationMultiplier);
    expect([...prices]).toEqual([...prices].sort((a, b) => a - b));
    expect([...durations]).toEqual([...durations].sort((a, b) => b - a));
  });

  it("orders volume tiers and keeps every rate under the cap", () => {
    const thresholds = volumeTiers.map((tier) => tier.threshold);
    expect([...thresholds]).toEqual([...thresholds].sort((a, b) => a - b));
    for (const tier of volumeTiers) {
      expect(tier.rate).toBeGreaterThan(0);
      expect(tier.rate).toBeLessThan(MAX_DISCOUNT_RATE);
    }
    for (const rule of discountRules) {
      expect(rule.rate).toBeGreaterThan(0);
      expect(rule.rate).toBeLessThanOrEqual(MAX_DISCOUNT_RATE);
    }
  });

  it("offers no support as an explicit option", () => {
    expect(SUPPORT_MONTH_OPTIONS[0]).toBe(0);
    expect(SUPPORT_MONTH_OPTIONS.length).toBeGreaterThan(1);
  });
});

describe("navigation and testimonials", () => {
  it("keeps nav items aligned with the section ids", () => {
    expect(navItems.map((item) => item.id)).toEqual([...SECTION_IDS]);
    expectUnique(
      navItems.map((item) => item.shortcut),
      "nav shortcuts",
    );
  });

  it("has translated testimonials with unique ids", () => {
    expectUnique(ids(testimonials), "testimonial ids");
    for (const entry of testimonials) {
      expectLocalized(entry.quote, `${entry.id} quote`);
      expectLocalized(entry.role, `${entry.id} role`);
      expect(initialsOf(entry.author)).toHaveLength(2);
    }
  });
});
