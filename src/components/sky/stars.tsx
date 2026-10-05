interface Star {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly opacity: number;
}

/** mulberry32: a tiny seeded generator, so server and client draw the same sky. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const STARS: readonly Star[] = (() => {
  const random = seeded(47_918_106);
  return Array.from({ length: 130 }, (_, id) => ({
    id,
    x: random() * 100,
    // Denser towards the zenith, where the sky is darkest.
    y: random() ** 1.5 * 74,
    r: 0.45 + random() * 0.95,
    opacity: 0.3 + random() * 0.7,
  }));
})();

export function Stars() {
  return (
    <svg className="sky-stars" width="100%" height="100%" aria-hidden focusable="false">
      {STARS.map((star) => (
        <circle
          key={star.id}
          cx={`${star.x.toFixed(2)}%`}
          cy={`${star.y.toFixed(2)}%`}
          r={star.r.toFixed(2)}
          opacity={star.opacity.toFixed(2)}
          fill="#fff"
        />
      ))}
    </svg>
  );
}
