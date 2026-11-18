/** The ridges' viewBox, in its own units. */
export const RIDGE_WIDTH = 1600;
export const RIDGE_HEIGHT = 240;

type Wave = readonly [amplitude: number, period: number, phase: number];

/** The ridge line's height at x: a base level less a sum of sines. */
function waveY(base: number, waves: readonly Wave[], x: number): number {
  return waves.reduce(
    (sum, [amplitude, period, phase]) => sum - amplitude * Math.sin((x / period) * Math.PI * 2 + phase),
    base,
  );
}

/**
 * A ridge's top edge as an open path, smoothed through segment midpoints. Long
 * waves give the massif its shape; short ones the forested texture of its top.
 */
function ridgeEdge(base: number, waves: readonly Wave[], step = 16): string {
  const points: [number, number][] = [];
  for (let x = 0; x <= RIDGE_WIDTH; x += step) {
    points.push([x, waveY(base, waves, x)]);
  }

  const first = points[0]!;
  const last = points[points.length - 1]!;
  let d = `${first[0]} ${first[1].toFixed(1)}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const [x, y] = points[index]!;
    const [nextX, nextY] = points[index + 1]!;
    d += ` Q${x} ${y.toFixed(1)} ${((x + nextX) / 2).toFixed(1)} ${((y + nextY) / 2).toFixed(1)}`;
  }
  return `${d} L${last[0]} ${last[1].toFixed(1)}`;
}

/** The filled ridge: up the left side, along the edge, down the right side and closed. */
function ridgePath(base: number, waves: readonly Wave[]): string {
  return `M0 ${RIDGE_HEIGHT} L${ridgeEdge(base, waves)} L${RIDGE_WIDTH} ${RIDGE_HEIGHT} Z`;
}

/** Bogd Khan Uul from the city: a long, rounded massif, with a hazier range behind. */
const FAR_WAVES: readonly Wave[] = [
  [34, 2600, 3.9],
  [18, 820, 1.2],
  [7, 300, 2.6],
  [1.4, 70, 0.5],
];
const NEAR_BASE = 172;
const NEAR_WAVES: readonly Wave[] = [
  [40, 3000, 1.1],
  [24, 1050, 2.2],
  [10, 410, 0.4],
  [2.4, 110, 1.6],
  [0.7, 31, 2.9],
];

const FAR_RIDGE = ridgePath(118, FAR_WAVES);
const NEAR_RIDGE = ridgePath(NEAR_BASE, NEAR_WAVES);

/** The near ridge's open top edge (no closing fill segment), for things that sit on the ridge. */
export const NEAR_RIDGE_EDGE = `M${ridgeEdge(NEAR_BASE, NEAR_WAVES)}`;

/**
 * The near ridge's top at x, in viewBox units (y grows downwards). x is clamped to the ridge's width and a
 * non-finite x counts as 0, so the result is always a finite y.
 */
export function nearRidgeY(x: number): number {
  const clamped = Number.isFinite(x) ? Math.min(Math.max(x, 0), RIDGE_WIDTH) : 0;
  return waveY(NEAR_BASE, NEAR_WAVES, clamped);
}

export function Ridges() {
  return (
    <svg
      className="sky-ridges"
      viewBox={`0 0 ${RIDGE_WIDTH} ${RIDGE_HEIGHT}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
      focusable="false"
    >
      <path className="ridge-far" d={FAR_RIDGE} />
      <path className="ridge-near" d={NEAR_RIDGE} />
    </svg>
  );
}
