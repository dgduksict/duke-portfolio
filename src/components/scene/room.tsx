import type { CSSProperties, ReactNode } from "react";
import { spriteRects } from "@/components/cat/pixel-sprite";
import { MUG, STEAM_1, STEAM_2, type Sprite } from "@/components/cat/sprites";

/*
 * The room around the window (components/scene/window-scene.tsx): furniture and plants as small bitmaps and rect
 * lists, one cell per pixel unit. Every colour is a `--scene-*` variable from scene.css, so the room is the warm day
 * room in the light theme and the navy night room in the dark one; only the sky behind the glass follows the clock.
 *
 * Bitmap legend:
 *   W wood, deepest (outlines)   w wood          h wood, lit edge     d wood, shaded
 *   l leaf    i leaf, lit        L leaf, shaded  p pot                P pot, shaded
 *   a lamp    A lamp, lit        D lamp, shaded  m metal (radiator)   M metal, shaded
 *   c paper / cream              b book (navy)
 */
const ROOM_PALETTE: Readonly<Record<string, string>> = {
  W: "--scene-wood-deep",
  w: "--scene-wood",
  h: "--scene-wood-hi",
  d: "--scene-wood-dark",
  l: "--scene-leaf",
  i: "--scene-leaf-hi",
  L: "--scene-leaf-dark",
  p: "--scene-pot",
  P: "--scene-pot-dark",
  a: "--scene-lamp",
  A: "--scene-lamp-hi",
  D: "--scene-lamp-dark",
  m: "--scene-metal",
  M: "--scene-metal-shade",
  c: "--scene-paper",
  b: "--scene-book",
};

/** The cat sprite file's mug, in the scene's own mug colours (it must not lean on the cat's variables). */
const MUG_PALETTE: Readonly<Record<string, string>> = {
  a: "--scene-mug",
  d: "--scene-mug-dark",
  w: "--scene-paper",
  c: "--scene-coffee",
  t: "--scene-steam",
};

/** One flat rect in cells, painted with a `--scene-*` variable. */
type Box = readonly [x: number, y: number, w: number, h: number, colour: string];

function Boxes({ boxes }: { readonly boxes: readonly Box[] }) {
  return (
    <>
      {boxes.map(([x, y, w, h, colour]) => (
        <rect key={`${x}.${y}.${w}.${h}`} x={x} y={y} width={w} height={h} fill={`var(${colour})`} />
      ))}
    </>
  );
}

function Bitmap({
  map,
  x = 0,
  y = 0,
  palette = ROOM_PALETTE,
  className,
  layer,
}: {
  readonly map: Sprite;
  readonly x?: number;
  readonly y?: number;
  readonly palette?: Readonly<Record<string, string>>;
  readonly className?: string;
  readonly layer?: string;
}) {
  return (
    <g className={className} data-layer={layer}>
      {spriteRects(map).map((r) => (
        <rect
          key={`${r.x}.${r.y}`}
          x={x + r.x}
          y={y + r.y}
          width={r.w}
          height={r.h}
          fill={`var(${palette[r.c] ?? "--scene-wood-deep"})`}
        />
      ))}
    </g>
  );
}

