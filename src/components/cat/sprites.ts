/*
 * The pixel cat's bitmaps. Each sprite is a list of equal-length rows, one character per pixel:
 *
 *   .  empty                       a  amber (mug, code)          s  screen (dark glass)
 *   k  ink: the black silhouette   d  deep amber (mug shade)     m  laptop body
 *   r  rim: the 1-pixel lighter    g  glow (cursor, bright code) n  laptop shade, keys
 *      edge that keeps the ink     w  white / cream (code, mug)  c  coffee
 *      readable on a dark sky      t  steam                      z  sleeping z
 *   e  eye (a half-lidded yellow slit)
 *
 * The rim sits on the top, left and right edges of the silhouette (never under it: he sits on a table) and draws the
 * few inner lines (a shut eye, a tucked tail). `PALETTE` maps each character to the `--cat-*` colour variable it is
 * painted with; the values live in cat.css, fixed so the cat never repaints when the theme flips. `pixel-sprite.tsx`
 * turns a map into rects (one per horizontal run), and `CatArt` splits the cat maps into their animated parts with the
 * boxes below. Hero sprites are 28 x 28 (shown at 6 units a pixel), minis 16 x 16 (3 units a pixel).
 */

export type Sprite = readonly string[];

/** The parts of a cat that animate on their own (each becomes a `cat-<part>` layer). */
export type CatPart = "head" | "ear-l" | "ear-r" | "eye" | "tail" | "paw-l" | "paw-r" | "body";

/**
 * A box of a cat map (inclusive grid coordinates) whose pixels belong to one part. Eye-coloured pixels always go to
 * the eye and anything no box holds to the body, so neither has boxes.
 */
