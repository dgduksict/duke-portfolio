import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { contrastRatio, parseTokens } from "./contrast";

describe("contrastRatio", () => {
  it("is 21 for black on white and symmetric", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
    expect(contrastRatio("#ffffff", "#000000")).toBe(21);
  });

  it("is 1 for identical colours", () => {
    expect(contrastRatio("#336699", "#336699")).toBeCloseTo(1, 5);
  });

  it("matches the known WCAG value for #777 on white", () => {
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });
});

describe("parseTokens", () => {
  const css = `
    :root {
      --ground: #fff8e7;
      --ink: #3b2314;
      --gap: 4px;
      color-scheme: light;
    }
    .dark {
      --ground: #0b1226;
      --ink: #f5ead0;
    }
  `;

  it("reads hex tokens from the :root block and ignores other declarations", () => {
    expect(parseTokens(css, ":root")).toEqual({ "--ground": "#fff8e7", "--ink": "#3b2314" });
  });

  it("reads hex tokens from the .dark block", () => {
    expect(parseTokens(css, ".dark")).toEqual({ "--ground": "#0b1226", "--ink": "#f5ead0" });
  });

  it("returns an empty record when the selector is missing", () => {
    expect(parseTokens("a { color: red; }", ".dark")).toEqual({});
  });
});

describe("theme tokens in src/app/globals.css", () => {
  const css = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../app/globals.css"), "utf8");

  for (const selector of [":root", ".dark"] as const) {
    describe(selector, () => {
      const t = parseTokens(css, selector);
      const pair = (fg: string, bg: string) => {
        const a = t[fg];
        const b = t[bg];
        if (a === undefined || b === undefined) throw new Error(`missing ${fg} or ${bg} in ${selector}`);
        return contrastRatio(a, b);
      };

      it("keeps body ink at AAA on the ground", () => {
        expect(pair("--ink", "--ground")).toBeGreaterThanOrEqual(7);
      });

      it("keeps soft ink at AAA on the ground", () => {
        expect(pair("--ink-soft", "--ground")).toBeGreaterThanOrEqual(7);
      });

      it("keeps soft ink at AAA on raised panels", () => {
        expect(pair("--ink-soft", "--panel")).toBeGreaterThanOrEqual(7);
      });

      it("keeps the accent text colour at AA on the ground", () => {
        expect(pair("--accent-text", "--ground")).toBeGreaterThanOrEqual(4.5);
      });

      it("keeps ink at AAA on raised panels", () => {
        expect(pair("--ink", "--panel")).toBeGreaterThanOrEqual(7);
      });

      it("keeps text on accent-filled buttons at AA", () => {
        expect(pair("--on-accent", "--accent")).toBeGreaterThanOrEqual(4.5);
      });
    });
  }
});
