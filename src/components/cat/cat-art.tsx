import { isBlank, pickColours, PixelSprite, splitParts } from "@/components/cat/pixel-sprite";
import {
  type CatPart,
  HERO_BACK,
  HERO_DAY,
  HERO_DAY_PARTS,
  HERO_FRONT,
  HERO_NIGHT,
  HERO_NIGHT_PARTS,
  LAPTOP,
  MINI_GROOM,
  MINI_LAPTOP,
  MINI_NAP,
  MINI_PARTS,
  MINI_SIT,
  MINI_SLEEP,
  MINI_TYPE,
  MUG,
  SCREEN_COLOURS,
  SPIN_BODY,
  type Sprite,
  STEAM_1,
  STEAM_2,
  Z_BIG,
  Z_SMALL,
} from "@/components/cat/sprites";
import type { CatState, RulerPose } from "@/lib/cat";
import { cn } from "@/lib/utils";

export type CatArtProps = (
  | {
      variant: "hero";
      state: CatState;
      /**
       * The easter egg: he is up and awake whatever the hour, turning on the spot in four drawn frames (side, front,
       * side mirrored, back) in their own `cat-spin` group for cat.css to cycle. By day the laptop stays where it is; by
       * night the mug stays and he sits where the loaf was.
       */
      uiia?: boolean;
    }
  | { variant: "mini"; pose: RulerPose }
) & {
  className?: string;
};

/** Hero sprites are 28 x 28 pixels at 6 units each; minis 16 x 16 at 3 units each. */
const HERO_GRID = 28;
const HERO_SCALE = 6;
const MINI_GRID = 16;
const MINI_SCALE = 3;

/** Where the props sit on the cat's grid (their top left, in pixels). */
const LAPTOP_AT = { x: 17, y: 17 } as const;
const MUG_AT = { x: 0, y: 22 } as const;
const STEAM_AT = { x: 2, y: 14 } as const;
const Z_BIG_AT = { x: 21, y: 6 } as const;
const Z_SMALL_AT = { x: 25, y: 1 } as const;
const MINI_LAPTOP_AT = { x: 10, y: 10 } as const;
const MINI_Z_AT = { x: 13, y: 1 } as const;
/**
 * By night the spinning cat sits eight pixels right of his day spot, on the loaf's place: clear of the mug, and every
 * frame of the turn (columns 0-20, SPIN_BODY) reaches past the slot by no more than a pixel, onto the window frame.
 */
const NIGHT_SPIN_SHIFT = 8;

/** Each drawing split into its animated parts once, at module load. */
const DAY = splitParts(HERO_DAY, HERO_DAY_PARTS);
const NIGHT = splitParts(HERO_NIGHT, HERO_NIGHT_PARTS);
const MINI: Record<RulerPose, Record<CatPart, Sprite>> = {
  type: splitParts(MINI_TYPE, MINI_PARTS.type),
  sit: splitParts(MINI_SIT, MINI_PARTS.sit),
  groom: splitParts(MINI_GROOM, MINI_PARTS.groom),
  sleep: splitParts(MINI_SLEEP, MINI_PARTS.sleep),
  nap: splitParts(MINI_NAP, MINI_PARTS.nap),
};
const LAPTOP_CASE = pickColours(LAPTOP, SCREEN_COLOURS, false);
const LAPTOP_SCREEN = pickColours(LAPTOP, SCREEN_COLOURS);
const MINI_LAPTOP_CASE = pickColours(MINI_LAPTOP, SCREEN_COLOURS, false);
const MINI_LAPTOP_SCREEN = pickColours(MINI_LAPTOP, SCREEN_COLOURS);

/**
 * The programmer cat as pixel art: a black silhouette with a 1-pixel lighter rim, sitting smug and chin-up at his
 * laptop by day, loafed asleep beside a steaming mug by night. Inline SVG rects only (sprites.ts holds the bitmaps,
 * pixel-sprite.tsx draws them), decorative (aria-hidden), painted only through the fixed `.cat-art` colour variables
 * in cat.css so a theme flip never repaints him.
 *
 * Two scales: `hero` (28 x 28 pixels, 168 units) and `mini` (16 x 16 pixels, 48 units; the ruler cat's five poses).
 * Every part that moves is its own group with a `cat-*` class (head holding ear-l, ear-r and eye; tail, body, paw-l,
 * paw-r; screen; zzz; steam). Placement lives in the rects' coordinates, so no `cat-*` group carries a transform and
 * CSS is free to animate them. The sprites need no ids.
 */
export function CatArt(props: CatArtProps) {
  if (props.variant === "hero") {
    const size = HERO_GRID * HERO_SCALE;
    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
        shapeRendering="crispEdges"
        className={cn("cat-art block overflow-visible", props.className)}
        data-state={props.state}
        data-uiia={props.uiia === true ? "" : undefined}
      >
        {props.uiia === true ? <HeroSpin state={props.state} /> : props.state === "day" ? <HeroDay /> : <HeroNight />}
      </svg>
    );
  }
  const size = MINI_GRID * MINI_SCALE;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      overflow="visible"
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
      className={cn("cat-art block overflow-visible", props.className)}
      data-pose={props.pose}
    >
      <Mini pose={props.pose} />
    </svg>
  );
}

/** One part layer, or nothing when the drawing has no pixels for it. */
function Part({ parts, part, scale }: { parts: Record<CatPart, Sprite>; part: CatPart; scale: number }) {
  const map = parts[part];
  return isBlank(map) ? null : <PixelSprite map={map} scale={scale} className={`cat-${part}`} />;
}

