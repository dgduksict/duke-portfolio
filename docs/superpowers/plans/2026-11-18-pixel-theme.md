# Portfolio Pixel-Art Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn duke-portfolio into one coherent pixel-art world (reference: a cozy pixel room, warm day / navy night, a simple black pixel cat): pixel font everywhere, a pixel window hero showing the live sky, a simple pixel cat, a pixel loading screen, a pixel ruler scrollbar, pixel-styled sections.

**Architecture:** Pixel art is drawn in code: CSS stepped gradients and stair-step borders on a single pixel unit `--px`, inline SVG rects generated from small bitmap maps (cat, plants, skyline), `steps()` animation. The existing pure logic (`src/lib/{cat,loader,ruler,ruler-gate}.ts`), the loader mechanics and the hero-cat mechanics (bubble, click rotation, day/night flip, hop timing, tests) are kept; their art and CSS are replaced.

**Tech Stack:** Next 16 App Router, React 19, Tailwind v4, next-themes, zustand, vitest + jsdom + Testing Library, `playwright-core` by file URL from the sibling repo's `node_modules`. No new dependencies; fonts via `next/font/google`.

**Spec:** `docs/superpowers/specs/2026-11-18-pixel-theme-design.md` (binding for appearance). Behaviour specs that still hold: `2026-11-18-cat-ruler-polish-design.md` (§3.1 behaviour, §3.2 ruler mechanics) and `2026-11-18-loading-screen-design.md` (§3 behaviour). Paths are relative to the repo root `duke-portfolio/`.

**Where we are:** the earlier plan `2026-11-18-cat-ruler-loader-polish.md` is done through its Task 4 (logic; a vector cat; a loader; a hero cat; all committed on branch `feature-cat-ruler-loader`). Its Tasks 5–8 are **superseded by this plan**. The vector `CatArt`, `cat.css`, the loader's visuals and the hero cat's placement are re-skinned here. The ruler's mechanics are those of the earlier plan; only the look changes.

## Global Constraints

- **One pixel unit:** `--px` (4 px; one variable scales it down on narrow screens). Everything pixel-drawn snaps to it; `image-rendering: pixelated`, `shape-rendering: crispEdges`. No blur, soft shadow, rounded corners or smooth gradients in the pixel world (stepped hard-stop bands only).
- **Palette:** day (light theme) = warm cream wall/ground, wood browns, lamp amber, plant green, deep brown ink; night (dark theme) = deep navy ground, cooler navy panels, window-yellow accent, cream text. Accent is amber/yellow in both (darker amber in light so links keep AA). **WCAG AA** for all text in both themes (a unit test enforces it, Task 1). No rainbow, no other site's colours or logos.
- **Fonts:** pixel font everywhere via `next/font/google`, subsets `latin`, `latin-ext`, `cyrillic`, `cyrillic-ext`; Ө ө Ү ү must render in the chosen faces (not a fallback). Candidates with both Cyrillic subsets: Press Start 2P, Tiny5, Handjet. Pixelify Sans is not usable (no Ө/Ү).
- **Cat:** simple black pixel silhouette (see spec 3.3). Keep the `CatArt` props (`{ variant: "hero"; state: CatState } | { variant: "mini"; pose: RulerPose }` + `className`), root `data-state`/`data-pose`, `aria-hidden`, `focusable="false"`, and the part classes `cat-head`, `cat-eye`, `cat-ear-l`, `cat-ear-r`, `cat-tail`, `cat-paw-l`, `cat-paw-r`, `cat-screen`, `cat-zzz`, `cat-body` (not every pose has every part; no `cat-*` element carries a `transform` attribute). Colours are fixed values scoped to `.cat-art` (the cat must not repaint on theme flip), light and `.dark` rim variants allowed.
- **Behaviour carried over unchanged:** day/night = sky phase (`catStateForPhase`, `?time=HH:MM`); loader first visit per session, `minMs` 1400 / `maxMs` 3500 / reduced `minMs` 600 / session key `"duke:loader-seen"` / `html[data-loader]` `on`→`run`→`done` / scroll lock always released / no-JS safe; ruler desktop only (`RULER_MIN_WIDTH` 900), `html[data-ruler="on"]` set by the gate before hydration and released after 5000 ms unless `window.__rulerLive`, ticks every 2 % (labelled every 10 %), needle hidden below 3 %, rail ~40 px, one passive scroll listener, never touches wheel/touch/keyboard, `aria-hidden`, hidden while `<html>` is scroll-locked; ruler cat types within 150 ms of scrolling, grooms after 1200 ms idle, naps from 98 %; click-for-a-quote bubble clears after ~4 s.
- **Motion:** `steps()` timing; only `transform`, `opacity` and `stroke-dashoffset` animate; reduced motion = static pose/scene, no loops, no hop; no per-frame React state.
- **Layers:** header `z-50`; ruler below header and loader and any open mobile menu; loader `z-[100]`; `data-print="hide"` on decorative layers.
- Repo conventions: double-quoted TS, ESLint must pass (inline type imports, no `console.log`, no `any`, `eqeqeq`), `Dictionary` en/mn identical, text only through the dictionary, Next 16 notes in `node_modules/next/dist/docs/` when unsure.
- Dev server: `http://localhost:3114` is running (do not start or stop servers; port 3000 is another app). Playwright: `import { chromium } from "playwright-core"` with `chromium.launch({ channel: "chrome", ignoreDefaultArgs: ["--hide-scrollbars"] })`; scripts and PNGs live outside the repo (`%TEMP%`). Seed `sessionStorage["duke:loader-seen"]="1"` via an init script to skip the loader except where testing it.
- Commit after each task with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (an implementer model may use its own name). Branch: `feature-cat-ruler-loader`. Commands from the repo root: `npm test -- <path>`, `npm run typecheck`, `npm run lint`.

