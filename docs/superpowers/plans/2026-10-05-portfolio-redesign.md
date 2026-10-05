# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generated-looking portfolio with a hiring-team-first single page whose hero is the live sky over Ulaanbaatar, with every claim on the page backed by Duke's real history and repos.

**Architecture:** Pure, test-first modules in `src/lib` (solar position, sky state, time phrases, skill evidence) feed thin client components. Content lives in typed bilingual data files; components only lay it out. Old feature code (pricing, charts, palette, motion kit) is deleted rather than hidden.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, Zustand (language only), next-themes, lucide-react, Vitest + Testing Library. Geologica via `next/font/google`.

**Spec:** `docs/superpowers/specs/2026-10-05-portfolio-redesign-design.md`

**Execution note:** executed natively in the session that wrote it (Duke delegated the choice: "do as you please"). Logic tasks carry their full tests and implementations below. UI tasks carry structure, contracts and tests; their visual details are tuned against screenshots in Task 12, which is how the design is verified.

## Global Constraints

- Copy: sentence case; no all-caps labels, eyebrows, monospace labels, `→` on links, or `A · B · C` meta strings.
- Every user-facing string exists in `en` and `mn`; the `Dictionary` type enforces parity.
- No unverified claims: no testimonials, metrics or outcomes ship unless Duke adds them; project copy follows the repo READMEs.
- Colour tokens (light / dark): ground `#F3F5F8`/`#0B1322`, ink `#0E1A2B`/`#E7ECF4`, ink-soft `#556175`/`#93A0B5`, rule `#D6DDE7`/`#1D2A40`, accent `#1F56C9`/`#8CB6FF`, sun `#E39A2D`/`#F2B45A`.
- Font: Geologica, subsets `latin`, `latin-ext`, `cyrillic`, `cyrillic-ext`; axes `wght` + `SHRP`.
- Motion: only the sky fade-in, pipeline tokens on hover/focus, and the eyes. All off under `prefers-reduced-motion`.
- Remove `recharts`, `framer-motion`, `geist`. No new runtime dependencies.
- Ulaanbaatar: 47.9184°N, 106.9177°E, `Asia/Ulaanbaatar`, fixed UTC+8 (no DST since 2017).
- Gates: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` all clean at the end.

## Review Focus

1. A visitor in a non-whole-hour zone (India +5:30, Nepal +5:45, Newfoundland −3:30) must read "2 hours 30 minutes ahead of you", not "2.5 hours". → Task 3 test.
2. Summer mornings and evenings put the sun in the northern sky, behind a viewer facing the southern ridge; the glow must sit dimmed at the nearest edge, never jump across or produce NaN positions. → Task 2 test.
3. A malformed `?time=` (`25:99`, `abc`, empty) must be ignored and the real time used. → Task 3 test.
4. A returning visitor still has the v2 persisted state (quote, filters) in localStorage; rehydration must keep their language and drop the rest without errors. → Task 5 test.
5. Optional data missing — project without links, role without `companyUrl`, no `resumeUrl`, empty testimonials — must render no dead links and no empty headings. → Tasks 7, 8, 10 tests.

---

### Task 1: Solar position

**Files:**
- Create: `src/lib/sun.ts`
- Test: `src/lib/sun.test.ts`

**Interfaces:**
- Produces: `sunPosition(date: Date, latitude: number, longitude: number): SunPosition` where `SunPosition = { elevation: number; azimuth: number }` (degrees; azimuth clockwise from north, 0–360). `ULAANBAATAR = { latitude: 47.9184, longitude: 106.9177 }`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { sunPosition, ULAANBAATAR } from "@/lib/sun";

const at = (iso: string) => sunPosition(new Date(iso), ULAANBAATAR.latitude, ULAANBAATAR.longitude);

describe("sunPosition over Ulaanbaatar", () => {
  it("peaks near 65.5° in the south at the June solstice", () => {
    const { elevation, azimuth } = at("2026-06-21T04:54:00Z");
    expect(elevation).toBeGreaterThan(64.8);
    expect(elevation).toBeLessThan(66.2);
    expect(Math.abs(azimuth - 180)).toBeLessThan(3);
  });

  it("only reaches about 18.6° at the December solstice", () => {
    const { elevation } = at("2026-12-21T04:50:00Z");
    expect(elevation).toBeGreaterThan(17.9);
    expect(elevation).toBeLessThan(19.3);
  });

  it("sits about 18.6° below the horizon at midsummer midnight", () => {
    const { elevation } = at("2026-06-21T16:54:00Z");
    expect(elevation).toBeLessThan(-17.9);
    expect(elevation).toBeGreaterThan(-19.3);
  });

  it("rises due east and sets due west around the equinox", () => {
    const rise = at("2026-03-19T22:52:00Z");
    const set = at("2026-03-20T10:52:00Z");
    expect(Math.abs(rise.elevation)).toBeLessThan(1.5);
    expect(Math.abs(rise.azimuth - 90)).toBeLessThan(3);
    expect(Math.abs(set.elevation)).toBeLessThan(1.5);
    expect(Math.abs(set.azimuth - 270)).toBeLessThan(3);
  });

  it("rises in the north-east in midsummer", () => {
    const { elevation, azimuth } = at("2026-06-20T21:00:00Z");
    expect(Math.abs(elevation)).toBeLessThan(1.5);
    expect(Math.abs(azimuth - 53.6)).toBeLessThan(3);
  });

  it("always returns an azimuth in [0, 360)", () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const { azimuth } = at(`2026-10-05T${String(hour).padStart(2, "0")}:00:00Z`);
      expect(azimuth).toBeGreaterThanOrEqual(0);
      expect(azimuth).toBeLessThan(360);
    }
  });
});
```

