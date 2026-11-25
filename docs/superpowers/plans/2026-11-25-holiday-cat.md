# Holiday Cat and Pet Hint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The cat wears a Santa hat from 20 Nov to 31 Dec and a party hat on 5 Jan, with matching window decorations and a festive first line. A two-stage hint teaches visitors to poke and then hold him.

**Architecture:** A pure `holidayAt` in `src/lib` plus a `useHoliday` hook, mirroring `seasonAt`/`useSeason`. Hats are small sprites drawn at per-drawing anchors inside `CatArt`'s head group. Decorations are extra layers in the window and room components. The hint reuses the speech box's slot.

**Tech Stack:** Next 16 App Router, React 19, Tailwind v4, vitest + jsdom + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-25-holiday-cat-design.md`. Read it with `docs/superpowers/specs/2026-11-19-cozy-cat-polish-design.md` §2 and §5 for the pixel rules.

## Global Constraints

- The pixel discipline of `2026-11-19-cozy-cat-polish-design.md` applies:
  - `steps()` only; only transform and opacity animate; whole cells.
  - No blur, gradients or rounding.
  - Reduced motion: still.
  - No hydration mismatch: holiday, pointer type and storage are read on the client after mount.
  - No new dependencies. No horizontal scroll at 320 px.
- Holiday by the Ulaanbaatar date: christmas is 20 Nov – 31 Dec inclusive, birthday is 5 Jan. `?holiday=christmas|birthday|none`.
- Copy (en / mn):
  - pet hint: "click to pet" / "tap to pet" / "намайг илээрэй"
  - hold hint: "hold to purr" / "удаан дараарай"
  - Christmas line: "Merry Christmas! Zero merge conflicts this year." / "Зул сарын баярын мэнд! Энэ жил merge conflict алга."
  - birthday line: "It's my human's birthday today!" / "Өнөөдөр эзний минь төрсөн өдөр!"
- Storage key: `duke:cat-hint`, with values `"poked"` and `"purred"`.
- Commit after each task with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never push. `npm run lint`, `npm run typecheck` and `npm test` pass after every task.

## Review Focus

1. **A visitor who clears storage, or a browser that blocks it.** The hint still works for the page view and never throws. Test in Task 5.
2. **The festive line vs UIIA and purr.** The first poke's festive line must not break the 5-poke UIIA count or the purr's "not a poke" rule. Test in Task 4.
3. **The hat on the mirrored spin frame and the night loaf.** It sits on the head, not floating, and is not clipped by the 168-unit box. Test in Task 2 (anchor inside the head bounds) plus a visual check in Task 6.
4. **31 Dec → 1 Jan and 4 → 5 Jan at Ulaanbaatar midnight, for a visitor in another time zone.** Test in Task 1.
5. **The hint at 320 px, in Mongolian.** It stays inside the scene. Visual check in Task 6.

---

### Task 1: Holiday logic, hook and copy

**Files:** Create `src/lib/holiday.ts`, `src/lib/holiday.test.ts`, `src/hooks/use-holiday.ts`. Modify `src/lib/i18n/dictionary.ts` (+ its test if it lists keys).

**Interfaces (Produces):**
- `export type Holiday = "christmas" | "birthday";`
- `export function holidayAt(now: Date): Holiday | null`
- `export function parseHolidayParam(value: string | null): Holiday | "none" | null`
- `export function useHoliday(now: Date | null): Holiday | null`, shaped exactly like `useSeason`.
- Dictionary `cat` gains `petHint: { click: string; tap: string }`, `holdHint: string`, `festive: { christmas: string; birthday: string }`. mn has no click/tap distinction, so both carry the same string.

- [ ] **Step 1: Failing tests.** `holidayAt` for each case, given as Ulaanbaatar wall times:
  - 2026-11-19 23:59 → null
  - 11-20 00:00 → christmas
  - 12-31 23:59 → christmas
  - 2027-01-01 00:00 → null
  - 01-04 23:59 → null
  - 01-05 12:00 → birthday
  - 01-06 00:00 → null

  Build each instant as UTC minus 8 h, and assert the result does not depend on the test machine's time zone.

  `parseHolidayParam` cases: christmas, birthday, none, junk → null, null → null.
- [ ] **Step 2: Run** `npx vitest run src/lib/holiday.test.ts`. Expect FAIL.
- [ ] **Step 3: Implement** the module, the hook and the dictionary copy (Global Constraints).
- [ ] **Step 4: Run** `npm test`. Expect PASS.
- [ ] **Step 5: Commit** `feat(cat): know Christmas and the birthday by the Ulaanbaatar calendar`.

### Task 2: Hats on the hero and ruler cats

**Files:** Modify `src/components/cat/sprites.ts` (`SANTA_HAT`, `PARTY_HAT` around 9×7; `SANTA_HAT_MINI`, `PARTY_HAT_MINI` around 6×5; new legend letters only if needed, added to `PALETTE`, with fixed colours in `cat.css`). Modify `src/components/cat/cat-art.tsx`, `hero-cat.tsx`, `ruler-cat.tsx`, `src/components/ruler/ruler.tsx` (pass the holiday) and `cat.css`. Tests: `cat-art.test.tsx`, `hero-cat.test.tsx`, `ruler-cat.test.tsx`.

**Interfaces:**
- Consumes `useHoliday` (Task 1).
- Produces:
  - `CatArt` (both variants) gains `hat?: "santa" | "party"`, rendered as `<g className="cat-hat" data-hat="santa|party">` inside the head group where the drawing has one, so it moves with the head.
  - A per-drawing anchor table, `HAT_AT`, in `cat-art.tsx`. Its keys are hero day, night, wake-yawn, wake-stretch, spin side, spin front, spin back, plus mini type, sit, groom, sleep and nap. The mirror frame reuses side, inside its mirror wrapper. Task 3 extends the table for the loader frames.
  - `HeroCat` and `RulerCat` map holiday → hat (christmas → santa, birthday → party).

- [ ] **Step 1: Failing tests:**
  - `"wears no hat on an ordinary day"`
  - `"wears a santa hat in every hero drawing"`: day, night, uiia (4 frames, each frame has one `.cat-hat`), wake (2 frames)
  - `"wears a party hat on the birthday"`
  - `"puts the hat on his head"`: for each drawing, the hat's rect bounds overlap the head part's top rows, and every hat rect stays inside the viewBox (0..168 hero, 0..48 mini)
  - `"ruler cat wears the hat in all five poses"`
  - `HeroCat` with `?holiday=christmas` renders `[data-hat="santa"]`; with `?holiday=none` and a December `?time=` there is none
  - The markup budget tests still pass (raise only the variants that need it, with a comment)
- [ ] **Step 2: Run** `npx vitest run src/components/cat src/components/ruler`. Expect FAIL.
- [ ] **Step 3: Implement.** Draw the hats per spec §3.2, with the Santa hat drooping at night. Thread `hat` through.
- [ ] **Step 4: Run** `npm test`. Expect PASS.
- [ ] **Step 5: Commit** `feat(cat): a Santa hat for December and a party hat for the birthday`.

### Task 3: The loader cat wears the hat too

**Files:** Modify `src/components/loader/loading-screen.tsx`, `yarn-stage.tsx`, `loader.css`, `cat-art.tsx` (only if the hat helper lives there). Test: `loading-screen.test.tsx`, `yarn-stage.test.tsx`.

**Interfaces:** Consumes `holidayAt` and `parseHolidayParam` (Task 1), and the mini hat sprites and anchor approach (Task 2). The overlay root gets `data-holiday="christmas|birthday"` from the effect. `YarnStage` draws a `.cat-hat` per frame group for both hats; CSS shows the one matching `data-holiday` and hides both otherwise.

- [ ] **Step 1: Failing tests:**
  - `"puts the holiday on the overlay from the effect"`: fake system time 2026-12-10 (UB) → `data-holiday="christmas"`, and the server/idle markup has no attribute
  - `?holiday=birthday` → birthday; `?holiday=none` in December → no attribute
  - The stage has a hat in each of the 8 frames, for each hat kind
  - CSS: hats are hidden unless `.loader[data-holiday=…]` matches
- [ ] **Step 2: Run** `npx vitest run src/components/loader`. Expect FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npm test`. Expect PASS.
- [ ] **Step 5: Commit** `feat(loader): the yarn cat dresses up for the holidays`.

