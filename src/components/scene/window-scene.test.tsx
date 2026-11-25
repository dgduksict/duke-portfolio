import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WindowScene } from "@/components/scene/window-scene";
import { contrastRatio, parseTokens } from "@/lib/contrast";

/** Noon and midnight in Ulaanbaatar (UTC+8) on an autumn day. */
const NOON = new Date("2026-10-05T04:50:00Z");
const MIDNIGHT = new Date("2026-10-05T16:00:00Z");
/** Shortly after sunset: the sun is a few degrees down. */
const DUSK = new Date("2026-10-05T10:45:00Z");

/** The reference site's brand colours; the portfolio must never wear them. */
const FOREIGN_PAINT = ["#ef4445", "#eb4397", "#8253a2", "#3f5fac", "#3ea3db", "--c-pink", "--grad"];

const skyOf = (container: HTMLElement) => container.querySelector<HTMLElement>("[data-ready]");

describe("WindowScene", () => {
  it("paints nothing time-dependent before the time is known", () => {
    const { container } = render(<WindowScene now={null} />);
    const sky = skyOf(container);
    expect(sky).not.toBeNull();
    expect(sky).toHaveAttribute("data-ready", "false");
    expect(sky).not.toHaveAttribute("data-phase");
    expect(container.querySelectorAll('[data-window="lit"]')).toHaveLength(0);
    expect(container.querySelector("[data-star]")).toBeNull();
    expect(container.querySelector("[data-band]")).toBeNull();
    expect(container.querySelector("[data-sun]")).toBeNull();
    expect(container.querySelector("[data-moon]")).toBeNull();
  });

  it("shows the day sky at noon: flat bands, no lit windows", () => {
    const { container } = render(<WindowScene now={NOON} />);
    const sky = skyOf(container);
    expect(sky).toHaveAttribute("data-ready", "true");
    expect(sky).toHaveAttribute("data-phase", "day");
    const bands = container.querySelectorAll("[data-band]");
    expect(bands.length).toBeGreaterThanOrEqual(10);
    for (const band of bands) expect(band.getAttribute("fill")).toMatch(/^#[0-9a-f]{6}$/);
    expect(container.querySelectorAll('[data-window="lit"]')).toHaveLength(0);
    expect(container.querySelector("[data-sun]")).not.toBeNull();
  });

  it("lights the skyline and the stars at night", () => {
    const { container } = render(<WindowScene now={MIDNIGHT} />);
    expect(skyOf(container)).toHaveAttribute("data-phase", "night");
    expect(container.querySelectorAll('[data-window="lit"]').length).toBeGreaterThan(10);
    expect(container.querySelectorAll("[data-star]").length).toBeGreaterThan(10);
    expect(container.querySelector("[data-moon]")).not.toBeNull();
  });

  it("lights fewer windows at dusk than at night", () => {
    const dusk = render(<WindowScene now={DUSK} />).container;
    const phase = skyOf(dusk)?.getAttribute("data-phase");
    expect(["twilight", "golden"]).toContain(phase);
    const atDusk = dusk.querySelectorAll('[data-window="lit"]').length;
    const night = render(<WindowScene now={MIDNIGHT} />).container;
    expect(atDusk).toBeLessThan(night.querySelectorAll('[data-window="lit"]').length);
  });

  it("is the same picture for the same minute", () => {
    const a = render(<WindowScene now={MIDNIGHT} />).container.innerHTML;
    const b = render(<WindowScene now={new Date(MIDNIGHT)} />).container.innerHTML;
    expect(a).toBe(b);
  });

  it("keeps a cat slot on the sill that renders its children and stays accessible", () => {
    const { container } = render(
      <WindowScene now={NOON}>
        <button type="button">Pet the cat</button>
      </WindowScene>,
    );
    const slot = container.querySelector("[data-cat-slot]");
    expect(slot).not.toBeNull();
    const button = screen.getByRole("button", { name: "Pet the cat" });
    expect(slot).toContainElement(button);
    expect(slot?.closest('[aria-hidden="true"]')).toBeNull();
  });

  it("hides every decorative layer from assistive tech and print", () => {
    const { container } = render(<WindowScene now={MIDNIGHT} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-print", "hide");
    expect(root).not.toHaveAttribute("aria-hidden");
    expect(container.textContent).toBe("");
    // Everything drawn sits under an aria-hidden layer; only the cat slot is outside one.
    for (const drawn of container.querySelectorAll("svg, [data-layer]")) {
      expect(drawn.closest('[aria-hidden="true"]'), drawn.outerHTML.slice(0, 80)).not.toBeNull();
    }
    for (const child of root.children) {
      if (child.hasAttribute("data-cat-slot")) continue;
      expect(child).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("gives the header a zone to watch above the window", () => {
    const { container } = render(<WindowScene now={null} />);
    expect(container.querySelector("[data-header-zone]")).not.toBeNull();
  });

  it("has a compact variant: the window, sill, plants and cat slot, without the room or the header zone", () => {
    const { container } = render(
      <WindowScene now={NOON} compact>
        <span>cat</span>
      </WindowScene>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("scene", "scene-compact");
    expect(root.querySelector(".scene-frame [data-ready]")).not.toBeNull();
    expect(root.querySelector(".scene-sill")).not.toBeNull();
    expect(root.querySelectorAll('[data-layer="sill-plant"]')).toHaveLength(2);
    expect(root.querySelector("[data-cat-slot]")).toHaveTextContent("cat");
    expect(root.querySelector("[data-header-zone]")).toBeNull();
    expect(root.querySelector(".scene-left, .scene-right, .scene-radiator, .scene-wainscot, .scene-skirting, .scene-mug")).toBeNull();
  });

  it("lets it snow in winter", () => {
    const { container } = render(<WindowScene now={NOON} season="winter" />);
    const snow = container.querySelector('[data-layer="snow"]');
    expect(snow).not.toBeNull();
    const near = snow?.querySelectorAll(".scene-snow-1 rect") ?? [];
    const far = snow?.querySelectorAll(".scene-snow-0 rect") ?? [];
    expect(near.length).toBeGreaterThan(0);
    expect(far.length).toBeGreaterThan(0);
    // 36 flakes, each drawn twice (at y and y - 64) so the fall loops without a seam.
    const rects = [...(snow?.querySelectorAll("rect") ?? [])];
    expect(rects).toHaveLength(72);
    expect(near.length + far.length).toBe(72);
    for (const rect of rects) {
      expect(rect).toHaveAttribute("width", "1");
      expect(rect).toHaveAttribute("height", "1");
    }
    const onGlass = rects.filter((rect) => Number(rect.getAttribute("y")) >= 0);
    expect(onGlass).toHaveLength(36);
    expect(new Set(onGlass.map((rect) => `${rect.getAttribute("x")},${rect.getAttribute("y")}`)).size).toBe(36);
    for (const rect of rects) expect(Number(rect.getAttribute("y"))).toBeLessThan(64);
    // The flakes sit behind the bars.
    const layers = [...container.querySelectorAll("[data-layer]")].map((el) => el.getAttribute("data-layer"));
    expect(layers.indexOf("snow")).toBeLessThan(layers.indexOf("bars"));
  });

  it("paints snow warm at night and white by day", () => {
    const night = render(<WindowScene now={MIDNIGHT} season="winter" />).container;
    expect(night.querySelector('[data-layer="snow"]')?.getAttribute("fill")).toBe("#fff8e0");
    const day = render(<WindowScene now={NOON} season="winter" />).container;
    expect(day.querySelector('[data-layer="snow"]')?.getAttribute("fill")).toBe("#ffffff");
  });

  it("shows fireflies only on summer nights", () => {
    const night = render(<WindowScene now={MIDNIGHT} season="summer" />).container;
    const flies = night.querySelector('[data-layer="fireflies"]');
    expect(flies).not.toBeNull();
    expect(flies?.querySelectorAll("rect")).toHaveLength(7);
    const delays = [...(flies?.querySelectorAll("rect") ?? [])].map((rect) => (rect as SVGElement).style.animationDelay);
    expect(new Set(delays).size).toBe(7);
    expect(night.querySelector('[data-layer="snow"]')).toBeNull();
    expect(render(<WindowScene now={NOON} season="summer" />).container.querySelector('[data-layer="fireflies"]')).toBeNull();
    expect(render(<WindowScene now={MIDNIGHT} season="winter" />).container.querySelector('[data-layer="fireflies"]')).toBeNull();
  });

  it("has no seasonal layers without a season", () => {
    for (const season of [undefined, null]) {
      const { container } = render(<WindowScene now={MIDNIGHT} season={season} />);
      expect(container.querySelector('[data-layer="snow"]')).toBeNull();
      expect(container.querySelector('[data-layer="fireflies"]')).toBeNull();
    }
  });

  it("has no snow before the time is known", () => {
    const { container } = render(<WindowScene now={null} season="winter" />);
    expect(container.querySelector('[data-layer="snow"]')).toBeNull();
  });

  // Twelve full scenes: each is unmounted as soon as it is read, and the test gets room for a busy full-suite run
  // (it took over 5 s there once, against under 1 s alone).
  it("wears no foreign brand colours", { timeout: 20_000 }, () => {
    for (const now of [null, NOON, DUSK, MIDNIGHT]) {
      for (const holiday of [null, "christmas", "birthday"] as const) {
        const { container, unmount } = render(<WindowScene now={now} holiday={holiday} />);
        const html = container.innerHTML.toLowerCase();
        unmount();
        for (const paint of FOREIGN_PAINT) expect(html).not.toContain(paint);
      }
    }
  });

  describe("holiday decorations", () => {
    const layer = (container: HTMLElement, name: string) => container.querySelector(`[data-layer="${name}"]`);
    const DECORATIONS = ["fairy-lights", "xmas-tree", "bunting", "cake"] as const;
    /** Every drawn cell of a layer as "x,y" (rects are in cells; the room art's x/y are the room's own). */
    const cells = (el: Element | null) =>
      new Set(
        [...(el?.querySelectorAll("rect") ?? [])].flatMap((rect) => {
          const [x, y, w, h] = ["x", "y", "width", "height"].map((a) => Number(rect.getAttribute(a)));
          return Array.from({ length: (w ?? 0) * (h ?? 0) }, (_, i) => `${x! + (i % w!)},${y! + Math.floor(i / w!)}`);
        }),
      );

    it("strings fairy lights and stands a tree for Christmas, without the birthday's things", () => {
      const { container } = render(<WindowScene now={NOON} holiday="christmas" />);
      expect(layer(container, "fairy-lights")).not.toBeNull();
      expect(layer(container, "xmas-tree")).not.toBeNull();
      expect(layer(container, "bunting")).toBeNull();
      expect(layer(container, "cake")).toBeNull();
    });

    it("hangs bunting and puts a cake on the sill for the birthday, without Christmas's things", () => {
      const { container } = render(<WindowScene now={NOON} holiday="birthday" />);
      expect(layer(container, "bunting")).not.toBeNull();
      expect(layer(container, "cake")).not.toBeNull();
      expect(layer(container, "fairy-lights")).toBeNull();
      expect(layer(container, "xmas-tree")).toBeNull();
    });

    it("decorates nothing on an ordinary day, or before the holiday is known", () => {
      for (const holiday of [null, undefined]) {
        const { container } = render(<WindowScene now={NOON} holiday={holiday} />);
        for (const name of DECORATIONS) expect(layer(container, name), name).toBeNull();
      }
    });

    it("stands the tree in the full room only: the compact scene keeps the lights but has no room for it", () => {
      const compact = render(<WindowScene now={NOON} compact holiday="christmas" />).container;
      expect(layer(compact, "fairy-lights")).not.toBeNull();
      expect(layer(compact, "xmas-tree")).toBeNull();
      const tree = render(<WindowScene now={NOON} holiday="christmas" />).container.querySelector(
        '[data-layer="xmas-tree"]',
      );
      expect(tree?.closest('[data-layer="room-left"]')).not.toBeNull();
      // The not-found page's compact scene, which passes no holiday, shows none of it.
      const plain = render(<WindowScene now={MIDNIGHT} compact />).container;
      for (const name of DECORATIONS) expect(layer(plain, name), name).toBeNull();
    });

    it("keeps the tree clear of the desk and the floor plant, standing on the floor", () => {
      const { container } = render(<WindowScene now={NOON} holiday="christmas" />);
      const tree = cells(layer(container, "xmas-tree"));
      expect(tree.size).toBeGreaterThan(60);
      for (const other of ["desk", "floor-plant"]) {
        const taken = cells(layer(container, other));
        expect(taken.size, other).toBeGreaterThan(0);
        for (const cell of tree) expect(taken.has(cell), `${other} at ${cell}`).toBe(false);
      }
      const rows = [...tree].map((cell) => Number(cell.split(",")[1]));
      expect(Math.max(...rows)).toBe(94);
      // About 20 cells tall, with a star on top.
      expect(Math.max(...rows) - Math.min(...rows) + 1).toBeGreaterThanOrEqual(18);
      expect(layer(container, "xmas-tree")?.querySelector('rect[fill="var(--scene-star)"]')).not.toBeNull();
    });

    it("hangs the lights and the bunting along the top of the glass, in front of the bars", () => {
      for (const [holiday, name] of [
        ["christmas", "fairy-lights"],
        ["birthday", "bunting"],
      ] as const) {
        const { container } = render(<WindowScene now={NOON} holiday={holiday} />);
        const decoration = layer(container, name);
        expect(decoration?.closest(".scene-frame")).not.toBeNull();
        const layers = [...container.querySelectorAll(".scene-frame [data-layer]")].map((el) =>
          el.getAttribute("data-layer"),
        );
        expect(layers.indexOf(name)).toBeGreaterThan(layers.indexOf("bars"));
        const rows = [...cells(decoration)].map((cell) => Number(cell.split(",")[1]));
        expect(Math.min(...rows)).toBe(0);
        expect(Math.max(...rows)).toBeLessThan(10);
      }
    });

    it("blinks the bulbs in two alternating sets of warm colours", () => {
      const { container } = render(<WindowScene now={NOON} holiday="christmas" />);
      const lights = layer(container, "fairy-lights");
      const a = lights?.querySelectorAll(".scene-bulb-a") ?? [];
      const b = lights?.querySelectorAll(".scene-bulb-b") ?? [];
      expect(a.length).toBeGreaterThanOrEqual(6);
      expect(b.length).toBe(a.length);
      // Each set holds every colour, so whichever set is dimmed the string still shows all four.
      for (const set of [a, b]) {
        const colours = new Set([...set].flatMap((bulb) => [...bulb.querySelectorAll("rect")].map((r) => r.getAttribute("fill"))));
        for (const colour of ["red", "amber", "green", "blue"]) expect(colours).toContain(`var(--scene-bulb-${colour})`);
      }
    });

    it("puts the cake on the sill with one candle whose flame has two frames", () => {
      const { container } = render(<WindowScene now={NOON} holiday="birthday" />);
      const cake = layer(container, "cake");
      expect(cake?.closest(".scene-window")).not.toBeNull();
      expect(cake).toHaveClass("scene-cake");
      expect(cake?.querySelectorAll(".scene-flame-1")).toHaveLength(1);
      expect(cake?.querySelectorAll(".scene-flame-2")).toHaveLength(1);
    });
  });
});

describe("scene.css", () => {
  const css = readFileSync("src/components/scene/scene.css", "utf8");
  const code = css.replace(/\/\*[\s\S]*?\*\//g, "");

  it("draws with hard pixels only: no gradients, blur, soft shadows or rounding", () => {
    expect(code).not.toMatch(/gradient\(/);
    expect(code).not.toMatch(/blur\(/);
    expect(code).not.toMatch(/border-radius:\s*(?!0)/);
    expect(code).not.toMatch(/box-shadow/);
  });

  it("animates in steps only and stops everything under reduced motion", () => {
    const timings = [...code.matchAll(/animation(?:-timing-function)?:([^;]+);/g)].map((m) => m[1] ?? "");
    const running = timings.filter((value) => !/^\s*none\s*$/.test(value) && !/!important/.test(value));
    expect(running.length).toBeGreaterThan(0);
    for (const value of running) expect(value).toMatch(/steps\(/);
    const reduced = code.slice(code.indexOf("prefers-reduced-motion: reduce"));
    expect(code).toContain("prefers-reduced-motion: reduce");
    expect(reduced).toMatch(/animation:\s*none/);
  });

  it("steps the snow down the glass and blinks the fireflies, and stills both under reduced motion", () => {
    expect(code).toMatch(/\.scene-snow-0\s*\{[^}]*animation:[^;]*steps\(64/);
    expect(code).toMatch(/\.scene-snow-1\s*\{[^}]*animation:[^;]*steps\(64/);
    expect(code).toMatch(/@keyframes scene-snow-fall\s*\{[^}]*transform:/);
    expect(code).toMatch(/@keyframes scene-firefly\s*\{[^}]*opacity:/);
    expect(code).toMatch(/\.scene-firefly\s*\{[^}]*animation:[^;]*steps\(/);
    const reduced = code.slice(code.indexOf("prefers-reduced-motion: reduce"));
    expect(reduced).toMatch(/\.scene-snow-0[^{]*\{[^}]*animation:\s*none/);
    expect(reduced).toMatch(/\.scene-firefly[^{]*\{[^}]*animation:\s*none/);
  });

  it("blinks the bulbs and flickers the flame on opacity in steps, and stills both under reduced motion", () => {
    for (const selector of ["scene-bulb-a", "scene-bulb-b", "scene-flame-1", "scene-flame-2"]) {
      const rule = code.match(new RegExp(`\\.${selector}\\s*\\{[^}]*animation:([^;]*);`));
      expect(rule, selector).not.toBeNull();
      expect(rule?.[1], selector).toMatch(/steps\(/);
      const name = rule?.[1]?.trim().split(/\s+/)[0] ?? "";
      expect(code, `${selector} keyframes`).toMatch(new RegExp(`@keyframes ${name}\\s*\\{[^@]*opacity:`));
      expect(code).not.toMatch(new RegExp(`@keyframes ${name}\\s*\\{[^@]*transform:`));
    }
    // The two sets alternate: one is half a loop behind the other.
    expect(code).toMatch(/\.scene-bulb-b\s*\{[^}]*animation-delay:/);
    const reduced = code.slice(code.indexOf("prefers-reduced-motion: reduce"));
    expect(reduced).toMatch(/\.scene-bulb[^{]*\{[^}]*animation:\s*none/);
    expect(reduced).toMatch(/\.scene-flame-1[^{]*\{[^}]*animation:\s*none/);
    // Reduced motion: every bulb lit (no dim frame left on) and one flame frame.
    expect(reduced).toMatch(/\.scene-flame-2\s*\{[^}]*opacity:\s*0/);
  });

  it("sets the cake on the sill by class, like the plants and the mug", () => {
    expect(code).toMatch(/\.scene-window > \.scene-cake/);
    expect(code).toMatch(/\.scene-cake\s*\{[^}]*top:/);
  });

  it("has day and night room colours, and the header ink reads on the wall in both", () => {
    const globals = readFileSync("src/app/globals.css", "utf8");
    for (const selector of [":root", ".dark"] as const) {
      const scene = parseTokens(css, selector);
      const theme = parseTokens(globals, selector);
      expect(scene["--scene-wall"], selector).toMatch(/^#[0-9a-f]{6}$/);
      expect(contrastRatio(theme["--ink"]!, scene["--scene-wall"]!)).toBeGreaterThanOrEqual(7);
    }
  });

  it("is imported by globals.css after the other stylesheets", () => {
    const globals = readFileSync("src/app/globals.css", "utf8");
    const imports = [...globals.matchAll(/@import\s+"([^"]+)"/g)].map((m) => m[1]);
    expect(imports.at(-1)).toBe("../components/scene/scene.css");
  });
});