- [ ] **Step 2: Run it to make sure it fails** — `npx vitest run src/lib/sun.test.ts` → FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
/** Low-precision solar position (NOAA / Astronomical Almanac), good to about one degree. */
export interface SunPosition {
  /** Degrees above the horizon; negative below it. */
  readonly elevation: number;
  /** Degrees clockwise from north, in [0, 360). */
  readonly azimuth: number;
}

export const ULAANBAATAR = { latitude: 47.9184, longitude: 106.9177 } as const;

const RAD = Math.PI / 180;
const J2000_DAYS_SINCE_EPOCH = 10_957.5;

function wrap360(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

function wrap180(degrees: number): number {
  const wrapped = wrap360(degrees);
  return wrapped > 180 ? wrapped - 360 : wrapped;
}

export function sunPosition(date: Date, latitude: number, longitude: number): SunPosition {
  const days = date.getTime() / 86_400_000 - J2000_DAYS_SINCE_EPOCH;
  const meanLongitude = wrap360(280.46 + 0.9856474 * days);
  const meanAnomaly = wrap360(357.528 + 0.9856003 * days) * RAD;
  const eclipticLongitude =
    (meanLongitude + 1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly)) * RAD;
  const obliquity = (23.439 - 0.0000004 * days) * RAD;

  const rightAscension =
    Math.atan2(Math.cos(obliquity) * Math.sin(eclipticLongitude), Math.cos(eclipticLongitude)) / RAD;
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLongitude));

  const siderealTime = wrap360(280.46061837 + 360.98564736629 * days + longitude);
  const hourAngle = wrap180(siderealTime - rightAscension) * RAD;
  const lat = latitude * RAD;

  const elevation = Math.asin(
    Math.sin(lat) * Math.sin(declination) + Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle),
  );
  const azimuth = Math.atan2(
    -Math.sin(hourAngle),
    Math.tan(declination) * Math.cos(lat) - Math.sin(lat) * Math.cos(hourAngle),
  );

  return { elevation: elevation / RAD, azimuth: wrap360(azimuth / RAD) };
}
```

- [ ] **Step 4: Run tests** — `npx vitest run src/lib/sun.test.ts` → PASS.

---

### Task 2: Sky state

**Files:**
- Create: `src/lib/sky.ts`
- Test: `src/lib/sky.test.ts`

**Interfaces:**
- Consumes: `SunPosition` (Task 1).
- Produces: `skyAt(sun: SunPosition): SkyState`, `mixHex(a: string, b: string, t: number): string`, `SKY_KEYFRAMES`, and

```ts
export type SkyPhase = "night" | "twilight" | "golden" | "day";
export interface SkyState {
  readonly zenith: string; readonly mid: string; readonly horizon: string; // #rrggbb
  readonly glow: string; readonly glowStrength: number;                   // 0..1
  readonly glowX: number; readonly glowY: number; readonly glowSize: number; // fractions of the sky box
  readonly stars: number;  // 0..1
  readonly sun: number;    // 0..1 disc opacity
  readonly phase: SkyPhase;
}
```

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { mixHex, SKY_KEYFRAMES, skyAt } from "@/lib/sky";

const south = (elevation: number) => skyAt({ elevation, azimuth: 180 });

describe("mixHex", () => {
  it("returns the endpoints and rounds the midpoint", () => {
    expect(mixHex("#000000", "#ffffff", 0)).toBe("#000000");
    expect(mixHex("#000000", "#ffffff", 1)).toBe("#ffffff");
    expect(mixHex("#11204f", "#173072", 0.5)).toBe("#142861");
  });
});

describe("skyAt", () => {
  it("clamps below the darkest and above the brightest keyframe", () => {
    const first = SKY_KEYFRAMES[0]!;
    const last = SKY_KEYFRAMES[SKY_KEYFRAMES.length - 1]!;
    expect(south(-40).zenith).toBe(first.zenith);
    expect(south(89).horizon).toBe(last.horizon);
  });

  it("lands exactly on a keyframe and interpolates between two", () => {
    expect(south(-6).zenith).toBe("#11204f");
    expect(south(-4).zenith).toBe("#142861");
  });

  it("shows stars only once the sun is well below the horizon", () => {
    expect(south(-12).stars).toBe(1);
    expect(south(-8).stars).toBe(0.5);
    expect(south(-4).stars).toBe(0);
    expect(south(30).stars).toBe(0);
  });

  it("brings the glow up through twilight and shows the disc from sunrise", () => {
    expect(south(-12).glowStrength).toBe(0);
    expect(south(-5).glowStrength).toBe(0.5);
    expect(south(10).glowStrength).toBe(1);
    expect(south(-3).sun).toBe(0);
    expect(south(5).sun).toBe(1);
  });

  it("places the sun by compass direction, facing south", () => {
    expect(skyAt({ elevation: 10, azimuth: 90 }).glowX).toBeCloseTo(0);
    expect(skyAt({ elevation: 10, azimuth: 180 }).glowX).toBeCloseTo(0.5);
    expect(skyAt({ elevation: 10, azimuth: 270 }).glowX).toBeCloseTo(1);
  });

  it("parks a sun behind the viewer at the nearest edge, dimmed", () => {
    const morning = skyAt({ elevation: 6, azimuth: 60 });
    const evening = skyAt({ elevation: 6, azimuth: 300 });
    expect(morning.glowX).toBe(-0.15);
    expect(evening.glowX).toBe(1.15);
    expect(morning.glowStrength).toBe(0.5);
    for (const value of [morning.glowX, morning.glowY, morning.glowSize, evening.glowY]) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("raises the sun higher in the frame as it climbs", () => {
    expect(south(60).glowY).toBeLessThan(south(10).glowY);
    expect(south(-8).glowY).toBeGreaterThan(south(0).glowY);
  });

  it("names the phase", () => {
    expect(south(-20).phase).toBe("night");
    expect(south(-7).phase).toBe("twilight");
    expect(south(3).phase).toBe("golden");
    expect(south(40).phase).toBe("day");
  });
});
```

