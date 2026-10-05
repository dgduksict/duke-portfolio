import type { SunPosition } from "@/lib/sun";

export type SkyPhase = "night" | "twilight" | "golden" | "day";

export interface SkyKeyframe {
  readonly elevation: number;
  readonly zenith: string;
  readonly mid: string;
  readonly horizon: string;
  readonly glow: string;
}

/**
 * Everything the sky picture needs, derived from where the sun is. Colours are
 * `#rrggbb`; positions and sizes are fractions of the sky box, viewed facing
 * south towards the Bogd Khan ridge (east on the left, west on the right).
 */
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
  // Facing south, a sun in the northern half of the sky is behind the viewer:
  // its light still reaches the edge of the picture, but the disc does not.
  const behindViewer = azimuth < 90 || azimuth > 270;
  const glowY =
    elevation >= 0
      ? clamp(HORIZON_Y - (Math.min(elevation, 70) / 70) * 0.74, 0.08, 0.95)
      : clamp(HORIZON_Y + (Math.min(-elevation, 10) / 10) * 0.08, 0.08, 0.95);

  return {
    ...frame,
    glowStrength: clamp((elevation + 10) / 10, 0, 1) * (behindViewer ? 0.5 : 1),
    glowX: clamp((azimuth - 90) / 180, -0.15, 1.15),
    glowY,
    glowSize: elevation <= 0 ? 1.1 : 1.1 - 0.7 * clamp(elevation / 30, 0, 1),
    stars: clamp((-4 - elevation) / 8, 0, 1),
    sun: behindViewer ? 0 : clamp((elevation + 1) / 2, 0, 1),
    phase: phaseOf(elevation),
  };
}