### Task 4: Window decorations and the festive line

**Files:** Modify `src/components/scene/window-scene.tsx` (prop `holiday?: Holiday | null`), `room.tsx` (tree, cake), `pixel-sky.tsx` or the frame markup (lights, bunting: whichever sits on the frame's inside top edge in front of the glass), `scene.css`, `src/components/sections/hero.tsx` (`holiday={useHoliday(now)}`, passed to `WindowScene` and to `HeroCat`), `hero-cat.tsx` (the festive first line). Tests: `window-scene.test.tsx`, `hero-cat.test.tsx`.

**Interfaces:** Consumes `Holiday`, `useHoliday` and dictionary `cat.festive` (Task 1). `HeroCat` gains `holiday?: Holiday | null` (Task 2 may already have added it; reuse it). Layers:
- `[data-layer="fairy-lights"]` (christmas)
- `[data-layer="xmas-tree"]` (christmas, inside the wide-screen room)
- `[data-layer="bunting"]` (birthday)
- `[data-layer="cake"]` (birthday, on the sill)

- [ ] **Step 1: Failing tests:**
  - christmas → lights and tree, no bunting or cake; birthday → bunting and cake, no lights or tree; null → none
  - The tree only in the full room (not `compact`, so `not-found` without a holiday shows none)
  - css: bulbs and flame animate opacity with `steps(`; `animation: none` under reduced motion
  - hero-cat: with `?holiday=christmas` by day, the first poke says the Christmas line and the second says `quotes[0]`. At night the first poke says "shh".
  - Review Focus 2: five quick pokes on a holiday still trigger UIIA, and a purr then a click still does not speak
- [ ] **Step 2: Run** `npx vitest run src/components/scene src/components/cat`. Expect FAIL.
- [ ] **Step 3: Implement** per spec §3.3.
- [ ] **Step 4: Run** `npm test`. Expect PASS.
- [ ] **Step 5: Commit** `feat(scene): fairy lights and a tree for December, bunting and cake for the birthday`.

### Task 5: The pet hint

**Files:** Create `src/lib/cat-hint.ts` (+ test) or add to `src/lib/cat.ts`. Modify `hero-cat.tsx` and `cat.css`. Test: `hero-cat.test.tsx`.

**Interfaces (Produces):**
- `export type HintStage = "pet" | "hold" | null;`
- `export function hintStage(stored: string | null): HintStage`: null/unknown → "pet", "poked" → "hold", "purred" → null.
- `export const HINT = { delayMs: 1500, storageKey: "duke:cat-hint" } as const;`
- The hint element is `.hero-cat-hint` (`id` via `useId`), referenced by the button's `aria-describedby` while shown.

- [ ] **Step 1: Failing tests:**
  - lib: the `hintStage` mapping.
  - hero-cat:
    - `"shows 'click to pet' 1.5 s after he arrives"`: none at 1499 ms after he shows, present at 1500
    - `"says tap on touch screens"`: `matchMedia('(pointer: coarse)')` true → "tap to pet"
    - `"turns into 'hold to purr' after the first poke and remembers it"`: storage `"poked"` set, hint text changes. A remount with `"poked"` in storage shows "hold to purr".
    - `"goes away for good after the first purr"`: `"purred"` stored, no hint, and none after a remount
    - `"hides while he speaks, spins, wakes or purrs"`
    - `"is described to screen readers"`: the button's `aria-describedby` matches the hint id while shown and is absent when not
    - Review Focus 1: `"works when storage throws"`: `localStorage` getter/setItem throw → the hint still shows and advances for this view, with no error
    - `"stays still under reduced motion"`: no bob (css)
    - Mongolian: "намайг илээрэй"
  - css: `.hero-cat-hint` uses the bubble's geometry, `pointer-events: none`, `data-print`-hidden, bob in `steps(`.
- [ ] **Step 2: Run** `npx vitest run src/components/cat src/lib`. Expect FAIL.
- [ ] **Step 3: Implement** per spec §3.4.
- [ ] **Step 4: Run** `npm test`. Expect PASS.
- [ ] **Step 5: Commit** `feat(cat): a little hint that teaches pet and purr`.

### Task 6: Browser check of the holiday features

**Files:** none new (fixes are `fix(...)` commits with tests).

- [ ] **Step 1: Run** `npm run lint && npm run typecheck && npm test && npm run build`. All green.
- [ ] **Step 2: Look in a real browser** (headless Edge over CDP against your own `next dev`). Save screenshots to the session scratchpad `screens/` folder:
  - `?holiday=christmas` by day and at `?time=23:00`, at 1280×800 and 320×640: hat, lights, tree (wide only)
  - UIIA mid-spin with the hat (Review Focus 3)
  - the loader with a hat (fresh session)
  - the ruler cat with a hat (wide and compact)
  - `?holiday=birthday`: party hat, bunting, cake
  - the hint in both stages, in English and Mongolian at 320×640 (Review Focus 5)
- [ ] **Step 3: Fix** anything broken, re-run Step 1, commit.
