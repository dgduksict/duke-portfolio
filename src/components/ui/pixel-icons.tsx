import type { SVGProps } from "react";

/**
 * Small icons drawn on a pixel grid, one square per lit cell. They replace the rounded
 * line icons so every glyph in the page shares the pixel world's hard corners.
 * `#` is lit, anything else is empty. Colour follows the text (currentColor).
 */
const ICONS = {
  sun: [
    "...##...",
    ".#....#.",
    "..####..",
    "#.####.#",
    "#.####.#",
    "..####..",
    ".#....#.",
    "...##...",
  ],
  moon: [
    "..####..",
    ".###....",
    "###.....",
    "###.....",
    "###....#",
    "###...##",
    ".###.###",
    "..#####.",
  ],
  menu: ["########", "........", "........", "########", "........", "........", "########"],
  close: [
    "##...##",
    "###.###",
    ".#####.",
    "..###..",
    ".#####.",
    "###.###",
    "##...##",
  ],
  "arrow-up-right": [
    "..#####",
    "...####",
    "....###",
    "...#.##",
    "..#...#",
    ".#.....",
    "#......",
  ],
  copy: [
    "######..",
    "#....#..",
    "#.######",
    "#.#....#",
    "#.#....#",
    "###....#",
    "..######",
  ],
  check: ["......##", ".....##.", "##..##..", ".####...", "..##...."],
  phone: ["######", "#....#", "#....#", "#....#", "#....#", "#....#", "#.##.#", "######"],
} as const satisfies Record<string, readonly string[]>;

export type PixelIconName = keyof typeof ICONS;

export interface PixelIconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  readonly name: PixelIconName;
  /** CSS pixels per grid cell; whole numbers keep the squares crisp. */
  readonly cell?: number;
}

export function PixelIcon({ name, cell = 2, ...props }: PixelIconProps) {
  const rows: readonly string[] = ICONS[name];
  const width = rows[0]?.length ?? 0;
  const height = rows.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width * cell}
      height={height * cell}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {rows.flatMap((row, y) =>
        Array.from(row.matchAll(/#+/g), (run) => (
          <rect key={`${y}-${run.index}`} x={run.index} y={y} width={run[0].length} height={1} />
        )),
      )}
    </svg>
  );
}
