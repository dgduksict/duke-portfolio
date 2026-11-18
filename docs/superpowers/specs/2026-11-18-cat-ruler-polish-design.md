# Portfolio: programmer cat, ruler scrollbar, loading screen, quiet polish — design

**Date:** 2026-11-18
**Status:** approved in conversation on 2026-11-18, re-targeted at the portfolio the same day. The user said the work is for **duke-portfolio** and that `mongolcontent-web-v2` was only a *reference* for animation and feel. Every decision below was approved earlier for the other site and carries over, except where marked **changed**.
**Builds on:** `2026-10-05-portfolio-redesign-design.md` (sky over Ulaanbaatar, calm editorial sections). The loading screen's own behaviour is specified in `2026-11-18-loading-screen-design.md`; this document adds the cat's palette and the other parts.

## 1. Intent

The user: "improve my portfolio site", it "looks kinda bland", they like the colour theme. They asked for (1) their trademark **programmer cat**, drawn from scratch, **smug about clean code and cool**, with an appearing animation and a time-of-day life (**codes by day, sleeps at night**); (2) the **ruler scrollbar** from getartcraft.com/apps/photocraft; (3) a **loading screen** modelled on the Mongol Content one; (4) less blandness.

**Why the first attempt missed:** it was built in the company repo, and the cat came out wearing that site's rainbow brand gradient and spiral logo. **Changed:** the cat now uses only this portfolio's palette.

## 2. Goals, non-goals, anti-goals

**Goals:** the cat is instantly recognisable as one character everywhere (hero, loader, ruler); the sky already tells the time, so the cat reads as part of the same world; the ruler is useful and calm; a visitor who ignores the cat still sees a less flat page.

**Non-goals:** no new dependencies; no change to content, data, i18n structure, or the light/dark theme mechanism; no layout restructuring; no scroll hijacking; mongolcontent code is not touched or imported (it is read-only reference; its local branch `feature-cat-ruler` is not part of this work).

**Anti-goals:** the rainbow brand gradient or spiral logo anywhere on the cat; clip-art look; a loud site (the sky and the name stay the stars of the page; the cat is the one memorable extra); motion everywhere; the ruler hurting normal scrolling; an unusable page when JS, storage or fonts fail.

## 3. The design

### 3.1 The cat (palette **changed**)
Layered inline SVG, one character at two scales (hero ~160–220 px, mini ~32–48 px), animated with CSS. Smug: half-lidded eyes, one-sided smirk, chin raised, one ear tilted. Cool: near-black ink body (the site's `--ink` family) with a pale rim light so it reads on dark sky and ridge; hoodie in the site's `--accent` blue with `--sun` amber drawstrings and zip; a laptop whose screen shows a few tidy aligned code lines in `--accent`, `--sun`, `--ink-soft` and `--rule`; the lid sticker is the site's own two-eyes mark (the one in the header, `components/ui/eyes.tsx`), not any logo. Colours are CSS variables scoped to `.cat-art`, so light/dark and the sky's own colours never fight the drawing. No rainbow, no gradient across brand hues.

**Day/night** follows the same sky the page shows: night iff `skyAt(sunPosition(now, …)).phase === "night"` (so `?time=HH:MM` previews drive it); re-evaluated as `useNow` ticks each minute. Day: types (paws, tail flick, an occasional smug glance, tidy-lines blink on the screen). Night: curled over the closed laptop, breathing, *zzz*.

**Hero cat:** sits on the hero's near ridge on the right, over the sky, laptop on his lap; hops in once (about 1 s) after the loader finishes (immediately when there is no loader), then settles into the day/night loop. Hidden below 760 px; never overlaps the name, buttons or header. A real `<button>`: click shows a short smug clean-code line (4 lines per language in the dictionary; at night "shh"), announced through a polite status region that clears after ~4 s. Mongolian lines natural, to be proofread by the user at the end.

### 3.2 The ruler
Desktop only (`min-width: 900px`, `pointer: fine`), homepage only. The native scrollbar is hidden by `html[data-ruler="on"]` set by an inline gate before hydration (so no layout shift), released if the ruler never mounts (5 s) and whenever the ruler unmounts or the screen narrows. Rail ~40 px on the right edge: minor ticks every 2 %, labelled major ticks every 10 %, a needle with a rolling percent readout (hidden below 3 %), and section markers for Hero, Experience, Work, Stack, Contact (labels from `navItems`, both languages; hero label from the dictionary). Click or drag the rail to scroll (smooth for a click unless reduced motion). It never touches wheel, touch or keyboard scrolling; it is `aria-hidden` (a pointer convenience); hidden while `<html>` is scroll-locked (loader, mobile menu). Colours from site tokens so it stays legible over the hero sky **and** over the ground in light and dark theme.
**The ruler cat** (mini) sits on the needle facing the page: day = types while scrolling, `sit` shortly after, grooms after 1200 ms idle; night = asleep curled; ≥98 % = naps.

### 3.3 The loading screen
As specified in `2026-11-18-loading-screen-design.md` (first visit per session, live sky, ridge line drawing with progress, cat on the ridge by day/asleep by night, exit lifts away). The cat in it is the portfolio cat above.

### 3.4 Quiet polish
- **Ridge dividers:** replace the flat `border-t` between sections with a low-amplitude ridge edge echoing the hero (SVG in `--rule`, a faint `--accent` tint beneath), one shared component/class so every section uses it.
- **Tonal rhythm:** alternate the page ground with a barely tinted band (`color-mix(in oklab, var(--ground), var(--accent) 3–4%)`), so the page reads as a sequence.
- **Rows and cards:** hover and focus states on experience entries, project blocks and stack rows (a quiet accent rule or sun dot; no lift or shadow games); the existing focus ring stays.
- **Type contrast:** a clearer step between section titles and body copy (`.type-title`), without changing the one-family type system.
- **Guardrails:** no per-section fade-and-slide reveals, no new animation library, at most one new scroll-triggered effect (the ruler counts as it), contrast stays AA, nothing changes under reduced motion except that motion stops.

## 4. Approaches
Same as agreed: layered SVG + CSS for the cat (Lottie/Rive/video need other tooling); a lean ruler, not PhotoCraft's zoom-map port; cat-led with quiet polish rather than restructuring. The code is a port of the pure logic and the structure of the company-site implementation (read-only reference at `C:\Users\dulguun.batt\Desktop\Development\mongolcontent-web-v2`, branch `feature-cat-ruler`) adapted to this repo's stack (Next 16, double quotes, jsdom component tests, sky-phase time).

## 5. Constraints
Next 16 App Router, React 19, Tailwind v4, vitest + jsdom + Testing Library, ESLint must pass (`prebuild` runs lint), double-quoted TS, `Dictionary` keeps `en`/`mn` identical, header is `z-50`, theme via next-themes (`.dark` class), `data-print="hide"` for decorative layers, `?time=HH:MM` preview param.

## 6. Left to the builder
Exact drawing and proportions; placement on the ridge; timings and easings; ridge-divider shape; band tint strength; exact rail geometry and label styling; the 4 speech lines (English and Mongolian).
