const WIDTH = 1600;
const HEIGHT = 240;

type Wave = readonly [amplitude: number, period: number, phase: number];

/**
 * A ridge line as a sum of sines, smoothed through segment midpoints. Long
 * waves give the massif its shape; short ones the forested texture of its top.
 */
function ridgePath(base: number, waves: readonly Wave[], step = 16): string {
  const points: [number, number][] = [];
  for (let x = 0; x <= WIDTH; x += step) {
    const y = waves.reduce(
      (sum, [amplitude, period, phase]) => sum - amplitude * Math.sin((x / period) * Math.PI * 2 + phase),
      base,
    );
    points.push([x, y]);
  }

  const first = points[0]!;
  const last = points[points.length - 1]!;
  let d = `M0 ${HEIGHT} L${first[0]} ${first[1].toFixed(1)}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const [x, y] = points[index]!;
    const [nextX, nextY] = points[index + 1]!;
    d += ` Q${x} ${y.toFixed(1)} ${((x + nextX) / 2).toFixed(1)} ${((y + nextY) / 2).toFixed(1)}`;
  }
  return `${d} L${last[0]} ${last[1].toFixed(1)} L${WIDTH} ${HEIGHT} Z`;
}

/** Bogd Khan Uul from the city: a long, rounded massif, with a hazier range behind. */
const FAR_RIDGE = ridgePath(118, [
  [34, 2600, 3.9],
  [18, 820, 1.2],
  [7, 300, 2.6],
  [1.4, 70, 0.5],
]);

const NEAR_RIDGE = ridgePath(172, [
  [40, 3000, 1.1],
  [24, 1050, 2.2],
  [10, 410, 0.4],
  [2.4, 110, 1.6],
  [0.7, 31, 2.9],
]);

export function Ridges() {
  return (
    <svg
      className="sky-ridges"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
      focusable="false"
    >
      <path className="ridge-far" d={FAR_RIDGE} />
      <path className="ridge-near" d={NEAR_RIDGE} />
    </svg>
  );
}
