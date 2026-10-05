import type { Language } from "@/types";

/** Mongolia dropped daylight saving in 2017; Ulaanbaatar is UTC+8 all year. */
export const ULAANBAATAR_OFFSET_MINUTES = 480;
const MINUTE = 60_000;

const clockFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Ulaanbaatar",
});

/** `viewerTimezoneOffset` is `Date#getTimezoneOffset()`: UTC minus local time, in minutes. */
export function minutesAhead(viewerTimezoneOffset: number): number {
  return ULAANBAATAR_OFFSET_MINUTES + viewerTimezoneOffset;
}

function duration(totalMinutes: number, language: Language): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (language === "mn") {
    if (hours > 0) parts.push(`${hours} цаг`);
    if (minutes > 0) parts.push(`${minutes} минут`);
    return parts.join(" ");
  }
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  return parts.join(" ");
}

/** "6 hours ahead of you", with the minutes kept for half- and quarter-hour zones. */
export function formatOffset(minutes: number, language: Language): string {
  if (minutes === 0) return language === "mn" ? "танайхтай ижил цаг" : "same time as you";
  const span = duration(Math.abs(minutes), language);
  if (language === "mn") {
    // Both "цаг" and "минут" take the back-vowel instrumental suffix "-аар".
    return `танайхаас ${span}аар ${minutes > 0 ? "түрүүлж" : "хоцорч"} байна`;
  }
  return `${span} ${minutes > 0 ? "ahead of you" : "behind you"}`;
}

export function formatClock(date: Date): string {
  return clockFormatter.format(date);
}

/** Reads a `?time=HH:MM` preview value; anything malformed is ignored. */
export function parseTimeParam(value: string | null): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

/** The instant Ulaanbaatar's clock shows `hours:minutes` on the same local day as `base`. */
export function ulaanbaatarDateAt(base: Date, hours: number, minutes: number): Date {
  const local = new Date(base.getTime() + ULAANBAATAR_OFFSET_MINUTES * MINUTE);
  const utc = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate(),
    hours,
    minutes,
  );
  return new Date(utc - ULAANBAATAR_OFFSET_MINUTES * MINUTE);
}