## Review Focus

1. Glyph coverage and legibility: `Ө ө Ү ү` render in the pixel font (not fallback) in both faces, and long Mongolian and English paragraphs are comfortably readable at body size (Tasks 1, 2).
2. AA contrast of every text/background pairing in light and dark theme, including text over the hero scene and over the ruler panel (Tasks 1, 4, 7).
3. Layout: the scene and the cat never cover the name, intro, buttons, header or the ruler; no horizontal scroll at 320 px; the scene degrades below 760 px (Tasks 4, 5).
4. Robustness carried from the earlier reviews: no JS, blocked/throwing `sessionStorage`, hung fonts or `load`, unmount mid-load, scroll lock released on every path, ruler restored native bar, language switch EN↔MN reflow keeps ruler markers correct (Tasks 6, 7).
5. Reduced motion, print, light/dark, `?time=` dawn/dusk edges: static and legible, loader/ruler/cats hidden in print (Tasks 3–8).

---

### Task 1: Pixel foundation (tokens, fonts, utilities, base components)

**Files:**
- Create: `src/lib/fonts.ts`, `src/app/pixel.css`, `src/lib/contrast.ts`, `src/lib/contrast.test.ts`
- Modify: `src/app/layout.tsx` (replace Geologica with the pixel fonts via `src/lib/fonts.ts`), `src/app/globals.css` (tokens for day/night, `@theme` font variables, base/components layers: `.btn*`, `.link*`, focus ring, selection, `.header-control`, type classes `.display-name`, `.type-title`, `.type-project`, `.type-lead`, `.measure`), and `@import "./pixel.css";`

**Interfaces (produces):**
- `fonts.ts`: `fontDisplay`, `fontBody` (next/font objects with CSS variables `--font-display`, `--font-body`) and `fontVariables: string` (the two `.variable` class names joined) for `<html className>`.
- `pixel.css`: the pixel unit `--px`, and utility classes `.px-box` (panel with stepped pixel border and flat fill from tokens), `.px-box-inset`, `.px-btn` helper rules used by `.btn`, `.px-dash` (pixel-dashed underline), `.px-rule` (pixel divider strip), `.px-focus` ring; all square, hard-stepped, theme-aware via tokens.
- `contrast.ts`: `contrastRatio(a: string, b: string): number` (WCAG, `#rrggbb`), `parseTokens(css: string, selector: ":root" | ".dark"): Record<string, string>` (reads `--token: #hex` declarations from a rule block).

