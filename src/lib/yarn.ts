// Pure rules for the loading screen's ball of yarn: which yarn and ending a visit gets, where the ball and the chasing
// cat sit on the bar, and when the chase counts as stalled. No DOM and no clock in here, so it is unit-tested.

/** The colour of the ball of yarn. */
export type YarnColour = "amber" | "rose" | "sky";

/** How the chase ends once the bar is full: the cat pounces, the ball tumbles away, or the cat just sits. */
export type YarnEnding = "pounce" | "tumble" | "sit";

const COLOURS: readonly YarnColour[] = ["amber", "rose", "sky"];
const ENDINGS: readonly YarnEnding[] = ["pounce", "tumble", "sit"];

/**
 * The chase's numbers.
 * - `ballStart`: the ball never sits left of this many blocks from the bar's left edge, so it is visible from the start.
 * - `catGap`: how many blocks the cat trails behind the ball.
 * - `stallMs`: with no new block for this long (and the bar not full) the cat looks puzzled instead of running.
 * - `endingMs`: how long the ending plays once the bar is full.
 */
export const YARN = { ballStart: 4, catGap: 4, stallMs: 800, endingMs: 700 } as const;

/** The index of a draw `r` (0 to 1) among `count` choices. A draw of 1 stays in range; NaN counts as 0. */
const indexOf = (r: number, count: number) => (Number.isNaN(r) ? 0 : Math.min(count - 1, Math.floor(r * count)));

/**
 * Picks this visit's yarn colour and ending from `random` (like `Math.random`). It makes exactly two draws, the colour
 * first, then the ending. A draw of 1 lands on the last choice and a NaN draw counts as 0, so the result is always
 * defined.
 */
export function pickYarn(random: () => number): { colour: YarnColour; ending: YarnEnding } {
  const colour = COLOURS[indexOf(random(), COLOURS.length)] as YarnColour;
  const ending = ENDINGS[indexOf(random(), ENDINGS.length)] as YarnEnding;
  return { colour, ending };
}

/**
 * Where the ball and the cat sit, in blocks from the bar's left edge, with `filled` of `blocks` lit. The ball rides the
 * leading edge of the fill but never left of `YARN.ballStart` and never past the bar's end; the cat trails it by
 * `YARN.catGap` and never goes left of 0.
 */
export function yarnPositions(filled: number, blocks: number): { ball: number; cat: number } {
  const ball = Math.min(blocks, Math.max(0, Math.max(filled, YARN.ballStart)));
  return { ball, cat: Math.max(0, ball - YARN.catGap) };
}

/** Whether the chase has stalled: `YARN.stallMs` or more since the last block lit, and the bar is not yet full. */
export function isStalled(msSinceLastBlock: number, filled: number, blocks: number): boolean {
  return msSinceLastBlock >= YARN.stallMs && filled < blocks;
}
