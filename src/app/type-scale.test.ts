import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("type scale", () => {
  it("steps .type-title down only through the sticky-column modifier", () => {
    const wide = [...css.matchAll(/@media \(width >= (?:64|70)rem\) \{([\s\S]*?)\n  \}/g)].map((m) => m[1] ?? "");
    expect(wide.length).toBeGreaterThan(0);
    for (const block of wide) expect(block).not.toMatch(/\.type-title\s*\{/);
    expect(css).toMatch(/\.type-title-sticky\s*\{/);
  });

  it("has no dead header gap rule below 23rem", () => {
    expect(css).not.toMatch(/\.site-header \.container-page\s*\{/);
  });
});

describe("body type sizes", () => {
  const theme = /@theme \{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
  const token = (name: string) => new RegExp(String.raw`${name}:\s*([^;]+);`).exec(theme)?.[1];
  const sizeOf = (selector: string) =>
    new RegExp(String.raw`${selector.replace(".", String.raw`\.`)}\s*\{[^}]*?font-size:\s*([^;]+);`).exec(css)?.[1];

  it("snaps the small text tokens to 20px", () => {
    expect(token("--text-xs")).toBe("1.25rem");
    expect(token("--text-sm")).toBe("1.25rem");
  });

  it("sets the pipeline label and detail at 20px", () => {
    expect(sizeOf(".pipeline-label")).toBe("1.25rem");
    expect(sizeOf(".pipeline-detail")).toBe("1.25rem");
  });

  it("keeps the 48-64rem nav row on the body face at 20px", () => {
    const block = /@media \(width >= 48rem\) and \(width < 64rem\) \{\s*\.nav-link \{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(block).toMatch(/font-size:\s*1\.25rem;/);
  });
});
