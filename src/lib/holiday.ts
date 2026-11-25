import { ULAANBAATAR_OFFSET_MINUTES } from "@/lib/time";

/**
 * Which holiday dresses the cat up, by Ulaanbaatar's calendar: Christmas from 20 November to 31 December, and the
 * owner's birthday on 5 January. The scene only reads the answer; the dates live here.
 */

export type Holiday = "christmas" | "birthday";

const MINUTE = 60_000;

/** The holiday in Ulaanbaatar at `now`, or `null` on an ordinary day. */
export function holidayAt(now: Date): Holiday | null {
  const local = new Date(now.getTime() + ULAANBAATAR_OFFSET_MINUTES * MINUTE);
  const month = local.getUTCMonth() + 1;
  const day = local.getUTCDate();
  if (month === 12 || (month === 11 && day >= 20)) return "christmas";
  if (month === 1 && day === 5) return "birthday";
  return null;
}

/** Reads a `?holiday=` preview value. `null` is no override; anything unknown is ignored. */
export function parseHolidayParam(value: string | null): Holiday | "none" | null {
  if (value === "christmas" || value === "birthday" || value === "none") return value;
  return null;
}