- [ ] **Step 2: Run it to make sure it fails** — `npx vitest run src/lib/sky.test.ts` → FAIL.

- [ ] **Step 3: Implement**

```ts
import type { SunPosition } from "@/lib/sun";

export type SkyPhase = "night" | "twilight" | "golden" | "day";

export interface SkyKeyframe {
  readonly elevation: number;
  readonly zenith: string;
  readonly mid: string;
  readonly horizon: string;
  readonly glow: string;
}

export interface SkyState {
  readonly zenith: string;
  readonly mid: string;
  readonly horizon: string;
  readonly glow: string;
  readonly glowStrength: number;
  readonly glowX: number;
  readonly glowY: number;
  readonly glowSize: number;
  readonly stars: number;
  readonly sun: number;
  readonly phase: SkyPhase;
}

/** Every zenith keeps white text above 4.5:1, so the header stays legible at any hour. */
export const SKY_KEYFRAMES: readonly SkyKeyframe[] = [
  { elevation: -18, zenith: "#060b1e", mid: "#0b1531", horizon: "#1a2246", glow: "#3a3060" },
  { elevation: -12, zenith: "#0a1430", mid: "#14204a", horizon: "#2e2c5c", glow: "#5a3e6e" },
  { elevation: -6, zenith: "#11204f", mid: "#273a78", horizon: "#7a577f", glow: "#c46e6a" },
  { elevation: -2, zenith: "#173072", mid: "#47589a", horizon: "#d0806a", glow: "#f08a4b" },
  { elevation: 2, zenith: "#1d4392", mid: "#5a78b8", horizon: "#efa567", glow: "#ffb55e" },
  { elevation: 8, zenith: "#1b4fb0", mid: "#3f78cc", horizon: "#b9cfe6", glow: "#ffe2a8" },
  { elevation: 25, zenith: "#1750bf", mid: "#3478d6", horizon: "#9bc4ee", glow: "#fff3d6" },
  { elevation: 60, zenith: "#124ab8", mid: "#2f74d6", horizon: "#a8cdf3", glow: "#fffbef" },
];

/** Where the ridge line sits, as a fraction of the sky box height. */
export const HORIZON_Y = 0.84;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function channels(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function mixHex(a: string, b: string, t: number): string {
  const from = channels(a);
  const to = channels(b);
  return `#${from
    .map((channel, index) => Math.round(channel + ((to[index] ?? channel) - channel) * t))
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function frameAt(elevation: number): Omit<SkyKeyframe, "elevation"> {
  const first = SKY_KEYFRAMES[0]!;
  const last = SKY_KEYFRAMES[SKY_KEYFRAMES.length - 1]!;
  if (elevation <= first.elevation) return first;
  if (elevation >= last.elevation) return last;
  const upperIndex = SKY_KEYFRAMES.findIndex((frame) => frame.elevation >= elevation);
  const upper = SKY_KEYFRAMES[upperIndex]!;
  const lower = SKY_KEYFRAMES[upperIndex - 1]!;
  const t = (elevation - lower.elevation) / (upper.elevation - lower.elevation);
  return {
    zenith: mixHex(lower.zenith, upper.zenith, t),
    mid: mixHex(lower.mid, upper.mid, t),
    horizon: mixHex(lower.horizon, upper.horizon, t),
    glow: mixHex(lower.glow, upper.glow, t),
  };
}

function phaseOf(elevation: number): SkyPhase {
  if (elevation <= -12) return "night";
  if (elevation <= -2) return "twilight";
  if (elevation <= 8) return "golden";
  return "day";
}

export function skyAt({ elevation, azimuth }: SunPosition): SkyState {
  const frame = frameAt(elevation);
  const behindViewer = azimuth < 90 || azimuth > 270;
  const glowX = clamp((azimuth - 90) / 180, -0.15, 1.15);
  const glowY =
    elevation >= 0
      ? clamp(HORIZON_Y - (Math.min(elevation, 70) / 70) * 0.74, 0.08, 0.95)
      : clamp(HORIZON_Y + (Math.min(-elevation, 10) / 10) * 0.08, 0.08, 0.95);
  const glowSize = elevation <= 0 ? 1.1 : 1.1 - (1.1 - 0.4) * clamp(elevation / 30, 0, 1);

  return {
    ...frame,
    glowStrength: clamp((elevation + 10) / 10, 0, 1) * (behindViewer ? 0.5 : 1),
    glowX,
    glowY,
    glowSize,
    stars: clamp((-4 - elevation) / 8, 0, 1),
    sun: behindViewer ? 0 : clamp((elevation + 1) / 2, 0, 1),
    phase: phaseOf(elevation),
  };
}
```

- [ ] **Step 4: Run tests** — `npx vitest run src/lib/sky.test.ts` → PASS.

---

### Task 3: Ulaanbaatar time helpers

**Files:**
- Create: `src/lib/time.ts`
- Test: `src/lib/time.test.ts`

**Interfaces:**
- Produces:
  - `ULAANBAATAR_OFFSET_MINUTES = 480`
  - `minutesAhead(viewerTimezoneOffset: number): number` — takes `Date#getTimezoneOffset()`.
  - `formatOffset(minutes: number, language: Language): string`
  - `formatClock(date: Date): string` — `HH:MM` in `Asia/Ulaanbaatar`.
  - `parseTimeParam(value: string | null): { hours: number; minutes: number } | null`
  - `ulaanbaatarDateAt(base: Date, hours: number, minutes: number): Date`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { formatClock, formatOffset, minutesAhead, parseTimeParam, ulaanbaatarDateAt } from "@/lib/time";

