# Cozy Cat Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the programmer cat livelier and the site cozier. This covers a real UIIA turn, a yarn-chase loader, readable small text, an idle-hiding mobile rail, and calm extras: snow, fireflies, shooting stars, a sunrise yawn, hold-to-purr hearts and paw prints.

**Architecture:** Inline SVG pixel sprites from bitmaps (`sprites.ts` → `PixelSprite`), motion in CSS with `steps()` only. Decisions (season, yarn pick, positions, wake, purr, paw caps) live as pure functions in `src/lib` with unit tests. Components write per-frame values straight to the DOM (refs, `data-*`, CSS variables), never through per-frame React state.

**Tech Stack:** Next 16 App Router, React 19, Tailwind v4, vitest + jsdom + Testing Library, ESLint.

**Spec:** `docs/superpowers/specs/2026-11-19-cozy-cat-polish-design.md`. Read it before any task. Every section number below (§4.x) refers to it.

## Global Constraints

- Pixel discipline: whole sprite cells, `steps()` timing only, only `transform` and `opacity` animate. No blur, no gradients, no rounding, no rotation except 90° multiples or mirroring.
- Every new animation is off under `prefers-reduced-motion: reduce`, and every feature still renders a sensible still state.
- Randomness and season are decided on the client after mount, never during render (no hydration mismatch).
- No sound, no new dependencies, no canvas, no Lottie.
- No horizontal scroll at 320 px.
- Next 16: read `node_modules/next/dist/docs/` before touching framework APIs (`AGENTS.md`).
- The `Dictionary` interface keeps `en` and `mn` identical. Tokens go in `globals.css`; the cat's colours are fixed in `cat.css`.
- Double-quoted TS. `npm run lint`, `npm run typecheck` and `npm test` pass after every task (baseline: 34 files, 445 tests green).
- Commit after each task, ending the message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never push.

## Review Focus

1. **Touch hold that becomes a scroll.** A `pointerdown` on the cat followed by `pointercancel` (the finger scrolls) must neither purr nor poke. Test in Task 11.
2. **A purr, then release.** The `click` that follows must not speak a quote or count toward UIIA. Test in Task 11.
3. **Hidden tab or slow load during the loader.** The forced finish at `maxMs` plays no ending and never leaves `data-yarn-motion="end"` stuck or the scroll locked. Test in Task 6.
4. **Rapid clicks and clicks on controls.** Paw prints cap at 4 pairs, never take the pointer, and never stop a link or button from working. Test in Task 12.
5. **320 px phone.** The yarn cat, the ball and every ending stay inside the viewport; the speech box and hearts stay inside the scene. Manual check in Task 13 at 320×640 and 640×320.

---

### Task 1: Readable small text (§4.3)

**Files:**
- Modify: `src/app/globals.css` (tokens `--text-xs`/`--text-sm` at ~102–105, `--ink-soft` at :27 and :49, `.pipeline-label`/`.pipeline-detail` ~525–535, the 48–64rem `.nav-link` ~655–662)
- Modify: `src/lib/contrast.test.ts`
- Modify as found: any other body-face (Tiny5) rule or utility below 20px (`grep -rn "font-size\|text-\[" src`)

