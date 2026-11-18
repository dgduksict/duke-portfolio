import { Ridge, Skyline } from "@/components/scene/skyline";
import { bandRows, type Cell, pixelStars, quantizeBands, snap } from "@/lib/pixel-sky";
import type { SkyState } from "@/lib/sky";

/** The picture behind the glass, in cells (one cell is one `--u`). The glass may show less of it on a narrow screen. */
export const GLASS_COLS = 128;
export const GLASS_ROWS = 64;
/** How many flat stripes the sky is quantised into, and how tall the ridge may stand. */
const BANDS = 12;
const RIDGE_MAX = 19;
/** The star field: a fixed seed, a count, and the rows above the city it may use. */
const STAR_SEED = 47_918_106;
const STAR_COUNT = 46;
const STAR_ROWS = 44;

/** The window's wooden bars: two uprights (three panes across, so the noon sun is never behind one) and a cross bar. */
const UPRIGHTS = [42, 83] as const;
const CROSS_BAR = 25;
const BAR = 3;

const SUN_CORE = "#fff7dc";
const MOON = "#f4ecd0";
const MOON_SHADE = "#d6cba6";
const STAR = "#fff8e0";

/** The rows of a pixel disc of radius `r` around a cell, as one span per row. */
function disc(cx: number, cy: number, r: number): { x: number; y: number; w: number }[] {
  return Array.from({ length: 2 * r + 1 }, (_, i) => {
    const dy = i - r;
    const half = Math.floor(Math.sqrt(Math.max(0, (r + 0.5) ** 2 - dy * dy)));
    return { x: cx - half, y: cy + dy, w: 2 * half + 1 };
  });
}

/** Stepped rings of the glow colour around the sun: flat layers, never a blend. */
function Halo({ sky, at }: { sky: SkyState; at: Cell }) {
  if (sky.glowStrength <= 0) return null;
  const rings = [
    { r: 12, alpha: 0.12 },
    { r: 8, alpha: 0.16 },
    { r: 5, alpha: 0.22 },
  ];
  return (
    <g data-layer="halo" fill={sky.glow}>
      {rings.map((ring) => (
        <g key={ring.r} opacity={(ring.alpha * sky.glowStrength).toFixed(3)}>
          {disc(at.x, at.y, ring.r).map((row) => (
            <rect key={row.y} x={row.x} y={row.y} width={row.w} height={1} />
          ))}
        </g>
      ))}
    </g>
  );
}

function Sun({ sky, at }: { sky: SkyState; at: Cell }) {
  if (sky.sun <= 0) return null;
  return (
    <g data-sun="" opacity={sky.sun.toFixed(3)}>
      {disc(at.x, at.y, 3).map((row) => (
        <rect key={row.y} x={row.x} y={row.y} width={row.w} height={1} fill={SUN_CORE} />
      ))}
    </g>
  );
}

/** A full moon with two darker seas, as bright as the stars are out. */
function Moon({ at, strength }: { at: Cell; strength: number }) {
  if (strength <= 0) return null;
  return (
    <g data-moon="" opacity={Math.min(1, 0.35 + strength).toFixed(3)}>
      {disc(at.x, at.y, 3).map((row) => (
        <rect key={row.y} x={row.x} y={row.y} width={row.w} height={1} fill={MOON} />
      ))}
      <rect x={at.x - 1} y={at.y - 1} width={2} height={1} fill={MOON_SHADE} />
      <rect x={at.x + 1} y={at.y + 1} width={1} height={2} fill={MOON_SHADE} />
    </g>
  );
}

const STARS = pixelStars(STAR_SEED, STAR_COUNT, GLASS_COLS, STAR_ROWS);

/** Grid stars; every fourth one twinkles (stepped, see scene.css) and a few bright ones get a cross of light. */
function Stars({ strength }: { strength: number }) {
  if (strength <= 0) return null;
  return (
    <g data-layer="stars" fill={STAR} opacity={strength.toFixed(3)}>
      {STARS.map((star, i) => {
        const twinkle = i % 4 === 1 ? `scene-twinkle scene-twinkle-${i % 3}` : undefined;
        if (i % 13 === 5) {
          return (
            <g key={i} data-star="" className={twinkle}>
              <rect x={star.x - 1} y={star.y} width={3} height={1} />
              <rect x={star.x} y={star.y - 1} width={1} height={3} />
            </g>
          );
        }
        return <rect key={i} data-star="" className={twinkle} x={star.x} y={star.y} width={1} height={1} />;
      })}
    </g>
  );
}