/** The eye's pixels in ink: the head is drawn with a socket under the eye, so the eye can glance without a hole. */
const socket = (eye: Sprite): Sprite => eye.map((row) => row.replaceAll("e", "k"));

/** The cat's layers, back to front: tail, body, head (with its ears and eye), paws. */
function Cat({ parts, scale }: { parts: Record<CatPart, Sprite>; scale: number }) {
  return (
    <>
      <Part parts={parts} part="tail" scale={scale} />
      <Part parts={parts} part="body" scale={scale} />
      <g className="cat-head">
        <PixelSprite map={parts.head} scale={scale} />
        <PixelSprite map={socket(parts.eye)} scale={scale} />
        <Part parts={parts} part="ear-l" scale={scale} />
        <Part parts={parts} part="ear-r" scale={scale} />
        <Part parts={parts} part="eye" scale={scale} />
      </g>
      <Part parts={parts} part="paw-l" scale={scale} />
      <Part parts={parts} part="paw-r" scale={scale} />
    </>
  );
}

function HeroDay() {
  return (
    <>
      <PixelSprite map={LAPTOP_CASE} scale={HERO_SCALE} {...LAPTOP_AT} layer="laptop" />
      <PixelSprite map={LAPTOP_SCREEN} scale={HERO_SCALE} {...LAPTOP_AT} className="cat-screen" />
      <Cat parts={DAY} scale={HERO_SCALE} />
    </>
  );
}

function HeroNight() {
  return (
    <>
      <PixelSprite map={MUG} scale={HERO_SCALE} {...MUG_AT} layer="mug" />
      <PixelSprite map={STEAM_1} scale={HERO_SCALE} {...STEAM_AT} className="cat-steam" layer="steam-1" />
      <PixelSprite map={STEAM_2} scale={HERO_SCALE} {...STEAM_AT} className="cat-steam" layer="steam-2" />
      <Cat parts={NIGHT} scale={HERO_SCALE} />
      <g className="cat-zzz">
        <PixelSprite map={Z_BIG} scale={HERO_SCALE} {...Z_BIG_AT} />
        <PixelSprite map={Z_SMALL} scale={HERO_SCALE} {...Z_SMALL_AT} />
      </g>
    </>
  );
}

/** The side view mirrored about his own body (columns SPIN_BODY), not the frame: he turns on the spot. */
const SPIN_MIRROR = `translate(${(SPIN_BODY.x1 + 1) * HERO_SCALE} 0) scale(-1 1)`;
/** The front and back frames sit one cell higher: a little hop each half-turn. */
const SPIN_LIFT = `translate(0 -${HERO_SCALE})`;

/**
 * The easter egg's drawing: he turns on the spot like the meme cat, in four drawn frames inside a `cat-spin` group
 * (side, front, side mirrored, back, each a `cat-spin-frame`), which cat.css shows one at a time. The side frames are
 * the day silhouette (awake, sitting up) on the sill; the front and back are lifted a cell. By day it keeps the laptop
 * beside him; by night the mug (and its steam) with him shifted onto the loaf's spot, and no z's. Every placement is
 * on a plain wrapper, never on a `cat-*` part.
 */
function HeroSpin({ state }: { state: CatState }) {
  const cat = (
    <g className="cat-spin">
      <g className="cat-spin-frame" data-frame="side">
        <Cat parts={DAY} scale={HERO_SCALE} />
      </g>
      <g className="cat-spin-frame" data-frame="front">
        <g transform={SPIN_LIFT}>
          <PixelSprite map={HERO_FRONT} scale={HERO_SCALE} />
        </g>
      </g>
      <g className="cat-spin-frame" data-frame="mirror">
        <g transform={SPIN_MIRROR}>
          <Cat parts={DAY} scale={HERO_SCALE} />
        </g>
      </g>
      <g className="cat-spin-frame" data-frame="back">
        <g transform={SPIN_LIFT}>
          <PixelSprite map={HERO_BACK} scale={HERO_SCALE} />
        </g>
      </g>
    </g>
  );
  if (state === "day") {
    return (
      <>
        <PixelSprite map={LAPTOP_CASE} scale={HERO_SCALE} {...LAPTOP_AT} layer="laptop" />
        <PixelSprite map={LAPTOP_SCREEN} scale={HERO_SCALE} {...LAPTOP_AT} className="cat-screen" />
        {cat}
      </>
    );
  }
  return (
    <>
      <PixelSprite map={MUG} scale={HERO_SCALE} {...MUG_AT} layer="mug" />
      <PixelSprite map={STEAM_1} scale={HERO_SCALE} {...STEAM_AT} className="cat-steam" layer="steam-1" />
      <PixelSprite map={STEAM_2} scale={HERO_SCALE} {...STEAM_AT} className="cat-steam" layer="steam-2" />
      <g transform={`translate(${NIGHT_SPIN_SHIFT * HERO_SCALE} 0)`}>{cat}</g>
    </>
  );
}

function Mini({ pose }: { pose: RulerPose }) {
  return (
    <>
      {pose === "type" ? (
        <>
          <PixelSprite map={MINI_LAPTOP_CASE} scale={MINI_SCALE} {...MINI_LAPTOP_AT} layer="laptop" />
          <PixelSprite map={MINI_LAPTOP_SCREEN} scale={MINI_SCALE} {...MINI_LAPTOP_AT} className="cat-screen" />
        </>
      ) : null}
      <Cat parts={MINI[pose]} scale={MINI_SCALE} />
      {pose === "sleep" ? (
        <g className="cat-zzz">
          <PixelSprite map={Z_SMALL} scale={MINI_SCALE} {...MINI_Z_AT} />
        </g>
      ) : null}
    </>
  );
}
