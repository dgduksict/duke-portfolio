# Duke — Portfolio

The portfolio of **Dulguun "Duke" Battulga**, AI engineer and blockchain developer in Ulaanbaatar.
One page, written for hiring teams: who he is, where he has worked, what he built, and how to reach him.

It is drawn as pixel art. The hero is a pixel window in a small room, and the glass shows the sky over
Ulaanbaatar right now, looking south at the Bogd Khan ridge. The sun is placed where it actually is (a
solar-position calculation for 47.92°N, 106.92°E), so a visitor sees a noon blue, a gold sunset or a starry
night depending on when they arrive, with the local time and their own offset underneath. A programmer cat
sits on the sill: awake by day, asleep at night.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script                  | What it does                                                 |
| ----------------------- | ------------------------------------------------------------ |
| `npm run dev`           | Dev server (Turbopack)                                       |
| `npm run build`         | Lints first, then a production build with full type checking |
| `npm start`             | Serves the production build                                  |
| `npm test`              | Vitest, single run                                           |
| `npm run test:watch`    | Vitest in watch mode                                         |
| `npm run test:coverage` | Coverage for `src/lib`, `src/store` and `src/data`           |
| `npm run lint`          | ESLint (flat config, `eslint-config-next`)                   |
| `npm run typecheck`     | `tsc --noEmit`                                               |

Requires Node 20.9 or newer. The fonts are fetched from Google Fonts at build time.

## Editing the content

Everything on the page comes from typed, bilingual files in [`src/data`](src/data). Every string is a
`{ en, mn }` pair.

- **`profile.ts`** — name, headline, intro, bio, email, phone, socials. Set `availability` to show a line
  such as "Open to new roles". Set `resumeUrl` (a PDF in `/public`, or a URL) to show a Résumé button.
- **`experience.ts`** — roles, newest first. `highlights` is optional.
- **`projects.ts`** — each project's copy, its `stages` (drawn as the pipeline diagram) and its stack.
  `outcomes` and `metrics` are optional and render only when present — add real numbers only.
- **`skills.ts`** — the tools index. The Stack section shows where each tool was used by matching the
  role and project stacks, so every tool links to evidence. A data test fails if a stack names a tool
  that isn't listed here; use `aliases` for other spellings.
- **`testimonials.ts`** — empty; the section appears once it has entries.

Interface copy (labels, headings) lives in [`src/lib/i18n/dictionary.ts`](src/lib/i18n/dictionary.ts);
the `Dictionary` type keeps English and Mongolian in step.

## The pixel theme

- **Type**: Press Start 2P for display text and Tiny5 for body text, both loaded with `next/font`
  ([`src/lib/fonts.ts`](src/lib/fonts.ts)). Every face carries the Cyrillic subsets, including the
  Mongolian Ө and Ү.
- **Day and night tokens**: [`globals.css`](src/app/globals.css) defines the colour tokens twice. Light is a
  warm day room, dark is a navy night room (switched with next-themes).
- **One pixel unit**: `--px` (4px, 3px on small screens). Borders, ledges, stair-step shadows and the
  sprites all snap to it. The shared pixel utilities live in [`src/app/pixel.css`](src/app/pixel.css).
- **Contrast is tested**: [`src/lib/contrast.test.ts`](src/lib/contrast.test.ts) parses the tokens from
  `globals.css` and fails if ink, soft ink, accent text or button text drop below their WCAG level in
  either theme. Change a token and run `npm test`.

## The sky window

The hero ([`src/components/scene/`](src/components/scene)) is a pixel window and a little room around it.
The glass is painted from the live sun position ([`src/lib/sun.ts`](src/lib/sun.ts)) and sky colours
([`src/lib/sky.ts`](src/lib/sky.ts)), quantised into flat bands with grid stars, the stepped ridge and a
skyline whose windows light up by the sky's phase ([`src/lib/pixel-sky.ts`](src/lib/pixel-sky.ts)).
Everything is in whole grid cells and deterministic, so the server and the client draw the same picture.

Add `?time=HH:MM` to see Ulaanbaatar at another time today, for example `/?time=07:40` (sunrise),
`/?time=12:30`, `/?time=18:30` (dusk) or `/?time=23:30`. The cat follows the preview too.

## The cat