export interface PartBox {
  readonly part: Exclude<CatPart, "eye" | "body">;
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

/** Legend character -> the `--cat-*` variable it is painted with. */
export const PALETTE: Readonly<Record<string, string>> = {
  k: "--cat-ink",
  r: "--cat-rim",
  e: "--cat-eye",
  a: "--cat-amber",
  d: "--cat-amber-deep",
  g: "--cat-glow",
  w: "--cat-white",
  s: "--cat-screen",
  m: "--cat-metal",
  n: "--cat-metal-shade",
  c: "--cat-coffee",
  t: "--cat-steam",
  z: "--cat-zzz",
};

/** The legend colours of a screen: picked out of a laptop into its own `cat-screen` layer. */
export const SCREEN_COLOURS = "sawg";

/**
 * The hero by day: sitting up in profile, chin raised, one half-lidded eye, tail curled up behind, paws reaching for
 * the keys (the laptop is its own sprite, drawn under him at LAPTOP_AT). 28 x 28.
 */
export const HERO_DAY: Sprite = [
// 0123456789012345678901234567
  "............................", // 0
  "............................", // 1
  "............................", // 2
  "......r....r................", // 3
  "......rr..rkr...............", // 4
  "......rkrrkkkr..............", // 5
  ".....rkkkkkkkkr.............", // 6
  ".....rkkkkkkeekr............", // 7
  ".....rkkkkkkkkkkr...........", // 8
  ".....rkkkkkkkkkr............", // 9
  "......rkkkkkkkr.............", // 10
  ".......rkkkkkr..............", // 11
  ".......rkkkkkr..............", // 12
  "......rkkkkkkkr.............", // 13
  "..rr.rkkkkkkkkr.............", // 14
  ".r...rkkkkkkkkkr............", // 15
  ".r..rkkkkkkkkkkr............", // 16
  "rk..rkkkkkkkkkkr............", // 17
  "rk..rkkkkkkkkkkkr...........", // 18
  "rk..rkkkkkkkkr.rkr..........", // 19
  "rk..rkkkkkkkkr..rkr.........", // 20
  "rk..rkkkkkkkkr..rkr.........", // 21
  ".rr.rkkkkkkkkr...rkr........", // 22
  ".rk.rkkkkkkkkr...rkr........", // 23
  "..rrkkkkkkkkkkr..rkkr.......", // 24
  "...rkkkkkkkkkkr.............", // 25
  "...rkkkkkkkkkkkr............", // 26
  "...rkkkkkkkkkkkr............", // 27
];

/**
 * The hero by night: loafed and asleep, ears up, eye shut, tail wrapped along the front. 28 x 28.
 */
export const HERO_NIGHT: Sprite = [
// 0123456789012345678901234567
  "............................", // 0
  "............................", // 1
  "............................", // 2
  "............................", // 3
  "............................", // 4
  "............................", // 5
  "............................", // 6
  "............................", // 7
  "............................", // 8
  "............................", // 9
  "............................", // 10
  "............................", // 11
  "............................", // 12
  "............................", // 13
  "...................r...r....", // 14
  "..................rk..rkr...", // 15
  "..................rkrrkkr...", // 16
  "...........rrrr..rkkkkkkkr..", // 17
  ".........rrkkkkrrkkkkkkkkkr.", // 18
  "........rkkkkkkkkkkkkkkkkkkr", // 19
  "........rkkkkkkkkkkkkrrkkkkr", // 20
  ".......rkkkkkkkkkkkkkkkkkkkr", // 21
  ".......rkkkkkkkkkkkkkkkkkkr.", // 22
  ".......rkkkkkkkkkkkkkkkkkr..", // 23
  ".......rkkkkkkkkkkkkkkkkkkrr", // 24
  ".......rkkkkkkkkkrrrrrrrrrrr", // 25
  ".......rkkkkkkkkkkkkkkkkkkkr", // 26
  "........rkkkkkkkkkkkkkkkkkr.", // 27
];

/**
 * A small laptop, screen towards the viewer: three tidy lines of code and a cursor on a dark screen. 11 x 11.
 */
export const LAPTOP: Sprite = [
// 01234567890
  ".mmmmmmmmm.", // 0
  ".msssssssm.", // 1
  ".maawwwssm.", // 2
  ".msssssssm.", // 3
  ".mssawwwsm.", // 4
  ".msssssssm.", // 5
  ".mwwsgsssm.", // 6
  ".mmmmmmmmm.", // 7
  "mmmmmmmmmmm", // 8
  "mnmnmnmnmnm", // 9
  "nnnnnnnnnnn", // 10
];

/**
 * An amber mug of coffee with a cream highlight and its handle on the right. 6 x 6.
 */
export const MUG: Sprite = [
// 012345
  "..aaaa", // 0
  "..accd", // 1
  "ddwaad", // 2
  "d.waad", // 3
  "ddwaad", // 4
  "..aadd", // 5
];

/**
 * Steam over the mug, frame 1. 4 x 7.
 */
export const STEAM_1: Sprite = [
// 0123
  ".t..", // 0
  "..t.", // 1
  "..t.", // 2
  ".t..", // 3
  "t...", // 4
  ".t..", // 5
  ".t..", // 6
];

/**
 * Steam over the mug, frame 2. 4 x 7.
 */
export const STEAM_2: Sprite = [
// 0123
  "..t.", // 0
  ".t..", // 1
  "t...", // 2
  ".t..", // 3
  "..t.", // 4
  "..t.", // 5
  ".t..", // 6
];

/**
 * A big sleeping z. 5 x 5.
 */
export const Z_BIG: Sprite = [
// 01234
  "zzzzz", // 0
  "...z.", // 1
  "..z..", // 2
  ".z...", // 3
  "zzzzz", // 4
];

/**
 * A small sleeping z. 3 x 5.
 */
export const Z_SMALL: Sprite = [
// 012
  "zzz", // 0
  "..z", // 1
  ".z.", // 2
  "z..", // 3
  "zzz", // 4
];

/**
 * The ruler cat's laptop: a two-pixel screen over a keyboard strip. 6 x 6.
 */
export const MINI_LAPTOP: Sprite = [
// 012345
  "..mmmm", // 0
  "..mssm", // 1
  "..mawm", // 2
  "..mgsm", // 3
  "mmmmmm", // 4
  "nnnnnn", // 5
];

/**
 * Mini: typing at the mini laptop. 16 x 16.
 */
export const MINI_TYPE: Sprite = [
// 0123456789012345
  "................", // 0
  "................", // 1
  "...r...r........", // 2
  "...rr.rk........", // 3
  "...rkrkkr.......", // 4
  "..rkkkkekr......", // 5
  "..rkkkkkkkr.....", // 6
  "...rkkkkkr......", // 7
  "....rkkkr.......", // 8
  "...rkkkkkr......", // 9
  "r.rkkkkkkkr.....", // 10
  "r.rkkkkr.rkr....", // 11
  "rr.rkkkr..rk....", // 12
  ".r.rkkkr..rkr...", // 13
  "..rkkkkkr.......", // 14
  "..rkkkkkr.......", // 15
];

/**
 * Mini: sitting, chin up, tail curled. 16 x 16.
 */
export const MINI_SIT: Sprite = [
// 0123456789012345
  "................", // 0
  "................", // 1
  "......r...r.....", // 2
  "......rr.rk.....", // 3
  "......rkrkkr....", // 4
  ".....rkkkkekr...", // 5
  ".....rkkkkkkkr..", // 6
  "......rkkkkkr...", // 7
  ".......rkkkr....", // 8
  "......rkkkkkr...", // 9
  "..r..rkkkkkkr...", // 10
  ".r..rkkkkkkkr...", // 11
  ".r..rkkkkkkkkr..", // 12
  ".rr.rkkkkkkkkr..", // 13
  "..rrkkkkkkkkkr..", // 14
  "...rkkkkkkkkkr..", // 15
];

/**
 * Mini: eyes shut, licking a raised paw. 16 x 16.
 */
export const MINI_GROOM: Sprite = [
// 0123456789012345
  "................", // 0
  "................", // 1
  "......r...r.....", // 2
  "......rr.rk.....", // 3
  "......rkrkkr....", // 4
  ".....rkkkkkr.rr.", // 5
  ".....rkkkrrkrkr.", // 6
  "......rkkkkkkr..", // 7
  ".......rkkkkr...", // 8
  "......rkkkkkr...", // 9
  "..r..rkkkkkr....", // 10
  ".r..rkkkkkkr....", // 11
  ".r..rkkkkkkkr...", // 12
  ".rr.rkkkkkkkr...", // 13
  "..rrkkkkkkkkkr..", // 14
  "...rkkkkkkkkkr..", // 15
];

/**
 * Mini: curled up asleep (the z is its own sprite). 16 x 16.
 */
export const MINI_SLEEP: Sprite = [
// 0123456789012345
  "................", // 0
  "................", // 1
  "................", // 2
  "................", // 3
  "................", // 4
  "................", // 5
  "................", // 6
  "..........r..r..", // 7
  ".........rk.rk..", // 8
  "....rrrr.rkrkr..", // 9
  "..rrkkkkrkkkkkr.", // 10
  ".rkkkkkkkkkrrkr.", // 11
  ".rkkkkkkkkkkkkr.", // 12
  "rkkkkkkkkkkkkkr.", // 13
  "rkkkkkkkrrrrrrr.", // 14
  ".rkkkkkkkkkkkkr.", // 15
];

/**
 * Mini: stretched out flat, chin on his paws, tail hanging. 16 x 16.
 */
export const MINI_NAP: Sprite = [
// 0123456789012345
  "................", // 0
  "................", // 1
  "................", // 2
  "................", // 3
  "................", // 4
  "................", // 5
  "................", // 6
  "................", // 7
  "................", // 8
  "...........r..r.", // 9
  "...........rr.rr", // 10
  "...rrrrrr.rkkrkr", // 11
  ".rrkkkkkkrkkrrkr", // 12
  "rkkkkkkkkkkkkkkr", // 13
  "r.rkkkkkkkkrrrrr", // 14
  "r..rkkkkkkkkkkkr", // 15
];

/* ---------- part boxes (first match wins; ears before the head that holds them) ---------- */

export const HERO_DAY_PARTS: readonly PartBox[] = [
  { part: "ear-l", x0: 5, y0: 3, x1: 7, y1: 4 },
  { part: "ear-r", x0: 9, y0: 3, x1: 12, y1: 4 },
  { part: "head", x0: 4, y0: 3, x1: 17, y1: 10 },
  { part: "tail", x0: 0, y0: 14, x1: 2, y1: 24 },
  { part: "paw-l", x0: 16, y0: 22, x1: 18, y1: 24 },
  { part: "paw-r", x0: 19, y0: 22, x1: 21, y1: 24 },
];

export const HERO_NIGHT_PARTS: readonly PartBox[] = [
  { part: "ear-l", x0: 18, y0: 14, x1: 20, y1: 15 },
  { part: "ear-r", x0: 22, y0: 14, x1: 24, y1: 15 },
  // Only the curl of the tail that pokes out past the loaf (x26-27, the last four rows of the right edge): a wider box
  // swallowed a strip of the belly, which a flick of the tail would then drag along.
  { part: "tail", x0: 26, y0: 24, x1: 27, y1: 27 },
  { part: "head", x0: 17, y0: 14, x1: 27, y1: 24 },
];

export const MINI_PARTS: Readonly<Record<"type" | "sit" | "groom" | "sleep" | "nap", readonly PartBox[]>> = {
  type: [
    { part: "ear-l", x0: 2, y0: 2, x1: 4, y1: 3 },
    { part: "ear-r", x0: 5, y0: 2, x1: 8, y1: 3 },
    { part: "head", x0: 1, y0: 2, x1: 11, y1: 7 },
    { part: "tail", x0: 0, y0: 10, x1: 1, y1: 13 },
    { part: "paw-l", x0: 9, y0: 11, x1: 10, y1: 13 },
    { part: "paw-r", x0: 11, y0: 11, x1: 12, y1: 13 },
  ],
  sit: [
    { part: "ear-l", x0: 5, y0: 2, x1: 7, y1: 3 },
    { part: "ear-r", x0: 8, y0: 2, x1: 11, y1: 3 },
    { part: "head", x0: 4, y0: 2, x1: 14, y1: 7 },
    { part: "tail", x0: 0, y0: 10, x1: 3, y1: 14 },
  ],
  groom: [
    { part: "ear-l", x0: 5, y0: 2, x1: 7, y1: 3 },
    { part: "ear-r", x0: 8, y0: 2, x1: 11, y1: 3 },
    { part: "paw-r", x0: 13, y0: 5, x1: 14, y1: 7 },
    { part: "head", x0: 4, y0: 2, x1: 12, y1: 7 },
    { part: "tail", x0: 0, y0: 10, x1: 3, y1: 14 },
  ],
  sleep: [
    { part: "ear-l", x0: 9, y0: 7, x1: 10, y1: 8 },
    { part: "ear-r", x0: 12, y0: 7, x1: 13, y1: 8 },
    { part: "tail", x0: 8, y0: 14, x1: 15, y1: 15 },
    { part: "head", x0: 9, y0: 7, x1: 15, y1: 13 },
  ],
  nap: [
    { part: "ear-l", x0: 10, y0: 9, x1: 12, y1: 10 },
    { part: "ear-r", x0: 13, y0: 9, x1: 15, y1: 10 },
    { part: "paw-l", x0: 11, y0: 14, x1: 13, y1: 15 },
    { part: "paw-r", x0: 14, y0: 14, x1: 15, y1: 15 },
    { part: "head", x0: 10, y0: 9, x1: 15, y1: 13 },
    { part: "tail", x0: 0, y0: 13, x1: 1, y1: 15 },
  ],
};

/** Every sprite by name (the tests walk this to check each map's shape and colours). */
export const SPRITES: Readonly<Record<string, Sprite>> = {
  heroDay: HERO_DAY,
  heroNight: HERO_NIGHT,
  laptop: LAPTOP,
  mug: MUG,
  steam1: STEAM_1,
  steam2: STEAM_2,
  zBig: Z_BIG,
  zSmall: Z_SMALL,
  miniLaptop: MINI_LAPTOP,
  miniType: MINI_TYPE,
  miniSit: MINI_SIT,
  miniGroom: MINI_GROOM,
  miniSleep: MINI_SLEEP,
  miniNap: MINI_NAP,
};
