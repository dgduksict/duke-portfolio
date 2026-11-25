import { ShootingStar } from "@/components/scene/shooting-star";
import { Ridge, Skyline } from "@/components/scene/skyline";
import type { Holiday } from "@/lib/holiday";
import { bandRows, type Cell, pixelStars, quantizeBands, snap } from "@/lib/pixel-sky";
import { fireflies, type Season, snowflakes } from "@/lib/season";
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
/** Winter's snow and summer's fireflies: fixed seeds and counts, like the stars. */
const SNOW_SEED = 20_261_119;
const SNOW_COUNT = 36;
const FIREFLY_SEED = 31_415_926;
const FIREFLY_COUNT = 7;
/** One blink-and-wander loop in seconds (scene.css); the flies' delays spread evenly across it. */
const FIREFLY_PERIOD = 3.6;

/** The window's wooden bars: two uprights (three panes across, so the noon sun is never behind one) and a cross bar. */
const UPRIGHTS = [42, 83] as const;
const CROSS_BAR = 25;
const BAR = 3;

const SUN_CORE = "#fff7dc";
const MOON = "#f4ecd0";
const MOON_SHADE = "#d6cba6";
const STAR = "#fff8e0";
const SNOW_NIGHT = "#fff8e0";
const SNOW_DAY = "#ffffff";
const FIREFLY = "#ffe58a";

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

const FLAKES = snowflakes(SNOW_SEED, SNOW_COUNT, GLASS_COLS, GLASS_ROWS);
const FIREFLIES = fireflies(FIREFLY_SEED, FIREFLY_COUNT, GLASS_COLS, GLASS_ROWS);

/**
 * Falling snow: one-cell flakes in two depths (the near ones fall faster and are brighter, the far ones slower and
 * dimmer). Each flake is drawn twice, at its cell and one glass height above it, and the group steps down by exactly that height, so the loop
 * has no seam (see scene.css). A one-cell sideways drift runs on an inner group.
 */
function Snow({ night }: { night: boolean }) {
  return (
    <g data-layer="snow" fill={night ? SNOW_NIGHT : SNOW_DAY} opacity="0.9">
      {([0, 1] as const).map((depth) => (
        <g key={depth} className={`scene-snow-${depth}`} opacity={depth === 0 ? 0.7 : 1}>
          <g className="scene-snow-drift">
            {FLAKES.filter((flake) => flake.depth === depth).flatMap((flake, i) =>
              [flake.y, flake.y - GLASS_ROWS].map((y) => (
                <rect key={`${i}.${y}`} x={flake.x} y={y} width={1} height={1} />
              )),
            )}
          </g>
        </g>
      ))}
    </g>
  );
}