/** The wooden bars across the glass, each with a lit edge and a shaded one (theme colours, like the frame). */
function Bars() {
  return (
    <g data-layer="bars">
      {UPRIGHTS.map((x) => (
        <g key={x}>
          <rect x={x} y={0} width={BAR} height={GLASS_ROWS} fill="var(--scene-wood)" />
          <rect x={x} y={0} width={1} height={GLASS_ROWS} fill="var(--scene-wood-hi)" />
          <rect x={x + BAR - 1} y={0} width={1} height={GLASS_ROWS} fill="var(--scene-wood-dark)" />
        </g>
      ))}
      <rect x={0} y={CROSS_BAR} width={GLASS_COLS} height={BAR} fill="var(--scene-wood)" />
      <rect x={0} y={CROSS_BAR} width={GLASS_COLS} height={1} fill="var(--scene-wood-hi)" />
      <rect x={0} y={CROSS_BAR + BAR - 1} width={GLASS_COLS} height={1} fill="var(--scene-wood-dark)" />
    </g>
  );
}

/** Two short diagonal glints on the glass, the pixel-art shorthand for "this is a window". */
function Glints() {
  const streak = (x: number, y: number, length: number) =>
    Array.from({ length }, (_, i) => <rect key={`${x}.${i}`} x={x + i} y={y - i} width={1} height={1} />);
  return (
    <g data-layer="glints" fill="#ffffff" opacity="0.2">
      {streak(5, 12, 6)}
      {streak(8, 12, 3)}
      {streak(50, 20, 5)}
    </g>
  );
}

export interface PixelSkyProps {
  /** `null` until the client knows the time: the glass then shows the base colour and a dark, unlit city. */
  readonly sky: SkyState | null;
  /** Where the moon sits (fractions of the glass), or `null` for no moon. */
  readonly moon: Cell | null;
}

/**
 * The window glass: the live sky over Ulaanbaatar quantised into flat bands, a stepped glow and a pixel sun on the
 * sun's computed spot (or a moon opposite it), grid stars, the Bogd Khan ridge and the city skyline in front, then
 * the window's own bars and glints. One cell is one pixel unit; the picture is pinned to the bottom centre of the
 * glass, so a narrow window crops its sides. Carries `data-ready`/`data-phase` like the old smooth sky did.
 */
export function PixelSky({ sky, moon }: PixelSkyProps) {
  const bands = sky === null ? [] : quantizeBands(sky, BANDS);
  const rows = bandRows(GLASS_ROWS, BANDS);
  const sunAt =
    sky === null ? null : { x: snap(sky.glowX * GLASS_COLS, 1), y: snap(sky.glowY * GLASS_ROWS, 1) };
  const moonAt = moon === null ? null : { x: snap(moon.x * GLASS_COLS, 1), y: snap(moon.y * GLASS_ROWS, 1) };

  return (
    <div className="scene-sky" data-ready={sky === null ? "false" : "true"} data-phase={sky?.phase}>
      <svg
        className="scene-sky-art"
        viewBox={`0 0 ${GLASS_COLS} ${GLASS_ROWS}`}
        width={GLASS_COLS * 4}
        height={GLASS_ROWS * 4}
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
      >
        {bands.map((fill, i) => (
          <rect key={i} data-band="" x={0} y={rows[i]?.y} width={GLASS_COLS} height={rows[i]?.h} fill={fill} />
        ))}
        {sky !== null && sunAt !== null ? (
          <>
            <Halo sky={sky} at={sunAt} />
            <Stars strength={sky.stars} />
            {moonAt !== null ? <Moon at={moonAt} strength={sky.stars} /> : null}
            <Sun sky={sky} at={sunAt} />
          </>
        ) : null}
        <Ridge sky={sky} cols={GLASS_COLS} rows={GLASS_ROWS} maxH={RIDGE_MAX} />
        <Skyline sky={sky} cols={GLASS_COLS} rows={GLASS_ROWS} />
        <Glints />
        <Bars />
      </svg>
    </div>
  );
}
