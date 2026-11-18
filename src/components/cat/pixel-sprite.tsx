import { type CatPart, PALETTE, type PartBox, type Sprite } from "@/components/cat/sprites";

/** One run of same-coloured pixels on a row, in grid units, with its legend colour. */
export interface SpriteRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly c: string;
}

/**
 * The rects that draw a bitmap: one per horizontal run of one colour on a row (`.` is empty and draws nothing), and a
 * run that repeats exactly (same column, width and colour) on the rows below grows into one taller rect, which keeps
 * the markup small (a rim edge down the side of the cat is one rect, not one per row). Rects come out in scan order
 * of their top-left pixel.
 */
export function spriteRects(map: readonly string[]): SpriteRect[] {
  const rects: { x: number; y: number; w: number; h: number; c: string }[] = [];
  /** Rects that reached the previous row, by "x:w:c", so a matching run below extends them. */
  let open = new Map<string, (typeof rects)[number]>();
  map.forEach((row, y) => {
    const next = new Map<string, (typeof rects)[number]>();
    let x = 0;
    while (x < row.length) {
      const c = row[x] ?? ".";
      let end = x + 1;
      while (end < row.length && row[end] === c) end += 1;
      if (c !== ".") {
        const key = `${x}:${end - x}:${c}`;
        const above = open.get(key);
        if (above === undefined) {
          const rect = { x, y, w: end - x, h: 1, c };
          rects.push(rect);
          next.set(key, rect);
        } else {
          above.h += 1;
          next.set(key, above);
        }
      }
      x = end;
    }
    open = next;
  });
  return rects;
}

/** The legend colour that always belongs to the eye layer, wherever it sits. */
const EYE = "e";
const PARTS: readonly CatPart[] = ["head", "ear-l", "ear-r", "eye", "tail", "paw-l", "paw-r", "body"];

/**
 * Splits one drawing into its part layers, so the cat is drawn whole (easy to read and edit as a picture) and still
 * animates part by part. Each inked pixel goes to the eye if it is eye-coloured, else to the first box that holds it,
 * else to the body. Every part comes back as a map of the drawing's full size, empty where it has no pixels.
 */
export function splitParts(map: Sprite, boxes: readonly PartBox[]): Record<CatPart, Sprite> {
  const partOf = (x: number, y: number, c: string): CatPart => {
    if (c === EYE) return "eye";
    return boxes.find((b) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1)?.part ?? "body";
  };
  const out = {} as Record<CatPart, Sprite>;
  for (const part of PARTS) {
    out[part] = map.map((row, y) =>
      [...row].map((c, x) => (c !== "." && partOf(x, y, c) === part ? c : ".")).join(""),
    );
  }
  return out;
}

/** The map with only the pixels whose legend colour is in `colours` (`keep`), or with exactly those removed. */
export function pickColours(map: Sprite, colours: string, keep = true): Sprite {
  return map.map((row) => [...row].map((c) => (c !== "." && colours.includes(c) === keep ? c : ".")).join(""));
}

/** True when a map has no pixels at all (an empty part is not rendered). */
export function isBlank(map: Sprite): boolean {
  return map.every((row) => /^\.*$/.test(row));
}

export interface PixelSpriteProps {
  readonly map: readonly string[];
  /** Screen units per pixel of the map. */
  readonly scale: number;
  /** Where the map's top left sits, in grid units (placement lives in the rects, never in a transform). */
  readonly x?: number;
  readonly y?: number;
  readonly className?: string;
  /** A name for the sprite (`data-layer`), e.g. "laptop" or "mug". */
  readonly layer?: string;
}

/**
 * A bitmap drawn as SVG rects: hard pixel edges (`crispEdges`), each colour painted through its `--cat-*` variable.
 * Renders a `<g>` that carries the class, so a part can be animated with CSS without a transform attribute on it.
 */
export function PixelSprite({ map, scale, x = 0, y = 0, className, layer }: PixelSpriteProps) {
  return (
    <g className={className} data-layer={layer} shapeRendering="crispEdges">
      {spriteRects(map).map((r) => (
        <rect
          key={`${r.x}.${r.y}`}
          x={(x + r.x) * scale}
          y={(y + r.y) * scale}
          width={r.w * scale}
          height={r.h * scale}
          fill={`var(${PALETTE[r.c] ?? "--cat-ink"})`}
        />
      ))}
    </g>
  );
}
