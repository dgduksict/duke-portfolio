import { blockWindows, ridgeSteps, skylineBlocks, windowLights } from "@/lib/pixel-sky";
import { mixHex, type SkyState } from "@/lib/sky";

/** Seeds for the city's shape and for which flats are home tonight: fixed, so every render draws the same city. */
const BLOCK_SEED = 1206;
const LIGHT_SEED = 77;

/** Window light (the reference's yellow) and a warmer lamp-lit flat for variety. */
export const WINDOW_LIGHT = "#ffd45c";
const WINDOW_WARM = "#f2b53a";
/** The darkest the city gets: silhouettes are mixed towards this from the sky's own colours. */
const CITY_INK = "#0b1024";

/** Before the time is known: plain night silhouettes on the base sky, no light anywhere. */
const BASE = { ridge: "#14204a", block: "#0b1330", shade: "#080e26", glass: "#0f1838" } as const;

export interface CityColours {
  readonly ridge: string;
  readonly block: string;
  readonly shade: string;
  readonly glass: string;
}

/**
 * The city's colours from the sky: the ridge is the horizon hazed towards the zenith (far away, so it takes the sky's
 * colour), the blocks are that ridge pushed towards the city ink (nearer, always darker than the ridge), their shaded
 * side a step darker again, and unlit windows darker still.
 */
export function cityColours(sky: SkyState | null): CityColours {
  if (sky === null) return BASE;
  const ridge = mixHex(mixHex(sky.horizon, sky.zenith, 0.45), CITY_INK, 0.12);
  const block = mixHex(ridge, CITY_INK, 0.5);
  return {
    ridge,
    block,
    shade: mixHex(block, CITY_INK, 0.35),
    glass: mixHex(block, CITY_INK, 0.6),
  };
}

export interface SkylineProps {
  readonly sky: SkyState | null;
  readonly cols: number;
  readonly rows: number;
}

/** The Bogd Khan ridge, far behind the city: one rect per run of equal height, standing on the bottom row. */
export function Ridge({ sky, cols, rows, maxH }: SkylineProps & { readonly maxH: number }) {
  const heights = ridgeSteps(cols, maxH);
  const runs: { x: number; w: number; h: number }[] = [];
  heights.forEach((h, x) => {
    const last = runs.at(-1);
    if (last !== undefined && last.h === h) last.w += 1;
    else runs.push({ x, w: 1, h });
  });
  const fill = cityColours(sky).ridge;
  return (
    <g data-layer="ridge">
      {runs.map((run) => (
        <rect key={run.x} x={run.x} y={rows - run.h} width={run.w} height={run.h} fill={fill} />
      ))}
    </g>
  );
}

/**
 * Ulaanbaatar's blocks in front of the ridge: flat-roofed panel blocks and a few towers (an antenna on the tallest),
 * each with a shaded right side and a grid of one-cell windows. Windows light in the sky's phase (`windowLights`);
 * before the time is known none is lit.
 */
export function Skyline({ sky, cols, rows }: SkylineProps) {
  const colours = cityColours(sky);
  const blocks = skylineBlocks(BLOCK_SEED, cols);
  const tallest = Math.max(...blocks.map((block) => block.h));

  return (
    <g data-layer="skyline">
      {blocks.map((block) => {
        const top = rows - block.h;
        const lit = new Set(sky === null ? [] : windowLights(sky.phase, block, LIGHT_SEED));
        return (
          <g key={block.x}>
            <rect x={block.x} y={top} width={block.w} height={block.h} fill={colours.block} />
            <rect x={block.x + block.w - 1} y={top} width={1} height={block.h} fill={colours.shade} />
            {block.h === tallest ? (
              <rect x={block.x + 1} y={top - 3} width={1} height={3} fill={colours.block} />
            ) : null}
            {blockWindows(block).map((cell, index) => {
              const on = lit.has(index);
              return (
                <rect
                  key={index}
                  x={block.x + cell.x}
                  y={top + cell.y}
                  width={1}
                  height={1}
                  fill={on ? (index % 5 === 3 ? WINDOW_WARM : WINDOW_LIGHT) : colours.glass}
                  data-window={on ? "lit" : "dark"}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}
