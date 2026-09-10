import { describe, expect, it } from "vitest";
import { dictionaries, getDictionary } from "@/lib/i18n";
import { LANGUAGES } from "@/types";

type Unknownish = Record<string, unknown>;

function collectKeys(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return [`${prefix}[]`];
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Unknownish).flatMap(([key, child]) =>
      collectKeys(child, prefix.length > 0 ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (typeof value === "object" && value !== null) {
    return Object.values(value as Unknownish).flatMap(collectStrings);
  }
  return [];
}

describe("dictionaries", () => {
  it("exposes every supported language", () => {
    for (const language of LANGUAGES) {
      expect(getDictionary(language)).toBe(dictionaries[language]);
    }
  });

  it("has identical key sets across languages", () => {
    const en = collectKeys(dictionaries.en).sort();
    const mn = collectKeys(dictionaries.mn).sort();
    expect(mn).toEqual(en);
  });

  it("keeps list-valued entries the same length", () => {
    expect(dictionaries.mn.about.principles).toHaveLength(
      dictionaries.en.about.principles.length,
    );
  });

  it("has no empty or placeholder copy", () => {
    for (const language of LANGUAGES) {
      for (const value of collectStrings(dictionaries[language])) {
        expect(value.trim().length).toBeGreaterThan(0);
        expect(value.toLowerCase()).not.toContain("lorem");
        expect(value).not.toContain("TODO");
      }
    }
  });

  it("does not leave English copy in the Mongolian dictionary for headings", () => {
    expect(dictionaries.mn.contact.title).not.toBe(dictionaries.en.contact.title);
    expect(dictionaries.mn.work.title).not.toBe(dictionaries.en.work.title);
    expect(dictionaries.mn.pricing.title).not.toBe(dictionaries.en.pricing.title);
  });
});
