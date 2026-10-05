/**
 * Shared domain types for the portfolio.
 * Every user-facing string is stored as a `Localized` value so the whole site
 * can switch language without re-fetching or re-deriving content.
 */

export const LANGUAGES = ["en", "mn"] as const;
export type Language = (typeof LANGUAGES)[number];

export type Localized<T = string> = Readonly<Record<Language, T>>;

/* ------------------------------------------------------------------ profile */

export interface SocialLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly handle: string;
  readonly icon: "github" | "linkedin" | "instagram" | "facebook";
}

export interface Profile {
  readonly name: Localized;
  readonly shortName: Localized;
  /** One line under the name: what and where. */
  readonly headline: Localized;
  /** Two sentences in the hero: current and past work. */
  readonly intro: Localized;
  readonly bio: Localized<readonly string[]>;
  readonly email: string;
  readonly phone: string | null;
  readonly location: Localized;
  readonly timeZone: "Asia/Ulaanbaatar";
  readonly coordinates: { readonly latitude: number; readonly longitude: number };
  /** Shown in the hero when set, e.g. "Open to new roles". */
  readonly availability: Localized | null;
  /** A PDF in /public or an absolute URL; the résumé link appears once this is set. */
  readonly resumeUrl: string | null;
  readonly sourceUrl: string;
  readonly socials: readonly SocialLink[];
}

/* --------------------------------------------------------------- experience */

export interface ExperienceEntry {
  readonly id: string;
  readonly role: Localized;
  readonly company: string;
  /** Only set when the site actually resolves. */
  readonly companyUrl: string | null;
  readonly location: Localized;
  /** `YYYY-MM`. */
  readonly start: string;
  /** `YYYY-MM`, or `null` while the role is current. */
  readonly end: string | null;
  readonly summary: Localized;
  readonly highlights?: Localized<readonly string[]>;
  readonly stack: readonly string[];
}

/* ----------------------------------------------------------------- projects */

export interface PipelineStage {
  readonly id: string;
  readonly label: Localized;
  readonly detail?: Localized;
}

export interface ProjectLink {
  readonly kind: "live" | "source";
  readonly href: string;
}

export interface ProjectMetric {
  readonly id: string;
  readonly label: Localized;
  readonly value: number;
  readonly suffix: string;
  readonly decimals: number;
}

export interface Project {
  readonly id: string;
  readonly name: Localized;
  readonly year: number;
  /** The experience entry this was built under, when known. */
  readonly roleId: string | null;
  readonly tagline: Localized;
  readonly description: Localized;
  /** What Duke did on it, as opposed to what the team shipped. */
  readonly part: Localized;
  /** How it works, in order — drawn as the pipeline diagram. */
  readonly stages: readonly PipelineStage[];
  readonly stack: readonly string[];
  /** Empty for internal tools. */
  readonly links: readonly ProjectLink[];
  /** Add only verified results. Nothing renders while these are absent. */
  readonly outcomes?: Localized<readonly string[]>;
  readonly metrics?: readonly ProjectMetric[];
}

/* ------------------------------------------------------------------- skills */

export const SKILL_GROUPS = ["ai", "backend", "web3", "frontend", "infra"] as const;
export type SkillGroupId = (typeof SKILL_GROUPS)[number];

export interface Skill {
  readonly id: string;
  readonly name: string;
  readonly group: SkillGroupId;
  /** Other spellings used in role and project stacks. */
  readonly aliases?: readonly string[];
}

/* ------------------------------------------------------------- testimonials */

export interface Testimonial {
  readonly id: string;
  readonly quote: Localized;
  readonly author: string;
  readonly role: Localized;
  readonly company: string;
}
