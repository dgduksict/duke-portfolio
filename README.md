# Duke — Portfolio

The portfolio of **Dulguun "Duke" Battulga**, AI engineer and blockchain developer in Ulaanbaatar.
One page, written for hiring teams: who he is, where he has worked, what he built, and how to reach him.

The hero is the sky over Ulaanbaatar right now, looking south at the Bogd Khan ridge. The sun is drawn
where it actually is — a solar-position calculation for 47.92°N, 106.92°E — so a visitor sees a noon
blue, a gold sunset or a starry night depending on when they arrive, with the local time and their own
offset underneath.

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

Requires Node 20.9 or newer. The font (Geologica) is fetched from Google Fonts at build time.

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

## Previewing the sky

Add `?time=HH:MM` to see Ulaanbaatar at another time today, for example `/?time=07:40` (sunrise),
`/?time=12:30`, `/?time=18:30` (dusk) or `/?time=23:30`.

## How it's built

- **Next.js 16** (App Router) + **React 19** + **TypeScript** in strict mode
- **Tailwind CSS v4** with a small token set in [`globals.css`](src/app/globals.css)
- **Geologica**, one variable family, loaded with the Cyrillic-ext subset that carries Mongolian Ө and Ү
- **Zustand** for the persisted language, **next-themes** for light and dark
- **Vitest** + Testing Library: solar position, sky colours, time zones, skill evidence, the data, the
  store, the dictionaries and every section

Motion is CSS only. The sky fades in once on load. A project's pipeline diagram animates while the
project is hovered or focused. The eyes in the wordmark follow the pointer. All of it stops under
`prefers-reduced-motion`. Printing the page (or saving it as PDF) gives a plain CV.

## Layout

```
src/
  app/           layout, page, 404, tokens and styles
  components/
    layout/      header, footer, providers, 404 copy
    sections/    hero, experience, work, stack, testimonials, contact
    sky/         sky, ridges, stars
    work/        pipeline diagram
    ui/          section shell, copy button, eyes, brand icons
  data/          profile, experience, projects, skills, testimonials, navigation
  hooks/         i18n, clock, active section, clipboard, hydration
  lib/           sun position, sky colours, time zones, skill evidence, formatting, i18n
  store/         Zustand store
  types/         shared domain types
```

## Notes

- Brand glyphs (GitHub, LinkedIn, Instagram, Facebook) are inlined from
  [Simple Icons](https://simpleicons.org) (CC0) because `lucide-react` v1 dropped brand icons.
- There is no backend. Email links open the visitor's mail app; nothing is sent from the page.