- [ ] **Step 1: Write failing tests.** `contrast.test.ts`: `contrastRatio("#000000", "#ffffff") === 21` and `("#777777", "#ffffff")` is about 4.48 (±0.01); `parseTokens` reads a sample CSS string; then, reading the real `src/app/globals.css`, for both `:root` and `.dark`: `--ink`/`--ground` ≥ 7, `--ink-soft`/`--ground` ≥ 4.5, `--accent-text`/`--ground` ≥ 4.5 and `--ink`/`--panel` ≥ 7 (define `--panel`, `--accent-text` tokens), `--on-accent`/`--accent` ≥ 4.5 (text on accent buttons).
- [ ] **Step 2: Run `npm test -- src/lib/contrast.test.ts`; expect FAIL.**
- [ ] **Step 3: Implement.** Define the day/night token sets from the reference's mood (spec 3.1) with the contrast above; pick fonts by the bake-off (spec 3.1; keep a short note of the result in your report); body paragraph size/line-height chosen for readability; build `pixel.css`; restyle `.btn`, links, focus ring, header controls, selection; remove smooth gradients, blur, soft shadows and radii from base styles. Keep component markup unchanged unless a style cannot be done in CSS.
- [ ] **Step 4: Run the new test, `npm test`, `npm run typecheck`, `npm run lint`; expect PASS (update any existing test only where it asserted a removed class).
- [ ] **Step 5: Browser check:** a throwaway page or the home page at 1440 and 390, EN and MN, light and dark: confirm programmatically that `Ө ө Ү ү` use the pixel font (draw to a canvas with the font vs a known fallback and compare widths/pixels, or `document.fonts.check`) and LOOK at screenshots of headings and a long paragraph in both languages and both themes; adjust sizes until clearly readable.
- [ ] **Step 6: Commit** `feat(theme): pixel foundation: tokens, fonts and utilities`.

### Task 2: Pixel sections (experience, work, stack, testimonials, contact, footer, header)

**Files:**
- Create: `src/components/ui/pixel-divider.tsx`, `src/components/ui/pixel-divider.test.tsx`
- Modify: `src/components/ui/section.tsx`, `src/components/layout/site-header.tsx`, `src/components/layout/site-footer.tsx`, `src/components/sections/{experience,work,stack,testimonials,contact}.tsx`, `src/components/work/pipeline.tsx`, `src/components/ui/{copy-button,eyes}.tsx` if needed, `src/app/globals.css`/`pixel.css` for the classes they use, and existing tests only where markup they assert changes

**Interfaces (produces):** `PixelDivider()`: a decorative (`aria-hidden`, `data-print="hide"`) pixel strip (a small skyline/brick row built from the pixel unit and tokens) used by `Section` in place of its flat `border-t`; `Section` keeps `id`, `aria-labelledby`, props, heading structure and the sticky title on wide screens.

- [ ] **Step 1: Write failing tests:** `PixelDivider` renders an `aria-hidden` element with no text; `Section` renders `section#id` labelled by its `h2`, contains a `PixelDivider` and no `border-t` class; existing section tests still find their headings and links.
- [ ] **Step 2: Run; expect FAIL.**
- [ ] **Step 3: Implement the pixel treatment** (spec 3.6): pixel boxes for entries and project blocks, square bullets/dots, pixel-dashed links, stepped hover/focus states (a one-unit shift, no smooth transitions), the header's pixel look (square controls, pixel language toggle, theme toggle, keep the pupil-following `Eyes` mark), pipeline diagrams with pixel nodes and stepped connectors, footer in the pixel style. Keep every text, link, heading, `aria-*` and id; text contrast AA in both themes. No content changes.
- [ ] **Step 4: Run tests, `npm test`, typecheck, lint; expect PASS.**
- [ ] **Step 5: Screenshots** of the whole page at 1440 and 390, light and dark, EN and MN; LOOK at them; check no horizontal scroll at 320, sticky titles and anchor offsets still work.
- [ ] **Step 6: Commit** `feat(theme): pixel sections, header and footer`.