describe("minutesAhead", () => {
  it("compares the viewer's zone with fixed UTC+8", () => {
    expect(minutesAhead(-480)).toBe(0); // viewer in UTC+8
    expect(minutesAhead(240)).toBe(720); // New York in summer
    expect(minutesAhead(0)).toBe(480); // London in winter
    expect(minutesAhead(-330)).toBe(150); // India
    expect(minutesAhead(-600)).toBe(-120); // Sydney in winter
  });
});

describe("formatOffset", () => {
  it("speaks in whole hours where it can", () => {
    expect(formatOffset(0, "en")).toBe("same time as you");
    expect(formatOffset(60, "en")).toBe("1 hour ahead of you");
    expect(formatOffset(360, "en")).toBe("6 hours ahead of you");
    expect(formatOffset(-120, "en")).toBe("2 hours behind you");
  });

  it("keeps the minutes of half- and quarter-hour zones", () => {
    expect(formatOffset(150, "en")).toBe("2 hours 30 minutes ahead of you");
    expect(formatOffset(135, "en")).toBe("2 hours 15 minutes ahead of you");
    expect(formatOffset(-30, "en")).toBe("30 minutes behind you");
  });

  it("has Mongolian phrasing", () => {
    expect(formatOffset(0, "mn")).toBe("танайхтай ижил цаг");
    expect(formatOffset(360, "mn")).toBe("танайхаас 6 цагаар түрүүлж байна");
    expect(formatOffset(-150, "mn")).toBe("танайхаас 2 цаг 30 минутаар хоцорч байна");
  });
});

describe("formatClock", () => {
  it("renders the Ulaanbaatar wall clock", () => {
    expect(formatClock(new Date("2026-10-05T06:32:00Z"))).toBe("14:32");
    expect(formatClock(new Date("2026-10-05T16:05:00Z"))).toBe("00:05");
  });
});

describe("parseTimeParam", () => {
  it("accepts HH:MM within a day", () => {
    expect(parseTimeParam("18:30")).toEqual({ hours: 18, minutes: 30 });
    expect(parseTimeParam("7:05")).toEqual({ hours: 7, minutes: 5 });
  });

  it("ignores anything else", () => {
    for (const value of [null, "", "abc", "25:00", "12:60", "12", "12:5", " 12:30"]) {
      expect(parseTimeParam(value)).toBeNull();
    }
  });
});

describe("ulaanbaatarDateAt", () => {
  it("moves to the given wall-clock time on the same Ulaanbaatar day", () => {
    const base = new Date("2026-10-05T03:00:00Z"); // 11:00 in Ulaanbaatar
    expect(ulaanbaatarDateAt(base, 18, 30).toISOString()).toBe("2026-10-05T10:30:00.000Z");
  });

  it("uses Ulaanbaatar's date, not UTC's", () => {
    const base = new Date("2026-10-05T20:00:00Z"); // already 04:00 on the 6th there
    expect(ulaanbaatarDateAt(base, 18, 30).toISOString()).toBe("2026-10-06T10:30:00.000Z");
  });
});
```

- [ ] **Step 2: Run it to make sure it fails** — `npx vitest run src/lib/time.test.ts` → FAIL.

- [ ] **Step 3: Implement**

```ts
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

export function formatOffset(minutes: number, language: Language): string {
  if (minutes === 0) return language === "mn" ? "танайхтай ижил цаг" : "same time as you";
  const span = duration(Math.abs(minutes), language);
  if (language === "mn") {
    return `танайхаас ${span}аар ${minutes > 0 ? "түрүүлж" : "хоцорч"} байна`;
  }
  return `${span} ${minutes > 0 ? "ahead of you" : "behind you"}`;
}

export function formatClock(date: Date): string {
  return clockFormatter.format(date);
}

export function parseTimeParam(value: string | null): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

export function ulaanbaatarDateAt(base: Date, hours: number, minutes: number): Date {
  const local = new Date(base.getTime() + ULAANBAATAR_OFFSET_MINUTES * MINUTE);
  const utc = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), hours, minutes);
  return new Date(utc - ULAANBAATAR_OFFSET_MINUTES * MINUTE);
}
```

- [ ] **Step 4: Run tests** — `npx vitest run src/lib/time.test.ts` → PASS.

---

### Task 4: Content model, data and evidence

**Files:**
- Modify: `src/types/index.ts` (rewrite), `src/data/profile.ts`, `src/data/experience.ts`, `src/data/projects.ts`, `src/data/skills.ts`, `src/data/testimonials.ts`, `src/data/navigation.ts`, `src/lib/format.ts` (trim), `src/lib/format.test.ts` (trim), `src/data/data.test.ts` (rewrite)
- Create: `src/lib/evidence.ts`, `src/lib/evidence.test.ts`
- Delete: `src/data/metrics.ts`, `src/data/services.ts`

**Interfaces:**
- Produces types:

```ts
export interface Profile {
  name: Localized; shortName: Localized; headline: Localized; intro: Localized; bio: Localized<readonly string[]>;
  email: string; phone: string | null; location: Localized; timeZone: "Asia/Ulaanbaatar";
  coordinates: { latitude: number; longitude: number };
  availability: Localized | null; resumeUrl: string | null; sourceUrl: string; socials: readonly SocialLink[];
}
export interface ExperienceEntry {
  id: string; role: Localized; company: string; companyUrl: string | null; location: Localized;
  start: string; end: string | null; summary: Localized; highlights?: Localized<readonly string[]>; stack: readonly string[];
}
export interface PipelineStage { id: string; label: Localized; detail?: Localized }
export interface ProjectLink { kind: "live" | "source"; href: string }
export interface Project {
  id: string; name: Localized; year: number; roleId: string | null; tagline: Localized; description: Localized;
  part: Localized; stages: readonly PipelineStage[]; stack: readonly string[]; links: readonly ProjectLink[];
  outcomes?: Localized<readonly string[]>; metrics?: readonly ProjectMetric[];
}
export const SKILL_GROUPS = ["ai", "backend", "web3", "frontend", "infra"] as const;
export interface Skill { id: string; name: string; group: SkillGroupId; aliases?: readonly string[] }
export interface Testimonial { id: string; quote: Localized; author: string; role: Localized; company: string }
```

- Produces functions: `normalizeTool(name: string): string`, `buildEvidence(skills, roles, projects): SkillEvidence[]` with `SkillEvidence = { skill: Skill; places: readonly EvidencePlace[] }` and `EvidencePlace = { kind: "role" | "project"; id: string; label: Localized; href: string }` (`#role-<id>` / `#project-<id>`); `formatYearRange(start: string, end: string | null, presentLabel: string): string`; keeps `roundTo`, `formatNumber`, `formatMetric`.
- Content: experience from Duke's April history (Mongol Content, MobiCom, ErchimLabs, NumadLabs; years only; URLs only where they resolve: mongolcontent.mn, mobicom.mn); projects Gogo.mn, Gogo newsletter, Article similarity monitor, Sonsy tickets with stages from the READMEs; `availability: null`, `resumeUrl: null`, `testimonials: []`.