- [ ] **Step 1: Write the failing tests** in `contrast.test.ts`, inside the existing per-selector `describe`: rename `"keeps soft ink at AA on the ground"` to `"keeps soft ink at AAA on the ground"` with `toBeGreaterThanOrEqual(7)`, and add `"keeps soft ink at AAA on raised panels"`: `expect(pair("--ink-soft", "--panel")).toBeGreaterThanOrEqual(7)`. Add a new `describe("body type sizes")` in `src/app/type-scale.test.ts`: read `--text-xs` and `--text-sm` from the `@theme` block and expect each to equal `1.25rem`. Expect `.pipeline-label` and `.pipeline-detail` font-size to be `1.25rem`.
- [ ] **Step 2: Run** `npx vitest run src/lib/contrast.test.ts src/app/type-scale.test.ts`. Expected: FAIL (ratio below 7, sizes 0.875rem/1rem).
- [ ] **Step 3: Implement.** Set `--text-xs` and `--text-sm` to `1.25rem`, line-height 1.5. Set `.pipeline-label`/`.pipeline-detail` to `1.25rem`. Darken light `--ink-soft` and lighten dark `--ink-soft` until both pairings reach 7 (start from `#4f3522` light and `#cdd3e6` dark and check). Fix the 48–64rem nav row so it still fits at 20px, or switch it to the display face at 16px (builder's call), with no wrap and no overflow at 48rem. Audit and fix any other body-face size below 20px. Leave display-face sizes untouched.
- [ ] **Step 4: Run** `npm test`. Expected: all pass.
- [ ] **Step 5: Commit** `fix(type): small body text snaps to 20px and soft ink reaches AAA`.

### Task 2: Mobile rail hides when idle (§4.4)

**Files:**
- Modify: `src/lib/ruler.ts` (add a constant)
- Modify: `src/components/ruler/ruler.tsx` (the effect at ~190–410)
- Modify: `src/components/ruler/ruler.css` (compact section ~263–345)
- Test: `src/components/ruler/ruler.test.tsx`

**Interfaces:**
- Produces: `export const IDLE_AFTER_MS = 1500;` in `src/lib/ruler.ts`. While idle, the ruler root (`.ruler`) carries `data-idle=""`.

- [ ] **Step 1: Write failing tests** (fake timers, compact mode as the existing compact tests set it up):
  - `"marks the compact ruler idle 1500 ms after the last scroll"`: after a scroll + rAF, `data-idle` is absent; advance 1499 ms → absent; advance 1 ms (+ a frame) → present.
  - `"clears idle on the next scroll"`: once idle, dispatch scroll + frame → `data-idle` absent.
  - `"never marks the full ruler idle"`: full mode, advance 5000 ms → absent.
  - `"marks idle at night too"`: night `?time=`, compact, advance 1500 ms → present. This guards the separate timer: the cat's pose timer is not armed at night.
  - In the `ruler.css` describe: `.ruler[data-mode="compact"][data-idle]` sets `opacity: 0` and its transition uses `steps(`.
- [ ] **Step 2: Run** `npx vitest run src/components/ruler/ruler.test.tsx`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement.** Add a second timer in the effect (`idleTimer`), separate from the cat's pose timer. In compact mode, re-arm it whenever the pass sees `window.scrollY` change, and also once when the ruler first goes compact. When it fires, set `box.dataset.idle = ""`. The next pass that sees a scroll deletes it. Clear it when the mode leaves compact and on cleanup. In CSS: compact + `[data-idle]` → `opacity: 0; transition: opacity 300ms steps(3, end)`; compact without it → `transition: opacity 150ms steps(3, end)`. Under reduced motion, no transition (the existing block covers it).
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(ruler): compact rail fades away when the page is still`.

### Task 3: UIIA turns like a top (§4.1)

**Files:**
- Modify: `src/components/cat/sprites.ts` (add `HERO_FRONT`, `HERO_BACK`; export `SPIN_BODY`)
- Modify: `src/components/cat/cat-art.tsx` (`HeroSpin`, ~185–210)
- Modify: `src/components/cat/cat.css` (the UIIA block ~798–817)
- Test: `src/components/cat/cat-art.test.tsx`, `src/components/cat/hero-cat.test.tsx`, `src/components/cat/pixel-sprite.test.ts` (sprite shape tests live there)

**Interfaces:**
- Produces: `HERO_FRONT: Sprite` and `HERO_BACK: Sprite`, each 28×28. Inked pixels only in columns 0–20, the lowest inked row is 27, and the same legend applies (the front has two `e` eye cells, the back none). Also `export const SPIN_BODY = { x0: 0, x1: 20 } as const;`.
- Inside `.cat-spin`, four `<g className="cat-spin-frame" data-frame="side|front|mirror|back">`, in that order.

- [ ] **Step 1: Write failing tests:**
  - sprites: `"draws the front and back on the side view's footing"`: 28 rows of 28 chars, every `[^.]` at column ≤ 20, row 27 has ink, the front contains `e`, the back does not.
  - cat-art: `"turns the UIIA cat through four drawn frames"`: `uiia` → `.cat-spin-frame` count 4, `data-frame` order `side, front, mirror, back`.
  - cat-art: `"mirrors the side frame about his own body"`: the mirror frame's inner wrapper has `transform="translate(126 0) scale(-1 1)"` (`(SPIN_BODY.x1 + 1) * 6`).
  - cat-art: `"lifts the front and back frames one cell"`: those frames' wrapper has `transform="translate(0 -6)"`.
  - css: the UIIA rules contain no `rotate(`, and the frame animation is `400ms steps(1, end) infinite` with delays `0ms, 100ms, 200ms, 300ms` per frame.
  - Update or remove existing assertions about `cat-uiia` rotation and the side-on lift.
- [ ] **Step 2: Run** `npx vitest run src/components/cat`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement.** Draw both sprites per §4.1, at the same sitting height as the `HERO_DAY` silhouette. `HeroSpin` renders the four frames: side = `<Cat parts={DAY}>`; mirror = the same, wrapped in the mirror transform; front and back as `PixelSprite`s, each wrapped in the lift transform. Placement goes on plain wrappers, never on `cat-*` parts. Keep the laptop by day and the mug by night, and keep `NIGHT_SPIN_SHIFT`. In CSS, remove the `cat-uiia` rotation. Each `.cat-spin-frame` animates `cat-uiia-frame` (`0% { opacity: 1 } 25%, 100% { opacity: 0 }`) with its delay. Parts inside stay still.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(cat): UIIA turns side, front, side, back like the real thing`.

### Task 4: Yarn logic and a shorter clock (§4.2)

**Files:**
- Create: `src/lib/yarn.ts`, `src/lib/yarn.test.ts`
- Modify: `src/lib/loader.ts` (`minMs` 1400 → 1000), `src/lib/loader.test.ts`

**Interfaces:**
- Produces:
  - `export type YarnColour = "amber" | "rose" | "sky";`
  - `export type YarnEnding = "pounce" | "tumble" | "sit";`
  - `export const YARN = { ballStart: 4, catGap: 4, stallMs: 800, endingMs: 700 } as const;`
  - `export function pickYarn(random: () => number): { colour: YarnColour; ending: YarnEnding }`. It makes two draws, the colour first. Index `Math.min(2, Math.floor(r * 3))`; a NaN draw counts as 0.
  - `export function yarnPositions(filled: number, blocks: number): { ball: number; cat: number }`. Both are in block units from the bar's left edge. `ball = clamp(max(filled, ballStart), 0, blocks)` and `cat = max(0, ball - catGap)`.
  - `export function isStalled(msSinceLastBlock: number, filled: number, blocks: number): boolean`. True when `msSinceLastBlock >= YARN.stallMs && filled < blocks`.

- [ ] **Step 1: Write failing tests:**
  - `pickYarn(() => 0)` → `{amber, pounce}`. A sequence `[0.5, 0.5]` → `{rose, tumble}`. `[0.99, 0.99]` → `{sky, sit}`. `() => 1` → `{sky, sit}`. `() => NaN` → `{amber, pounce}`.
  - `yarnPositions(0, 20)` → `{ball: 4, cat: 0}`. `(2, 20)` → `{4, 0}`. `(10, 20)` → `{10, 6}`. `(20, 20)` → `{20, 16}`. `(25, 20)` → `{20, 16}`.
  - `isStalled(799, 5, 20)` false; `(800, 5, 20)` true; `(5000, 20, 20)` false.
  - loader.test: `LOADER.minMs` is 1000. Update any expectations computed from 1400.
- [ ] **Step 2: Run** `npx vitest run src/lib/yarn.test.ts src/lib/loader.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the module and the constant change.
- [ ] **Step 4: Run** `npm test`. Expected: PASS (fix any component test that relied on 1400).
- [ ] **Step 5: Commit** `feat(loader): yarn pick, positions and stall rules`.

### Task 5: Yarn sprites and the stage (§4.2)

**Files:**
- Modify: `src/components/cat/sprites.ts` (new sprites; `PALETTE` adds `y` → `--cat-yarn`, `h` → `--cat-yarn-shade`)
- Modify: `src/components/cat/cat.css` (default `--cat-yarn: #e9a420; --cat-yarn-shade: #b9770f;` on `.cat-art`)
- Create: `src/components/loader/yarn-stage.tsx`
- Test: `src/components/loader/yarn-stage.test.tsx`, sprite tests in `pixel-sprite.test.ts`

**Interfaces:**
- Produces sprites on a shared 20×16 grid, feet on row 15, facing right: `YARN_SIT`, `RUN_1`, `RUN_2`, `CROUCH_1`, `CROUCH_2`, `POUNCE`, `TUMBLE`, `PROUD`. Also `YARN_BALL` (7×7, using `y`/`h` plus a loose strand).
- Produces `export function YarnStage(): JSX.Element`. It renders `<div className="yarn-stage" aria-hidden="true">` containing:
  - `<div className="yarn-cat" data-yarn-cat="">`: one `svg.cat-art` (`viewBox="0 0 20 16"`, scale 1) with one `<g data-cat-frame="sit|run-1|run-2|crouch-1|crouch-2|pounce|tumble|proud">` per sprite.
  - `<div className="yarn-ball" data-yarn-ball="">`: one `svg.cat-art` (`viewBox="0 0 7 7"`).
- Which frame shows is decided by CSS from the overlay's `data-yarn-motion` and `data-yarn-ending` (Task 6).

- [ ] **Step 1: Write failing tests:**
  - sprites: each yarn cat sprite is 16 rows of 20, ink on row 15. `YARN_BALL` is 7×7 and contains `y` and `h`.
  - stage: `"draws every cat frame once and the ball"`: the 8 `data-cat-frame` values are present, plus one `[data-yarn-ball]`. The stage is `aria-hidden`.
  - stage: `"paints yarn through the yarn variables"`: some rect in the ball has `fill="var(--cat-yarn)"`.
- [ ] **Step 2: Run** `npx vitest run src/components/loader/yarn-stage.test.tsx src/components/cat/pixel-sprite.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.** Draw the sprites in the existing legend and rim rules, with a cute, readable silhouette at 4 px per cell. Build the stage with `PixelSprite` at scale 1.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(loader): yarn ball and running cat sprites`.

### Task 6: The loader becomes the yarn chase (§4.2)

**Files:**
- Modify: `src/components/loader/loading-screen.tsx`
- Modify: `src/components/loader/loader.css`
- Test: `src/components/loader/loading-screen.test.tsx`

**Interfaces:**
- Consumes: `pickYarn`, `yarnPositions`, `isStalled`, `YARN` (Task 4); `YarnStage` (Task 5); `LOADER`, `displayedProgress`, `loaderReadout` (existing).
- Overlay root attributes written by the effect: `data-yarn-colour` (`YarnColour`), `data-yarn-ending` (`YarnEnding`), and `data-yarn-motion` (`"still" | "run" | "stall" | "end"`). The stage gets the CSS variables `--ball` and `--cat` (block indices).

- [ ] **Step 1: Update and write tests:**
  - Remove the three sky/cat tests (`"shows the cat awake…"`, `"stands the cat in the window's cat slot…"`, `"shows the live pixel sky…"`). Add `"shows no window scene"`: no `.scene` inside `.loader`.
  - `"picks a yarn colour and ending on the client"`: stub `Math.random` with the sequence `[0.5, 0.99]`. After take-over the root has `data-yarn-colour="rose"` and `data-yarn-ending="sit"`. In the idle server markup neither attribute is present.
  - `"moves the ball and cat with the lit blocks"`: drive progress to 10 lit blocks. The stage's `style` has `--ball: 10` and `--cat: 6`.
  - `"crouches when progress stalls and runs again when it moves"`: hold the loaded fraction back. 800 ms after the last new block → `data-yarn-motion="stall"`; release → `"run"`.
  - `"plays the ending for YARN.endingMs before the wipe"`: on a normal finish `data-yarn-motion="end"`, `data-phase` stays `run` until `YARN.endingMs` has passed, then becomes `exit`.
  - Review Focus 3: `"skips the ending when forced to finish at maxMs"`: block every signal and advance to `LOADER.maxMs`. `data-yarn-motion` is never `"end"`, the phase goes to `exit` at once, and after `REMOVE_AFTER_MS` the overlay is gone, `html.style.overflow` restored and `data-loader="done"`.
  - `"keeps still under reduced motion"`: `data-yarn-motion="still"` throughout; the ball variable still follows the blocks.
  - Progress signals are now two: fonts and the window load. Update `"holds the bar back while a signal is missing"` to the two-signal world.
  - css: lit blocks use `var(--cat-yarn)`. Each `[data-yarn-colour]` sets `--cat-yarn` and `--cat-yarn-shade`. No `.loader .scene` rules remain. The existing "steps only" and "hard pixels" CSS tests still pass.
- [ ] **Step 2: Run** `npx vitest run src/components/loader`. Expected: the new and updated tests FAIL.
- [ ] **Step 3: Implement.**
  - Component: remove `WindowScene`, `CatArt`, `useNow`, the sky and `catStateForPhase`; the `loaded()` signal becomes `(fonts + load) / 2`. Render `<YarnStage />` above `.loader-meter`. Pick the yarn in the effect with `pickYarn(Math.random)` and write it to the root. In `paint`, when `filled` changes, write `--ball`/`--cat` from `yarnPositions` and stamp `lastBlockAt`. In `tick`, set the motion to `stall`/`run` from `isStalled` (write only on change). `finish(hold)` gains a flag: a normal finish sets motion `end` and holds `YARN.endingMs`, while the `maxMs` path calls it with hold 0 and no ending. Reduced motion: motion `still`, hold `HOLD_REDUCED_MS`, no ending.
  - CSS: the stage is as wide as the bar (`--pitch: calc(var(--px) * (var(--block-w) + 1))`), with its bottom on the trough's top edge. Ball and cat use `transform: translateX(calc(var(--ball) * var(--pitch)))` (cat with `--cat`) and `transition: transform 120ms steps(2, end)`. Frame switching: `run` alternates `run-1`/`run-2` (240 ms `steps(1)` loop); `stall` alternates the crouch frames; `still` and idle show `sit`. `end` shows the ending's frames with its keyframes (pounce: an arc of ≤ 4 cells high landing on the ball; tumble: cat and ball rotate in 90° steps; sit: `proud`). The ball rolls (90° steps) while `run`. Colours: amber `#e9a420`/`#b9770f`; rose and sky are the builder's, readable on `--scene-wood-deep`. Ending transforms must keep everything inside the overlay at 320 px.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(loader): the cat chases a ball of yarn along the bar`.

### Task 7: Season and sky randomness logic (§4.5, §4.6)

**Files:**
- Create: `src/lib/season.ts`, `src/lib/season.test.ts`, `src/hooks/use-season.ts`
- Modify: `src/lib/pixel-sky.ts` (export its seeded generator if `pixelStars` has one inline, so the season module can reuse it)

**Interfaces:**
- Produces in `src/lib/season.ts`:
  - `export type Season = "winter" | "summer";`
  - `export function seasonAt(now: Date): Season | null`. Uses the Ulaanbaatar month (`ULAANBAATAR_OFFSET_MINUTES`): 11, 12, 1, 2, 3 → winter; 6, 7, 8 → summer; else null.
  - `export function parseSeasonParam(value: string | null): Season | "none" | null`. `null` means no override; anything else unknown → null.
  - `export interface Flake { readonly x: number; readonly y: number; readonly depth: 0 | 1 }`
  - `export function snowflakes(seed: number, count: number, cols: number, rows: number): Flake[]`
  - `export function fireflies(seed: number, count: number, cols: number, rows: number): Cell[]`. Every `y` falls in `[floor(rows * 2 / 3), rows)`.
  - `export interface StreakPath { readonly x: number; readonly y: number; readonly dx: 1 | -1; readonly length: number }`
  - `export function shootingStarPath(random: () => number, cols: number, rows: number): StreakPath`. Here `y < rows * 0.4`, `length` is 3–5, and the start is inside the glass.
  - `export function nextShootingStarDelay(random: () => number): number`, in `[25_000, 70_000]`.
- Produces in `src/hooks/use-season.ts`: `export function useSeason(now: Date | null): Season | null`. It returns null while `now` is null. It reads `?season` once after mount: an override wins, and `"none"` → null.

- [ ] **Step 1: Write failing tests:**
  - `seasonAt` on `2026-11-19T12:00+08:00` → winter. `2026-03-31T23:30+08:00` → winter. `2026-03-31T16:30Z` (that is April 1, 00:30 in Ulaanbaatar) → null. `2026-07-10` → summer. `2026-05-15` → null.
  - `parseSeasonParam`: `"winter"` → winter; `"summer"` → summer; `"none"` → `"none"`; `"spring"` → null; null → null.
  - `snowflakes(1, 36, 128, 64)`: length 36, every value in range, depths 0 and 1 both present, deterministic for the same seed.
  - `fireflies(1, 7, 128, 64)`: length 7, every `y ≥ 42`.
  - `shootingStarPath(() => 0)` and `(() => 0.999)`: in range, `y < 25.6`.
  - `nextShootingStarDelay(() => 0)` = 25000; `(() => 1)` = 70000.
- [ ] **Step 2: Run** `npx vitest run src/lib/season.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the module and the hook.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(sky): seasons by the Ulaanbaatar calendar, flakes and streak paths`.

### Task 8: Snow and fireflies in the window (§4.5)

**Files:**
- Modify: `src/components/scene/pixel-sky.tsx` (new prop; layers after `<Skyline>`, before `<Glints>`)
- Modify: `src/components/scene/window-scene.tsx` (new optional prop `season`, passed through)
- Modify: `src/components/sections/hero.tsx` (`season={useSeason(now)}`)
- Modify: `src/components/scene/scene.css`
- Test: `src/components/scene/window-scene.test.tsx`

**Interfaces:**
- Consumes: `Season`, `snowflakes`, `fireflies`, `useSeason` (Task 7).
- `PixelSkyProps` and `WindowSceneProps` gain `readonly season?: Season | null` (default null). `not-found.tsx` passes nothing.

- [ ] **Step 1: Write failing tests:**
  - `"lets it snow in winter"`: `season="winter"` → `[data-layer="snow"]` holds 36 flake rects in two `scene-snow-0`/`scene-snow-1` groups. Each flake is drawn twice (at `y` and `y - GLASS_ROWS`) so the fall loops seamlessly.
  - `"shows fireflies only on summer nights"`: summer + a night `sky` → `[data-layer="fireflies"]` with 7 rects; summer + day → none; winter + night → none.
  - `"has no seasonal layers without a season"`: neither layer.
  - css: `.scene-snow-0`/`-1` animate `transform` with `steps(64`, and fireflies animate `opacity` with `steps(`. Under reduced motion both have `animation: none`.
- [ ] **Step 2: Run** `npx vitest run src/components/scene`. Expected: FAIL.
- [ ] **Step 3: Implement.** Snow fills are `#fff8e0` at night and `#ffffff` by day (opacity ~0.9). The near group falls `GLASS_ROWS` cells over 16 s, the far one over 24 s, each with a 1-cell sideways drift keyframe; flakes sit behind the bars. Fireflies are `#ffe58a`, blinking with index-staggered negative delays and a 1–2 cell wander.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(sky): winter snow and summer-night fireflies`.

### Task 9: A rare shooting star (§4.6)

**Files:**
- Create: `src/components/scene/shooting-star.tsx`, `src/components/scene/shooting-star.test.tsx`
- Modify: `src/components/scene/pixel-sky.tsx` (render `<ShootingStar active={sky?.phase === "night"} />` inside the svg, after the stars)
- Modify: `src/components/scene/scene.css`

**Interfaces:**
- Consumes: `shootingStarPath`, `nextShootingStarDelay` (Task 7); `GLASS_COLS`/`GLASS_ROWS`.
- Produces: `export function ShootingStar({ active }: { readonly active: boolean }): JSX.Element | null`. A client component that renders a `<g data-layer="shooting-star">` holding at most one streak at a time.

- [ ] **Step 1: Write failing tests** (fake timers, stubbed `Math.random`):
  - `"draws nothing until the first delay"`, then `"draws one streak after nextShootingStarDelay and clears it after 600 ms"` (a head plus `length` trail rects with decreasing opacity attributes).
  - `"never schedules while inactive"`: `active={false}`, advance 120 s → nothing.
  - `"stays dark under reduced motion"`: `matchMedia` reduce → nothing after 120 s.
  - `"skips a streak while the tab is hidden"`: `document.hidden` true at fire time → no streak, but a new delay is scheduled.
  - `"clears its timers on unmount"`: `vi.getTimerCount()` is 0 after unmount.
- [ ] **Step 2: Run** `npx vitest run src/components/scene/shooting-star.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement.** Timers in an effect keyed on `active`; the streak path goes into state (once per streak, which is fine). CSS: `.scene-shooting-star` translates `dx * 12` cells and `+6` cells over 600 ms with `steps(6, end)`, then fades out.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(sky): a rare shooting star on clear nights`.

### Task 10: Sunrise yawn and stretch (§4.7)

**Files:**
- Modify: `src/components/cat/sprites.ts` (`HERO_YAWN`, `HERO_STRETCH`, 28×28, feet on row 27)
- Modify: `src/lib/cat.ts`, `src/lib/cat.test.ts`
- Modify: `src/components/cat/cat-art.tsx` (hero prop `wake?: boolean`)
- Modify: `src/components/cat/hero-cat.tsx`, `src/components/cat/cat.css`
- Test: `src/components/cat/hero-cat.test.tsx`, `src/components/cat/cat-art.test.tsx`

**Interfaces:**
- Produces in `lib/cat.ts`:
  - `export const WAKE_MS = 1600;`
  - `export function wakesOnArrival(sun: SunPosition, phase: SkyPhase): boolean`. True when `phase` is `"twilight"` or `"golden"` and `sun.azimuth < 180` (morning, the sun in the east).
- `CatArt` hero with `wake` renders the laptop plus two `<g className="cat-wake-frame" data-frame="yawn|stretch">`. CSS shows yawn for the first half of `WAKE_MS` and stretch for the second.

- [ ] **Step 1: Write failing tests:**
  - lib: `wakesOnArrival({elevation: 2, azimuth: 110}, "golden")` true; azimuth 250 → false; `"day"` → false; `"night"` → false.
  - cat-art: `wake` → both frames are present and no `cat-spin` is rendered.
  - hero-cat: `"yawns and stretches when night turns to day"`: rerender with a day `now` after a night one → `CatArt` `wake` is on (two `.cat-wake-frame`) and no cross-fade layer exists. After `WAKE_MS` → the day drawing.
  - hero-cat: `"wakes on arrival on a morning sky"`: a morning golden `?time=` → wake plays after the 1000 ms hop. An evening golden time → it doesn't.
  - hero-cat: `"day to night still cross-fades"` (existing behaviour kept).
  - hero-cat: `"no wake under reduced motion"`: a plain swap.
  - hero-cat: `"UIIA cancels a wake"`: five pokes during the wake → spin frames, no wake frames.
- [ ] **Step 2: Run** `npx vitest run src/lib/cat.test.ts src/components/cat`. Expected: FAIL.
- [ ] **Step 3: Implement.** Draw the yawn (head up, mouth open) and the stretch (front paws forward, rear up). In `HeroCat`, a `wake` state is set by the night→day flip (in place of `setLeaving`) or on arrival via `wakesOnArrival` (1000 ms after the cat first shows). A timer clears it after `WAKE_MS`; clear the timers on unmount. Pokes during a wake speak normally.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(cat): a yawn and a stretch at sunrise`.

### Task 11: Hold the cat to purr (§4.8)

**Files:**
- Modify: `src/lib/cat.ts`, `src/lib/cat.test.ts`
- Modify: `src/lib/i18n/dictionary.ts` (`cat.purr`: en `"prrr"`, mn `"пүррр"`), `src/lib/i18n/dictionary.test.ts` if it lists keys
- Modify: `src/components/cat/sprites.ts` (`HEART` 5×5 with a new legend `p` → `--cat-heart`; add it to `PALETTE`)
- Modify: `src/components/cat/cat-art.tsx` (hero prop `content?: boolean`: eye cells drawn as `r`, a shut curve)
- Modify: `src/components/cat/hero-cat.tsx`, `src/components/cat/cat.css` (`--cat-heart`, hearts, touch rules)
- Test: `src/components/cat/hero-cat.test.tsx`

**Interfaces:**
- Produces: `export const PURR = { holdMs: 500, heartEveryMs: 350, maxHearts: 3, heartLifeMs: 1200 } as const;` in `lib/cat.ts`. While purring, `.hero-cat` carries `data-purr=""`, and hearts are `.hero-cat-heart` elements inside `.hero-cat-hearts` (`aria-hidden`).

- [ ] **Step 1: Write failing tests** (fake timers, `fireEvent.pointerDown/Up/Cancel/Leave`):
  - `"purrs after a 500 ms hold"`: pointerdown, advance 499 → no `data-purr`; advance 1 → `data-purr`, status `"prrr"`, one heart. At 350 ms intervals more hearts appear, never more than 3 at once; each is removed after 1200 ms.
  - Review Focus 2: `"a purr is not a poke"`: hold 600 ms, pointerup, click → status stays `"prrr"` (no quote). Then 4 quick pokes → no UIIA (the purr's click was not counted).
  - `"a short press is a poke"`: down, up at 300 ms, click → a quote.
  - Review Focus 1: `"a hold that turns into a scroll does nothing"`: down, `pointercancel` at 200 ms, advance 1000 → no purr, no line, no hearts. The same with `pointerleave`.
  - `"stops new hearts on release"`: hold 1000 ms, up, advance 1000 → no heart added after release.
  - `"purrs asleep at night without opening his eye"`: night → `data-purr`, hearts, no `content` eye change.
  - `"closes his eye contentedly by day"`: day purr → the eye layer has no `var(--cat-eye)` fills.
  - `"ignores holds during UIIA"`.
  - `"keeps still under reduced motion"`: the status says `"prrr"`, with no hearts and no eye change.
  - `"blocks the long-press menu on the cat only"`: `contextmenu` on the button is `defaultPrevented`. The css test checks `.hero-cat-button` has `-webkit-touch-callout: none` and `user-select: none`.
  - Keyboard: Enter still pokes on keydown exactly as today (existing test kept).
- [ ] **Step 2: Run** `npx vitest run src/components/cat src/lib`. Expected: FAIL.
- [ ] **Step 3: Implement.** Hold timer on `pointerdown` (primary button only); `pointerup`/`pointercancel`/`pointerleave` end the hold. A ref `purred` makes the next `click` return early, then resets. Hearts come from an interval while held; each heart is `{id, bornAt}` in state and is removed by its own timeout. Hearts float up 4 cells over `heartLifeMs` in `steps(4)` and fade in the last step. Clear every timer on unmount.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(cat): hold him to purr little pixel hearts`.

### Task 12: Paw prints on click (§4.9)

**Files:**
- Modify: `src/lib/cat.ts`, `src/lib/cat.test.ts`
- Modify: `src/components/cat/sprites.ts` (`PAW`, 4×4, ink `k`)
- Create: `src/components/cat/paw-prints.tsx`, `src/components/cat/paw-prints.test.tsx`
- Modify: `src/app/layout.tsx` (mount `<PawPrints />` after `<Ruler />` inside `Providers`)
- Modify: `src/components/cat/cat.css`

**Interfaces:**
- Produces in `lib/cat.ts`:
  - `export const PAWS = { maxPairs: 4, lifeMs: 1000 } as const;`
  - `export interface Paw { readonly id: number; readonly x: number; readonly y: number }`
  - `export function addPaw(list: readonly Paw[], paw: Paw, max: number = PAWS.maxPairs): Paw[]`. It appends and drops the oldest beyond `max`, without mutating `list`.
- Produces: `export function PawPrints(): JSX.Element | null`. A fixed layer `.paw-layer` (`aria-hidden`, `data-print="hide"`, `pointer-events: none`, `z-index: 45`). Each pair is a `.paw-pair` positioned at the click point.

- [ ] **Step 1: Write failing tests:**
  - lib: `addPaw` caps at 4, keeping the newest 4 ids, and leaves the input untouched.
  - component: `"drops a pair of prints where you click"`: click at (100, 200) → one `.paw-pair` whose style places it there, with 2 paw svgs.
  - Review Focus 4: `"keeps at most four pairs"`: 6 rapid clicks → 4 pairs, the newest ones.
  - Review Focus 4: `"never blocks the page"`: clicking a `<button onClick={spy}>` and an `<a>` still calls the spy and does not prevent default; the layer's computed `pointer-events` is `none` (css test).
  - `"fades each pair after a second"`: advance 1000 → 0 pairs.
  - `"ignores clicks on the loader, the full ruler and the cat"`: targets inside `.loader`, `.ruler[data-mode="full"]` and `.hero-cat-button` → no pair.
  - `"ignores non-primary buttons"`: `button: 2` → none.
  - `"is off under reduced motion and away from the homepage"`.
  - `"removes its listener on unmount"`.
- [ ] **Step 2: Run** `npx vitest run src/components/cat/paw-prints.test.tsx src/lib/cat.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.** One passive `click` listener on `document`, using `usePathname()` for the homepage check. The two prints are offset diagonally by 3 `--px` like a step. Colour is `--ink-soft` at opacity 0.5; they fade in `steps(4)` over `lifeMs`. Timers are cleared on unmount.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(cat): tiny paw prints where you click`.

### Task 13: Whole-branch verification and a look in the browser

**Files:** none new (fixes go to the task they belong to, committed as `fix(...)`).

- [ ] **Step 1: Run** `npm run lint && npm run typecheck && npm test && npm run build`. Expected: all green, the test count above 445, the build succeeds.
- [ ] **Step 2: Look in the real app** (use the `run` skill: `npm run dev`, then a browser). Take screenshots at 1280×800, 768×1024, 320×640 and 640×320 of:
  - the loader on a fresh session, with each colour and ending forced via a stubbed `Math.random` in the console or several reloads;
  - `/?time=22:00&season=summer` (fireflies);
  - `/?season=winter` (snow);
  - `/?time=06:30` (sunrise yawn);
  - UIIA (five quick clicks), a 500 ms hold (purr) and clicks (paw prints);
  - the phone rail after 2 s still.
  Check Review Focus 5: nothing outside the viewport, and no horizontal scroll.
- [ ] **Step 3: Fix** anything found, re-run Step 1, commit.
- [ ] **Step 4: Hand over** to the user with the screenshots and the Mongolian line `"пүррр"` to proofread.
