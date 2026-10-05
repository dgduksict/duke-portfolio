# Portfolio redesign — design spec

Date: 2026-10-05 · Branch: `redesign`

## Brief

- **Who it is for:** hiring teams — recruiters and engineering leads deciding whether to talk to Duke.
- **What it must do in 10 seconds:** name, what he builds, where he is, how to reach him.
- **In 60 seconds:** where he has worked, what he actually built, with what, and proof (live links).
- **Cut:** pricing/cost (estimator, quote engine, currency switch, contact budget picker), anything that reads as
  generated: mock dashboards and counters, self-rated skill meters and radar, stock AI dashboard images, aurora/grid
  backdrop, command palette, back-to-top, the simulated contact form (it never sent anything).
- **Content rule:** nothing unverified ships. Testimonials, per-project numbers, and the Yield Optimizer / Chain
  Analytics projects are cut. Experience copy comes from Duke's own April 2026 history; project copy is rewritten from
  the READMEs of the real repos (gogo-web, gogo-backend, gogo-newsletter, article-monitor, sonsy-tickets-web), kept
  high level. Typed optional slots stay for data Duke will add later (`metrics`, `outcomes`, `testimonials`,
  `resumeUrl`, `availability`), and render nothing while empty.

## Concept: the sky over Ulaanbaatar

Mongolia is the land of the eternal blue sky, and Duke works from UTC+8 for teams that may not. The hero is a live
picture of the sky over Ulaanbaatar **right now**, looking south at the Bogd Khan ridge: deep blue at noon, gold at
sunset, stars at night, with the sun drawn where it actually is (real solar position for 47.92°N, 106.92°E). Under
the ridge, on solid ground, sits the name. A caption gives the visitor the practical version: the local time in
Ulaanbaatar and how far ahead of them it is.

This is the page's single bold move. Everything below the ridge is quiet, typographic and fast to scan.

## Visual system

### Colour

The sky is computed (see Sky). The page itself uses two grounds:

| Token        | Light (snow)  | Dark (night)  | Use                                   |
| ------------ | ------------- | ------------- | ------------------------------------- |
| `--ground`   | `#F3F5F8`     | `#0B1322`     | page background, front ridge          |
| `--ink`      | `#0E1A2B`     | `#E7ECF4`     | text                                  |
| `--ink-soft` | `#556175`     | `#93A0B5`     | secondary text (≥ 5.7:1 on ground)    |
| `--rule`     | `#D6DDE7`     | `#1D2A40`     | hairlines, diagram strokes            |
| `--accent`   | `#1F56C9`     | `#8CB6FF`     | links, focus, diagram tokens (≥ 5.9:1)|
| `--sun`      | `#E39A2D`     | `#F2B45A`     | the sun, "current role" marker only   |

Theme follows the system with a toggle. The sky does not change with theme; the ridge silhouette takes the ground
colour, so light theme reads as snow under the sky and dark theme as a silhouette.

### Type

One family: **Geologica** (variable: `wght` 100–900, `SHRP` 0–100), loaded through `next/font/google` with
`latin`, `latin-ext`, `cyrillic`, `cyrillic-ext` — the last one carries Mongolian Ө/Ү, which rules out most display
faces. Personality comes from the axes, not a second family: display sizes use heavy weight with sharpened joins;
text stays at `SHRP 0`.

- Name: weight 800, `clamp(3.25rem, 11.5vw, 10.5rem)`, tracking −0.035em, line-height 0.9.
- Section titles: weight 650, `clamp(1.75rem, 3.6vw, 2.75rem)`.
- Project names: weight 650, `clamp(1.5rem, 2.6vw, 2.125rem)`.
- Body: 1.0625rem / 1.6, max ~68ch. Small: 0.875rem / 1.5 in `--ink-soft`.
- Dates and times: tabular numerals.
- Sentence case everywhere. No all-caps labels, no monospace labels, no eyebrows, no arrows appended to links.

### Layout

- Container 72rem, 16px gutters on phones, 32px from `md`.
- Below the hero: a 12-column grid. Section title in columns 1–3 (sticky while its section scrolls), content in
  4–12. Single column on phones. Everything left-aligned.
- No cards. Rows separated by space and a hairline `--rule`.

```
┌───────────────────────────────────────────────────────────────┐
│ Duke ◉◉                        Experience Work Stack Contact EN│  header (white over sky)
│                           ·            ·                 ·    │
│                                       ☀ (real position)       │  live sky
│    ╱╲      ╱╲╱╲        ╱╲       ╱╲╱╲        ╱╲               │  far ridge (haze)
│ __╱  ╲____╱    ╲______╱  ╲_____╱    ╲______╱  ╲____╱╲________ │  near ridge (= ground)
│ Dulguun Battulga                                              │  name on the ground
│ AI engineer & blockchain developer in Ulaanbaatar.            │
│ I build backends and AI services for Gogo.mn …               │
│ [Email me] LinkedIn GitHub          14:32 in Ulaanbaatar, 6 h ahead of you │
├───────────────────────────────────────────────────────────────┤
│ Experience │ 2026 – now ● Software Developer, Mongol Content  │
│ (sticky)   │            summary · highlights · stack          │
├───────────────────────────────────────────────────────────────┤
│ Work       │ Gogo.mn                          2026  gogo.mn ↗ │
│            │ [ editors → NestJS API → MySQL/Redis → Next.js ] │  pipeline diagram
│            │ What it is / My part / Stack                     │
├───────────────────────────────────────────────────────────────┤
│ Stack      │ Qdrant      Gogo.mn, Newsletter, Article monitor │  evidence index
├───────────────────────────────────────────────────────────────┤
│ [cat]      │ About + email, socials                           │
└───────────────────────────────────────────────────────────────┘
```