- [ ] **Step 1: Write the failing tests** (`src/lib/evidence.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import { buildEvidence, normalizeTool } from "@/lib/evidence";
import type { ExperienceEntry, Project, Skill } from "@/types";

const l = (text: string) => ({ en: text, mn: text });
const role = (id: string, company: string, stack: string[]): ExperienceEntry => ({
  id, company, stack, role: l("Dev"), companyUrl: null, location: l("UB"), start: "2024-01", end: null, summary: l("s"),
});
const project = (id: string, stack: string[]): Project => ({
  id, stack, name: l(id), year: 2026, roleId: null, tagline: l("t"), description: l("d"), part: l("p"), stages: [], links: [],
});

describe("normalizeTool", () => {
  it("ignores case, spaces and punctuation", () => {
    expect(normalizeTool("Next.js")).toBe(normalizeTool("nextjs"));
    expect(normalizeTool("GitHub Actions")).toBe("githubactions");
  });
});

describe("buildEvidence", () => {
  const skills: Skill[] = [
    { id: "postgres", name: "PostgreSQL", group: "backend", aliases: ["Postgres"] },
    { id: "next", name: "Next.js", group: "frontend" },
    { id: "langchain", name: "LangChain", group: "ai" },
  ];
  const roles = [role("a", "Alpha", ["Postgres", "Next.js"]), role("b", "Beta", ["NEXTJS"])];
  const projects = [project("p1", ["PostgreSQL", "Postgres"])];

  it("matches names and aliases, roles first, in data order, without duplicates", () => {
    const [postgres, next] = buildEvidence(skills, roles, projects);
    expect(postgres?.places.map((place) => place.href)).toEqual(["#role-a", "#project-p1"]);
    expect(next?.places.map((place) => place.href)).toEqual(["#role-a", "#role-b"]);
    expect(postgres?.places[0]?.label.en).toBe("Alpha");
  });

  it("keeps tools nobody used, with no places", () => {
    expect(buildEvidence(skills, roles, projects)[2]?.places).toEqual([]);
  });
});
```

Add to `src/lib/format.test.ts` (replacing the currency/weeks/month tests):

```ts
describe("formatYearRange", () => {
  it("shows years only", () => {
    expect(formatYearRange("2024-01", "2025-01", "now")).toBe("2024 – 2025");
    expect(formatYearRange("2026-02", null, "now")).toBe("2026 – now");
    expect(formatYearRange("2025-03", "2025-11", "now")).toBe("2025");
  });
});
```

Rewrite `src/data/data.test.ts` with these invariants: unique ids everywhere; every `Localized` value filled in both languages; links and URLs absolute `https://`; experience newest first with `start <= end`; every project has ≥ 3 stages and a `roleId` that is null or an existing role; every tool named in any role or project stack is a known skill (name or alias), so the Stack section misses nothing; every evidence `href` points to an existing role or project id; `testimonials` entries (if any) are translated.

- [ ] **Step 2: Run to make sure they fail** — `npx vitest run src/lib src/data` → FAIL.

- [ ] **Step 3: Implement** `src/lib/evidence.ts`:

```ts
import type { ExperienceEntry, Localized, Project, Skill } from "@/types";

export interface EvidencePlace {
  readonly kind: "role" | "project";
  readonly id: string;
  readonly label: Localized;
  readonly href: string;
}

export interface SkillEvidence {
  readonly skill: Skill;
  readonly places: readonly EvidencePlace[];
}

export function normalizeTool(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function buildEvidence(
  skills: readonly Skill[],
  roles: readonly ExperienceEntry[],
  projects: readonly Project[],
): SkillEvidence[] {
  return skills.map((skill) => {
    const names = new Set([skill.name, ...(skill.aliases ?? [])].map(normalizeTool));
    const uses = (stack: readonly string[]) => stack.some((tool) => names.has(normalizeTool(tool)));
    const places: EvidencePlace[] = [
      ...roles.filter((entry) => uses(entry.stack)).map((entry) => ({
        kind: "role" as const, id: entry.id, label: { en: entry.company, mn: entry.company }, href: `#role-${entry.id}`,
      })),
      ...projects.filter((entry) => uses(entry.stack)).map((entry) => ({
        kind: "project" as const, id: entry.id, label: entry.name, href: `#project-${entry.id}`,
      })),
    ];
    return { skill, places };
  });
}
```

Then rewrite the types and data files per the interfaces and content rules above, and trim `format.ts` to `roundTo`, `formatNumber`, `formatMetric`, `formatYearRange`.

- [ ] **Step 4: Run tests** — `npx vitest run src/lib src/data` → PASS.

---

### Task 5: Store and dictionary

**Files:**
- Modify: `src/store/portfolio-store.ts`, `src/store/portfolio-store.test.ts`, `src/lib/i18n/dictionary.ts`, `src/lib/i18n/dictionary.test.ts`

**Interfaces:**
- Produces: `usePortfolioStore` with `{ language, setLanguage, toggleLanguage, mobileNavOpen, setMobileNavOpen }`, persisted as `duke-portfolio` version 3 with `partialize: language` and a `migrate` that keeps only a valid language. `resetPortfolioStore()`.
- Produces: `Dictionary` with groups `meta`, `nav` (experience, work, stack, contact, menu, close, toggleTheme, language, skip, home), `hero` (emailMe, copyEmail, copied, resume, clock(time, offset) → string), `experience` (title, now, fromThisRole), `work` (title, howItWorks, myPart, stack, outcomes, internal, live, source), `stack` (title, alsoUsed, groups record), `testimonials` (title), `contact` (title, avatarAlt, elsewhere, phone, copy, copied), `footer` (source), `notFound` (title, body, home).

- [ ] **Step 1: Write the failing tests**

```ts
// portfolio-store.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

