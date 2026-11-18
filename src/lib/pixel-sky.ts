import { HORIZON_Y, mixHex, type SkyPhase, type SkyState } from "@/lib/sky";
import type { SunPosition } from "@/lib/sun";

/**
 * The pure geometry and colour of the hero's pixel window (components/scene): the live sky quantised into flat bands,
 * grid stars, the Bogd Khan ridge as a stepped silhouette and a seeded skyline of Ulaanbaatar blocks whose windows
 * light up by the sky's phase. Everything is in whole grid cells and deterministic, so the server and the client draw
 * the same picture and nothing flickers between renders.
 */

/** A building of the skyline, in grid cells: left column, width, height (it stands on the bottom row). */
export interface SkylineBlock {
  readonly x: number;
  readonly w: number;
  readonly h: number;
  /**
   * The block's lived-in windows: indices into `blockWindows(block)` that can light up. Which of them are on at a
   * given hour is `windowLights`.
   */
  readonly lit: readonly number[];
}

export interface Cell {
  readonly x: number;
  readonly y: number;
}

/** Where the mid colour sits between the zenith (0) and the horizon (1), as in the smooth sky it replaces. */
const MID_AT = 0.55;

/** mulberry32: a tiny seeded generator. */
function seeded(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** `value` rounded to the nearest whole `unit` (never -0). */
export function snap(value: number, unit: number): number {
  if (!(unit > 0)) return value;
  return Math.round(value / unit) * unit + 0;
}

/** The smooth sky's colour at `t` (0 = zenith, 1 = horizon). */
function skyColourAt(sky: SkyState, t: number): string {
  if (t <= MID_AT) return mixHex(sky.zenith, sky.mid, t / MID_AT);
  return mixHex(sky.mid, sky.horizon, (t - MID_AT) / (1 - MID_AT));
}

/**
 * The sky as `bands` flat colours, top to bottom: the first is the zenith, the last the horizon, the ones between
 * sampled evenly from the zenith -> mid -> horizon ramp. Painted as hard-edged stripes, never blended.
 */
export function quantizeBands(sky: SkyState, bands: number): string[] {
  const n = Math.max(0, Math.floor(bands));
  if (n === 1) return [sky.mid];
  return Array.from({ length: n }, (_, i) => skyColourAt(sky, i / (n - 1)));
}

/** The rows each of `bands` stripes covers in a box `rows` tall: whole rows, no gaps, top to bottom. */
export function bandRows(rows: number, bands: number): { y: number; h: number }[] {
  const n = Math.max(0, Math.floor(bands));
  return Array.from({ length: n }, (_, i) => {
    const y = Math.floor((i * rows) / n);
    const next = Math.floor(((i + 1) * rows) / n);
    return { y, h: next - y };
  });
}

/**
 * `count` stars on whole cells of a `cols` x `rows` box, each on its own cell, denser towards the top where the sky
 * is darkest. Asking for more stars than there are cells fills the box.
 */
export function pixelStars(seed: number, count: number, cols: number, rows: number): Cell[] {
  const want = Math.max(0, Math.min(Math.floor(count), cols * rows));
  const random = seeded(seed);
  const taken = new Set<number>();
  const stars: Cell[] = [];
  for (let attempt = 0; stars.length < want && attempt < want * 50; attempt += 1) {
    const x = Math.min(cols - 1, Math.floor(random() * cols));
    const y = Math.min(rows - 1, Math.floor(random() ** 1.35 * rows));
    const key = y * cols + x;
    if (taken.has(key)) continue;
    taken.add(key);
    stars.push({ x, y });
  }
  // A crowded box can starve the random walk: fill what is left in scan order.
  for (let key = 0; stars.length < want && key < cols * rows; key += 1) {
    if (taken.has(key)) continue;
    taken.add(key);
    stars.push({ x: key % cols, y: Math.floor(key / cols) });
  }
  return stars;
}

/**
 * The window cells of a block, relative to its top left: one-cell windows on every other column (keeping a wall
 * column at each side) and every other row from the second row down, leaving a storey of wall at the street.
 */
export function blockWindows(block: Pick<SkylineBlock, "w" | "h">): Cell[] {
  const columns = Math.max(0, Math.floor((block.w - 1) / 2));
  const storeys = Math.max(0, Math.floor((block.h - 3) / 2));
  const cells: Cell[] = [];
  for (let row = 0; row < storeys; row += 1) {
    for (let col = 0; col < columns; col += 1) cells.push({ x: 1 + col * 2, y: 2 + row * 2 });
  }
  return cells;
}

/**
 * A skyline of Ulaanbaatar-style blocks across `cols` columns: long low panel blocks with a few taller towers, side
 * by side with small gaps, never overlapping and never past the last column.
 */
export function skylineBlocks(seed: number, cols: number): SkylineBlock[] {
  const random = seeded(seed);
  const blocks: SkylineBlock[] = [];
  let x = Math.floor(random() * 2);
  while (x < cols) {
    const tower = random() < 0.28;
    let w = tower ? 5 + 2 * Math.floor(random() * 3) : 7 + 2 * Math.floor(random() * 4);
    const h = tower ? 13 + Math.floor(random() * 6) : 5 + Math.floor(random() * 7);
    const room = cols - x;
    if (room < 3) break;
    if (w > room || room - w < 3) w = room;
    const windows = blockWindows({ w, h });
    const lit = windows.map((_, i) => i).filter(() => random() < 0.88);
    blocks.push({ x, w, h, lit });
    x += w + Math.floor(random() * 3);
  }
  return blocks;
}

/** The share of lived-in windows that are lit in each phase of the sky. */
const LIT_SHARE: Readonly<Record<SkyPhase, number>> = {
  day: 0,
  golden: 0.18,
  twilight: 0.45,
  night: 0.85,
};

/**
 * Which of a block's lived-in windows are lit (indices into `blockWindows`): none by day, a few in the golden hour,
 * about half at twilight, most at night. Each window draws one seeded number and is lit whenever its phase's share is
 * above it, so a window lit at twilight stays lit through the night.
 */
export function windowLights(phase: SkyPhase, block: SkylineBlock, seed: number): number[] {
  const share = LIT_SHARE[phase];
  const random = seeded(seed * 7919 + block.x * 104_729 + block.w * 31 + block.h);
  return block.lit.filter(() => random() < share);
}

/**
 * Where a moon sits in the window, as fractions of the glass (like `SkyState.glowX`/`glowY`), or `null` when there is
 * none to show. The site computes no moon, so the window shows one opposite the sun, as a full moon would be: risen
 * once the sun is well down, mapped onto the glass the same way `skyAt` maps the sun (facing south, east on the left).
 */
export function moonSpot({ elevation, azimuth }: SunPosition): Cell | null {
  const height = -elevation;
  const x = (((azimuth + 180) % 360) - 90) / 180;
  if (height < 6 || x < 0.06 || x > 0.94) return null;
  return { x, y: HORIZON_Y - (Math.min(height, 70) / 70) * 0.74 };
}

/**
 * The Bogd Khan ridge seen from the city: a long massif with a broad high shoulder, as one height per column (in
 * cells, at most `maxH`), held flat over runs of three columns so it reads as pixel steps.
 */
export function ridgeSteps(cols: number, maxH: number): number[] {
  const RUN = 3;
  return Array.from({ length: cols }, (_, x) => {
    const at = (Math.floor(x / RUN) * RUN) / Math.max(1, cols - 1);
    const shape =
      0.62 +
      0.24 * Math.sin(Math.PI * (at * 1.15 + 0.05)) +
      0.1 * Math.sin(2 * Math.PI * (at * 2.6 + 0.15)) +
      0.05 * Math.sin(2 * Math.PI * (at * 6.3 + 0.4));
    return Math.max(0, Math.min(maxH, Math.round(shape * maxH)));
  });
}
