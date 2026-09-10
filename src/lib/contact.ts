export const BUDGET_BANDS = ["under5k", "5to15k", "15to40k", "over40k"] as const;
export type BudgetBand = (typeof BUDGET_BANDS)[number];

export const BUDGET_LABELS: Readonly<Record<BudgetBand, string>> = {
  under5k: "< $5k",
  "5to15k": "$5k – $15k",
  "15to40k": "$15k – $40k",
  over40k: "$40k +",
};

export interface ContactValues {
  readonly name: string;
  readonly email: string;
  readonly budget: BudgetBand;
  readonly message: string;
}

export type ContactField = "name" | "email" | "message";
export type ContactErrors = Partial<Record<ContactField, true>>;

export const emptyContactValues: ContactValues = {
  name: "",
  email: "",
  budget: "5to15k",
  message: "",
};

/** Deliberately permissive: one @, a dot in the domain, no whitespace. */
export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 6 || /\s/.test(trimmed)) return false;
  return /^[^@]+@[^@]+\.[^@.]{2,}$/.test(trimmed);
}

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (values.name.trim().length < 2) errors.name = true;
  if (!isValidEmail(values.email)) errors.email = true;
  if (values.message.trim().length < 12) errors.message = true;
  return errors;
}

export function hasErrors(errors: ContactErrors): boolean {
  return Object.keys(errors).length > 0;
}
