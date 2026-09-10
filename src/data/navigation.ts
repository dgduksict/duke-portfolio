import type { Localized } from "@/types";

export const SECTION_IDS = [
  "about",
  "skills",
  "experience",
  "work",
  "impact",
  "pricing",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export interface NavItem {
  readonly id: SectionId;
  readonly label: Localized;
  readonly shortcut: string;
}

export const navItems: readonly NavItem[] = [
  { id: "about", label: { en: "About", mn: "Миний тухай" }, shortcut: "1" },
  { id: "skills", label: { en: "Skills", mn: "Чадвар" }, shortcut: "2" },
  { id: "experience", label: { en: "Experience", mn: "Туршлага" }, shortcut: "3" },
  { id: "work", label: { en: "Work", mn: "Ажлууд" }, shortcut: "4" },
  { id: "impact", label: { en: "Impact", mn: "Үр дүн" }, shortcut: "5" },
  { id: "pricing", label: { en: "Pricing", mn: "Үнэ" }, shortcut: "6" },
  { id: "contact", label: { en: "Contact", mn: "Холбоо барих" }, shortcut: "7" },
];
