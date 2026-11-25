import type { ReactNode } from "react";
import { isBlank, pickColours, PixelSprite, splitParts } from "@/components/cat/pixel-sprite";
import {
  type CatPart,
  HERO_BACK,
  HERO_DAY,
  HERO_DAY_PARTS,
  HERO_FRONT,
  HERO_NIGHT,
  HERO_NIGHT_PARTS,
  HERO_STRETCH,
  HERO_YAWN,
  LAPTOP,
  MINI_GROOM,
  MINI_LAPTOP,
  MINI_NAP,
  MINI_PARTS,
  MINI_SIT,
  MINI_SLEEP,
  MINI_TYPE,
  MUG,
  PARTY_HAT,
  PARTY_HAT_MINI,
  SANTA_HAT,
  SANTA_HAT_DROOP,
  SANTA_HAT_MINI,
  SCREEN_COLOURS,
  SPIN_BODY,
  type Sprite,
  STEAM_1,
  STEAM_2,
  Z_BIG,
  Z_SMALL,
} from "@/components/cat/sprites";
import type { CatState, RulerPose } from "@/lib/cat";
import type { Holiday } from "@/lib/holiday";
import { cn } from "@/lib/utils";

/** The hat he wears for a holiday: the Santa hat for Christmas, the party hat for the owner's birthday. */
export type Hat = "santa" | "party";

/** The hat for a holiday (lib/holiday.ts), or none on an ordinary day. */
export function hatFor(holiday: Holiday | null | undefined): Hat | undefined {
  if (holiday === "christmas") return "santa";
  if (holiday === "birthday") return "party";
  return undefined;
}

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
      /**
       * The sunrise wake: by his laptop, a yawn and then a stretch, two whole drawings each in a `cat-wake-frame` group
       * for cat.css to show one after the other. The spin wins if both are asked for.
       */
      wake?: boolean;
      /**
       * The purr: by day his eye closes contentedly, the eye's cells drawn in rim (a shut line, like the night eye).
       * Only his day pose changes; by night he is asleep already, and the wake and the spin draw their own frames.
       */
      content?: boolean;
    }
  | { variant: "mini"; pose: RulerPose }
) & {
  className?: string;
  /**
   * A holiday hat on his head in every drawing (each frame of the spin and the wake too), at that drawing's HAT_AT
   * anchor: in the head group where the drawing has one, so it breathes and glances with his head. None by default.
   */
  hat?: Hat;
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
 * Where a hat sits in one drawing: the top left of its box on that drawing's grid (a 10 x 7 hero hat or a 6 x 5 mini
 * one, sprites.ts), and whether the Santa hat droops there (the sleeping loaf).
 */
export interface HatAnchor {
  readonly x: number;
  readonly y: number;
  readonly size: "hero" | "mini";
  readonly droop?: boolean;
}

/**
 * Every drawing's hat anchor, worked out against its bitmap so the brim (or the cone's base) sits on his brow over the
 * ears and every cell stays on the grid. The spin's mirror frame wears the side frame's hat inside its mirror wrapper,
 * and the front and back frames' hats are lifted with them, so no frame needs its own mirrored or lifted anchor. The
 * wake's yawn wears it pushed back on his tipped-back head, clear of his open mouth.
 */
export const HAT_AT = {
  day: { x: 5, y: 0, size: "hero" },
  night: { x: 16, y: 12, size: "hero", droop: true },
  "wake-yawn": { x: 2, y: 0, size: "hero" },
  "wake-stretch": { x: 11, y: 10, size: "hero" },
  "spin-side": { x: 5, y: 0, size: "hero" },
  "spin-front": { x: 6, y: 1, size: "hero" },
  "spin-back": { x: 6, y: 1, size: "hero" },
  "mini-type": { x: 2, y: 0, size: "mini" },
  "mini-sit": { x: 5, y: 0, size: "mini" },
  "mini-groom": { x: 5, y: 0, size: "mini" },
  "mini-sleep": { x: 8, y: 5, size: "mini" },
  "mini-nap": { x: 10, y: 7, size: "mini" },
  // The loader's yarn cat (20 x 16, facing right, one unit a cell): the brim on the head's first full row, its left end
  // on the head's left rim, so the cone covers the ears. The proud pose's hat pokes two rows above the grid (loader.css lets the drawing overflow).
  "loader-sit": { x: 7, y: 0, size: "mini" },
  "loader-run-1": { x: 12, y: 1, size: "mini" },
  "loader-run-2": { x: 12, y: 1, size: "mini" },
  "loader-crouch-1": { x: 11, y: 6, size: "mini" },
  "loader-crouch-2": { x: 11, y: 6, size: "mini" },
  "loader-pounce": { x: 10, y: 0, size: "mini" },
  "loader-tumble": { x: 12, y: 1, size: "mini" },
  "loader-proud": { x: 7, y: -2, size: "mini" },
} as const satisfies Record<string, HatAnchor>;

