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
