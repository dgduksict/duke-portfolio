import type { Language, Localized } from "@/types";

export { dictionaries, getDictionary, type Dictionary } from "./dictionary";

/** Reads the active language out of a `Localized` value. */
export function pick<T>(value: Localized<T>, language: Language): T {
  return value[language];
}

export function otherLanguage(language: Language): Language {
  return language === "en" ? "mn" : "en";
}
