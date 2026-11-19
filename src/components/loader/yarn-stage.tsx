import { PixelSprite } from "@/components/cat/pixel-sprite";
import {
  CROUCH_1,
  CROUCH_2,
  POUNCE,
  PROUD,
  RUN_1,
  RUN_2,
  type Sprite,
  TUMBLE,
  YARN_BALL,
  YARN_SIT,
} from "@/components/cat/sprites";

/** The yarn cat's frames by name (`data-cat-frame`), in the order they are drawn. */
const CAT_FRAMES: readonly (readonly [string, Sprite])[] = [
  ["sit", YARN_SIT],
  ["run-1", RUN_1],
  ["run-2", RUN_2],
  ["crouch-1", CROUCH_1],
  ["crouch-2", CROUCH_2],
  ["pounce", POUNCE],
  ["tumble", TUMBLE],
  ["proud", PROUD],
];

/** The yarn cat's shared grid (every frame is 20 x 16) and the ball's (7 x 7), one unit a cell. */
const CAT_W = 20;
const CAT_H = 16;
const BALL_SIZE = 7;

/**
 * The loader's cast: the black cat and his ball of yarn, drawn once and left still. The cat's svg holds every frame
 * (sitting, the two-frame gallop, the two-frame crouch and the three ending poses), each in its own
 * `g[data-cat-frame]`; which one shows, and where the cat and the ball stand on the bar, is the loader's CSS, keyed on
 * the overlay's `data-yarn-motion` and `data-yarn-ending`. Both drawings are one unit a cell, sized by CSS at `--px` a
 * cell, and painted through the fixed `.cat-art` colours (the ball through `--cat-yarn` and `--cat-yarn-shade`).
 * Decorative: hidden from assistive technology (the loader's status label speaks for it).
 */
export function YarnStage() {
  return (
    <div className="yarn-stage" aria-hidden="true">
      <div className="yarn-cat" data-yarn-cat="">
        <svg
          viewBox={`0 0 ${CAT_W} ${CAT_H}`}
          width={CAT_W}
          height={CAT_H}
          focusable="false"
          shapeRendering="crispEdges"
          className="cat-art block"
        >
          {CAT_FRAMES.map(([name, map]) => (
            <g key={name} data-cat-frame={name}>
              <PixelSprite map={map} scale={1} />
            </g>
          ))}
        </svg>
      </div>
      <div className="yarn-ball" data-yarn-ball="">
        <svg
          viewBox={`0 0 ${BALL_SIZE} ${BALL_SIZE}`}
          width={BALL_SIZE}
          height={BALL_SIZE}
          focusable="false"
          shapeRendering="crispEdges"
          className="cat-art block"
        >
          <PixelSprite map={YARN_BALL} scale={1} />
        </svg>
      </div>
    </div>
  );
}
