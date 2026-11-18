import { type ReactNode, useId } from "react";
import type { CatState, RulerPose } from "@/lib/cat";
import { cn } from "@/lib/utils";

export type CatArtProps = ({ variant: "hero"; state: CatState } | { variant: "mini"; pose: RulerPose }) & {
  className?: string;
};

/**
 * The programmer cat, smug about his clean code: an ink cat with a pale rim light, in a blue hoodie with amber
 * drawstrings, at a laptop full of tidy code. Pure inline SVG, decorative (aria-hidden), painted only through the
 * `.cat-art` colour variables in cat.css, which map the portfolio's own tokens for the light and the dark theme.
 *
 * Two scales of one character: `hero` (200 x 200; day = typing, night = asleep on the closed laptop) and `mini`
 * (48 x 48, the ruler cat's five poses). Every part that moves sits in its own group with a `cat-*` class (head, eye,
 * ear-l, ear-r, tail, paw-l, paw-r, screen, zzz, body). Those groups never carry a transform attribute themselves:
 * their placement lives on a wrapping group, so CSS transforms on them stay free for the animation.
 */
export function CatArt(props: CatArtProps) {
  const id = `cat${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  if (props.variant === "hero") {
    return (
      <svg
        viewBox="0 0 200 200"
        width="200"
        height="200"
        aria-hidden="true"
        focusable="false"
        className={cn("cat-art", props.className)}
        data-state={props.state}
      >
        <Hoodie id={id} x1={52} y1={92} x2={128} y2={194} />
        {props.state === "day" ? <HeroDay hoodie={id} /> : <HeroNight hoodie={id} />}
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 48 48"
      width="48"
      height="48"
      overflow="visible"
      aria-hidden="true"
      focusable="false"
      className={cn("cat-art", props.className)}
      data-pose={props.pose}
    >
      <Hoodie id={id} x1={10} y1={28} x2={34} y2={48} />
      <Mini pose={props.pose} hoodie={id} />
    </svg>
  );
}

/**
 * The hoodie's paint: one blue, lit from the top left and deepening a little towards the bottom right. A single hue
 * (a shade, not a sweep across colours), in user space so every piece of the hoodie (sleeves too) shares it.
 */
function Hoodie({ id, x1, y1, x2, y2 }: { id: string; x1: number; y1: number; x2: number; y2: number }) {
  return (
    <defs>
      <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
        <stop offset="0" className="h-lit" />
        <stop offset=".55" className="h-mid" />
        <stop offset="1" className="h-deep" />
      </linearGradient>
    </defs>
  );
}

/** An ink paw: a pale edge under it, a rim of light on top. Centred on 0,0. */
function Paw({ rx, ry, edge = 2.6 }: { rx: number; ry: number; edge?: number }) {
  return (
    <>
      <ellipse className="s-edge" strokeWidth={edge} rx={rx} ry={ry} />
      <ellipse className="f-ink" rx={rx} ry={ry} />
      <path
        className="s-rim"
        strokeWidth={r1(edge * 0.45)}
        d={`M${r1(-rx * 0.6)} ${r1(-ry * 0.75)}Q0 ${r1(-ry * 1.15)} ${r1(rx * 0.6)} ${r1(-ry * 0.8)}`}
      />
    </>
  );
}

/** Rounds to one decimal, to keep generated path data short. */
function r1(n: number) {
  return Math.round(n * 10) / 10;
}

/* ---------------------------------------------------------------------------------------------------------------- */
/* Hero                                                                                                             */
/* ---------------------------------------------------------------------------------------------------------------- */

/*
 * The laptop is drawn in one oblique projection. On the ground plane the hinge axis (60 units wide) runs right and
 * towards the viewer, the depth axis (44 units, hinge to front edge) runs left towards the cat; GROUND maps those
 * local units onto the page. LID maps the open lid (60 x 44, leaning back a little) the same way.
 */
const DAY_GROUND = "matrix(.924 .348 -.768 .42 126 150)";
const DAY_LID = "matrix(.924 .348 -.2 1.153 134.8 99.2)";
const DAY_HOOD = "M58 116C52 98 68 88 90 88C112 88 126 98 120 116C110 106 68 106 58 116Z";
const DAY_HOODIE =
  "M58 112C48 130 44 160 45 186C45 191 49 194 55 194L121 194C127 194 130 191 129 186C128 160 124 130 116 112C106 103 68 103 58 112Z";
const DAY_ARM_L = "M108 118C116 130 124 148 128 157";
const DAY_ARM_R = "M100 126C108 148 128 166 143 168.5";

const HEAD =
  "M-34-6C-34-22-18-32 0-32C20-32 36-22 37-4C38 12 30 24 16 28C6 31-8 31-18 27L-26 26-23 22-34 20-29 16-38 10-32 6C-34 2-34-2-34-6Z";
/** The head's outline where no ear covers it (the edge would otherwise show as a seam at the ear roots). */
const HEAD_EDGE =
  "M36.4-12C37.6 3 31 21 16 28C6 31-8 31-18 27L-26 26-23 22-34 20-29 16-38 10-32 6C-34 2-34-4-33-10M-8-29.6Q-3-32 2-31.4";
const EAR_R = "M2-30L24-55Q27-58 28-54L35-15Z";
const EAR_L = "M-31-12L-40-50Q-40.5-54-37-51.5L-8-29Z";

/** The hero head, centred on 0,0 and turned three-quarters to his left. Awake: half-lidded side-eye and a smirk. */
function HeroHead({ asleep = false }: { asleep?: boolean }) {
  return (
    <g className="cat-head">
      <g className="cat-ear-r">
        <path className="s-edge" strokeWidth="3" d={EAR_R} />
        <path className="f-ink" d={EAR_R} />
        <path className="f-ink2" d="M8-29L24-49L29-22Z" />
      </g>
      <g className="cat-ear-l">
        <path className="s-edge" strokeWidth="3" d={EAR_L} />
        <path className="f-ink" d={EAR_L} />
        <path className="f-ink2" d="M-29-17L-36-44L-14-29Z" />
        <path className="s-rim" strokeWidth="1.5" d="M-32.5-15L-39.5-47" />
      </g>
      <path className="s-edge" strokeWidth="3" d={HEAD_EDGE} />
      <path className="f-ink" d={HEAD} />
      <path className="s-rim" strokeWidth="1.8" d="M-33.5 4C-35-16-21-30-3-31.6" />
      {asleep ? (
        <>
          <g className="cat-eye">
            <path className="s-paper" strokeWidth="2" d="M-20-3Q-10 3-1-3" />
          </g>
          <g className="cat-eye">
            <path className="s-paper" strokeWidth="1.8" d="M16-3Q22 1.5 28-2.5" />
          </g>
        </>
      ) : (
        <>
          <g className="cat-eye">
            <path className="f-eye" d="M-21-7L1-6C0 3-18 4-21-7Z" />
            <path className="f-ink" d="M-19-6.9L-12.5-6.6C-12.5 0-19 0-19-6.9Z" />
          </g>
          <g className="cat-eye">
            <path className="f-eye" d="M15-7L29-6C29 1.5 17 2.5 15-7Z" />
            <path className="f-ink" d="M16.2-6.9L20.8-6.7C20.8-1.6 16.2-1.6 16.2-6.9Z" />
          </g>
          <path className="s-paper" strokeWidth="1.6" d="M15-15Q22-19.5 29-15.5" />
        </>
      )}
      <path className="f-nose" d="M15 7.5L23 7.5Q23 9 19 12Q15 9 15 7.5Z" />
      <path className="s-paper" strokeWidth="1.6" d="M19 12V14.5M11 16Q15 17.5 19 14.5Q25 16 30 10.5" />
      <path className="s-whisker" strokeWidth=".9" d="M-14 12L-46 7M-14 15L-44 18M31 12L48 7M31 15L47 17" />
    </g>
  );
}

function HeroDay({ hoodie }: { hoodie: string }) {
  const h = `url(#${hoodie})`;
  return (
    <>
      <ellipse className="f-ground" cx="110" cy="193" rx="86" ry="5" />

      {/* laptop, behind the cat: lid back, lid face with the screen, deck */}
      <path className="f-metal2" d="M136.7 98.2L192.1 119.1L183.3 169.9L127.9 149Z" />
      <g transform={DAY_LID}>
        <rect className="f-ink2" width="60" height="44" rx="3" />
        <g className="cat-screen">
          <rect className="f-screen" x="3" y="3" width="54" height="36" rx="1" />
          {/* five tidy lines: two-space indents, aligned columns */}
          <g strokeWidth="2.2">
            <path className="s-code-accent" d="M7 9H14M11 19H16M7 31H12" />
            <path className="s-code-soft" d="M17 9H28M19 14H31M31 24H37M15 31H22" />
            <path className="s-code-sun" d="M31 9H42M19 19H29M11 24H28" />
            <path className="s-code-rule" d="M11 14H16M32 19H45M25 31H33" />
          </g>
          <rect className="f-cursor" x="36" y="29.2" width="2.2" height="3.6" />
        </g>
      </g>
      <path className="f-metal2" d="M92.2 168.5L147.6 189.4L181.4 170.9V175.9L147.6 194.4L92.2 173.5Z" />
      <g transform={DAY_GROUND}>
        <rect className="f-metal" width="60" height="44" rx="1.5" />
        <rect className="f-ink2" x="5" y="4" width="50" height="20" rx="1.5" />
        <path className="s-metal2" strokeWidth="1" strokeDasharray="3 1.6" d="M7 9.5H53M7 14.5H53M7 19.5H53" />
        <rect className="s-metal2" strokeWidth="1" x="22" y="28" width="16" height="12" rx="1.5" />
      </g>

      {/* tail, curling out on the far side */}
      <g className="cat-tail">
        <path className="s-edge" strokeWidth="12" d="M56 188C28 194 14 178 19 158C22 146 33 142 31 130" />
        <path className="s-ink" strokeWidth="9" d="M56 188C28 194 14 178 19 158C22 146 33 142 31 130" />
        <path className="s-rim" strokeWidth="1.5" d="M23 180C15 172 14 162 18 154" />
      </g>

      <g className="cat-body">
        <g transform="translate(62 191)">
          <Paw rx={10} ry={4.5} />
        </g>
        {/* the hood, bunched behind the neck, and the hoodie; the pale edge keeps the blue off a blue sky */}
        <path className="s-edge" strokeWidth="3" d={DAY_HOOD} />
        <path className="s-edge" strokeWidth="3" d={DAY_HOODIE} />
        <path className="f-ink" d={DAY_HOOD} />
        <path fill={h} opacity=".8" d={DAY_HOOD} />
        <path fill={h} d={DAY_HOODIE} />
        <path className="s-hoodie-lit" strokeWidth="1.6" d="M56 118C49 134 46.5 156 46.5 178" />
        <path className="f-shade" d="M45.1 184L129.1 184L129 186C130 191 127 194 121 194L55 194C49 194 45 191 45 186Z" />
        <path className="s-shade" strokeWidth="1.4" d="M64 158L106 158L112 180L58 180Z" />
        {/* half zip and drawstrings, in amber */}
        <path className="s-sun" strokeWidth="1.6" d="M89 107V124" />
        <rect className="f-sun" x="87.2" y="123" width="3.6" height="5" rx="1" />
        <path className="s-sun" strokeWidth="1.8" d="M80 109L78 128M98 109L100 126" />
        <circle className="f-sun" cx="77.8" cy="130" r="1.9" />
        <circle className="f-sun" cx="100.2" cy="128" r="1.9" />
        <path className="s-paper" strokeWidth="2" opacity=".9" d="M78 141L74 145L78 149M86 140L82 150M90 141L94 145L90 149" />
      </g>

      <g transform="translate(88 68) rotate(-8)">
        <HeroHead />
      </g>

      {/* arms in front of everything, paws on the keys */}
      <path className="s-shade" strokeWidth="17" d={DAY_ARM_L} />
      <path stroke={h} fill="none" strokeLinecap="round" strokeWidth="14" d={DAY_ARM_L} />
      <path className="s-shade" strokeWidth="17" d={DAY_ARM_R} />
      <path stroke={h} fill="none" strokeLinecap="round" strokeWidth="14" d={DAY_ARM_R} />
      <path className="s-shade" strokeWidth="14" strokeLinecap="butt" d="M125.4 151L128 157M137 167.5L143 168.5" />
      <g transform="translate(131 161.5) rotate(20)">
        <g className="cat-paw-l">
          <Paw rx={7} ry={4.4} />
        </g>
      </g>
      <g transform="translate(148.5 170.3) rotate(20)">
        <g className="cat-paw-r">
          <Paw rx={7} ry={4.4} />
        </g>
      </g>
    </>
  );
}

/** Night: the laptop closed (the site's two-eyes sticker on the lid), the cat curled on it, asleep, with a zzz. */
const NIGHT_GROUND = "matrix(.962 .363 -.8 .438 90 140)";
const NIGHT_HOODIE = "M58 156C52 132 70 106 102 104C132 102 152 120 152 142C152 152 148 158 140 160Z";

/** The sticker: the header's two eyes, white with dark pupils, glancing to the side. Centred on 0,0. */
function EyesSticker() {
  return (
    <>
      <rect className="f-ink2" x="-10" y="-6" width="20" height="12" rx="6" />
      <circle className="f-paper" cx="-4.4" r="4" />
      <circle className="f-paper" cx="4.4" r="4" />
      <circle className="f-ink" cx="-3.2" cy=".6" r="1.9" />
      <circle className="f-ink" cx="5.6" cy=".6" r="1.9" />
    </>
  );
}

function HeroNight({ hoodie }: { hoodie: string }) {
  const h = `url(#${hoodie})`;
  return (
    <>
      <ellipse className="f-ground" cx="100" cy="190" rx="82" ry="5" />

      {/* closed laptop: the sides with the seam, then the lid (lid back up) with the sticker */}
      <path className="f-metal2" d="M54.8 159.3L112.5 181.1L147.7 161.8V169L112.5 188.3L54.8 166.5Z" />
      <path className="s-shade" strokeWidth=".8" d="M54.8 162.9L112.5 184.7L147.7 165.4" />
      <g transform={NIGHT_GROUND}>
        <rect className="f-metal" width="60" height="44" rx="1.5" />
        <g transform="translate(17 34)">
          <EyesSticker />
        </g>
      </g>

      {/* tail dangling over the laptop's edge */}
      <g className="cat-tail">
        <path className="s-edge" strokeWidth="11" d="M64 150C50 154 44 164 46 177C47 184 45 188 40 190" />
        <path className="s-ink" strokeWidth="8" d="M64 150C50 154 44 164 46 177C47 184 45 188 40 190" />
        <path className="s-rim" strokeWidth="1.4" d="M49.5 158C45 164 44 170 44.5 176" />
      </g>

      <g className="cat-body">
        <path className="s-edge" strokeWidth="3" d={NIGHT_HOODIE} />
        <path fill={h} d={NIGHT_HOODIE} />
        <path className="s-hoodie-lit" strokeWidth="1.6" d="M60 148C57 130 72 110 100 107" />
        <path className="f-shade" d="M58 156C56 151 55 147 56 143C76 154 126 158 152 146C151 153 147 158 140 160Z" />
        <path className="s-paper" strokeWidth="2" opacity=".9" d="M84 120L80 124L84 128M92 119L88 129M96 120L100 124L96 128" />
        <path className="f-ink" d="M110 112C122 108 140 112 146 124C136 118 120 118 110 124Z" opacity=".25" />
      </g>

      <g transform="translate(134 138) rotate(12) scale(.9)">
        <HeroHead asleep />
      </g>
      <g transform="translate(122 164) rotate(8)">
        <g className="cat-paw-l">
          <Paw rx={8} ry={4.6} />
        </g>
      </g>
      <g transform="translate(143 160) rotate(4)">
        <g className="cat-paw-r">
          <Paw rx={7.5} ry={4.4} />
        </g>
      </g>

      <g className="cat-zzz">
        <path className="s-zzz-a" strokeWidth="2.2" d="M175 112H181L175 119H181" />
        <path className="s-zzz-b" strokeWidth="2.4" d="M180 92H189L180 102H189" />
        <path className="s-zzz-a" strokeWidth="2.6" d="M185 68H196L185 81H196" />
      </g>
    </>
  );
}

/* ---------------------------------------------------------------------------------------------------------------- */
/* Mini (ruler cat)                                                                                                 */
/* ---------------------------------------------------------------------------------------------------------------- */

const MINI_HEAD = "M-12-2C-12-8-6-11 0-11C7-11 13-7 13-1C13 5 9 9 3 10C-3 11-9 10-12 7L-14.5 4.5L-12 3Z";
const MINI_EAR_R = "M1-10L9-20L12-4Z";
const MINI_EAR_L = "M-10-4L-15-18L-3-10Z";

/** The mini head, centred on 0,0, the same three-quarter turn as the hero, cut to what reads at 32 to 48 px. */
function MiniHead({ asleep = false }: { asleep?: boolean }) {
  return (
    <g className="cat-head">
      <g className="cat-ear-r">
        <path className="s-edge" strokeWidth="1.6" d={MINI_EAR_R} />
        <path className="f-ink" d={MINI_EAR_R} />
      </g>
      <g className="cat-ear-l">
        <path className="s-edge" strokeWidth="1.6" d={MINI_EAR_L} />
        <path className="f-ink" d={MINI_EAR_L} />
        <path className="s-rim" strokeWidth=".8" d="M-10.6-5L-14.4-16.6" />
      </g>
      <path className="s-edge" strokeWidth="1.6" d="M12.8-3C13.4 4 9 9 3 10C-3 11-9 10-12 7L-14.5 4.5L-12 3L-11.8-4M-3-10.5Q-1-11 1-10.6" />
      <path className="f-ink" d={MINI_HEAD} />
      <path className="s-rim" strokeWidth="1" d="M-11.6-1C-11.6-7-6-10.4-1-10.6" />
      {asleep ? (
        <g className="cat-eye">
          <path className="s-paper" strokeWidth="1.1" d="M-8-1Q-4.5 1.6-1-1M4-1Q6.5 1 9-1" />
        </g>
      ) : (
        <g className="cat-eye">
          <path className="f-eye" d="M-8.5-2.5L-.5-2C-1 2-7.5 2.2-8.5-2.5ZM3.5-2.2L9.5-1.8C9.5 1.4 4.5 1.6 3.5-2.2Z" />
          <path className="f-ink" d="M-8-2.4L-5-2.3C-5 .3-8 .3-8-2.4ZM4-2.1L6.4-2C6.4.2 4 .2 4-2.1Z" />
        </g>
      )}
      <circle className="f-nose" cx="7.5" cy="3" r="1.2" />
      <path className="s-paper" strokeWidth=".9" d="M3.5 6Q5.5 6.8 7.3 5Q9.5 5.8 11.5 3.5" />
    </g>
  );
}

/** The seated hoodie (sit, type, groom), with the hood bunched at the neck and the amber drawstrings. */
function MiniSeated({ h, x }: { h: string; x: number }) {
  const d = `M${x - 11} 47C${x - 12} 37 ${x - 8} 30 ${x} 29C${x + 8} 29 ${x + 12} 37 ${x + 11} 47Z`;
  return (
    <g className="cat-body">
      <path className="s-edge" strokeWidth="1.6" d={d} />
      <path fill={h} d={d} />
      <path className="f-shade" d={`M${x - 8} 31.5Q${x} 27 ${x + 8} 31.5Q${x} 29.6 ${x - 8} 31.5Z`} />
      <path className="s-sun" strokeWidth="1" d={`M${x - 2.6} 32V37.4M${x + 2.6} 32V36.6`} />
    </g>
  );
}

/** A hoodie sleeve: pale edge, a darker seam, then the blue. */
function MiniArm({ h, d }: { h: string; d: string }) {
  return (
    <>
      <path className="s-edge" strokeWidth="6.6" d={d} />
      <path className="s-shade" strokeWidth="5.6" d={d} />
      <path stroke={h} fill="none" strokeLinecap="round" strokeWidth="4.4" d={d} />
    </>
  );
}

/** A hoodie body lying down (sleep, nap), with its pale edge. */
function MiniLying({ h, d, children }: { h: string; d: string; children?: ReactNode }) {
  return (
    <g className="cat-body">
      <path className="s-edge" strokeWidth="1.6" d={d} />
      <path fill={h} d={d} />
      {children}
    </g>
  );
}

function MiniTail({ d }: { d: string }) {
  return (
    <g className="cat-tail">
      <path className="s-edge" strokeWidth="4.6" d={d} />
      <path className="s-ink" strokeWidth="3.2" d={d} />
    </g>
  );
}

function Mini({ pose, hoodie }: { pose: RulerPose; hoodie: string }) {
  const h = `url(#${hoodie})`;
  switch (pose) {
    case "type":
      return (
        <>
          {/* a tiny laptop to his left, screen towards him */}
          <path className="f-metal2" d="M33.6 26.4L46.6 30.4L45.6 43.4L32.6 39.4Z" />
          <path className="f-ink2" d="M32.6 27L45.6 31L44.6 44L31.6 40Z" />
          <g className="cat-screen">
            <path className="f-screen" d="M33.6 29L44.1 32.2L43.4 41.6L32.9 38.4Z" />
            <path className="s-code-accent" strokeWidth="1.2" d="M34.8 31.3L38.6 32.5" />
            <path className="s-code-sun" strokeWidth="1.2" d="M35.6 34.1L41.1 35.8" />
            <path className="s-code-soft" strokeWidth="1.2" d="M34.4 36.5L38.1 37.6" />
          </g>
          <path className="f-metal" d="M31.6 40L44.6 44L36.6 47L23.6 43.5Z" />
          <MiniTail d="M13 46C5 47 3 39 7 34" />
          <MiniSeated h={h} x={21} />
          <MiniArm h={h} d="M27 34.5L31 41" />
          <g transform="translate(32 42.6) rotate(18)">
            <g className="cat-paw-l">
              <Paw rx={2.6} ry={1.7} edge={1.2} />
            </g>
          </g>
          <g transform="translate(37.4 44.6) rotate(18)">
            <g className="cat-paw-r">
              <Paw rx={2.6} ry={1.7} edge={1.2} />
            </g>
          </g>
          <g transform="translate(21 20) rotate(-6)">
            <MiniHead />
          </g>
        </>
      );
    case "groom":
      return (
        <>
          <MiniTail d="M15 46C6 47 4 39 8 34" />
          <MiniSeated h={h} x={23} />
          <g transform="translate(19.5 46.4)">
            <Paw rx={3} ry={1.6} edge={1.2} />
          </g>
          <g transform="translate(23 21) rotate(12)">
            <MiniHead asleep />
          </g>
          <MiniArm h={h} d="M29 41C33.5 37 35 33 34 30" />
          <ellipse className="f-nose" cx="30.6" cy="28.4" rx="1.6" ry="1.1" transform="rotate(-30 30.6 28.4)" />
          <g transform="translate(33.6 26.6) rotate(-70)">
            <g className="cat-paw-r">
              <Paw rx={3.4} ry={2.3} edge={1.3} />
            </g>
          </g>
        </>
      );
    case "sleep":
      return (
        <>
          <MiniLying h={h} d="M6 47C4 37 12 30 24 30C36 30 43 37 42 47Z">
            <path className="f-shade" d="M27 31Q36 30 41 37Q35 33 27 33Z" />
          </MiniLying>
          <MiniTail d="M8 45C12 48 22 48 27 46" />
          <g transform="translate(33 38.5) rotate(16) scale(.88)">
            <MiniHead asleep />
          </g>
          <g transform="translate(31 46.2)">
            <g className="cat-paw-l">
              <Paw rx={3} ry={1.6} edge={1.2} />
            </g>
          </g>
          <g className="cat-zzz">
            <path className="s-zzz-a" strokeWidth="1.2" d="M39 22H42L39 25.5H42" />
            <path className="s-zzz-b" strokeWidth="1.4" d="M43 14H47L43 18.5H47" />
          </g>
        </>
      );
    case "nap":
      return (
        <>
          {/* flat out, chin on the closed laptop, tail hanging off the needle */}
          <MiniTail d="M7 44C3 45 2 48 3 52" />
          <MiniLying h={h} d="M4 47C3 40 9 35 18 35C26 35 30 39 30 47Z" />
          <path className="f-metal2" d="M24 42.5H44L46.5 40V43L44 46H24Z" />
          <path className="f-metal" d="M24 42.5H44L46.5 40H27Z" />
          <circle className="f-paper" cx="40.4" cy="41.3" r=".9" />
          <circle className="f-paper" cx="42.6" cy="41.3" r=".9" />
          <g transform="translate(33.5 33) rotate(4) scale(.9)">
            <MiniHead asleep />
          </g>
          <g transform="translate(29 42.6)">
            <g className="cat-paw-l">
              <Paw rx={3.1} ry={1.6} edge={1.2} />
            </g>
          </g>
          <g transform="translate(37 42.8)">
            <g className="cat-paw-r">
              <Paw rx={3} ry={1.5} edge={1.2} />
            </g>
          </g>
        </>
      );
    default:
      return (
        <>
          <MiniTail d="M15 46C6 47 4 39 8 34" />
          <MiniSeated h={h} x={24} />
          <g transform="translate(20.5 46.2)">
            <g className="cat-paw-l">
              <Paw rx={3} ry={1.7} edge={1.2} />
            </g>
          </g>
          <g transform="translate(27.5 46.2)">
            <g className="cat-paw-r">
              <Paw rx={3} ry={1.7} edge={1.2} />
            </g>
          </g>
          <g transform="translate(24 20) rotate(-6)">
            <MiniHead />
          </g>
        </>
      );
  }
}
