/**
 * Shared domain types for the portfolio.
 * Every user-facing string is stored as a `Localized` value so the whole site
 * can switch language without re-fetching or re-deriving content.
 */

export const LANGUAGES = ["en", "mn"] as const;
export type Language = (typeof LANGUAGES)[number];

export type Localized<T = string> = Readonly<Record<Language, T>>;

export const CURRENCIES = ["USD", "MNT"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

/* ------------------------------------------------------------------ profile */

export interface SocialLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly handle: string;
  readonly icon: "github" | "linkedin" | "instagram" | "facebook" | "mail";
}

export interface Profile {
  readonly name: Localized;
  readonly shortName: Localized;
  readonly role: Localized;
  readonly roleRotation: Localized<readonly string[]>;
  readonly tagline: Localized;
  readonly bio: Localized<readonly string[]>;
  readonly email: string;
  readonly phone: string;
  readonly location: Localized;
  readonly timezone: string;
  readonly availability: Localized;
  readonly availableFrom: string;
  readonly yearsExperience: number;
  readonly socials: readonly SocialLink[];
  readonly focusAreas: readonly FocusArea[];
}

export interface FocusArea {
  readonly id: string;
  readonly icon: "brain" | "blocks" | "server" | "sparkles";
  readonly title: Localized;
  readonly description: Localized;
}

/* ------------------------------------------------------------------- skills */

export const SKILL_DOMAINS = ["ai", "blockchain", "backend", "frontend", "devops"] as const;
export type SkillDomain = (typeof SKILL_DOMAINS)[number];

export interface Skill {
  readonly id: string;
  readonly name: string;
  readonly domain: SkillDomain;
  /** Self-assessed proficiency, 0-100, deterministic mock data. */
  readonly level: number;
  readonly years: number;
  readonly url: string;
  readonly accent: string;
}

export interface SkillGroup {
  readonly domain: SkillDomain;
  readonly title: Localized;
  readonly summary: Localized;
  readonly skills: readonly Skill[];
}

/* --------------------------------------------------------------- experience */

export interface ExperienceEntry {
  readonly id: string;
  readonly role: Localized;
  readonly company: string;
  readonly companyUrl: string;
  readonly location: Localized;
  readonly start: string;
  readonly end: string | null;
  readonly summary: Localized;
  readonly highlights: Localized<readonly string[]>;
  readonly stack: readonly string[];
}

/* ----------------------------------------------------------------- projects */

export const PROJECT_CATEGORIES = ["fullstack", "ai", "blockchain", "platform"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export interface ProjectMetric {
  readonly id: string;
  readonly label: Localized;
  readonly value: number;
  readonly suffix: string;
  readonly decimals: number;
}

export interface Project {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly category: ProjectCategory;
  readonly year: number;
  readonly featured: boolean;
  readonly tagline: Localized;
  readonly description: Localized;
  readonly role: Localized;
  readonly outcomes: Localized<readonly string[]>;
  readonly stack: readonly string[];
  readonly metrics: readonly ProjectMetric[];
  readonly image: string;
  readonly accent: string;
  readonly demoUrl: string | null;
  readonly repoUrl: string | null;
}

/* ------------------------------------------------------------------ metrics */

export interface ActivityPoint {
  readonly month: string;
  readonly shipped: number;
  readonly reviewed: number;
  readonly automated: number;
}

export interface StackShare {
  readonly name: string;
  readonly share: number;
  readonly accent: string;
}

export interface DomainScore {
  readonly domain: SkillDomain;
  readonly label: Localized;
  readonly score: number;
}

export interface HeadlineStat {
  readonly id: string;
  readonly label: Localized;
  readonly value: number;
  readonly suffix: string;
  readonly decimals: number;
  readonly caption: Localized;
}

/* ----------------------------------------------------------------- services */

export const SERVICE_IDS = ["landing", "webapp", "ai", "blockchain", "audit"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export const ADD_ON_IDS = ["designSystem", "i18n", "analytics", "cms", "handover"] as const;
export type AddOnId = (typeof ADD_ON_IDS)[number];

export const TIMELINE_IDS = ["standard", "priority", "rush"] as const;
export type TimelineId = (typeof TIMELINE_IDS)[number];

export const DISCOUNT_IDS = ["nonprofit", "openSource"] as const;
export type DiscountId = (typeof DISCOUNT_IDS)[number];

export interface Service {
  readonly id: ServiceId;
  readonly name: Localized;
  readonly summary: Localized;
  readonly icon: "layout" | "layers" | "brain" | "blocks" | "search";
  /** Base fee in USD covering the included scope. */
  readonly basePrice: number;
  readonly includedScreens: number;
  readonly maxScreens: number;
  readonly pricePerScreen: number;
  readonly baseWeeks: number;
  readonly weeksPerScreen: number;
  readonly deliverables: Localized<readonly string[]>;
  readonly popular: boolean;
}

export interface AddOn {
  readonly id: AddOnId;
  readonly name: Localized;
  readonly description: Localized;
  /** Flat fee in USD. Combined with `basePercent` when both are non-zero. */
  readonly flatPrice: number;
  /** Percentage of the service base fee, expressed 0-1. */
  readonly basePercent: number;
  readonly weeks: number;
}

export interface TimelineOption {
  readonly id: TimelineId;
  readonly name: Localized;
  readonly description: Localized;
  /** Multiplier applied to the scoped subtotal. */
  readonly priceMultiplier: number;
  /** Multiplier applied to the estimated duration. */
  readonly durationMultiplier: number;
}

export interface DiscountRule {
  readonly id: DiscountId;
  readonly name: Localized;
  readonly description: Localized;
  readonly rate: number;
}

export interface VolumeTier {
  readonly threshold: number;
  readonly rate: number;
}
