import type { Localized } from "@/types";

export const SECTION_IDS = ["experience", "work", "stack", "contact"] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export interface NavItem {
  readonly id: SectionId;
  readonly label: Localized;
}

export const navItems: readonly NavItem[] = [
  { id: "experience", label: { en: "Experience", mn: "Туршлага" } },
  { id: "work", label: { en: "Work", mn: "Ажлууд" } },
  { id: "stack", label: { en: "Stack", mn: "Технологи" } },
  { id: "contact", label: { en: "Contact", mn: "Холбоо барих" } },
];
