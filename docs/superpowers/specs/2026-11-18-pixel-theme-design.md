# Portfolio pixel-art theme — design

**Date:** 2026-11-18
**Status:** approved by the user in conversation on 2026-11-18 (direction: pixel theme for the whole site; hero = pixel window scene; pixel font everywhere; cat simple like the reference).
**Supersedes the look, keeps the mechanics of:** `2026-11-18-cat-ruler-polish-design.md` and `2026-11-18-loading-screen-design.md`. Behaviour (day/night cat from the sky phase, first-visit loader, ruler, click-for-a-quote, reduced motion, i18n, no-JS safety) is unchanged; **how everything looks changes to pixel art.** Where this document and those disagree about appearance, this one wins.

## 1. Intent

The user: "change my portfolio theme" into a **pixel-themed style**, with a **simple black pixel cat like the reference picture**. The reference is a cozy pixel room split into day and night: warm wood, a glowing lamp and hanging plants on the left; on the right a window onto a navy night sky with stars and a skyline of lit windows, a radiator, plants on the sill, and a **black cat silhouette sitting on a wooden table beside a steaming mug**. It is a reference for mood, palette and cat style, not an image to copy.

## 2. Goals, non-goals, anti-goals

**Goals**
- The whole site (header, hero, every section, footer, loader, ruler, cat) reads as one coherent pixel-art world with the reference's warm-day / navy-night mood.
- The day/night split of the reference maps onto what the site already has: the light theme is the warm **day room**, the dark theme the **night room**, and the hero window shows the site's real, live Ulaanbaatar sky.
- Pixel font everywhere (user's choice), still readable in English **and Mongolian** (Ө ө Ү ү must render in the chosen font, not a fallback).
- The cat is simple: a black pixel silhouette, readable at a glance.

**Non-goals**
- No content, data, routing or i18n-structure changes. No new dependencies (fonts come from `next/font/google`). No raster images: pixels are drawn with CSS and inline SVG rects. No sound.

**Anti-goals**
- Smooth gradients, blur, soft shadows or rounded corners leaking into the pixel world (everything snaps to the pixel grid, stepped gradients only).
- Unreadable text: long project descriptions must stay comfortably legible in the pixel font (size, line-height, contrast AA).
- Motion that is not stepped (use `steps()` timing so animation feels like pixel frames); motion that ignores reduced-motion.
- The live sky being replaced by a static picture (it must keep following the real time / `?time=HH:MM`).
- A rainbow, any other site's logo or brand colours.

## 3. The design

### 3.1 Pixel foundations
- **Grid:** one pixel unit `--px` (4 px; 3 px under 480 px width or via a single scale variable) drives borders, shadows, sprite scale and spacing rhythm. Everything pixel-drawn uses `image-rendering: pixelated` / `shape-rendering: crispEdges`.
- **Palette (direction, exact values chosen by the builder with AA contrast checks):**
  - *Day (light theme):* warm cream wall and page ground, wood browns for frames and rules, lamp amber for accents and glow, plant green for small details, deep brown ink for text.
  - *Night (dark theme):* deep navy ground, a cooler navy for panels, window-light yellow for accents and links, cream text, a touch of plant green.
  - Accent is amber/yellow in both (a darker amber in the light theme so links keep AA contrast). No gradients across hues.
- **Typography:** one pixel font family for everything, loaded with `next/font/google` with subsets `latin`, `latin-ext`, `cyrillic`, `cyrillic-ext` (Ө and Ү live in `cyrillic-ext`). Candidates that have both Cyrillic subsets: **Press Start 2P**, **Tiny5**, **Handjet**. The builder runs a short bake-off (screenshots at real sizes, EN and MN) and picks: a display face for the name, titles and small labels, and a body face for paragraphs, both pixel fonts; body must be readable at paragraph length. Verify programmatically that `Ө ө Ү ү` render in the chosen faces (not a fallback glyph). Pixelify Sans is **not** usable (its Cyrillic subset lacks Ө/Ү).
- **Components:** buttons, cards, chips, inputs and panels get stepped pixel borders (box-shadow/`clip-path` stair-steps or a border-image style), square corners, a pressed state that moves by one pixel unit, stepped (not smooth) hover transitions. Focus ring: a 2-px-unit contrasting block outline, always visible. Section dividers become small pixel strips (e.g. a skyline or brick row) instead of flat rules. Link underlines are pixel-dashed.
- **Theme toggle** keeps working (next-themes); the pixel palette switches with `.dark` exactly like the current tokens do.

### 3.2 The hero: pixel window scene
A cozy room corner in the spirit of the reference, built from CSS and inline SVG rects: a wooden **window** (frame, cross mullions, sill) whose glass shows the **live sky** drawn in pixels — a stepped-band gradient quantised from the existing `skyAt` colours, snapped-to-grid pixel stars (existing seeded star field, grid-snapped), a pixel sun/moon on the sun's computed position, a pixel **skyline** of Ulaanbaatar-style blocks with windows that light up at night, and the Bogd Khan ridge as a stepped silhouette far behind it. On the sill/table: plants, a steaming mug at night, and the **cat**. By day the room is warm and the lamp glows (amber light pixels near the window edge); by night the room is navy and the window is the light source. The scene sits at the top of the hero; the name, headline, intro and buttons stay below it exactly as today in content and order, in the pixel font. The scene never covers text or buttons, scales down gracefully (the scene simplifies below 760 px: no lamp/furniture, window only), and keeps the header (fixed, `z-50`) legible over it.

### 3.3 The cat (simple, **changed**)
A **black pixel silhouette** like the reference: sitting in profile, chin slightly up, ears, tail curled; tiny detail only (an eye highlight or none, a 1-px lighter rim so it reads on the dark window). Built as small sprite bitmaps rendered as SVG rects (one rect per run of pixels), so it is crisp at any scale, themable, and animated with `steps()`. Poses and scale: **hero** (~28×28 grid at ×5–6): *day* = sitting at a small pixel laptop whose screen glows, paws on keys; *night* = loafed/curled asleep with pixel `z`s, mug with pixel steam beside him. **Mini** (~16×16 at ×2–3, the ruler cat): `type`, `sit`, `groom`, `sleep`, `nap`. Smug is carried by posture (chin up, a lazy tail flick, half-closed eye pixel), not detail. Same behaviours as before: hops in once after the loader (stepped), day/night from the sky phase, click shows a short line in a **pixel speech box**, cross-fade between states, reduced motion = static.

### 3.4 The loading screen
Same rules as before (first visit per session, real-signal progress with a floor and ceiling, scroll lock released on every path, no-JS safe), re-skinned: a small pixel window scene (the live sky in pixels, skyline, the cat on the sill) and a **chunky pixel progress bar** (a row of blocks filling) instead of the drawn ridge line; the exit is a stepped wipe.

### 3.5 The ruler
Same mechanics (desktop only, native bar hidden before hydration, single scroll listener, markers for Top/Experience/Work/Stack/Contact, click/drag to scroll, never intercepts native scrolling), re-skinned: a narrow pixel rail with square ticks (every 10 % a longer one), a pixel arrow needle with a blocky percent readout in the pixel font, square section markers, a pixel panel behind the rail so it is legible over the window scene and over the ground in both themes. The mini cat rides the needle.

### 3.6 Sections
Experience, Work (including the pipeline diagrams), Stack, Testimonials, Contact and the footer keep their content and structure and take the pixel treatment: pixel boxes for entries, square bullets/dots, pixel-dashed links, stepped hover/focus states, pixel dividers. Sticky section titles keep working.

## 4. Approaches
Pixel art drawn in code (CSS stepped gradients, SVG rects, sprite maps in TypeScript) rather than raster images: crisp at every size, themable per light/dark, no assets to maintain, animatable with `steps()`. A canvas renderer or a sprite-image pipeline would add weight and lose theming. Reuse everything that already works: the pure logic (`lib/cat`, `lib/loader`, `lib/ruler`, gates), the loader and hero-cat mechanics and tests; replace art, CSS and layout.

## 5. Constraints
Next 16 App Router, React 19, Tailwind v4, next-themes, zustand, vitest + jsdom + Testing Library, double-quoted TS, ESLint (`prebuild` runs lint), `Dictionary` en/mn identical, header `z-50`, `?time=HH:MM` preview, `data-print="hide"` on decorative layers. WCAG AA contrast for text in both themes.

## 6. Left to the builder
Exact palette values, the font bake-off result, sprite pixel maps and proportions, the scene's composition and prop placement, skyline shapes, pixel-border technique, ruler geometry, timings.