const state = () => usePortfolioStore.getState();
beforeEach(() => resetPortfolioStore());

describe("portfolio store", () => {
  it("toggles and sets the language", () => {
    expect(state().language).toBe("en");
    state().toggleLanguage();
    expect(state().language).toBe("mn");
    state().setLanguage("en");
    expect(state().language).toBe("en");
  });

  it("opens and closes the mobile nav", () => {
    state().setMobileNavOpen(true);
    expect(state().mobileNavOpen).toBe(true);
  });

  it("keeps the language from a v2 snapshot and drops everything else", async () => {
    window.localStorage.setItem(
      "duke-portfolio",
      JSON.stringify({ state: { language: "mn", quote: { serviceId: "webapp" }, projectFilter: {} }, version: 2 }),
    );
    await usePortfolioStore.persist.rehydrate();
    expect(state().language).toBe("mn");
    expect(state()).not.toHaveProperty("quote");
    expect(state()).not.toHaveProperty("projectFilter");
  });

  it("falls back to English when the stored language is unknown", async () => {
    window.localStorage.setItem("duke-portfolio", JSON.stringify({ state: { language: "fr" }, version: 2 }));
    await usePortfolioStore.persist.rehydrate();
    expect(state().language).toBe("en");
  });
});
```

Dictionary test: keep parity/empty-copy checks; collect function-valued keys as keys and call each `clock` with `("14:32", "x")` to check it returns non-empty copy containing `14:32`; headings differ between languages for `work.title`, `contact.title`, `stack.title`.

- [ ] **Step 2: Run** — `npx vitest run src/store src/lib/i18n` → FAIL.

- [ ] **Step 3: Implement** the store (keep `createMemoryStorage`/`resolveStorage`; `version: 3`; `migrate: (persisted) => ({ language: isLanguage(persisted?.language) ? persisted.language : "en" })`; `merge` that only copies `language`) and the dictionary for both languages.

- [ ] **Step 4: Run** — PASS.

---

### Task 6: Foundation — tokens, font, layout, shell pieces; remove the old app

**Files:**
- Modify: `src/app/globals.css` (rewrite), `src/app/layout.tsx`, `src/components/layout/providers.tsx`, `next.config.ts`, `package.json`, `README.md`
- Create: `src/components/ui/section.tsx`, `src/components/ui/copy-button.tsx`, `src/components/ui/eyes.tsx` (CSS-only rewrite), `src/hooks/use-now.ts`
- Move: `src/components/visual/brand-icons.tsx` → `src/components/ui/brand-icons.tsx`; `public/professional-developer-portrait.png` → `public/avatar.png`
- Delete: `src/components/charts/*`, `src/components/pricing/*`, `src/components/projects/*`, `src/components/sections/{about,impact,pricing,pricing.test,skills}.tsx`, `src/components/layout/{command-palette,back-to-top}.tsx`, `src/components/ui/{controls,controls.test,modal,primitives,button}.tsx`, `src/components/visual/*`, `src/lib/{pricing,pricing.test,brief,brief.test,contact,contact.test,projects,projects.test}.ts`, `src/hooks/{use-local-time,use-is-mounted}.ts`, the five AI images and five `placeholder*` files in `public/`
- `npm uninstall recharts framer-motion geist`

**Interfaces:**
- Produces: `<Section id title>` (title column + content grid, `aria-labelledby`); `<CopyButton value label copiedLabel />`; `<Eyes />`; `useNow(): Date | null` — `null` until mounted, then the current time (or the `?time=HH:MM` override via `parseTimeParam` + `ulaanbaatarDateAt`), ticking on each minute boundary.
- CSS utilities/classes used by later tasks: tokens as `--color-ground`, `--color-ink`, `--color-ink-soft`, `--color-rule`, `--color-accent`, `--color-sun` (so Tailwind gets `bg-ground`, `text-ink`, …), `container-page`, `display-name`, `type-title`, `type-project`, `link`, `btn-primary`, `btn-quiet`, `tabular`.

- [ ] **Step 1: Write the failing test** (`src/hooks/use-now.test.tsx`)

```tsx
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNow } from "@/hooks/use-now";

afterEach(() => {
  vi.useRealTimers();
  window.history.replaceState(null, "", "/");
});

describe("useNow", () => {
  it("uses the real time and ignores a malformed override", () => {
    vi.useFakeTimers({ now: new Date("2026-10-05T03:00:00Z") });
    window.history.replaceState(null, "", "/?time=25:99");
    const { result } = renderHook(() => useNow());
    expect(result.current?.toISOString()).toBe("2026-10-05T03:00:00.000Z");
  });

  it("honours ?time= as Ulaanbaatar wall-clock time", () => {
    vi.useFakeTimers({ now: new Date("2026-10-05T03:00:00Z") });
    window.history.replaceState(null, "", "/?time=18:30");
    const { result } = renderHook(() => useNow());
    expect(result.current?.toISOString()).toBe("2026-10-05T10:30:00.000Z");
  });

  it("ticks on the minute", () => {
    vi.useFakeTimers({ now: new Date("2026-10-05T03:00:30Z") });
    const { result } = renderHook(() => useNow());
    act(() => vi.advanceTimersByTime(30_000));
    expect(result.current?.toISOString()).toBe("2026-10-05T03:01:00.000Z");
  });
});
```

- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** `use-now.ts`, then the deletions, dependency removal, `globals.css` tokens/base/print, Geologica in `layout.tsx` (`next/font/google`, `axes: ["SHRP"]`, `variable: "--font-geologica"`), `Section`, `CopyButton`, `Eyes`.
- [ ] **Step 4: Run** — `npx vitest run src/hooks` → PASS.

---

### Task 7: Hero and sky

**Files:**
- Create: `src/components/sky/sky.tsx`, `src/components/sky/ridges.tsx`, `src/components/sky/stars.tsx`, `src/components/sections/hero.tsx` (rewrite), `src/components/sections/hero.test.tsx`

**Interfaces:**
- Consumes: `sunPosition`, `ULAANBAATAR`, `skyAt`, `useNow`, `formatClock`, `minutesAhead`, `formatOffset`, `profile`, `useI18n`, `CopyButton`.
- Produces: `<Sky now={Date | null} />` — sets `--sky-zenith/mid/horizon/glow` and glow geometry as inline custom properties, `data-ready` once `now` is known, `data-phase`; stars from a seeded generator; two ridge silhouettes (far: `color-mix(in oklab, var(--sky-horizon) 55%, var(--color-ground))`, near: `var(--color-ground)`). `<Hero />` with `id="top"`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Hero } from "@/components/sections/hero";
import { Sky } from "@/components/sky/sky";
import { profile } from "@/data/profile";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

beforeEach(() => resetPortfolioStore());

describe("Hero", () => {
  it("leads with the name and ways to get in touch", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1, name: profile.name.en })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /email me/i })).toHaveAttribute("href", `mailto:${profile.email}`);
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute("href", expect.stringMatching(/^https:/));
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("href", expect.stringMatching(/^https:/));
  });

  it("hides the résumé link while there is no résumé", () => {
    render(<Hero />);
    expect(screen.queryByRole("link", { name: /résumé/i })).not.toBeInTheDocument();
  });

  it("switches to Mongolian", () => {
    usePortfolioStore.getState().setLanguage("mn");
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1, name: profile.name.mn })).toBeInTheDocument();
  });
});

describe("Sky", () => {
  it("waits for a time before painting", () => {
    const { container } = render(<Sky now={null} />);
    expect(container.firstElementChild).toHaveAttribute("data-ready", "false");
  });

  it("paints the night sky at midnight in Ulaanbaatar", () => {
    const { container } = render(<Sky now={new Date("2026-10-05T16:00:00Z")} />);
    const sky = container.firstElementChild as HTMLElement;
    expect(sky).toHaveAttribute("data-ready", "true");
    expect(sky).toHaveAttribute("data-phase", "night");
    expect(sky.style.getPropertyValue("--sky-zenith")).toMatch(/^#[0-9a-f]{6}$/);
  });
});
```

- [ ] **Step 2: Run** — FAIL. **Step 3: Implement.** **Step 4: Run** — PASS.

---

### Task 8: Experience

**Files:**
- Modify: `src/components/sections/experience.tsx` (rewrite) — Test: `src/components/sections/experience.test.tsx`

**Interfaces:**
- Consumes: `experience`, `projects` (for "work from this role" links via `roleId`), `formatYearRange`, `Section`.
- Produces: rows with `id="role-<id>"`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Experience } from "@/components/sections/experience";
import { experience } from "@/data/experience";

describe("Experience", () => {
  it("lists every role newest first with years", () => {
    render(<Experience />);
    const rows = screen.getAllByRole("listitem", { name: /.+/ });
    expect(rows).toHaveLength(experience.length);
    expect(within(rows[0]!).getByText(/2026 – now/)).toBeInTheDocument();
  });

  it("links companies only when they have a working site", () => {
    render(<Experience />);
    for (const entry of experience) {
      const link = screen.queryByRole("link", { name: entry.company });
      if (entry.companyUrl) expect(link).toHaveAttribute("href", entry.companyUrl);
      else expect(link).not.toBeInTheDocument();
    }
  });

  it("points from a role to the work done there", () => {
    render(<Experience />);
    expect(screen.getByRole("link", { name: "Gogo.mn" })).toHaveAttribute("href", "#project-gogo");
  });
});
```

Rows are `<li aria-labelledby>` so `getAllByRole("listitem", { name })` finds exactly the role rows.

- [ ] **Step 2: Run** — FAIL. **Step 3: Implement.** **Step 4: Run** — PASS.

---

### Task 9: Work and the pipeline diagram

**Files:**
- Create: `src/components/work/pipeline.tsx` — Modify: `src/components/sections/work.tsx` (rewrite), `src/components/sections/work.test.tsx` (rewrite)

**Interfaces:**
- Consumes: `projects`, `Section`, `useI18n`.
- Produces: `<Pipeline stages label />` — `<figure>` with an `<ol>` of stages, `figcaption` for screen readers, decorative token track (`aria-hidden`) animated by CSS while the parent `.project` is hovered or has focus. Project rows `id="project-<id>"`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Work } from "@/components/sections/work";
import { projects } from "@/data/projects";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

beforeEach(() => resetPortfolioStore());

describe("Work", () => {
  it("shows every project with how it works", () => {
    render(<Work />);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(projects.length);
    for (const [index, project] of projects.entries()) {
      const article = articles[index]!;
      expect(within(article).getByRole("heading", { name: project.name.en })).toBeInTheDocument();
      expect(within(article).getAllByRole("listitem").length).toBeGreaterThanOrEqual(project.stages.length);
    }
  });

  it("links live projects and labels internal ones instead of linking nowhere", () => {
    render(<Work />);
    expect(screen.getByRole("link", { name: /gogo\.mn/i })).toHaveAttribute("href", "https://gogo.mn");
    const internal = projects.filter((project) => project.links.length === 0);
    expect(screen.getAllByText(/internal tool/i)).toHaveLength(internal.length);
  });

  it("renders Mongolian copy", () => {
    usePortfolioStore.getState().setLanguage("mn");
    render(<Work />);
    expect(screen.getByText(projects[0]!.tagline.mn)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run** — FAIL. **Step 3: Implement.** **Step 4: Run** — PASS.

---

### Task 10: Stack, testimonials, about + contact

**Files:**
- Create: `src/components/sections/stack.tsx`, `src/components/sections/stack.test.tsx`
- Modify: `src/components/sections/testimonials.tsx` (rewrite), `src/components/sections/contact.tsx` (rewrite), `src/components/sections/contact.test.tsx` (rewrite)

**Interfaces:**
- Consumes: `buildEvidence`, `skills`, `experience`, `projects`, `testimonials`, `profile`, `CopyButton`, brand icons.
- Produces: `<Stack />` (`id="stack"`), `<Testimonials items={testimonials} />` (returns `null` when empty), `<Contact />` (`id="contact"`).

- [ ] **Step 1: Write the failing tests**

```tsx
// stack.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stack } from "@/components/sections/stack";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";

describe("Stack", () => {
  it("backs every tool with links to where it was used", () => {
    render(<Stack />);
    const anchors = new Set([
      ...experience.map((entry) => `#role-${entry.id}`),
      ...projects.map((entry) => `#project-${entry.id}`),
    ]);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(anchors.has(link.getAttribute("href") ?? "")).toBe(true);
  });
});

// contact.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Contact } from "@/components/sections/contact";
import { Testimonials } from "@/components/sections/testimonials";
import { profile } from "@/data/profile";

describe("Contact", () => {
  it("offers the address as a mail link and a copy button", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<Contact />);
    expect(screen.getByRole("link", { name: profile.email })).toHaveAttribute("href", `mailto:${profile.email}`);
    await userEvent.click(screen.getByRole("button", { name: /copy/i }));
    expect(writeText).toHaveBeenCalledWith(profile.email);
    expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
  });

  it("shows the avatar with honest alt text", () => {
    render(<Contact />);
    expect(screen.getByRole("img", { name: /cat/i })).toBeInTheDocument();
  });
});

describe("Testimonials", () => {
  it("renders nothing while there are none", () => {
    const { container } = render(<Testimonials items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run** — FAIL. **Step 3: Implement.** **Step 4: Run** — PASS.

---

### Task 11: Header, footer, page, 404, metadata

**Files:**
- Modify: `src/components/layout/site-header.tsx` (rewrite), `src/components/layout/site-footer.tsx` (rewrite), `src/app/page.tsx`, `src/app/not-found.tsx`, `src/hooks/use-active-section.ts`, `src/data/navigation.ts`
- Test: `src/components/layout/site-header.test.tsx`

**Interfaces:**
- Produces: header with skip link, wordmark + eyes linking `#top`, nav (Experience, Work, Stack, Contact) with `aria-current` on the active section, language group (`EN`/`МН` buttons with `aria-pressed`), theme toggle, phone menu; `data-over-sky` while the sky is under it.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { SiteHeader } from "@/components/layout/site-header";
import { resetPortfolioStore, usePortfolioStore } from "@/store/portfolio-store";

beforeEach(() => resetPortfolioStore());

describe("SiteHeader", () => {
  it("links to every section", () => {
    render(<SiteHeader />);
    for (const name of ["Experience", "Work", "Stack", "Contact"]) {
      expect(screen.getAllByRole("link", { name })[0]).toHaveAttribute("href", `#${name.toLowerCase()}`);
    }
  });

  it("switches language from the toggle", async () => {
    render(<SiteHeader />);
    await userEvent.click(screen.getByRole("button", { name: "МН" }));
    expect(usePortfolioStore.getState().language).toBe("mn");
    expect(screen.getByRole("button", { name: "МН" })).toHaveAttribute("aria-pressed", "true");
  });
});
```

- [ ] **Step 2: Run** — FAIL. **Step 3: Implement**, compose `page.tsx` (Header, `<main id="main">` Hero, Experience, Work, Stack, Testimonials, Contact, Footer), 404 with a fixed-midnight `<Sky>`, metadata from `profile`. **Step 4: Run** — `npm test` → PASS.

---

### Task 12: Verify and critique

- [ ] `npm run lint` → clean. `npm run typecheck` → clean. `npm test` → all pass. `npm run build` → succeeds.
- [ ] Screenshot `/` at 390×844 and 1440×900, light and dark, with `?time=12:30`, `?time=19:10` (golden), `?time=23:30` (night), plus 320px width in Mongolian.
- [ ] Critique each against the spec: one bold move, legible header over every sky, name never collides with the ridge, no generic tells, nothing overflows at 320px, focus rings visible, reduced motion respected. Fix what fails and re-shoot.
- [ ] Update `README.md` to describe the new page, data files and scripts.
