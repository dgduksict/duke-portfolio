/*
 * The pixel cat's bitmaps. Each sprite is a list of equal-length rows, one character per pixel:
 *
 *   .  empty                       a  amber (mug, code)          s  screen (dark glass)
 *   k  ink: the black silhouette   d  deep amber (mug shade)     m  laptop body
 *   r  rim: the 1-pixel lighter    g  glow (cursor, bright code) n  laptop shade, keys
 *      edge that keeps the ink     w  white / cream (code, mug)  c  coffee
 *      readable on a dark sky      t  steam                      z  sleeping z
 *   e  eye (a half-lidded yellow slit)                           y  yarn
 *                                                                h  yarn shade (the wound thread)
 *                                                                p  pink (the purr's hearts)
 *
 * Coffee and cream also paint the inside of the sunrise yawn's open mouth and its one fang (HERO_YAWN).
 *
 * The rim sits on the top, left and right edges of the silhouette (never under it: he sits on a table) and draws the
 * few inner lines (a shut eye, a tucked tail). `PALETTE` maps each character to the `--cat-*` colour variable it is
 * painted with; the values live in cat.css, fixed so the cat never repaints when the theme flips. `pixel-sprite.tsx`
 * turns a map into rects (one per horizontal run), and `CatArt` splits the cat maps into their animated parts with the
 * boxes below. Hero sprites are 28 x 28 (shown at 6 units a pixel), minis 16 x 16 (3 units a pixel), and the loader's
 * yarn cat 20 x 16 (one unit a pixel, drawn at --px a cell) beside his 7 x 7 ball of yarn.
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
  y: "--cat-yarn",
  h: "--cat-yarn-shade",
  p: "--cat-heart",
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
 * The columns the sitting side view's body spans (tail to paws, inclusive). The UIIA turn mirrors HERO_DAY about this
 * span, not the whole frame, and draws HERO_FRONT and HERO_BACK on it, so he turns on the spot.
 */
export const SPIN_BODY = { x0: 0, x1: 20 } as const;

/**
 * The hero facing you (a UIIA frame): sitting up, both ears, both eyes as half-lidded slits, a rim dot of a nose, the
 * front legs and paws together down his chest, his tail wrapped round his left side along the floor. The same sitting
 * height as HERO_DAY (ears on row 3, feet on row 27), on its body columns (SPIN_BODY). 28 x 28.
 */
export const HERO_FRONT: Sprite = [
// 0123456789012345678901234567
  "............................", // 0
  "............................", // 1
  "............................", // 2
  ".....r.........r............", // 3
  ".....rr.......rr............", // 4
  ".....rkr.....rkr............", // 5
  ".....rkkrrrrrkkr............", // 6
  "....rkkkkkkkkkkkr...........", // 7
  "...rkkkkkkkkkkkkkr..........", // 8
  "...rkkeekkkkkeekkr..........", // 9
  "...rkkkkkkrkkkkkkr..........", // 10
  "....rkkkkkkkkkkkr...........", // 11
  ".....rkkkkkkkkkr............", // 12
  "......rkkkkkkkr.............", // 13
  ".....rkkkkkkkkkr............", // 14
  ".....rkkkkkkkkkr............", // 15
  "....rkkkkkkkkkkkr...........", // 16
  "....rkkkkkkkkkkkr...........", // 17
  "....rkkkkkkkkkkkr...........", // 18
  "...rkkkkkkkkkkkkkr..........", // 19
  "...rkkkrkkkkkrkkkr..........", // 20
  "...rkkkrkkkkkrkkkr..........", // 21
  "...rkkkrkkkkkrkkkr..........", // 22
  "..rkkkkrkkkkkrkkkkr.........", // 23
  "..rkkkkrkkrkkrkkkkr.........", // 24
  "..rkkkkrkkrkkrrrrkr.........", // 25
  "..rkkkkrkkrkkrkkkkr.........", // 26
  "..rkkkkrkkrkkrkkkkr.........", // 27
];