/** A few fireflies low over the roofs, each blinking and wandering a cell or two out of step with the others. */
function Fireflies() {
  return (
    <g data-layer="fireflies" fill={FIREFLY}>
      {FIREFLIES.map((cell, i) => (
        <rect
          key={i}
          className="scene-firefly"
          style={{ animationDelay: `${((-i * FIREFLY_PERIOD) / FIREFLY_COUNT).toFixed(2)}s` }}
          x={cell.x}
          y={cell.y}
          width={1}
          height={1}
        />
      ))}
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

/*
 * The holiday string across the top of the glass: a wire hung from the frame in eight shallow scallops (16 cells
 * each, dipping two cells in the middle), drawn after the bars because it hangs on the room side of the window. The
 * picture is pinned to the bottom centre of the glass, so its top rows are the glass's top rows and a narrow window
 * crops the string's ends like the rest of the picture.
 */
const SCALLOP = 16;

/** How far the string hangs below the glass's top edge at column `x`: 0 at the hooks, 1, then 2 in the middle. */
function sag(x: number): number {
  const t = x % SCALLOP;
  const d = Math.min(t, SCALLOP - 1 - t);
  return d < 2 ? 0 : d < 5 ? 1 : 2;
}

/** The string itself, as one rect per run of cells on the same row. */
function wire(): { x: number; y: number; w: number }[] {
  const runs: { x: number; y: number; w: number }[] = [];
  for (let x = 0; x < GLASS_COLS; x += 1) {
    const last = runs.at(-1);
    if (last !== undefined && last.y === sag(x) && last.x + last.w === x) last.w += 1;
    else runs.push({ x, y: sag(x), w: 1 });
  }
  return runs;
}

const WIRE = wire();
const BULB_COLOURS = ["red", "amber", "green", "blue"] as const;
/**
 * Two bulbs per scallop, a quarter in from each hook. The left one is set A, the right one set B (they blink in turn),
 * and the colours rotate so that each set holds all four and no two neighbours match.
 */
const BULBS = Array.from({ length: (GLASS_COLS / SCALLOP) * 2 }, (_, i) => {
  const scallop = Math.floor(i / 2);
  const right = i % 2;
  const x = scallop * SCALLOP + (right === 0 ? 4 : 11);
  return {
    x,
    y: sag(x) + 1,
    colour: BULB_COLOURS[(scallop + 2 * right) % BULB_COLOURS.length],
    set: right === 0 ? "a" : "b",
  };
});

/**
 * Christmas: fairy lights. Each bulb hangs from the wire on a one-cell socket, a 2 x 2 glass with a lit corner; the
 * two sets dim and light in turn, in steps (scene.css). Under reduced motion every bulb stays lit.
 */
function FairyLights() {
  return (
    <g data-layer="fairy-lights">
      {WIRE.map((run) => (
        <rect key={run.x} x={run.x} y={run.y} width={run.w} height={1} fill="var(--scene-wood-deep)" />
      ))}
      {BULBS.map((bulb) => (
        <g key={bulb.x}>
          <rect x={bulb.x} y={bulb.y} width={1} height={1} fill="var(--scene-wood-deep)" />
          <g className={`scene-bulb scene-bulb-${bulb.set}`}>
            <rect x={bulb.x} y={bulb.y + 1} width={2} height={2} fill={`var(--scene-bulb-${bulb.colour})`} />
            <rect x={bulb.x} y={bulb.y + 1} width={1} height={1} fill="var(--scene-bulb-shine)" />
          </g>
        </g>
      ))}
    </g>
  );
}

/** The birthday's pennants: room colours and the accent, in turn along the string. */
const FLAG_COLOURS = ["--accent", "--scene-pot", "--scene-leaf", "--scene-book", "--scene-paper"] as const;
/** Two pennants per scallop, 5 cells wide and 3 deep, each hung from the wire at its centre. */
const FLAGS = Array.from({ length: (GLASS_COLS / SCALLOP) * 2 }, (_, i) => {
  const x = Math.floor(i / 2) * SCALLOP + (i % 2 === 0 ? 2 : 9);
  return { x, y: sag(x + 2) + 1, colour: FLAG_COLOURS[i % FLAG_COLOURS.length] };
});

/** The birthday: a string of triangular bunting along the top of the glass. Still: flags do not need to move. */
function Bunting() {
  return (
    <g data-layer="bunting">
      {WIRE.map((run) => (
        <rect key={run.x} x={run.x} y={run.y} width={run.w} height={1} fill="var(--scene-wood-deep)" />
      ))}
      {FLAGS.map((flag) => (
        <g key={flag.x} fill={`var(${flag.colour})`}>
          <rect x={flag.x} y={flag.y} width={5} height={1} />
          <rect x={flag.x + 1} y={flag.y + 1} width={3} height={1} />
          <rect x={flag.x + 2} y={flag.y + 2} width={1} height={1} />
        </g>
      ))}
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
  /** Winter drops snow on the glass, summer lights fireflies on its nights; `null` (the default) shows neither. */
  readonly season?: Season | null;
  /** Christmas strings fairy lights across the top of the glass, the birthday bunting; `null` (the default) neither. */
  readonly holiday?: Holiday | null;
}

/**
 * The window glass: the live sky over Ulaanbaatar quantised into flat bands, a stepped glow and a pixel sun on the
 * sun's computed spot (or a moon opposite it), grid stars, the Bogd Khan ridge and the city skyline in front, then
 * the season's snow or fireflies, the window's own bars and glints and, on a holiday, its lights or bunting. One cell
 * is one pixel unit; the picture is pinned to the bottom centre of the glass, so a narrow window crops its sides. Carries `data-ready`/`data-phase` like the old smooth sky did.
 */
export function PixelSky({ sky, moon, season = null, holiday = null }: PixelSkyProps) {
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
            <ShootingStar active={sky.phase === "night"} />
            {moonAt !== null ? <Moon at={moonAt} strength={sky.stars} /> : null}
            <Sun sky={sky} at={sunAt} />
          </>
        ) : null}
        <Ridge sky={sky} cols={GLASS_COLS} rows={GLASS_ROWS} maxH={RIDGE_MAX} />
        <Skyline sky={sky} cols={GLASS_COLS} rows={GLASS_ROWS} />
        {sky !== null && season === "winter" ? <Snow night={sky.phase === "night"} /> : null}
        {sky !== null && season === "summer" && sky.phase === "night" ? <Fireflies /> : null}
        <Glints />
        <Bars />
        {holiday === "christmas" ? <FairyLights /> : null}
        {holiday === "birthday" ? <Bunting /> : null}
      </svg>
    </div>
  );
}
