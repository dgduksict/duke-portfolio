# Cozy cat polish — design

**Date:** 2026-11-19
**Status:** approved by the user on 2026-11-19, including the calls in §8
**Builds on:** `2026-11-18-pixel-theme-design.md`, `2026-11-18-loading-screen-design.md`, `2026-11-18-cat-ruler-polish-design.md`.

## 1. Intent

The user loves their pixel theme and the programmer cat: it "feels calming and cute". This round makes the cat livelier and the site cozier, and fixes three things that bother them:

- The UIIA easter egg "is just spinning weird": the whole sprite rotates in-plane like a clock hand. The meme cat turns on its vertical axis.
- The loading screen "looks like it copied the home page": it renders the hero's own `WindowScene`. They want a cat animation there instead. They picked **the cat chasing a ball of yarn along the progress bar**, and earlier asked for something random each time.
- "The small texts kinda hard to read."
- On mobile, the scroll rail should hide after a short while when not scrolling.

They also approved every "calm cute" extra proposed: seasonal snow, summer fireflies, a rare shooting star, a sunrise yawn-and-stretch, hearts when the cat is held, and paw prints on click.

## 2. Goals, non-goals, anti-goals

**Goals**
- Every new motion reads as pixel art: whole sprite cells, `steps()` timing, only `transform` and `opacity` animate, hard edges, no blur, no gradients, no rotation other than 90° multiples or mirroring.
- Calm: slow, sparse, quiet. Extras are rare or small enough to never compete with the content.
- Small body text is crisp and comfortable to read in both themes.

**Non-goals**
- No sound (not even for UIIA).
- No new dependencies, no canvas, no Lottie. Inline SVG rects from bitmaps, as today.
- No content, section or navigation changes.

**Anti-goals**
- Anything that slows a visitor down: the loader must not get meaningfully longer, paw prints must never cover or block a click target, the hold-to-purr must not break the existing poke / UIIA behaviour.
- Motion under `prefers-reduced-motion: reduce`. Every new animation is off there, and every new feature still renders a sensible still state.
- Blurry pixels (fractional scales, squashing, sub-pixel offsets).
- A hydration mismatch from anything random or time-based: randomness and season are decided on the client after mount.

## 3. Approaches (decided)

The user handed the how to the author; these are the author's picks, stated to the user before writing.

| Part | Picked | Rejected and why |
|---|---|---|
| UIIA spin | **Four drawn frames**: side, front, side mirrored, back, cycled fast, with a one-cell hop on the front and back frames. Needs two new 28x28 drawings. | Squashing the side view with `scaleX` to fake a turn: no new art, but squashed pixels blur and break the theme. |
| Yarn loader | **Driven by real progress**: the ball sits at the bar's leading edge and the cat runs behind it; at 100 % one of three endings plays, then the existing wipe. | A CSS loop independent of progress: simpler, but cat and bar drift apart and progress stops being honest. |
| Small text | **Snap sizes to the body face's grid and darken `--ink-soft`.** | Swapping the body font: would redo the whole look. |
| Mobile rail hide | **An idle flag on the compact ruler**, from the scroll pass it already runs. | A second scroll listener: duplicate work. |
| Extras | **SVG + CSS inside the existing hero scene and cat**, decided by pure functions in `src/lib`, unit-tested. | Canvas particles: off-style and heavier. |

## 4. The parts

### 4.1 UIIA: a real spin

Today: `CatArt` (`uiia`) wraps the sitting silhouette in `.cat-spin`, which `cat.css` rotates 0→360° in `steps(4)`, 400 ms a turn, 8 turns (`UIIA.durationMs` 3200), and lifts side-on frames.