### Task 3: The pixel cat

**Files:**
- Create: `src/components/cat/sprites.ts`, `src/components/cat/pixel-sprite.tsx`, `src/components/cat/pixel-sprite.test.ts`
- Rewrite: `src/components/cat/cat-art.tsx`, `src/components/cat/cat.css` (static paint only here; keep the animation rules for Task 5/8 working by keeping class names), `src/components/cat/cat-art.test.tsx` (update to the new art)

**Interfaces (produces):**
- `sprites.ts`: bitmap maps as `readonly string[]` rows with a palette legend (e.g. `.` empty, `k` ink black, `r` rim, `e` eye, `a` amber, `g` glow, `w` white, `s` screen) for: hero day cat, hero night cat, laptop, mug, steam frames, `z` marks, and five mini poses (`type`, `sit`, `groom`, `sleep`, `nap`); `PALETTE: Record<string, string>` mapping legend chars to CSS variables (`--cat-ink`, `--cat-rim`, ...).
- `pixel-sprite.tsx`: `spriteRects(map: readonly string[]): { x: number; y: number; w: number; h: number; c: string }[]` (merge horizontal runs of the same colour into one rect) and `PixelSprite(props: { map: readonly string[]; scale: number; className?: string; layer?: string })` rendering `<g>` of `<rect>`s with `shape-rendering="crispEdges"`.
- `CatArt` as in Global Constraints, drawn from the sprites (parts as separate `<g class="cat-…">` layers so they can be animated independently).

- [ ] **Step 1: Write failing tests:** `spriteRects` merges runs, ignores `.`, keeps rows/columns right for a small map (assert exact rects); every sprite map in `sprites.ts` is rectangular and uses only legend chars present in `PALETTE`; `CatArt`: hero day has `data-state="day"` and `.cat-screen` and no `.cat-zzz`; hero night has `.cat-zzz`; five mini poses render with `data-pose`; root `aria-hidden`; no duplicate ids with several instances; the CSS file and markup contain none of the old brand strings (`#ef4445`, `#eb4397`, `#8253a2`, `#3f5fac`, `#3ea3db`, `--c-pink`, `--grad`) and no `gradient(`; rendered size per variant under 15 KB.
- [ ] **Step 2: Run; expect FAIL.**
- [ ] **Step 3: Draw the sprites** (spec 3.3): black silhouette like the reference — sitting in profile, chin slightly up, two ear points, tail curled — pixel-simple; a 1-unit lighter rim so it reads on the dark window; day = at a small pixel laptop with a glowing screen (screen pixels in the accent colours), paws on keys; night = loafed/curled asleep with pixel `z`s, mug with steam beside him. Minis are smaller, even simpler. No rainbow, no logos. Replace the old vector art and its CSS.
- [ ] **Step 4: Run tests, `npm test`, typecheck, lint; expect PASS** (loader and hero-cat tests that assert cat markup must still pass or be updated for the new markup only).
- [ ] **Step 5: Stills:** throwaway preview route (delete before committing) showing every sprite on cream, navy and a sky-blue panel at 1x and 4x; screenshot and LOOK; iterate until it reads as a cute, simple black cat like the reference, legible at the mini size.
- [ ] **Step 6: Commit** `feat(cat): simple pixel cat sprites`.

### Task 4: The pixel window scene (hero)

