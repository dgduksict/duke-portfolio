/** WCAG 2.x contrast helpers, used to keep the theme tokens honest (see contrast.test.ts). */

const HEX = /^#([0-9a-f]{6})$/i;

function channel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const match = HEX.exec(hex.trim());
  if (match === null) throw new Error(`Expected #rrggbb, got "${hex}"`);
  const n = Number.parseInt(match[1] ?? "", 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

/** WCAG contrast ratio between two `#rrggbb` colours, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Reads `--token: #rrggbb;` declarations from the first top-level rule block whose
 * selector is exactly `selector` (blocks are flat: tokens are never nested). Other
 * declarations are ignored.
 */
export function parseTokens(css: string, selector: ":root" | ".dark"): Record<string, string> {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const tokens: Record<string, string> = {};
  const rule = /([^{}]+)\{([^{}]*)\}/g;
  for (const match of stripped.matchAll(rule)) {
    // Statements such as `@import ...;` sit in front of the selector without a brace between.
    const head = (match[1] ?? "").split(";").pop() ?? "";
    const selectors = head.split(",").map((s) => s.trim());
    if (!selectors.includes(selector) || selectors.length !== 1) continue;
    for (const decl of (match[2] ?? "").matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) {
      const name = decl[1];
      const value = decl[2];
      if (name !== undefined && value !== undefined) tokens[name] = value.toLowerCase();
    }
    return tokens;
  }
  return tokens;
}