/** A small SVG on the pixel grid: `cols` x `rows` cells, sized in CSS from `--cols`/`--rows` (see `.scene-px`). */
function Art({
  cols,
  rows,
  className,
  layer,
  children,
}: {
  readonly cols: number;
  readonly rows: number;
  readonly className: string;
  readonly layer: string;
  readonly children: ReactNode;
}) {
  return (
    <svg
      className={`scene-px ${className}`}
      data-layer={layer}
      viewBox={`0 0 ${cols} ${rows}`}
      width={cols * 4}
      height={rows * 4}
      style={{ "--cols": cols, "--rows": rows } as CSSProperties}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ sprites */

/** A desk lamp with an amber shade, its bulb showing under the rim. 12 x 20. */
const LAMP: Sprite = [
  "....aaaa....",
  "...aAaaaa...",
  "..aAaaaaaD..",
  "..aAaaaaaD..",
  ".aAaaaaaaaD.",
  ".aAaaaaaaaD.",
  "aaaaaaaaaaDD",
  "DDDDDDDDDDDD",
  "....AAAA....",
  ".....dd.....",
  ".....dd.....",
  ".....dd.....",
  ".....dd.....",
  ".....dd.....",
  ".....dd.....",
  ".....dd.....",
  ".....dd.....",
  "...wwwwww...",
  "..whhhhhhw..",
  "..WWWWWWWW..",
];

/** A trailing pothos in a terracotta pot. 11 x 13. */
const POTHOS: Sprite = [
  "....i......",
  "..i.li..l..",
  "...llil.i..",
  ".l.Llill...",
  "..lLlLlLl..",
  "...lLlLl.l.",
  "..l.LlL....",
  ".....L.....",
  "..PPPPPPP..",
  "..ppppppP..",
  "...pppppP..",
  "...pppppP..",
  "....pppP...",
];

/** A snake plant: tall striped blades in a narrow pot. 9 x 15. */
const SNAKE_PLANT: Sprite = [
  "..i......",
  "..l...i..",
  ".il...l..",
  ".il.i.lL.",
  ".il.liLL.",
  ".lL.liLL.",
  "lLL.lLLL.",
  "lLLllLLl.",
  ".LLllLL..",
  ".lLlLLl..",
  "..PPPPP..",
  "..ppppP..",
  "..ppppP..",
  "..ppppP..",
  "...ppP...",
];

/** A tall leafy floor plant on a thin stem, in a big pot. 14 x 28. */
const FLOOR_PLANT: Sprite = [
  "......li......",
  "....lliil.....",
  "...lliilL.il..",
  "...llilLLliil.",
  "....lLL.lliLl.",
  ".il..dL.lLLL..",
  "liil.d..LL....",
  "liiLLd.il.....",
  ".lLL.dliil....",
  "..L..dliLl....",
  ".....dlLL.il..",
  "..il.d...liiL.",
  ".liild..lliLL.",
  ".liLLd.d.LLL..",
  "..LL.dd.......",
  ".....d........",
  ".....d........",
  ".....d........",
  "..PPPPPPPPPP..",
  "..ppppppppPP..",
  "...pppppppP...",
  "...pppppppP...",
  "...pppppppP...",
  "...pppppppP...",
  "...pppppppP...",
  "....ppppppP...",
  "....ppppppP...",
  "....PPPPPPP...",
];

/* -------------------------------------------------------------- the lamp glow */

/** A stepped octagon of radius `r` around a cell, one rect per row. */
function octagon(cx: number, cy: number, r: number): Box[] {
  return Array.from({ length: 2 * r + 1 }, (_, i) => {
    const dy = Math.abs(i - r);
    const half = Math.min(r, Math.round(r * 1.45) - dy);
    return [cx - half, cy - r + i, 2 * half + 1, 1, "--scene-glow"] as const;
  });
}

/** Lamp light by day: three flat stepped rings of amber around the bulb (hidden in the dark theme: the lamp is off). */
function LampGlow({ cx, cy }: { readonly cx: number; readonly cy: number }) {
  return (
    <g className="scene-lamp-glow" data-layer="lamp-glow">
      {[
        { r: 22, alpha: 0.1 },
        { r: 15, alpha: 0.14 },
        { r: 9, alpha: 0.22 },
      ].map((ring) => (
        <g key={ring.r} opacity={ring.alpha}>
          <Boxes boxes={octagon(cx, cy, ring.r)} />
        </g>
      ))}
    </g>
  );
}

/* --------------------------------------------------------------- left: desk */

/** The left part of the room is 80 cells wide and as tall as the window wall (its right edge meets the frame). */
const LEFT_COLS = 80;
/** Rows of the room, top of the window wall to the floor (window-scene.tsx keeps the same numbers in CSS). */
export const ROOM_ROWS = 95;
/** The floor line and the desk top, in room rows. */
const FLOOR = ROOM_ROWS;
const DESK_TOP = 78;

const DESK: readonly Box[] = [
  // top board: lit edge, face, shade
  [12, DESK_TOP, 56, 1, "--scene-wood-hi"],
  [12, DESK_TOP + 1, 56, 2, "--scene-wood"],
  [12, DESK_TOP + 3, 56, 1, "--scene-wood-deep"],
  // legs
  [14, DESK_TOP + 4, 3, FLOOR - DESK_TOP - 4, "--scene-wood-dark"],
  [63, DESK_TOP + 4, 3, FLOOR - DESK_TOP - 4, "--scene-wood-dark"],
  // a drawer under the top, with a brass knob
  [17, DESK_TOP + 4, 16, 6, "--scene-wood"],
  [17, DESK_TOP + 9, 16, 1, "--scene-wood-deep"],
  [24, DESK_TOP + 6, 2, 1, "--scene-lamp"],
];

/** Two books lying on the desk and a small one leaning. */
const BOOKS_ON_DESK: readonly Box[] = [
  [18, DESK_TOP - 2, 14, 2, "--scene-book"],
  [18, DESK_TOP - 2, 14, 1, "--scene-paper"],
  [19, DESK_TOP - 4, 12, 2, "--scene-pot"],
  [19, DESK_TOP - 4, 1, 2, "--scene-pot-dark"],
  [21, DESK_TOP - 6, 9, 2, "--scene-leaf"],
];

/** A framed picture of hills under a sun, above the desk. */
const PICTURE: readonly Box[] = [
  [22, 26, 24, 19, "--scene-wood-deep"],
  [23, 27, 22, 17, "--scene-wood"],
  [25, 29, 18, 13, "--scene-paper"],
  [36, 31, 3, 3, "--scene-lamp"],
  [25, 36, 7, 1, "--scene-leaf"],
  [25, 37, 10, 5, "--scene-leaf"],
  [30, 38, 13, 4, "--scene-leaf-dark"],
  [35, 37, 8, 1, "--scene-leaf-dark"],
  [23, 27, 22, 1, "--scene-wood-hi"],
];

/** The day side of the room: a floor plant, a desk with books and the lamp, a picture on the wall. */
export function RoomLeft() {
  const lampX = 50;
  const lampY = DESK_TOP - LAMP.length;
  return (
    <Art cols={LEFT_COLS} rows={ROOM_ROWS} className="scene-left" layer="room-left">
      <LampGlow cx={lampX + 6} cy={lampY + 9} />
      <Boxes boxes={PICTURE} />
      <Bitmap map={FLOOR_PLANT} x={-4} y={FLOOR - FLOOR_PLANT.length} layer="floor-plant" />
      <Boxes boxes={DESK} />
      <Boxes boxes={BOOKS_ON_DESK} />
      <Bitmap map={LAMP} x={lampX} y={lampY} className="scene-lamp" layer="lamp" />
    </Art>
  );
}

/* ------------------------------------------------------------ right: shelf */

const RIGHT_COLS = 60;
const SHELF_X = 10;
const SHELF_W = 36;
const SHELF_TOP = 50;
/** The shelf boards, in room rows (the top one is the shelf's lid). */
const BOARDS = [SHELF_TOP, 65, 80] as const;
/** Books standing on each board: [width, height, colour], left to right. Muted room colours only. */
const SHELF_BOOKS: readonly (readonly (readonly [number, number, string])[])[] = [
  [
    [3, 11, "--scene-book"],
    [2, 9, "--scene-pot"],
    [3, 12, "--scene-paper"],
    [2, 10, "--scene-leaf"],
    [3, 11, "--scene-lamp-dark"],
  ],
  [
    [2, 10, "--scene-pot"],
    [3, 12, "--scene-book"],
    [3, 11, "--scene-leaf-dark"],
    [2, 9, "--scene-paper"],
  ],
  [
    [3, 11, "--scene-lamp-dark"],
    [3, 12, "--scene-paper"],
    [2, 10, "--scene-book"],
    [3, 11, "--scene-pot-dark"],
    [2, 9, "--scene-leaf"],
    [3, 12, "--scene-book"],
  ],
];

function shelf(): Box[] {
  const boxes: Box[] = [
    // the case: an outline, sides and a back
    [SHELF_X, SHELF_TOP, SHELF_W, FLOOR - SHELF_TOP, "--scene-wood-deep"],
    [SHELF_X + 1, SHELF_TOP + 1, SHELF_W - 2, FLOOR - SHELF_TOP - 1, "--scene-wood"],
    [SHELF_X + 3, SHELF_TOP + 3, SHELF_W - 6, FLOOR - SHELF_TOP - 5, "--scene-wood-dark"],
    [SHELF_X + 1, SHELF_TOP + 1, SHELF_W - 2, 1, "--scene-wood-hi"],
  ];
  BOARDS.forEach((board, shelfIndex) => {
    // Books stand on the next board down (the lowest row on the case's bottom).
    const floor = BOARDS[shelfIndex + 1] ?? FLOOR - 2;
    if (shelfIndex > 0) boxes.push([SHELF_X + 3, board, SHELF_W - 6, 2, "--scene-wood"]);
    let x = SHELF_X + 4;
    for (const [w, h, colour] of SHELF_BOOKS[shelfIndex] ?? []) {
      boxes.push([x, floor - h, w, h, colour]);
      x += w;
    }
  });
  return boxes;
}

const SHELF = shelf();

/** The night side of the reference: a bookshelf with a pothos trailing over its top. */
export function RoomRight() {
  return (
    <Art cols={RIGHT_COLS} rows={ROOM_ROWS} className="scene-right" layer="room-right">
      <Boxes boxes={SHELF} />
      <Bitmap map={POTHOS} x={SHELF_X + 3} y={SHELF_TOP - POTHOS.length} layer="shelf-plant" />
      <Bitmap map={SNAKE_PLANT} x={SHELF_X + 22} y={SHELF_TOP - SNAKE_PLANT.length} layer="shelf-plant" />
    </Art>
  );
}

/* --------------------------------------------------------- under the window */

const RADIATOR_COLS = 56;
const RADIATOR_ROWS = 12;

function radiator(): Box[] {
  const boxes: Box[] = [
    [2, 1, RADIATOR_COLS - 4, 1, "--scene-metal-shade"],
    [2, RADIATOR_ROWS - 3, RADIATOR_COLS - 4, 1, "--scene-metal-shade"],
    // feet
    [4, RADIATOR_ROWS - 2, 2, 2, "--scene-metal-shade"],
    [RADIATOR_COLS - 6, RADIATOR_ROWS - 2, 2, 2, "--scene-metal-shade"],
  ];
  for (let x = 2; x + 3 <= RADIATOR_COLS - 2; x += 4) {
    boxes.push([x, 0, 3, RADIATOR_ROWS - 2, "--scene-metal"]);
    boxes.push([x + 2, 1, 1, RADIATOR_ROWS - 3, "--scene-metal-shade"]);
  }
  return boxes;
}

const RADIATOR = radiator();

/** The radiator under the sill, from the reference's night side. */
export function Radiator() {
  return (
    <Art cols={RADIATOR_COLS} rows={RADIATOR_ROWS} className="scene-radiator" layer="radiator">
      <Boxes boxes={RADIATOR} />
    </Art>
  );
}

/** The plants on the sill (they stay on narrow screens: the window keeps its sill). */
export function SillPlants() {
  return (
    <>
      <Art cols={11} rows={13} className="scene-sill-plant scene-sill-plant-a" layer="sill-plant">
        <Bitmap map={POTHOS} />
      </Art>
      <Art cols={9} rows={15} className="scene-sill-plant scene-sill-plant-b" layer="sill-plant">
        <Bitmap map={SNAKE_PLANT} />
      </Art>
    </>
  );
}

/**
 * The night room's steaming mug on the sill, beside the cat's spot. Shown in the dark theme (scene.css), and stepped
 * aside when the sleeping cat, who brings his own mug, is in the slot. Two steam frames alternate in steps.
 */
export function Mug() {
  return (
    <Art cols={6} rows={14} className="scene-mug" layer="mug">
      <Bitmap map={STEAM_1} x={2} y={0} palette={MUG_PALETTE} className="scene-steam scene-steam-1" />
      <Bitmap map={STEAM_2} x={2} y={0} palette={MUG_PALETTE} className="scene-steam scene-steam-2" />
      <Bitmap map={MUG} y={8} palette={MUG_PALETTE} />
    </Art>
  );
}