**Files:**
- Create: `src/lib/pixel-sky.ts`, `src/lib/pixel-sky.test.ts`, `src/components/scene/window-scene.tsx`, `src/components/scene/pixel-sky.tsx`, `src/components/scene/skyline.tsx`, `src/components/scene/scene.css`, `src/components/scene/window-scene.test.tsx`
- Modify: `src/components/sections/hero.tsx` (replace `<Sky />` and the ridge with `<WindowScene />`; keep name/headline/intro/buttons content and order), `src/components/layout/site-header.tsx` (`useOverSky` must follow the new scene), `src/app/globals.css` (import `scene.css`)

**Interfaces (produces):**
- `pixel-sky.ts` (pure): `quantizeBands(sky: SkyState, bands: number): string[]` (flat hex colours top to bottom, interpolated from `zenith`/`mid`/`horizon` via `mixHex`, exactly `bands` entries), `snap(value: number, unit: number): number`, `pixelStars(seed: number, count: number, cols: number, rows: number): { x: number; y: number }[]` (deterministic, on-grid, unique cells), `skylineBlocks(seed: number, cols: number): { x: number; w: number; h: number; lit: number[] }[]` (building columns with heights and window cells), `windowLights(phase: SkyPhase, block: …, seed: number): number[]` (which window cells are lit: none by day, most at night, some at dusk), `ridgeSteps(cols: number, maxH: number): number[]` (stepped silhouette heights, deterministic).
- `WindowScene(props: { now: Date | null; children?: ReactNode })`: renders the room corner and window with the live pixel sky (`data-ready`, `data-phase` like `Sky`), `children` rendered in the **cat slot** (a positioned area on the sill/table, with a stable `data-cat-slot` attribute). Exposes the same `.sky` class hook the header observes (or updates the header hook to the new class) so the header can switch style over the scene.

- [ ] **Step 1: Write failing tests** (pure functions first): `quantizeBands` returns exactly N valid `#rrggbb` strings with first ≈ zenith and last ≈ horizon, deterministic; `snap`; `pixelStars` is deterministic for a seed, unique, all on-grid, within bounds; `skylineBlocks` deterministic and non-overlapping within `cols`; `windowLights`: none lit in `"day"`, more in `"night"` than in `"twilight"` for the same block; `ridgeSteps` deterministic and within `maxH`. `window-scene.test.tsx`: renders nothing time-dependent on the server render (`now` null → `data-ready="false"` and base sky colour); with a day time sets `data-phase="day"`; with a night time `data-phase="night"` and some lit window cells; the cat slot element exists and renders `children`; root `aria-hidden` for the decorative parts but children stay accessible; no old-brand colours.
- [ ] **Step 2: Run; expect FAIL.**
- [ ] **Step 3: Implement** per spec 3.2: wooden window frame with cross mullions and a sill; the pane shows the quantised sky bands, grid-snapped stars (opacity from `sky.stars`), a pixel sun/moon at the sun's computed position, Bogd Khan ridge steps behind, a skyline of blocks whose windows light by phase; on the sill: pixel plants (bitmap sprites), by night a steaming mug; by day a glowing lamp near the window edge (amber pixels); room wall in the day/night token colours. Compose with CSS grid/absolute coordinates on the pixel unit so the cat slot position is static and known. Below 760 px simplify (window only). `scene.css`: stepped animations only (twinkling stars with `steps()`, steam frames), reduced motion = static. Keep the hero's text legible (AA) and the header readable over the scene in both themes. `?time=HH:MM` must still drive everything.
- [ ] **Step 4: Run tests, `npm test`, typecheck, lint; expect PASS** (the hero tests must still find the name, headline, links).
- [ ] **Step 5: Screenshots** at 1440×900, 1024×768, 800×700, 390×844 and at `?time=` 06:00, 13:00, 18:30, 22:00, 02:00; light and dark; LOOK; the scene reads like the reference's mood (warm day room, navy night window with lit skyline), never covers text, no horizontal scroll at 320.
- [ ] **Step 6: Commit** `feat(scene): pixel window hero with the live sky`.

