import { CatArt, hatFor } from "@/components/cat/cat-art";
import { type CatState, rulerCatPose } from "@/lib/cat";
import type { Holiday } from "@/lib/holiday";

export interface RulerCatProps {
  /** Awake (day) or asleep (night); `null` while the client does not know the time, which draws nothing. */
  readonly state: CatState | null;
  /** Milliseconds since the page last scrolled. */
  readonly msSinceScroll: number;
  /** How far down the page the needle is, 0..1. */
  readonly progress: number;
  /** The holiday he dresses up for (a Santa hat at Christmas, a party hat on the birthday); none on an ordinary day. */
  readonly holiday?: Holiday | null;
}

/**
 * The little cat that rides the ruler's needle: the mini drawing in the pose `rulerCatPose` picks (types while the page
 * scrolls, sits, grooms after a long pause, naps at the bottom, sleeps at night). He faces the page, which is to the
 * left of the rail: the drawings face right, so the wrapper mirrors them (cat.css, `.ruler-cat`) and mirrors the z's
 * back so they stay readable; no `cat-*` part is flipped itself. The wrapper never takes the pointer, so the rail
 * beneath it keeps clicking and dragging. On a holiday he wears its hat in every pose (the ruler reads the holiday).
 *
 * Presentation only: the ruler decides where he stands, when he shows and when his pose changes (see ruler.tsx),
 * and mounts him inside the needle above the percent plate. The motion lives in cat.css under `.ruler-cat`.
 */
export function RulerCat({ state, msSinceScroll, progress, holiday = null }: RulerCatProps) {
  if (state === null) return null;
  const pose = rulerCatPose({ state, msSinceScroll, progress });
  return (
    <div className="ruler-cat pointer-events-none" data-facing="left" aria-hidden="true">
      <div className="ruler-cat-hop">
        <CatArt variant="mini" pose={pose} hat={hatFor(holiday)} />
      </div>
    </div>
  );
}