New:
- Two new 28x28 sprites in `sprites.ts`, same legend and rim rules: **`HERO_FRONT`** (sitting, facing the viewer: both ears, both eyes as the half-lidded yellow slits, front paws together, tail curling round one side) and **`HERO_BACK`** (sitting, seen from behind: ears, back of head, no eyes, tail straight up or curled). Same sitting height and footprint as the side view so feet stay on row 27.
- Four frames per turn, 100 ms each: side (the existing sitting silhouette) → front → side mirrored → back. The mirror is about **the cat's own body centre** (columns 0–20 of `HERO_DAY`, centre 10.5: pixel-exact), **not** the 28-cell frame, which would put him on the laptop by day and past the slot by night. The front and back drawings are placed on the same body column span, so the turn happens on the spot. 400 ms a turn, 8 turns, so `UIIA.durationMs` and the trigger rules in `lib/cat.ts` do not change.
- Front and back frames sit one cell higher (`translateY(-6px)` inside the 168-unit SVG), the side frames on the sill: a little bounce each half-turn.
- The frames are four groups in the `cat-spin` slot shown one at a time by a stepped opacity keyframe (or one group whose content swaps, the builder's choice); the in-plane rotation and the side-on lift are removed.
- The laptop by day and the mug by night stay where they are today; the night shift (`NIGHT_SPIN_SHIFT`) stays.
- Reduced motion: unchanged (no pose change, only the speech box).

### 4.2 Loader: the yarn chase

Today `loading-screen.tsx` renders `WindowScene` with `CatArt` inside. That goes. The progress logic (`displayedProgress`, `loaderReadout`, the gate, the timings in `LOADER`, scroll locking, the exit wipe, the status label) stays.

**Picture.** A plain wall (`--scene-wall`, dark theme as today) with the wooden trough bar centred, the percent under it. Directly on top of the bar runs a strip as wide as the bar where the cat and the ball live (the trough's top edge is their floor). No window, no sky, no sill.

**The yarn is the progress.** The lit blocks take the yarn's colour instead of `--accent`: the bar reads as unwound thread. The ball's position is `max(leading edge, start position)`: it starts about four blocks in from the left, and once the lit blocks reach it, it rides the boundary between the last lit block and the first dark one, moving a block each time one lights. The cat sits at the bar's left end at the start, then runs a fixed distance (about four blocks) behind the ball, never past the bar's left end.

**New sprites** (in `sprites.ts`, drawn on the loader at `--px` per cell so they sit on the same grid as the bar):
- **Running cat, side view facing right**: two or three run-cycle frames, about 20x14 cells, cycled every ~120 ms while he is moving.
- **Crouch / butt-wiggle frame**: used while progress has stalled (no new block for **800 ms** or more; the easing makes the last block take about 515 ms on a normal load, so a shorter threshold would flash the crouch just before every ending): he crouches and wiggles in two frames, about to pounce. Honest: a stalled load looks like waiting, not running in place.
- **Yarn ball**: about 7x7 cells, two-tone (yarn colour and a shade), with a loose strand. It "rolls" by rotating in 90° steps while moving (pixel-exact).
- **Ending poses** (below), as needed: a pounce/airborne frame, a curled tumble frame, a proud sit-on-ball frame.

Movement is written to the DOM like the blocks are today (a CSS variable or `transform` on the cat and ball when the lit-block count changes, snapped to whole `--px`), never through React state per frame.

**Random per visit** (picked on the client in the effect, written as `data-` attributes on the overlay, never during render):
- **Yarn colour**: amber, rose or sky blue. Three new fixed colour pairs (fill and shade) in `loader.css`, each with a lit-block colour that reads on the trough.
- **Ending** at 100 %: **pounce** (he leaps in two or three frames and lands on the ball), **tumble** (cat and ball roll over together in 90° steps and he ends sitting dazed), or **sit** (he trots up and sits proudly on top of the ball). Each lasts about 700 ms.

The pick is a pure function (`pickYarn(random: () => number)` in `lib/loader.ts` or a new `lib/yarn.ts`) so tests can force each case.

**Timing.** On a normal finish the ending replaces the current 260 ms hold: hold becomes the ending's length (~700 ms), then the existing wipe. When the loader is forced to finish at `LOADER.maxMs` (slow load, hidden tab), no ending plays and the hold is 0 as today, so the cap is unchanged. To keep the first visit no longer than today, `LOADER.minMs` comes down from 1400 to **1000 ms**, so the bar plus the ending takes about the same time as the old bar plus hold.

**Before React takes over** (`data-loader="on"`, server HTML): a still picture: the cat sitting at the left end of the bar, the ball (amber) just ahead. Colour and ending are applied once the effect runs.

**Night.** The loader no longer shows the sky, so the cat no longer sleeps there; he always chases. `catStateForPhase` and the `useNow` / sky imports can leave the loader if nothing else needs them. Whether "the sky having a time" stays as a progress signal is the builder's call (it doubles as "the client has mounted").

**Reduced motion.** No run cycle, no wiggle, no ending, no rolling. The cat sits at the bar's left end, the ball sits at the leading edge and jumps block to block (that is the progress itself), the exit is the existing fade.

**Narrow and short screens.** The strip scales with `--px` like the bar (`--px` 3px under `height < 30rem`, smaller blocks under `width < 26rem`); the cat and ball must stay inside the viewport at 320 px wide.

### 4.3 Readable small text

The body face (Tiny5) is crisp at multiples of 10px; the display face (Press Start 2P) at multiples of 8px. Today body-face text is set at 16px and 14px in several places (`text-sm` / `text-xs` tokens, `.pipeline-label`, `.pipeline-detail`, the 48–64rem `.nav-link`, the hero meta lines, and any other body-face text below 20px the builder finds), often in `--ink-soft` too.

- Every body-face size snaps to a multiple of 10px, with **20px the smallest**. Change the `--text-xs` / `--text-sm` tokens (and their line heights) so existing utility classes follow; fix the hand-set rules. Where 20px does not fit (the 48–64rem nav row is the known case), the builder picks the fix (e.g. the display face at 8px multiples, a tighter layout, or moving the breakpoint), and must not reintroduce horizontal scrolling at 320 px.
- Display-face sizes stay on 8px multiples (they already do).
- This means `--text-xs`, `--text-sm` and `--text-base` all become 20px: small text is no longer smaller. Hierarchy for secondary text (hero meta lines, pipeline details) comes from `--ink-soft`, spacing and the display face for labels, not from size. Tiny5 has no crisp size between 10px (too small to read) and 20px.
- **Darken `--ink-soft`** in light and lighten it in dark so soft text reaches at least 7:1 on `--ground` and `--panel` (AAA for normal text). Raise `contrast.test.ts`'s bar for `--ink-soft` to 7, and add the `--ink-soft` on `--panel` pairing it does not check yet.
- No visual changes to headings, the display name or the hero lead.

### 4.4 Mobile: the rail hides when idle

Only the compact ruler (`data-mode="compact"`). The full desktop ruler is the scrollbar there and never hides.

- `ruler.tsx`'s rAF pass re-arms a timeout at the 150 ms and 1200 ms marks after the last scroll, but only while the cat's pose is type or sit (none at night or near the page bottom). The idle mark needs **its own timer**, re-armed on every scroll in compact mode, at **1500 ms**: from then the root gets `data-idle`; the next scroll clears it.
- `ruler.css`: under `data-idle` the compact rail and its cat fade out in steps (`opacity` 0 over ~300 ms, `steps(3)`), and fade back in the same way (faster: ~150 ms) when scrolling resumes. On first show the rail is visible until the first idle mark.
- The rail never takes the pointer in compact mode, so hiding it changes nothing about interaction.
- The cat's pose logic is unchanged (he still sits / grooms on the hidden rail; it just isn't visible).
- Reduced motion: it still hides and shows, without the transition.
- The native scrollbar beside it is the browser's and is untouched (mobile browsers already auto-hide it).

### 4.5 Seasonal sky: snow and fireflies

In the hero's window (`pixel-sky.tsx` / `window-scene.tsx`), behind the window bars, in front of the sky and the skyline.

- **Season** is from the **Ulaanbaatar date** of `now` (the same `now` the sky uses, so `?time=` previews follow): **winter** = November to March, **summer** = June to August, otherwise none. A pure function `seasonAt(now): "winter" | "summer" | null` in `src/lib`. Add a `?season=winter|summer|none` preview parameter alongside `?time=`, for testing.
- **Snow (winter, every sky phase)**: around 30–40 one-cell flakes in two depths (slow and slower), falling in cell steps with a one-cell sideways drift, looping. Flake colour is the star colour by night and a near-white that reads on the day sky by day. Positions come from a seeded generator (like `pixelStars`), so they are stable and testable.
- **Fireflies (summer, night phase only)**: 6–8 one-cell warm-yellow dots in the lower third of the glass (over the skyline), each blinking on and off in steps and wandering a cell or two, out of phase with each other.
- **Not in the loader** (it has no sky now) and not on the 404 page unless it shares the component for free (builder's call).
- Reduced motion: snow shows as a still scatter of flakes; fireflies show as a few lit dots; nothing moves.

### 4.6 A rare shooting star

- Night phase only, any season. One at a time, at a random interval of about 25–70 s while the page is visible (paused or rescheduled when the tab is hidden; timers are cleared on unmount).
- A short pixel streak (a bright head cell with 3–5 fading trail cells, the trail as stepped opacities, never a gradient) crossing a random upper part of the sky diagonally in cell steps over ~600 ms, then gone.
- Randomness on the client only (start, angle, path), in a pure function that takes a random source.
- Reduced motion: none.

### 4.7 Sunrise: yawn and stretch

- When the hero cat goes from **night to day while the page is open** (the existing cross-fade in `hero-cat.tsx`), he plays a short wake-up instead of the plain cross-fade: **yawn** (head up, mouth open: a new frame or a small mouth patch on the night drawing) → **stretch** (front paws forward, rear up: a new 28x28 frame) → his day pose. About 1.6 s total, in frames.
- Also once on arrival: if the hero cat first appears during the **morning** twilight or golden phase (the sun rising, i.e. before solar noon), he does the yawn-stretch right after his hop-in.
- Day to night stays the existing cross-fade.
- New sprites: `HERO_YAWN` and `HERO_STRETCH` (28x28, feet on row 27).
- Reduced motion: none; the plain swap as today.

### 4.8 Hold the cat: purr and hearts

- **Press and hold** the hero cat button for **500 ms** (pointer, mouse or touch): he purrs. His eye closes into a content curve (the night drawing's shut-eye line, or a new 2-cell patch), small pixel hearts (5x5 cells, a warm pink, new fixed colour in `cat.css`) float up from above his head in cell steps and fade, one every ~350 ms for as long as the hold lasts (at most 3 on screen). The speech box says **"prrr"** (new dictionary key, English and Mongolian; Mongolian is the builder's best equivalent, e.g. "пүррр"), cleared like other lines.
- **Release** stops new hearts; the ones in flight finish. A hold that turned into a purr does **not** also count as a poke (no line, no UIIA count). A press shorter than 500 ms is a normal poke.
- Moving the pointer off the cat or a `pointercancel` ends the hold.
- Touch: long-press must not open the context menu, a callout or a text selection on the cat button (`-webkit-touch-callout: none`, `user-select: none`, `contextmenu` prevented on the button only).
- Keyboard: no hold-to-purr. A native button fires `click` on Enter keydown and on key repeat, so telling a hold from a poke would mean moving the poke to keyup and changing how the button behaves for keyboard users. Keyboard pokes work exactly as today. The purr is a pointer-only extra, like the paw prints.
- At night, holding purrs too (he stays asleep; hearts and "prrr" only, no eye change).
- Not during UIIA.
- Reduced motion: the box says "prrr", no hearts, no eye change.

### 4.9 Paw prints on click

- Homepage only. A click (primary button, or a tap) anywhere on the page drops a pair of tiny pixel paw prints (each about 4x4 cells at `--px`) at the click point, offset diagonally like a step, in `--ink-soft` at reduced opacity. They fade out in steps over ~1 s.
- At most **4 pairs** on screen; the oldest is removed first.
- They sit in one fixed, `pointer-events: none`, `aria-hidden` layer above the content and below the header, so they never block anything. `data-print="hide"`.
- Not on clicks inside the loader, on the full ruler, or on the hero cat (he has his own response).
- One delegated listener on `document`, passive; the layer renders its prints without re-rendering the page.
- Reduced motion: off entirely.

## 5. Constraints

Next 16 (App Router; read `node_modules/next/dist/docs/` before touching framework APIs, per `AGENTS.md`), React 19, Tailwind v4, vitest with jsdom and Testing Library (component tests are the norm here; pure logic lives in `src/lib` with unit tests), ESLint must pass (`npm run lint` runs before build), double-quoted TS, the `Dictionary` interface keeps `en` and `mn` identical, tokens in `globals.css`, colours of the cat fixed in `cat.css`. Existing tests must keep passing; update the ones that assert the old loader scene or the old UIIA rotation. No horizontal scroll at 320 px.

## 6. Left to the builder

- The exact pixel art of every new sprite (front, back, run cycle, crouch, yarn ball, ending poses, yawn, stretch, hearts, paw prints), within the existing legend, rim rules and palette (plus the new yarn and heart colours).
- Exact timings and keyframe percentages within the ranges given.
- The three yarn colour values and the heart pink, chosen to read on their grounds.
- How frames are switched (stepped opacity per group, or swapping content).
- The fix for the 48–64rem nav row at 20px.
- Whether the loader keeps "the sky has a time" as a progress signal, and whether `minMs` comes down a little to offset the ending.
- File layout of the new pure functions (`lib/cat.ts`, `lib/loader.ts`, or new modules).
- Order of work. Suggested: small text and the mobile rail first (smallest, highest value), then UIIA, then the loader, then the extras.

## 7. The author's calls (stated to the user before writing)

Four-frame UIIA spin with new front and back drawings; the yarn chase tied to real progress with the lit blocks as unwound yarn; random yarn colour (amber / rose / sky blue) and random ending (pounce / tumble / sit) per visit; seasons by the Ulaanbaatar calendar (winter Nov–Mar, summer Jun–Aug), fireflies only on summer nights; paw prints fading quickly, at most a few at once; the mobile rail and its cat hiding about 1.5 s after the last scroll.

## 8. The author's calls made while writing (listed to the user with the doc)

- The loader cat no longer sleeps at night: he always chases.
- `minMs` drops to 1000 ms so the ending costs no extra time; the forced finish at `maxMs` skips the ending.
- Stalled progress (800 ms without a new block) shows the crouch-and-wiggle instead of running in place.
- `--ink-soft` raised to 7:1; body-face text never below 20px, so small text is no longer smaller (hierarchy by colour and spacing).
- The UIIA mirror frame flips about the cat's body, not the sprite frame.
- Hold time 500 ms; a purr does not count as a poke; pointer only, no keyboard purr.
- Shooting stars every ~25–70 s, night only.
- The sunrise yawn also plays on arrival in the morning, not only on a live night→day flip.
- Paw prints homepage only, not on the hero cat, the loader or the full ruler.
- A `?season=` preview parameter.