### Task 5: The hero cat in the scene

**Files:**
- Modify: `src/components/cat/hero-cat.tsx`, `src/components/cat/cat.css`, `src/components/cat/hero-cat.test.tsx`, `src/components/sections/hero.tsx` (render `<HeroCat now={now} />` as the `WindowScene`'s children), `src/components/scene/*` only for the slot

**Interfaces:** consumes `WindowScene`'s cat slot (Task 4), `CatArt`/pixel sprites (Task 3), `useCatState`, `useLoaderDone`, `useI18n`. `HeroCat` keeps its behaviour: nothing on the server or before `now`/loader-done; hop in once; day/night loops; cross-fade on state flip; button named `dict.cat.label`; click rotates `dict.cat.quotes` (day) or `dict.cat.sleeping` (night) in a polite `role="status"` region that clears after ~4 s; reduced motion static; hidden below 760 px (or the scene's simplified form).

- [ ] **Step 1: Update/extend tests:** the existing behaviour cases still pass against the new markup (button name, rotation, night `sleeping`, 4 s clear, unmount clears timers, waits for the loader); the cat is rendered inside the scene's cat slot; the bubble is a pixel box (class), no `rounded-`/`blur`/`shadow` classes on it.
- [ ] **Step 2: Run; expect FAIL where markup changed.**
- [ ] **Step 3: Re-skin.** Remove the ridge-measuring positioning (the slot is static now; keep any measurement only if the slot needs it); stepped keyframes (`steps()`): hop in (a few frames), day = typing paws (2-frame), slow tail flick, laptop-screen pixel blink; night = breathing (1-px body shift), drifting pixel `z`s, steam frames on the mug; pixel speech box with a stair-step tail; the per-state tail origins and fixed cat colours stay; the two-tone focus ring becomes a pixel block ring. Reduced motion: static.
- [ ] **Step 4: Run tests, `npm test`, typecheck, lint; expect PASS.**
- [ ] **Step 5: Playwright:** at 1440, 1024, 800 and 760/759 (hidden/simplified), `?time=13:00` and `?time=01:30`, EN and MN, light and dark, reduced motion: the cat sits on the table/sill convincingly, a real `page.mouse.click` at the button's centre opens the bubble, no overlap with the h1/buttons/header, no console errors; frames across the hop; LOOK at them.
- [ ] **Step 6: Commit** `feat(cat): hero cat in the pixel scene`.

### Task 6: The pixel loading screen

**Files:**
- Modify: `src/components/loader/loading-screen.tsx`, `src/components/loader/loader.css`, `src/components/loader/loading-screen.test.tsx`
- Reuse: `src/components/scene/*` pieces (the pixel sky, skyline, sill) and the pixel cat from Tasks 3 and 4

**Interfaces:** the component's mechanics, exports (`LoadingScreen`, `LoaderGate`, `useLoaderDone`) and the `data-loader`/`data-phase` lifecycle are unchanged. Visual changes only: a small pixel window scene (live sky in pixels, skyline, the cat on the sill); progress is a **row of chunky pixel blocks** that fills (the readout stays a small pixel-font percent); the exit is a stepped wipe (`steps()` lift) instead of the smooth lift; the overlay's palette follows the night tokens as before.

- [ ] **Step 1: Update tests** for the new markup (blocks bar: assert the number of filled blocks follows `displayedProgress`; keep all lifecycle cases (a)–(h): hidden when unmarked, session key set, scroll locked and always released, `maxMs` ceiling with hung signals, unmount cleanup, throwing storage, reduced motion, Mongolian label, `useLoaderDone`).
- [ ] **Step 2: Run; expect FAIL where markup changed.**
- [ ] **Step 3: Re-skin** per spec 3.4. Also fix the carried-forward minors: `html[data-loader="on"] { overflow: hidden }` in CSS so the page does not scroll before hydration; set `data-loader="run"` and the lock only after the effect's setup cannot throw (or wrap setup in try/catch with release); the hidden overlay is unmounted (`phase "gone"`) on repeat visits and non-home routes.
- [ ] **Step 4: Run tests, `npm test`, typecheck, lint; expect PASS.**
- [ ] **Step 5: Playwright:** first visit shows the pixel loader in the first paint, blocks fill, stepped wipe, `html[data-loader]` ends `done`, scroll restored; reload shows nothing; `?time=01:30` asleep cat; no-JS; hung fonts exit by about 3.5 s; mobile and desktop, light and dark, MN, reduced motion; LOOK at frames.
- [ ] **Step 6: Commit** `feat(loader): pixel loading screen`.