## Sections

1. **Header.** Wordmark "Duke" + the pointer-tracking eyes (kept from the original site). Links: Experience, Work,
   Stack, Contact. Language toggle (EN/МН) and theme toggle. Transparent with white text over the sky; switches to
   solid `--ground` with a bottom rule once the sky has scrolled away. Phones: links collapse into a menu button.
2. **Hero.** Sky (clamp(260px, 54svh, 580px) tall) → ridge → name (`h1`) → one-line headline → a two-sentence intro naming
   current and past work (a `Localized` string in `profile`, so Duke edits it in one place) → actions: Email me (mailto), copy-email button, LinkedIn,
   GitHub, Résumé (only if `resumeUrl`) → time caption. The `h1` renders immediately (no entrance animation).
3. **Experience.** One row per role, newest first: years (`2026 – now`), title, company (linked), location, summary,
   optional highlights, stack as plain small text. Current roles get the `--sun` dot.
4. **Work.** Four projects: Gogo.mn, Gogo newsletter, Article similarity monitor, Sonsy tickets. Each row: name,
   year, live/source links, one-liner, a **pipeline diagram** of how it works (stages from data), "What it is",
   "My part", stack, and optional outcomes/metrics. Hovering or focusing a project sends tokens along its pipeline.
5. **Stack.** Grouped tools, each followed by where it was used — links to the role or project rows that list it
   (computed from the data, so a claim always has evidence). Tools with no evidence are listed plainly at the end of
   their group.
6. **Testimonials.** Rendered only when `testimonials` is non-empty (it ships empty).
7. **About + contact (`#contact`).** The sunglasses cat as the avatar, a short factual bio, the email address large
   with copy and mailto, then LinkedIn, GitHub, Instagram, Facebook, phone.
8. **Footer.** Name and year, link to the source.
9. **404.** Night sky, one line, a link home.

## Sky

- `sunPosition(date, lat, lon) → { elevation, azimuth }` — low-precision NOAA algorithm (±1°), pure.
- `skyAt(elevation, azimuth) → SkyState` — zenith/mid/horizon colours interpolated between keyframes at elevations
  −18, −12, −6, −2, 2, 8, 25, 60; star opacity (1 at ≤ −12°, 0 at ≥ −4°); sun glow colour, strength and position.
  Facing south: azimuth 90°→left edge, 180°→centre, 270°→right edge; elevation maps up from the ridge line.
- Every zenith keyframe keeps white text ≥ 4.5:1 so the header stays legible; text never sits on the bright band near
  the horizon.
- Renders after mount (server has no "now"): a deep navy base (keeps the white header legible) shows first and the
  sky fades in over 700 ms — the page's one load moment. Recomputed every minute. `?time=HH:MM` previews another Ulaanbaatar time (used for
  screenshots).
- Static stars from a seeded generator; no twinkle. `prefers-reduced-motion` drops the fade.
- Time caption: `14:32 in Ulaanbaatar` plus the visitor's offset (`6 hours ahead of you` / `same time as you`).

## Motion

Only three things move: the sky fading in on load, diagram tokens while a project is hovered or focused, and the eyes
following the pointer. No scroll reveals, no counters, no marquee. All of it is off under reduced motion.
Framer Motion and Recharts are removed; motion is CSS.

## Data and code changes

- `types`: drop services, pricing, metrics-dashboard, currency types. Profile gains `coordinates`, `timeZone`,
  `resumeUrl`, nullable `availability`; loses `roleRotation`, `focusAreas`, `yearsExperience`. Project gains
  `stages`, `links`; `image`, `accent`, `category`, `featured` go; `outcomes`/`metrics` optional. Skill becomes
  `{ id, name, group, aliases? }`.
- `lib`: new `sun.ts`, `sky.ts`, `time.ts` (offset phrase), `evidence.ts`; `format.ts` trimmed to date ranges;
  `pricing.ts`, `brief.ts`, `contact.ts`, `projects.ts` deleted.
- `store`: language and mobile-nav only.
- `i18n`: dictionary rewritten for the new chrome; `en`/`mn` parity enforced by the `Dictionary` type and test.
- Deleted components: charts, pricing, project card/dialog, controls, modal, aurora, motion primitives, command
  palette, back-to-top, and the old sections. Deleted assets: the five AI dashboard images and the v0 placeholders.
  The cat image is renamed `avatar.png`.
- Dependencies removed: `recharts`, `framer-motion`, `geist`.

## Quality floor

Responsive to 320px; visible focus rings; keyboard-reachable everything; `prefers-reduced-motion` respected; text
contrast AA; print stylesheet that drops the sky and prints the content as a clean CV; `lang` attribute follows the
language toggle.

## Testing

- Unit, test-first: `sunPosition` against known Ulaanbaatar values (solstice noons, midnight, sunrise azimuth);
  `skyAt` keyframe boundaries, interpolation, stars and glow rules; offset phrase in both languages; evidence
  matching (aliases, ordering, unmatched tools); date range formatting.
- Data invariants: unique ids, both languages filled, absolute links, ≥ 3 stages per project, every evidence link
  points at a rendered anchor.
- Components: hero shows name and contact actions; language switch changes copy; work lists all projects with links;
  copy-email works; testimonials section absent when empty.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, then screenshots at 390px and 1440px, light and
  dark, at noon, sunset and night.

## Out of scope

Real screenshots of the products, an OG image, a CMS, sending mail from the page.
