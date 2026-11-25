import { seeded, type Cell } from "@/lib/pixel-sky";
import { ULAANBAATAR_OFFSET_MINUTES } from "@/lib/time";

/**
 * Which part of the year the window shows: winter (snow) or summer (fireflies at night), by Ulaanbaatar's calendar.
 * The pure placement of the snow, the fireflies and the shooting star lives here, so the scene only draws it.
 */

export type Season = "winter" | "summer";

const MINUTE = 60_000;

/** The season in Ulaanbaatar at `now`: November to March winter, June to August summer, otherwise none. */
export function seasonAt(now: Date): Season | null {
  const month = new Date(now.getTime() + ULAANBAATAR_OFFSET_MINUTES * MINUTE).getUTCMonth() + 1;
  if (month >= 11 || month <= 3) return "winter";
  if (month >= 6 && month <= 8) return "summer";
  return null;
}

/** Reads a `?season=` preview value. `null` is no override; anything unknown is ignored. */
export function parseSeasonParam(value: string | null): Season | "none" | null {
  if (value === "winter" || value === "summer" || value === "none") return value;
  return null;
}

/** A snowflake on a whole cell; `depth` 1 is the near, bigger layer. */
export interface Flake {
  readonly x: number;
  readonly y: number;
  readonly depth: 0 | 1;
}

/** `count` snowflakes scattered over a `cols` x `rows` glass, each on a whole cell and in one of two depths. */
export function snowflakes(seed: number, count: number, cols: number, rows: number): Flake[] {
  const random = seeded(seed);
  return Array.from({ length: Math.max(0, Math.floor(count)) }, () => ({
    x: Math.min(cols - 1, Math.floor(random() * cols)),
    y: Math.min(rows - 1, Math.floor(random() * rows)),
    depth: random() < 0.5 ? 0 : 1,
  }));
}

/** `count` fireflies low over the roofs: every cell falls in the bottom third of the glass. */
export function fireflies(seed: number, count: number, cols: number, rows: number): Cell[] {
  const random = seeded(seed);
  const top = Math.floor((rows * 2) / 3);
  return Array.from({ length: Math.max(0, Math.floor(count)) }, () => ({
    x: Math.min(cols - 1, Math.floor(random() * cols)),
    y: Math.min(rows - 1, top + Math.floor(random() * (rows - top))),
  }));
}

/** A shooting star: where its head starts, which way it runs and how many cells long its tail is. */
export interface StreakPath {
  readonly x: number;
  readonly y: number;
  readonly dx: 1 | -1;
  readonly length: number;
}

/** A streak that starts in the upper two fifths of the glass and runs left or right, three to five cells long. */
export function shootingStarPath(random: () => number, cols: number, rows: number): StreakPath {
  const x = Math.min(cols - 1, Math.floor(random() * cols));
  const y = Math.min(Math.ceil(rows * 0.4) - 1, Math.floor(random() * rows * 0.4));
  const dx = random() < 0.5 ? 1 : -1;
  const length = 3 + Math.min(2, Math.floor(random() * 3));
  return { x, y, dx, length };
}

/** Milliseconds until the next shooting star: 25 to 70 seconds. */
export function nextShootingStarDelay(random: () => number): number {
  return 25_000 + Math.round(random() * 45_000);
}