/** Each hat's drawings: on the hero, on the hero's sleeping loaf (only the Santa hat droops), and on a mini. */
const HATS: Readonly<Record<Hat, { hero: Sprite; droop: Sprite; mini: Sprite }>> = {
  santa: { hero: SANTA_HAT, droop: SANTA_HAT_DROOP, mini: SANTA_HAT_MINI },
  party: { hero: PARTY_HAT, droop: PARTY_HAT, mini: PARTY_HAT_MINI },
};

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
 * Every part that moves is its own group with a `cat-*` class (head holding ear-l, ear-r, eye and, on a holiday, the
 * hat; tail, body, paw-l, paw-r; screen; zzz; steam). Placement lives in the rects' coordinates, so no `cat-*` group
 * carries a transform and CSS is free to animate them. The sprites need no ids.
 */
export function CatArt(props: CatArtProps) {
  if (props.variant === "hero") {
    const size = HERO_GRID * HERO_SCALE;
    const spinning = props.uiia === true;
    const waking = !spinning && props.wake === true;
    const content = !spinning && !waking && props.state === "day" && props.content === true;
    const hat = props.hat;
    let drawing = props.state === "day" ? <HeroDay content={content} hat={hat} /> : <HeroNight hat={hat} />;
    if (spinning) drawing = <HeroSpin state={props.state} hat={hat} />;
    else if (waking) drawing = <HeroWake hat={hat} />;
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
        data-uiia={spinning ? "" : undefined}
        data-wake={waking ? "" : undefined}
        data-content={content ? "" : undefined}
      >
        {drawing}
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
      <Mini pose={props.pose} hat={props.hat} />
    </svg>
  );
}

/** One part layer, or nothing when the drawing has no pixels for it. */
function Part({ parts, part, scale }: { parts: Record<CatPart, Sprite>; part: CatPart; scale: number }) {
  const map = parts[part];
  return isBlank(map) ? null : <PixelSprite map={map} scale={scale} className={`cat-${part}`} />;
}

/** The hat at a drawing's anchor, in its own `cat-hat` group (placed by its rects, never a transform); none without one. */
export function HatLayer({ hat, at, scale }: { hat: Hat | undefined; at: HatAnchor; scale: number }) {
  if (hat === undefined) return null;
  const drawings = HATS[hat];
  let map = drawings.hero;
  if (at.size === "mini") map = drawings.mini;
  else if (at.droop === true) map = drawings.droop;
  return (
    <g className="cat-hat" data-hat={hat}>
      <PixelSprite map={map} scale={scale} x={at.x} y={at.y} />
    </g>
  );
}

/** The eye's pixels in ink: the head is drawn with a socket under the eye, so the eye can glance without a hole. */
const socket = (eye: Sprite): Sprite => eye.map((row) => row.replaceAll("e", "k"));

/** The eye shut contentedly: its cells drawn in rim, the same line the sleeping cat's eye is. */
const shut = (eye: Sprite): Sprite => eye.map((row) => row.replaceAll("e", "r"));

/**
 * The cat's layers, back to front: tail, body, head (with its ears, eye and any hat, the hat on top), paws. `content`
 * shuts the eye (the purr); the socket under it stays ink either way.
 */
function Cat({
  parts,
  scale,
  content = false,
  hat = null,
}: {
  parts: Record<CatPart, Sprite>;
  scale: number;
  content?: boolean;
  hat?: ReactNode;
}) {
  const eyed = content ? { ...parts, eye: shut(parts.eye) } : parts;
  return (
    <>
      <Part parts={parts} part="tail" scale={scale} />
      <Part parts={parts} part="body" scale={scale} />
      <g className="cat-head">
        <PixelSprite map={parts.head} scale={scale} />
        <PixelSprite map={socket(parts.eye)} scale={scale} />
        <Part parts={parts} part="ear-l" scale={scale} />
        <Part parts={parts} part="ear-r" scale={scale} />
        <Part parts={eyed} part="eye" scale={scale} />
        {hat}
      </g>
      <Part parts={parts} part="paw-l" scale={scale} />
      <Part parts={parts} part="paw-r" scale={scale} />
    </>
  );
}

