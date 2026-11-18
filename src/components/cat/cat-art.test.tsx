import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CatArt } from "@/components/cat/cat-art";
import type { RulerPose } from "@/lib/cat";

const POSES: readonly RulerPose[] = ["type", "sit", "groom", "sleep", "nap"];

/** The reference site's brand colours; the portfolio's cat must never wear them. */
const FOREIGN_PAINT = ["#ef4445", "#eb4397", "#8253a2", "#3f5fac", "#3ea3db", "--c-pink", "--grad"];

describe("CatArt (hero)", () => {
  it("types by day, with no zzz", () => {
    const { container } = render(<CatArt variant="hero" state="day" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("data-state", "day");
    expect(container.querySelector(".cat-zzz")).toBeNull();
    expect(container.querySelector(".cat-screen")).not.toBeNull();
  });

  it("sleeps at night, with a zzz", () => {
    const { container } = render(<CatArt variant="hero" state="night" />);
    expect(container.querySelector("svg")).toHaveAttribute("data-state", "night");
    expect(container.querySelector(".cat-zzz")).not.toBeNull();
  });

  it("is decorative", () => {
    const { container } = render(<CatArt variant="hero" state="day" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).toHaveClass("cat-art");
  });
});

describe("CatArt (mini)", () => {
  it.each(POSES)("renders the %s pose", (pose) => {
    const { container } = render(<CatArt variant="mini" pose={pose} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("data-pose", pose);
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".cat-head")).not.toBeNull();
  });

  it("keeps an extra class name", () => {
    const { container } = render(<CatArt variant="mini" pose="sit" className="ruler-cat-art" />);
    expect(container.querySelector("svg")).toHaveClass("cat-art", "ruler-cat-art");
  });
});

describe("CatArt markup", () => {
  it("gives every instance its own ids", () => {
    const { container } = render(
      <>
        <CatArt variant="hero" state="day" />
        <CatArt variant="hero" state="night" />
        <CatArt variant="mini" pose="type" />
        <CatArt variant="mini" pose="type" />
      </>,
    );
    const ids = [...container.querySelectorAll("[id]")].map((element) => element.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never carries a transform on an animated part", () => {
    const { container } = render(
      <>
        <CatArt variant="hero" state="day" />
        <CatArt variant="hero" state="night" />
        {POSES.map((pose) => (
          <CatArt key={pose} variant="mini" pose={pose} />
        ))}
      </>,
    );
    const parts = container.querySelectorAll("[class^='cat-'], [class*=' cat-']");
    expect(parts.length).toBeGreaterThan(0);
    for (const part of parts) {
      if (part.tagName.toLowerCase() === "svg") continue;
      expect(part.hasAttribute("transform")).toBe(false);
    }
  });

  const variants = [
    { name: "hero day", node: <CatArt variant="hero" state="day" /> },
    { name: "hero night", node: <CatArt variant="hero" state="night" /> },
    ...POSES.map((pose) => ({ name: `mini ${pose}`, node: <CatArt variant="mini" pose={pose} /> })),
  ];

  it.each(variants)("paints $name in the portfolio palette only, under 15 KB", ({ node }) => {
    const { container } = render(node);
    const markup = container.innerHTML;
    for (const foreign of FOREIGN_PAINT) {
      expect(markup).not.toContain(foreign);
    }
    expect(markup.length).toBeLessThan(15 * 1024);
  });
});
