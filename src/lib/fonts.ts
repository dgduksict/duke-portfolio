import { Press_Start_2P, Tiny5 } from "next/font/google";

/*
 * Pixel type for the whole site. Mongolian needs Ө/Ү, which live in `cyrillic-ext`, so every
 * face is loaded with all four subsets (both candidates ship them; Pixelify Sans does not).
 * next/font needs literal option objects, so the subset list is repeated rather than shared.
 *
 * - Display: Press Start 2P (name, titles, small labels). A true 8-pixel grid, crisp at multiples
 *   of 8px, very wide, so it stays on short lines.
 * - Body: Tiny5 (paragraphs). A compact 5-pixel face that stays readable at paragraph length,
 *   crisp at multiples of 10px.
 */
export const fontDisplay = Press_Start_2P({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: "400",
  display: "swap",
  variable: "--font-display",
});

export const fontBody = Tiny5({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: "400",
  display: "swap",
  variable: "--font-body",
});

/** Both CSS-variable class names, for `<html className>`. */
export const fontVariables: string = `${fontDisplay.variable} ${fontBody.variable}`;