function HeroDay({ content, hat }: { content: boolean; hat: Hat | undefined }) {
  return (
    <>
      <PixelSprite map={LAPTOP_CASE} scale={HERO_SCALE} {...LAPTOP_AT} layer="laptop" />
      <PixelSprite map={LAPTOP_SCREEN} scale={HERO_SCALE} {...LAPTOP_AT} className="cat-screen" />
      <Cat
        parts={DAY}
        scale={HERO_SCALE}
        content={content}
        hat={<HatLayer hat={hat} at={HAT_AT.day} scale={HERO_SCALE} />}
      />
    </>
  );
}

function HeroNight({ hat }: { hat: Hat | undefined }) {
  return (
    <>
      <PixelSprite map={MUG} scale={HERO_SCALE} {...MUG_AT} layer="mug" />
      <PixelSprite map={STEAM_1} scale={HERO_SCALE} {...STEAM_AT} className="cat-steam" layer="steam-1" />
      <PixelSprite map={STEAM_2} scale={HERO_SCALE} {...STEAM_AT} className="cat-steam" layer="steam-2" />
      <Cat parts={NIGHT} scale={HERO_SCALE} hat={<HatLayer hat={hat} at={HAT_AT.night} scale={HERO_SCALE} />} />
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
 * on a plain wrapper, never on a `cat-*` part. A hat goes on in every frame (he is awake, so the Santa hat stands up
 * even by night): the side frames' in their head group, so the mirror flips it with him; the front and back frames'
 * over the drawing, inside the lift.
 */
function HeroSpin({ state, hat }: { state: CatState; hat: Hat | undefined }) {
  const sideHat = <HatLayer hat={hat} at={HAT_AT["spin-side"]} scale={HERO_SCALE} />;
  const cat = (
    <g className="cat-spin">
      <g className="cat-spin-frame" data-frame="side">
        <Cat parts={DAY} scale={HERO_SCALE} hat={sideHat} />
      </g>
      <g className="cat-spin-frame" data-frame="front">
        <g transform={SPIN_LIFT}>
          <PixelSprite map={HERO_FRONT} scale={HERO_SCALE} />
          <HatLayer hat={hat} at={HAT_AT["spin-front"]} scale={HERO_SCALE} />
        </g>
      </g>
      <g className="cat-spin-frame" data-frame="mirror">
        <g transform={SPIN_MIRROR}>
          <Cat parts={DAY} scale={HERO_SCALE} hat={sideHat} />
        </g>
      </g>
      <g className="cat-spin-frame" data-frame="back">
        <g transform={SPIN_LIFT}>
          <PixelSprite map={HERO_BACK} scale={HERO_SCALE} />
          <HatLayer hat={hat} at={HAT_AT["spin-back"]} scale={HERO_SCALE} />
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

/**
 * The sunrise wake's drawing: his laptop where it always is, and the yawn and the stretch as whole drawings (no parts,
 * so none of the day loops touch them), each in a `cat-wake-frame` group that cat.css shows in turn. Without the
 * animation (a still render) only the yawn shows. A hat goes on in each frame, over the drawing.
 */
function HeroWake({ hat }: { hat: Hat | undefined }) {
  return (
    <>
      <PixelSprite map={LAPTOP_CASE} scale={HERO_SCALE} {...LAPTOP_AT} layer="laptop" />
      <PixelSprite map={LAPTOP_SCREEN} scale={HERO_SCALE} {...LAPTOP_AT} className="cat-screen" />
      <g className="cat-wake-frame" data-frame="yawn">
        <PixelSprite map={HERO_YAWN} scale={HERO_SCALE} />
        <HatLayer hat={hat} at={HAT_AT["wake-yawn"]} scale={HERO_SCALE} />
      </g>
      <g className="cat-wake-frame" data-frame="stretch">
        <PixelSprite map={HERO_STRETCH} scale={HERO_SCALE} />
        <HatLayer hat={hat} at={HAT_AT["wake-stretch"]} scale={HERO_SCALE} />
      </g>
    </>
  );
}

function Mini({ pose, hat }: { pose: RulerPose; hat: Hat | undefined }) {
  return (
    <>
      {pose === "type" ? (
        <>
          <PixelSprite map={MINI_LAPTOP_CASE} scale={MINI_SCALE} {...MINI_LAPTOP_AT} layer="laptop" />
          <PixelSprite map={MINI_LAPTOP_SCREEN} scale={MINI_SCALE} {...MINI_LAPTOP_AT} className="cat-screen" />
        </>
      ) : null}
      <Cat parts={MINI[pose]} scale={MINI_SCALE} hat={<HatLayer hat={hat} at={HAT_AT[`mini-${pose}`]} scale={MINI_SCALE} />} />
      {pose === "sleep" ? (
        <g className="cat-zzz">
          <PixelSprite map={Z_SMALL} scale={MINI_SCALE} {...MINI_Z_AT} />
        </g>
      ) : null}
    </>
  );
}
