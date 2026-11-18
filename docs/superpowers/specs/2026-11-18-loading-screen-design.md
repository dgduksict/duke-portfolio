# Portfolio loading screen — design

**Date:** 2026-11-18
**Status:** approved by the user on 2026-11-18 (they approved the design as laid out in conversation; this writes it down)
**Builds on:** `2026-10-05-portfolio-redesign-design.md` (the sky-over-Ulaanbaatar portfolio). Modelled on the Mongol Content site's loading screen (`mongolcontent-web-v2`, `HomeLoader`, `lib/motion/loader.ts`, `intro-gate.ts`).

## 1. Intent

The user asked: "add loading screen when going in web. look at mongolcontent-web-v2 to improvise." After checking, the target is **duke-portfolio** (their personal site) and the Mongol Content loader is the reference for feel and rules. The user's trademark, the **programmer cat** (smug about clean code, drawn for the Mongol Content homepage and approved by them), goes in it.

## 2. Goals, non-goals, anti-goals

**Goals**
- A first impression that is specific to this site: the portfolio's own **live Ulaanbaatar sky** is the loading screen, with the cat on the ridge.
- Honest progress: the bar reflects what has really loaded, with a floor and a ceiling so it is never a trap.

**Non-goals**
- No loader on repeat visits in the same tab session, on other routes, or in print.
- No new dependencies, no sound, no changes to the portfolio's content, theming or sections.
- Not the full cat system from the company site (no speech bubbles, no ruler cat, no hero cat here).

**Anti-goals**
- The page is ever unusable or hidden because of the loader (no JS, slow assets, a hung font, blocked storage).
- A flash of the loader on repeat visits, or a flash of the finished page before the loader on a first visit.
- Layout shift or lost scroll position when the loader leaves.
- A generic spinner or progress bar. The progress is the ridge line drawing itself.

## 3. Behaviour

- **When:** first visit to `/` in a browser session (`sessionStorage` key `duke:loader-seen`, set when the loader takes over, so a reload mid-load shows it again). Other paths and repeat visits never show it.
- **Gate:** an inline script (server component) runs while the HTML parses and marks `<html data-loader="on">` on a first visit, so the overlay is up before hydration and the hero never flashes. If React has not taken over within 3000 ms, the gate sets `done` and the page shows without the loader. Without JS the overlay is hidden by CSS and never appears. Blocked or throwing `sessionStorage` counts as a first visit and never throws.
- **Look:** a full-screen layer (above the header) showing the sky for the visitor's moment, reusing the existing sky, stars and ridge (so `?time=HH:MM` previews work). The near ridge's top edge is drawn as a thin line that fills left to right with progress; a small percent readout sits by it. The cat stands on the ridge: **by day he types on his laptop, when the sky phase is night he sleeps with *zzz***. The only visible text is the percent; an accessible label ("Loading" / Mongolian) is announced through a status region from the dictionary (no visible language flash, since the language store hydrates after first paint).
- **Progress:** from three real signals: fonts ready, the window `load` event, and the sky having a time (client mounted). Displayed progress = min(clock easing over `minMs`, share loaded); from `maxMs` it is 1 regardless. `minMs` 1400, `maxMs` 3500; with reduced motion `minMs` is 600.
- **Exit:** at 100 % a short hold, then the whole layer lifts away (translateY, about 520 ms), then it is removed from the DOM about 1 s later. Scrolling is locked while it is up and always released, including on unmount.
- **Reduced motion:** the cat is a static pose, the ridge line is drawn without animation, the exit is a quick fade; the loader still shows, for the shorter minimum.
- **Theming:** like the sky, the overlay does not follow light/dark theme. Print: `data-print="hide"`.

## 4. Approaches

One sensible way: SVG and CSS, a pure-logic module with tests, a gate script, no libraries. A canvas or Lottie loader would add weight and art tooling the project doesn't have; copying the Mongol Content ribbon-and-two-characters loader wouldn't use this site's own sky and would need art that doesn't exist here.

## 5. Constraints

Next 16 (App Router), React 19, Tailwind v4, vitest with jsdom and Testing Library (component tests are the norm here), ESLint must pass (`npm run lint` runs before build), double-quoted TS, `Dictionary` interface keeps `en` and `mn` identical, tokens in `globals.css`, header is `z-50`.

## 6. Left to the builder

The exact cat placement on the ridge, the percent readout's styling, easing and hold times, how the cat art is recoloured for this palette (its Mongol Content version uses that site's brand tokens), and how the ridge edge path is exposed from `ridges.tsx`.

## 7. The author's calls (confirmed by the user's approval of the design)

First-visit-per-session; the sky itself as the loading picture; cat asleep when the sky phase is night (matching the sky shown, including `?time=`); caption-free visible UI; copying the cat SVG rather than linking repos.
