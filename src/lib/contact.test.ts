import { describe, expect, it } from "vitest";
import {
  BUDGET_BANDS,
  BUDGET_LABELS,
  emptyContactValues,
  hasErrors,
  isValidEmail,
  validateContact,
  type ContactValues,
} from "@/lib/contact";

const valid: ContactValues = {
  name: "Dulguun",
  email: "hello@example.com",
  budget: "5to15k",
  message: "We need an AI-assisted newsletter pipeline for our newsroom.",
};

describe("isValidEmail", () => {
  it("accepts ordinary addresses", () => {
    expect(isValidEmail("hello@example.com")).toBe(true);
    expect(isValidEmail("first.last+tag@sub.example.co")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("hello")).toBe(false);
    expect(isValidEmail("hello@example")).toBe(false);
    expect(isValidEmail("hello@@example.com")).toBe(false);
    expect(isValidEmail("hello @example.com")).toBe(false);
    expect(isValidEmail("a@b.c")).toBe(false);
  });

  it("ignores surrounding whitespace", () => {
    expect(isValidEmail("  hello@example.com  ")).toBe(true);
  });
});

describe("validateContact", () => {
  it("passes a complete form", () => {
    const errors = validateContact(valid);
    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });

  it("flags every empty field", () => {
    const errors = validateContact(emptyContactValues);
    expect(errors).toEqual({ name: true, email: true, message: true });
    expect(hasErrors(errors)).toBe(true);
  });

  it("requires a real name rather than a single character", () => {
    expect(validateContact({ ...valid, name: "D" }).name).toBe(true);
    expect(validateContact({ ...valid, name: "  " }).name).toBe(true);
    expect(validateContact({ ...valid, name: "Du" }).name).toBeUndefined();
  });

  it("requires a message with some substance", () => {
    expect(validateContact({ ...valid, message: "hi" }).message).toBe(true);
    expect(validateContact({ ...valid, message: "a".repeat(12) }).message).toBeUndefined();
  });

  it("never flags the budget band", () => {
    for (const budget of BUDGET_BANDS) {
      expect(validateContact({ ...valid, budget })).toEqual({});
    }
  });
});

describe("budget bands", () => {
  it("has a label for every band", () => {
    for (const band of BUDGET_BANDS) {
      expect(BUDGET_LABELS[band].length).toBeGreaterThan(0);
    }
  });
});