The programmer cat ([`src/components/cat/`](src/components/cat)) is drawn from pixel sprites
([`sprites.ts`](src/components/cat/sprites.ts), [`cat-art.tsx`](src/components/cat/cat-art.tsx)).

- **Hero cat**: sits on the window sill. Its day or night state comes from the sky phase for the current
  (or previewed) time: working at a laptop by day, asleep with a mug and drifting z's at night. It is
  hidden on narrow screens.
- **Mini cat**: rides the needle of the ruler scrollbar and changes pose with the scroll and idle time
  (logic in [`src/lib/cat.ts`](src/lib/cat.ts)). It also appears on the 404 page, asleep in the window.

## The loading screen

On a first visit to `/` a short pixel loading screen
([`src/components/loader/`](src/components/loader)) covers the page until the fonts, the window load and the sky's clock are ready.
It is shown once per tab: the session key `duke:loader-seen` in `sessionStorage` makes a reload skip it.
Timings live in [`src/lib/loader.ts`](src/lib/loader.ts) (a minimum, a maximum so a slow asset never traps
the visitor, and a shorter minimum under reduced motion).

An inline gate script ([`loader-gate.tsx`](src/components/loader/loader-gate.tsx)) runs before first paint
and sets `html[data-loader]`, so CSS puts the loader up before React hydrates and the hero never flashes.
If React never takes over, the script releases the page by itself after a few seconds.

## The ruler scrollbar

On wide screens with a fine pointer, the homepage swaps the native scrollbar for a pixel ruler
([`src/components/ruler/`](src/components/ruler)): ticks and a marker per section, a needle you can drag
or click, and the mini cat riding it. It is desktop only; touch and narrow screens keep the native
scrollbar. Geometry and maths are in [`src/lib/ruler.ts`](src/lib/ruler.ts).

A gate script ([`ruler-gate.tsx`](src/components/ruler/ruler-gate.tsx),
[`src/lib/ruler-gate.ts`](src/lib/ruler-gate.ts)) sets `html[data-ruler]` before first paint, which hides the
native scrollbar so the page does not shift sideways when the ruler mounts. If the ruler never takes over,
the scrollbar comes back after a few seconds.

## How it's built

- **Next.js 16** (App Router) + **React 19** + **TypeScript** in strict mode
- **Tailwind CSS v4** with the token set in [`globals.css`](src/app/globals.css)
- **Zustand** for the persisted language, **next-themes** for light and dark
- **Vitest** + Testing Library: solar position, sky and pixel-sky geometry, time zones, skill evidence,
  the data, the store, the dictionaries, the contrast of the tokens, the cat, loader and ruler logic and
  every section

Motion is CSS only: the cat's breathing, tail and z's, the loader bar, the ruler's needle and the window's
sky and clouds. A project's pipeline diagram animates while the project is hovered or focused. The eyes in
the wordmark follow the pointer. All of it stops under `prefers-reduced-motion` (the cat then holds a
still pose and the loader is shorter). Printing the page (or saving it as PDF) gives a plain CV: the
scene, cat, loader, ruler, header and footer are hidden and the colours go black on white.

## Layout

```
src/
  app/           layout, page, 404, tokens (globals.css) and pixel utilities (pixel.css)
  components/
    cat/         cat sprites and art, hero cat, mini cat, cat state and styles
    layout/      header, footer, providers, 404 copy
    loader/      first-visit loading screen, gate script, styles
    ruler/       ruler scrollbar, gate script, styles
    scene/       pixel window, sky, skyline, room, styles
    sections/    hero, experience, work, stack, testimonials, contact
    ui/          section shell, copy button, eyes, brand and pixel icons, pixel divider
    work/        pipeline diagram
  data/          profile, experience, projects, skills, testimonials, navigation
  hooks/         i18n, clock, active section, clipboard, hydration
  lib/           sun position, sky colours, pixel sky, cat, loader, ruler, time zones, skill evidence,
                 fonts, contrast, formatting, i18n
  store/         Zustand store
  types/         shared domain types
```

## Notes

- Brand glyphs (GitHub, LinkedIn, Instagram, Facebook) are inlined from
  [Simple Icons](https://simpleicons.org) (CC0).
- There is no backend. Email links open the visitor's mail app; nothing is sent from the page.
