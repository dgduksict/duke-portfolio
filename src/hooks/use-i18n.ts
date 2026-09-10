"use client";

import { useCallback, useMemo } from "react";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { usePortfolioStore } from "@/store/portfolio-store";
import type { Language, Localized } from "@/types";

export interface I18n {
  readonly language: Language;
  readonly dict: Dictionary;
  /** Reads the active language out of a `Localized` value. */
  readonly t: <T>(value: Localized<T>) => T;
}

export function useI18n(): I18n {
  const language = usePortfolioStore((state) => state.language);
  const dict = useMemo(() => getDictionary(language), [language]);
  const t = useCallback(<T>(value: Localized<T>): T => value[language], [language]);
  return { language, dict, t };
}
