# Duke — Portfolio

A front-end-only portfolio and engagement estimator for **Dulguun "Duke" Battulga**, AI engineer and
blockchain developer. It is a single Next.js page: hero, about, skills, an experience timeline,
a filterable case-study grid, a Recharts activity dashboard, references, a live pricing estimator and
a contact form.

There is no backend, no database and no API keys. Every number on the page comes from typed,
deterministic mock data in [`src/data`](src/data) and pure functions in [`src/lib`](src/lib) — but the
app behaves like the real thing: filters, sorting, a command palette, currency switching, live
re-pricing, form validation and bilingual copy all work.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script                  | What it does                                              |
| ----------------------- | --------------------------------------------------------- |
| `npm run dev`           | Dev server (Turbopack)                                      |
| `npm run build`         | Lints first, then a production build with full type checking |
| `npm start`             | Serves the production build                                 |
| `npm test`              | Vitest, single run                                          |
| `npm run test:watch`    | Vitest in watch mode                                        |
| `npm run test:coverage` | Coverage for `src/lib`, `src/store` and `src/data`          |
| `npm run lint`          | ESLint (flat config, `eslint-config-next`)                  |
| `npm run typecheck`     | `tsc --noEmit`                                              |

Requires Node 20.9 or newer.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** in strict mode
  (`noUncheckedIndexedAccess`, `noUnusedLocals`, no `any` anywhere — the rule is an error)
- **Tailwind CSS v4** with an OKLCH token system and custom `@utility` layers
- **Framer Motion** for scroll reveals, layout transitions, the tilt/spotlight cards and the marquee
- **Recharts** for the activity area chart, the domain radar, the language bars and the cost donut
- **Zustand** (persisted, hydration-safe) for language, work filters and the estimator state
- **Vitest** + Testing Library, 147 tests over the pricing engine, formatting, filtering, the store,
  the dictionaries, the data fixtures and the interactive sections

## What is interactive

- **⌘K / Ctrl+K command palette** — jump to a section, open a case study, toggle theme, switch
  language, copy the email address, open a profile. Arrow keys and Enter work.
- **Work grid** — search across titles, stack and outcomes in the active language, filter by domain
  or stack chip, re-sort, and open a case study dialog (focus-trapped, escape to close).
- **Impact dashboard** — switch the activity window between 3, 6 and 12 months; the totals and the
  chart both recompute.
- **Estimator** — see below. Every control feeds one pure function.
- **Contact** — client-side validation, a simulated send, and a "Send this brief" hand-off from the
  estimator that pre-fills the message with the exact quote you configured.
- **Language toggle (EN/MN)** — the whole page, including project narratives, role titles and
  quote line items. **Theme toggle** — dark-first, with a full light palette.

Language, estimator configuration and work filters persist to `localStorage`. The store is
rehydrated after mount (`skipHydration`), so the server render and the first client render always
agree, and a blocked or missing `localStorage` silently falls back to session memory.

## Pricing rules

All amounts are **USD**; MNT is a display conversion at a **fixed rate of ₮3,450 per $1** — there is
no live FX call. The catalogue lives in [`src/data/services.ts`](src/data/services.ts) and the engine
is [`buildQuote`](src/lib/pricing.ts), a pure function covered by unit tests.

Inputs are clamped before anything is priced: screens to the service's `[included, max]` range,
integrations to 0–8, support to one of 0/3/6/12 months, and unknown or duplicated add-ons dropped.

The order of operations is:

1. **Base fee** — per engagement type: Landing $1,800 · Full-Stack Product $7,200 ·
   AI Integration $5,400 · Smart Contract & Web3 $8,600 · Architecture Review $2,600.
   Each includes a number of screens.
2. **Scope** — every screen beyond the included count is charged at the service's per-screen rate
   ($220–$420); every third-party integration is $520.
3. **Add-ons** — a flat fee, a percentage of the base fee, or both. Design system is 18% of base;
   analytics is $800 + 5% of base; multi-language $1,100; headless CMS $1,500; handover $650.
4. **Pace** — a multiplier on the scoped subtotal: Standard ×1.00, Priority ×1.15, Rush ×1.35.
   The difference is shown as its own line so the premium is never hidden.
5. **Discounts** — eligibility rates stack (non-profit 15% + open source 10%) and the highest
   reached volume tier is added (5% over $10,000, 10% over $20,000, tiers do not stack with each
   other). The combined rate is then **capped at 20%** of the subtotal.
6. **Support retainer** — 12% of the discounted project total per month, with a **$400 monthly
   floor**, times the number of months. It is quoted alongside the project rather than inside it.
7. **VAT** — 10% (Mongolian rate) on the project total plus the retainer.
8. **Payment split** — 40% deposit to start, the balance on delivery.

Every monetary value is rounded to whole USD (half away from zero) as it is produced, so the
rendered breakdown always sums to exactly the rendered total — there is a test asserting that
invariant across several configurations.

**Duration** is estimated separately: `base weeks + extra screens × per-screen weeks +
integrations × 0.25 + add-on weeks`, multiplied by the pace factor (×1.0 / ×0.8 / ×0.65), floored at
one week and rounded to the nearest half week.

The estimator is indicative. Final scope is agreed in writing — but the numbers it shows are
produced by the same rules a real quote would use.

## Layout

```
src/
  app/           layout, page, 404, Tailwind theme + tokens
  components/
    layout/      header, footer, command palette, back-to-top, providers
    sections/    hero, about, skills, experience, work, impact, testimonials, pricing, contact
    projects/    case-study card and dialog
    pricing/     estimator controls, quote summary, line-item labels
    charts/      Recharts wrappers and the shared tooltip
    ui/          button, fields, slider, segmented control, switch, modal
    visual/      aurora backdrop, motion primitives, brand icons, eyes
  data/          typed mock data: profile, skills, experience, projects, metrics, services
  hooks/         i18n, active section, clipboard, local clock, mount + hydration
  lib/           pricing engine, formatting, project filtering, contact validation, brief builder
  store/         Zustand store
  types/         shared domain types
```

## Notes

- Brand glyphs (GitHub, LinkedIn, Instagram, Facebook) are inlined from
  [Simple Icons](https://simpleicons.org) (CC0) because `lucide-react` v1 dropped brand icons.
- Motion respects `prefers-reduced-motion`: reveals, counters, the cursor spotlight and the aurora
  all fall back to static states.
- The contact form never transmits anything. Submitting it simulates latency and shows a
  confirmation; the message stays in the browser.
