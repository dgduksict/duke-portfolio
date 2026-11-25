# Holiday cat and pet hint — design

**Date:** 2026-11-25
**Status:** the user asked for it and handed every choice to the author ("just pick urself"); these are the author's picks.
**Builds on:** `2026-11-19-cozy-cat-polish-design.md` (same pixel rules, same season machinery).

## 1. Intent

The user asked for three things:
- The cat wears a Christmas hat from 20 November to 31 December, with holiday decorations around him.
- Something special on their birthday, 1.5 (read as **5 January**, the Mongolian year.month.day order).
- A hint next to the cat, such as "click to pet him", so visitors discover he is interactive.

The goal is the same calm, cute pixel feel as before.

## 2. Goals, non-goals, anti-goals

**Goals**
- The festive look is unmistakable at a glance and still calm: small, sparse, slow.
- Visitors learn the two gestures (poke, hold) without reading anything long.

**Non-goals**
- No other holidays (Tsagaan Sar, New Year, Halloween). The holiday logic is a small table, so they can be added later.
- No sound, no confetti bursts, no pop-ups.

**Anti-goals**
- A hint that nags. It goes away for good once the visitor has done what it says.
- Anything that breaks the existing pixel rules, reduced motion, print, or 320 px.
- A hydration mismatch. The holiday is decided on the client from `now`, like the season.

## 3. Behaviour

### 3.1 Which holiday (pure logic)
- `holidayAt(now): "christmas" | "birthday" | null` uses the **Ulaanbaatar date**:
  - **christmas** runs from 20 November to 31 December, inclusive.
  - **birthday** is 5 January.
  - Otherwise there is no holiday.
- A `?holiday=christmas|birthday|none` preview parameter works like `?season=`, read once after mount.
- The hero, the ruler cat and the window all follow the same `now`, so `?time=` and `?holiday=` previews drive everything.

### 3.2 Hats
- **Christmas:** a red pixel Santa hat with a white brim and a white pompom flopping to one side.
- **Birthday:** a striped party cone (amber and the accent) with a pompom on top.
- He wears the hat in **every** drawing:
  - the hero cat by day, by night, while spinning and while waking
  - the ruler cat's five minis
  - the loader's yarn-chase frames
- Each drawing has its own hat anchor so the hat sits on his head. The hat moves with his head where the head animates (breathing, glance). By night the Santa hat droops over his ear.
- Two sizes: a hero hat (about 9 × 7 cells) and a mini hat (about 6 × 5) for the minis and the loader cat. The spin's back and mirrored frames get the hat too: mirrored with the body in the mirror frame, seen from behind in the back frame. The builder may use the same hat for back and front if it reads.
- The loader learns the holiday in its effect, using `holidayAt(new Date())` and `?holiday=`, and writes `data-holiday` on the overlay, so the server HTML is unchanged. Before React takes over there is no hat.

### 3.3 Decorations
**Christmas**
- A string of pixel fairy lights along the inside top edge of the window frame, at every width.
- The bulbs are a few warm colours that blink in two alternating sets, in steps, slowly (about 1.2 s).
- On wide screens, where the room shows, a small pixel Christmas tree stands on the floor in the left room (about 12 × 20 cells). It has a star and a few baubles, and it must not cover the desk or the floor plant.

**Birthday**
- A row of triangular bunting flags along the inside top of the window frame, in room colours plus the accent.
- A small cake with one candle on the sill. The flame flickers in two frames, and the cake sits clear of the cat's slot and the sill plants.

**Both**
- A festive first line when he is poked, then the usual quotes:
  - Christmas: en "Merry Christmas! Zero merge conflicts this year.", mn "Зул сарын баярын мэнд! Энэ жил merge conflict алга."
  - Birthday: en "It's my human's birthday today!", mn "Өнөөдөр эзний минь төрсөн өдөр!"
  - At night he still says "shh".
- Reduced motion: the lights stay lit, the flame is still, and the hats are unchanged.
- Hidden in print, like the rest of the scene.

### 3.4 Pet hint
**Where:** the hint shows in the speech box's place and shape, as a quieter version (the panel at reduced opacity, the same pixel outline). It appears 1.5 s after he has hopped in, so it is always inside the scene at 320 px and never overlaps the box. While he is speaking it hides. It is gone during UIIA, the wake and the purr.

**What it says**, in two stages:
- **Stage 1**, before the visitor has ever poked him: en "click to pet" with a fine pointer, "tap to pet" with a coarse pointer (`(pointer: coarse)`); mn "намайг илээрэй".
- **Stage 2**, after the first poke and until the first purr: en "hold to purr", mn "удаан дараарай".
- **Afterwards:** nothing, ever again on that browser.

**Memory**
- Progress is kept in `localStorage` (`duke:cat-hint`: `"poked"`, then `"purred"`), wrapped in try/catch.
- When storage is unavailable, it falls back to this page view only.

**Motion and accessibility**
- A gentle one-unit bob every 2 s, in steps. No bob under reduced motion.
- The button points at the hint with `aria-describedby`, so screen readers hear it too.
- The hint never takes the pointer.

**At night** he is asleep, but the hint still shows ("click to pet"). Pokes say "shh" and purring works, so the hint stays truthful.

## 4. Approaches (author's picks)

| Part | Picked | Rejected |
|---|---|---|
| Hats | A hat sprite per size, drawn at a per-drawing anchor inside the head group, so it animates with the head. | Redrawing every pose with a hat: around 20 new drawings, which would drift from the originals. |
| Decorations | Extra layers in the existing window and room components, driven by a `holiday` prop. | A separate overlay layer: it would duplicate the scene's geometry. |
| Hint | The speech box's slot and geometry, already proven at 320 px. | A new floating label: new geometry to keep on screen. |

## 5. Constraints
The same as `2026-11-19-cozy-cat-polish-design.md` §5, plus:
- The new dictionary keys stay identical in shape across en and mn.
- The Mongolian lines are the author's and go to the user for proofreading.

## 6. Left to the builder
- The exact pixel art and anchors.
- Bulb colours.
- Tree and cake placement within the rules above.
- How hats are threaded through `CatArt` (a prop is expected: `hat?: "santa" | "party"`).
- Hint styling details.