### Task 7: The pixel ruler

**Files:**
- Create: `src/components/ruler/ruler-gate.tsx`, `src/components/ruler/ruler.tsx`, `src/components/ruler/ruler.css`, `src/components/ruler/ruler.test.tsx`
- Modify: `src/app/layout.tsx` (`<RulerGate />` beside `<LoaderGate />`; `<Ruler />` inside `<Providers>`), `src/app/globals.css` (import `ruler.css`), `src/lib/i18n/dictionary.ts` (`ruler: { top }`: en "Top", mn "Эхлэл")

**Interfaces:** consumes `src/lib/ruler.ts` and `src/lib/ruler-gate.ts` (done), `navItems`, `useI18n`. Produces `RulerGate()` (server) and `Ruler()` (client; nothing on the server). Mechanics ported from the reference `Ruler.tsx`: one passive scroll listener + ResizeObserver on `document.body` + MutationObserver on `<html>` style + `matchMedia` change + one passive window `resize` listener, all only scheduling one coalesced rAF pass; cached measurements behind a dirty flag; pointer capture with a 3 px drag slop (click = smooth scroll unless reduced motion, drag = instant); the component also claims and releases `html[data-ruler="on"]` and mirrors `window.__rulerLive`; hysteresis of +1 px in the "document taller than viewport" test; markers for `top` + every `navItems` id re-measured after a **language switch** reflow; decorative text rendered via `data-*` + CSS `::after` so find-in-page cannot see it; the native bar hidden by `html[data-ruler="on"] { scrollbar-width: none }` and the WebKit pseudo-element.

- [ ] **Step 1: Write failing tests** (jsdom; mock `matchMedia`, `ResizeObserver`, `getBoundingClientRect`, `scrollTo`, `requestAnimationFrame`): nothing when `(min-width: 900px) and (pointer: fine)` does not match; when it matches `window.__rulerLive` is true and `html[data-ruler="on"]`, both removed on unmount; markers for `top` and each nav id with labels in the active language, re-labelled on a language switch without remount and re-measured; a document not taller than the viewport (within the hysteresis) removes `data-ruler` and renders no rail; root `aria-hidden`; pointer down/move/up calls `window.scrollTo` with `progressToScrollTop(...)` (`smooth` click, `instant` drag and for reduced motion); hidden while `<html>` inline `overflow` is `hidden` and visible again when it changes; no `wheel`/`touchstart`/`touchmove`/`keydown` listener registered; label text is not present as DOM text.
- [ ] **Step 2: Run; expect FAIL.**
- [ ] **Step 3: Implement** with the pixel look (spec 3.5): a narrow pixel rail panel (so it stays legible over the window scene and over both grounds), square ticks (longer every 10 %), a pixel arrow needle with a blocky percent readout (pixel font, hidden below 3 %), square section markers with pixel labels on hover/near the needle, stepped transitions only, no content gutter, below the header/loader/menu, not overlapping the header controls or the hero cat's button.
- [ ] **Step 4: Run tests, `npm test`, typecheck, lint; expect PASS.**
- [ ] **Step 5: Playwright (real scrollbars):** `clientWidth` never changes across load and hydration (no layout shift); 50 % scroll reads 50 ±1; clicking the rail at 75 % lands within 2 %; marker click lands on its heading; EN→MN switch keeps markers matching headings; absent below 900 px (native bar present); hidden while the loader runs and back after; `javaScriptEnabled: false` keeps the native bar; reduced motion clicks jump instantly; dark theme legible over the scene and over the ground; a real drag scrubs; `elementFromPoint` shows the rail never covers header controls or the cat button; LOOK at top/mid/bottom shots in both themes at 1440 and 1024.
- [ ] **Step 6: Commit** `feat(ruler): pixel ruler scrollbar with section markers`.