/**
 * The hero from behind (a UIIA frame): sitting up, ears and the back of his head, no face, his tail wrapped round his
 * left side along the floor, its tip curled up beside him. The same outline as HERO_FRONT, on the same rows and
 * columns. 28 x 28.
 */
export const HERO_BACK: Sprite = [
// 0123456789012345678901234567
  "............................", // 0
  "............................", // 1
  "............................", // 2
  ".....r.........r............", // 3
  ".....rr.......rr............", // 4
  ".....rkr.....rkr............", // 5
  ".....rkkrrrrrkkr............", // 6
  "....rkkkkkkkkkkkr...........", // 7
  "...rkkkkkkkkkkkkkr..........", // 8
  "...rkkkkkkkkkkkkkr..........", // 9
  "...rkkkkkkkkkkkkkr..........", // 10
  "....rkkkkkkkkkkkr...........", // 11
  ".....rkkkkkkkkkr............", // 12
  "......rkkkkkkkr.............", // 13
  ".....rkkkkkkkkkr............", // 14
  ".....rkkkkkkkkkr............", // 15
  "....rkkkkkkkkkkkr...........", // 16
  "....rkkkkkkkkkkkr...........", // 17
  "....rkkkkkkkkkkkr...........", // 18
  "...rkkkkkkkkkkkkkr..........", // 19
  "...rkkkkkkkkkkkkkr..........", // 20
  "rr.rkkkkkkkkkkkkkr..........", // 21
  "rk.rkkkkkkkkkkkkkr..........", // 22
  "rkrkkkkkkkkkkkkkkkr.........", // 23
  "rkrkkkkkkkkkkkkkkkr.........", // 24
  "rkrrrrrrrrkkkkkkkkr.........", // 25
  "rkkkkkkkkkkkkkkkkkr.........", // 26
  "rkkkkkkkkkkkkkkkkkr.........", // 27
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
 * The sunrise wake, frame 1 (hero-cat.tsx, cat.css): the yawn. Sitting up at his laptop's side, head tipped back,
 * eye squeezed shut (a rim line), the jaws wide open on the dark inside of his mouth (coffee) with one cream fang,
 * front legs straight down to the floor, tail curled behind as by day. On the day cat's columns (0-20), so the laptop
 * beside him stays in view. 28 x 28, feet on row 27.
 */
export const HERO_YAWN: Sprite = [
// 0123456789012345678901234567
  "............................", // 0
  "............................", // 1
  "............................", // 2
  ".....r..r....rr.............", // 3
  ".....rr.rr..rkkr............", // 4
  ".....rkrkkrrkkkr............", // 5
  ".....rkkrrkrccw.............", // 6
  ".....rkkkkrcc...............", // 7
  ".....rkkkkkrcc..............", // 8
  ".....rkkkkkkrrrr............", // 9
  "......rkkkkkkkr.............", // 10
  ".......rkkkkr...............", // 11
  ".......rkkkkr...............", // 12
  "......rkkkkkkkr.............", // 13
  "..rr.rkkkkkkkkr.............", // 14
  ".r...rkkkkkkkkkr............", // 15
  ".r..rkkkkkkkkkkr............", // 16
  "rk..rkkkkkkkkkkr............", // 17
  "rk..rkkkkkkkkkkkr...........", // 18
  "rk..rkkkkkkrkkkr............", // 19
  "rk..rkkkkkkrkkkr............", // 20
  "rk..rkkkkkkrkkkr............", // 21
  ".rr.rkkkkkkrkkkr............", // 22
  ".rk.rkkkkkkrkkkr............", // 23
  "..rrkkkkkkkrkkkr............", // 24
  "...rkkkkkkkrkkkr............", // 25
  "...rkkkkkkkrkkkkr...........", // 26
  "...rkkkkkkkrkkkkr...........", // 27
];

/**
 * The sunrise wake, frame 2: the stretch. The classic cat stretch: rear up high on straight hind legs, tail raised,
 * back sloping down to his shoulders, chest low, head up with ears forward and the half-lidded eye of the day cat,
 * front legs reaching forward flat along the floor (their paws just over the laptop's keyboard edge, as his typing paws
 * are by day). On the day cat's columns (0-20). 28 x 28, feet on row 27.
 */
export const HERO_STRETCH: Sprite = [
// 0123456789012345678901234567
  "............................", // 0
  "............................", // 1
  "............................", // 2
  "............................", // 3
  "............................", // 4
  "..rr........................", // 5
  ".rk.........................", // 6
  ".rk.........................", // 7
  ".rk.........................", // 8
  ".rk.........................", // 9
  ".rk.........................", // 10
  "..rk........................", // 11
  "..rkrrr.....................", // 12
  ".rkkkkkrr...................", // 13
  ".rkkkkkkkr..................", // 14
  ".rkkkkkkkkr..r..r...........", // 15
  ".rkkkkkkkkkr.rr.rr..........", // 16
  ".rkkkkkkkkkkrkkrkkr.........", // 17
  ".rkkkkkkkkkkkkkkkeer........", // 18
  ".rkkkr...rkkkkkkkkkr........", // 19
  ".rkkr.....rkkkkkkkr.........", // 20
  ".rkkr.....rkkkkkr...........", // 21
  ".rkr......rkkkkr............", // 22
  ".rkr......rkkkkr............", // 23
  ".rkr......rkkkkkr...........", // 24
  ".rkr......rkkkkkkrrr........", // 25
  ".rkkr.....rkkkkkkkkkr.......", // 26
  ".rkkr.....rkkkkkkkkkr.......", // 27
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

/*
 * ---------- the loader's yarn cat (components/loader/yarn-stage.tsx) ----------
 * One cat on one shared 20 x 16 grid, facing right (towards the ball), every frame standing on row 15 so swapping
 * frames never makes him hop or sink. The loader shows one frame at a time (loader.css picks it).
 */

/**
 * Yarn cat: sitting calmly, chin up, front legs together, tail curled round on the floor behind him. 20 x 16.
 */
export const YARN_SIT: Sprite = [
// 01234567890123456789
  "....................", // 0
  "....................", // 1
  "........r...r.......", // 2
  ".......rkr.rkr......", // 3
  ".......rkkrkkr......", // 4
  ".......rkkkkkkr.....", // 5
  "......rkkkkkeekr....", // 6
  "......rkkkkkkkkkr...", // 7
  ".......rkkkkkkkr....", // 8
  "........rkkkkkr.....", // 9
  "...r...rkkkkkkkr....", // 10
  "..rkr.rkkkkkkkkkr...", // 11
  ".rkr.rkkkkkkrkkkr...", // 12
  ".rkrrrkkkkkkrkkkr...", // 13
  "..rkkrkkkkkkrkkkr...", // 14
  "....rkkkkkkkrkkkr...", // 15
];

/**
 * Yarn cat: running, frame 1 of the gallop. Stretched out: front legs reaching forward, hind legs kicked back, tail
 * streaming behind. 20 x 16.
 */
export const RUN_1: Sprite = [
// 01234567890123456789
  "....................", // 0
  "....................", // 1
  "....................", // 2
  ".............r...r..", // 3
  "............rkr.rkr.", // 4
  ".r..........rkkrkkr.", // 5
  "rkr.........rkkkkkr.", // 6
  ".rkrrrrrrrrrkkkkeekr", // 7
  ".rkkkkkkkkkkkkkkkkkr", // 8
  "..rkkkkkkkkkkkkkkkr.", // 9
  "..rkkkkkkkkkkkkkkr..", // 10
  ".rkkkkkkr...rkkkkkr.", // 11
  "rkkkkr.......rkkkkkr", // 12
  "rkkkr.........rkkkkr", // 13
  "rkkr............rkkr", // 14
  "rkr.............rkkr", // 15
];

/**
 * Yarn cat: running, frame 2 of the gallop. Gathered: back arched, all four legs bunched under him, tail up. The head
 * stays where RUN_1 has it, so the gallop reads as the body working under a steady head. 20 x 16.
 */
export const RUN_2: Sprite = [
// 01234567890123456789
  "....................", // 0
  "....................", // 1
  "....................", // 2
  ".............r...r..", // 3
  ".r..........rkr.rkr.", // 4
  "rkr...rrrr..rkkrkkr.", // 5
  ".rkrrrkkkkrrrkkkkkr.", // 6
  ".rkrkkkkkkkkkkkkeekr", // 7
  "..rkkkkkkkkkkkkkkkkr", // 8
  "..rkkkkkkkkkkkkkkkr.", // 9
  "...rkkkkkkkkkkkkkr..", // 10
  "....rkkkkkkkkkkkkr..", // 11
  "....rkkkkr.rkkkkr...", // 12
  ".....rkkkr.rkkkr....", // 13
  ".....rkkkrrkkkr.....", // 14
  "......rkkrrkkr......", // 15
];

/**
 * Yarn cat: crouched to pounce, frame 1 of the wiggle. Head low over his front paws, rear up, tail low behind. 20 x 16.
 */
export const CROUCH_1: Sprite = [
// 01234567890123456789
  "....................", // 0
  "....................", // 1
  "....................", // 2
  "....................", // 3
  "....................", // 4
  "....................", // 5
  "...rrr..............", // 6
  "..rkkkrr............", // 7
  ".rkkkkkkrr..r...r...", // 8
  ".rkkkkkkkkrrkr.rkr..", // 9
  ".rkkkkkkkkkrkkrkkr..", // 10
  ".rkkkkkkkkkkkkkkkkr.", // 11
  "..rkkkkkkkkkkkkeekr.", // 12
  ".rkkkkkkkkkkkkkkkkkr", // 13
  "rkrkkkkkkkkkkkkkkkr.", // 14
  "rkrkkkkkrrkkkkkkkkkr", // 15
];

/**
 * Yarn cat: crouched to pounce, frame 2 of the wiggle. The same crouch with the rear swung one cell right and the tail
 * tip flicked up, so the two frames make the butt wiggle. 20 x 16.
 */
export const CROUCH_2: Sprite = [
// 01234567890123456789
  "....................", // 0
  "....................", // 1
  "....................", // 2
  "....................", // 3
  "....................", // 4
  "....................", // 5
  "....rrr.............", // 6
  "...rkkkrr...........", // 7
  "..rkkkkkkr..r...r...", // 8
  ".rkkkkkkkkrrkr.rkr..", // 9
  ".rkkkkkkkkkrkkrkkr..", // 10
  ".rkkkkkkkkkkkkkkkkr.", // 11
  "rkrkkkkkkkkkkkkeekr.", // 12
  "rkrkkkkkkkkkkkkkkkkr", // 13
  ".rkkkkkkkkkkkkkkkkr.", // 14
  ".rkkkkkkrrkkkkkkkkkr", // 15
];

/**
 * Yarn cat: the pounce. Launched and stretched out on a rising diagonal, front legs reaching out under his chin, hind
 * toes just leaving the floor (row 15), tail straight out behind. 20 x 16.
 */
export const POUNCE: Sprite = [
// 01234567890123456789
  "....................", // 0
  "...........r...r....", // 1
  "..........rkr.rkr...", // 2
  "..........rkkrkkr...", // 3
  "..........rkkkkkkr..", // 4
  ".........rkkkkkeekr.", // 5
  "........rrkkkkkkkkr.", // 6
  "......rrkkkkkkkkkr..", // 7
  "....rrkkkkkkkkkkrrr.", // 8
  ".rrrkkkkkkkkkkkkkkkr", // 9
  "rkkkkkkkkkkkrkkkkkkr", // 10
  "..rkkkkkkkkr........", // 11
  "..rkkkkkr...........", // 12
  ".rkkkr..............", // 13
  "rkkkr...............", // 14
  "rkkr................", // 15
];

/**
 * Yarn cat: the tumble. Curled up tight mid-roll, ears and an open eye at the front, a front paw tucked under his chin
 * and the tail wrapped round underneath (the rim line). Round enough to roll in 90-degree steps. 20 x 16.
 */
export const TUMBLE: Sprite = [
// 01234567890123456789
  "....................", // 0
  "....................", // 1
  "....................", // 2
  ".............r...r..", // 3
  "......rrrr..rkr.rkr.", // 4
  "....rrkkkkrrrkkrkkr.", // 5
  "...rkkkkkkkkrkkkkkr.", // 6
  "..rkkkkkkkkkkkkkkkkr", // 7
  ".rkkkkkkkkkkkkkeekkr", // 8
  ".rkkkkkkkkkkkkkkkkkr", // 9
  "rkkkkkkkkkkkkkkkkkr.", // 10
  "rkkkkkkkkkkkkkkkkkkr", // 11
  "rkkkkkkkkkkkkkrkkkr.", // 12
  "rkkkkkkrrrrrrrkkkkr.", // 13
  ".rkkkkkkkkkkkkkkkr..", // 14
  "...rkkkkkkkkkkkkr...", // 15
];

/**
 * Yarn cat: proud and smug (he sits like this on top of the ball). Upright, chest out, chin and nose raised, eye
 * half-lidded, tail up and hooked over at the tip. 20 x 16.
 */
export const PROUD: Sprite = [
// 01234567890123456789
  "........r...r.......", // 0
  ".......rkr.rkr......", // 1
  ".......rkkrkkkr.....", // 2
  ".......rkkkkkkkr....", // 3
  "......rkkkkkeekkr...", // 4
  "......rkkkkkkkkr....", // 5
  "..r....rkkkkkkr.....", // 6
  ".rkr....rkkkkr......", // 7
  "rkrkr..rkkkkkkr.....", // 8
  "rkr...rkkkkkkkkr....", // 9
  "rkr...rkkkkkkkkkr...", // 10
  ".rkr..rkkkkkkkkkr...", // 11
  ".rkr.rkkkkkkrkkkr...", // 12
  "..rkrrkkkkkkrkkkr...", // 13
  "...rkkkkkkkkrkkkr...", // 14
  "....rkkkkkkkrkkkr...", // 15
];

/**
 * The ball of yarn: round, its wound thread in the yarn colour and its shade, the loose strand curling off its lower
 * left onto the floor (towards the unwound yarn of the bar). No rim: the yarn is bright enough on the dark wall. 7 x 7.
 */
export const YARN_BALL: Sprite = [
// 0123456
  "..yyyy.", // 0
  ".yhhhyy", // 1
  ".yyyyhy", // 2
  ".yhhyyh", // 3
  ".hyyhyh", // 4
  "y.hhyh.", // 5
  ".yy....", // 6
];

/**
 * A purr heart (hero-cat.tsx, while he is held): two lobes and a point, in one warm pink, no rim. 5 x 5.
 */
export const HEART: Sprite = [
// 01234
  "pp.pp", // 0
  "ppppp", // 1
  "ppppp", // 2
  ".ppp.", // 3
  "..p..", // 4
];

/**
 * One paw print (paw-prints.tsx): two toes over a pad. Drawn in ink like the rest, but cat.css repaints it with the
 * page's --ink-soft, so the prints sit on the page rather than on the cat. 4 x 4.
 */
export const PAW: Sprite = [
// 0123
  "k..k", // 0
  ".kk.", // 1
  "kkkk", // 2
  ".kk.", // 3
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
  heroFront: HERO_FRONT,
  heroBack: HERO_BACK,
  heroYawn: HERO_YAWN,
  heroStretch: HERO_STRETCH,
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
  yarnSit: YARN_SIT,
  run1: RUN_1,
  run2: RUN_2,
  crouch1: CROUCH_1,
  crouch2: CROUCH_2,
  pounce: POUNCE,
  tumble: TUMBLE,
  proud: PROUD,
  yarnBall: YARN_BALL,
  heart: HEART,
  paw: PAW,
};