### Task 8: The pixel cat on the needle

**Files:**
- Create: `src/components/cat/ruler-cat.tsx`, `src/components/cat/ruler-cat.test.tsx`
- Modify: `src/components/ruler/ruler.tsx`, `src/components/cat/cat.css`

**Interfaces:** consumes `CatArt` mini sprites, `rulerCatPose`, `useCatState` (gate: renders only when non-null), `NEEDLE_FADE_BELOW`. Produces `RulerCat(props: { state: CatState; msSinceScroll: number; progress: number })` rendering the mini with `rulerCatPose(...)`, facing the page (flip the mini sprite on a wrapper, counter-flip the `z`s), `pointer-events: none`.

- [ ] **Step 1: Write failing tests:** each `rulerCatPose` case gives the matching `data-pose`; night stays `sleep` while scrolling; progress 0.99 by day is `nap`; non-finite props still render a pose; facing wrapper class; `pointer-events: none` class.
- [ ] **Step 2: Run; expect FAIL.**
- [ ] **Step 3: Implement.** `Ruler` tracks `msSinceScroll` inside its existing rAF pass (no second scroll listener) with one timeout re-armed after the last scroll for the 150/1200 ms thresholds; React state changes only when the POSE changes (no re-renders at night for day-only changes); stepped mini animations per pose; fades in with the needle; arrival hop kept inside the rail lane; percent labels near the needle hide under him; reduced motion static.
- [ ] **Step 4: Run tests, `npm test`, typecheck, lint; expect PASS.**
- [ ] **Step 5: Playwright:** `?time=13:00`: scrolling gives `type`, ~0.2 s later `sit`, ~1.3 s later `groom`, bottom `nap`; `?time=01:30` `sleep` throughout; a real drag through the cat's location still scrolls; no overlap with content or header at 1440/1024; reduced motion static; LOOK at stills.
- [ ] **Step 6: Commit** `feat(cat): pixel cat rides the ruler needle`.

### Task 9: Whole-feature verification

- [ ] **Step 1:** `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; all pass; `git status` shows only intended changes.
- [ ] **Step 2: Screenshot matrix** (scratchpad): `/` at 1440×900, 1024×768 and 390×844; `?time=` 06:00, 13:00, 18:30, 01:30; EN and MN; light and dark; reduced motion on/off; JS off; first visit (loader) and repeat visit; record console errors.
- [ ] **Step 3: Regression sweep:** the not-found page, header and theme/language toggles, copy-email, nav `aria-current`, mobile menu; print preview hides the loader, ruler, cats and scene; no horizontal scroll at 320 px; Mongolian text (including Ө/Ү) in the pixel font everywhere.
- [ ] **Step 4: Hand the user** the screenshot paths, the cat stills and the Mongolian speech lines to proofread. Do not merge or deploy.

---

## Self-review notes

- **Spec coverage:** foundations/palette/fonts/components (Task 1, 2), simple cat (Task 3), window scene with the live sky (Task 4), hero cat behaviour (Task 5), loader (Task 6), ruler (Task 7), ruler cat (Task 8), verification (Task 9).
- **Types:** `CatState`/`RulerPose`/`rulerCatPose` (earlier Task 1) used by Tasks 3, 5, 8; `CatArt` (Task 3) by Tasks 5, 6, 8; `WindowScene` cat slot and pixel-sky pieces (Task 4) by Tasks 5, 6; `Ruler` (Task 7) hosts `RulerCat` (Task 8).
