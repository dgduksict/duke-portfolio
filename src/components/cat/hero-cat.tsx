"use client";

import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CatArt } from "@/components/cat/cat-art";
import { useCatState } from "@/components/cat/use-cat-state";
import { useLoaderDone } from "@/components/loader/use-loader-done";
import { nearRidgeY, RIDGE_HEIGHT, RIDGE_WIDTH } from "@/components/sky/ridges";
import { useI18n } from "@/hooks/use-i18n";
import type { CatState } from "@/lib/cat";
import { cn } from "@/lib/utils";

/** How long a line stays up, the cross-fade between day and night, and the wait before a resize is measured (ms). */
const BUBBLE_MS = 4000;
const FADE_MS = 600;
const RESIZE_MS = 120;

/**
 * The art is 200 units square. `ANCHOR` is the middle of the ground shadow under the day cat (on the ridge line); the
 * night drawing's own anchor sits `NIGHT_SHIFT` units to the left and above it, so its layer is nudged to match.
 * `SHADOW_RX` is the shadow's half-width and `REACH` the share of the box the cat's drawing fills from the feet up
 * (ears of the day cat, the zzz of the night one stay under it).
 */
const ANCHOR = { x: 110, y: 193 } as const;
const NIGHT_SHIFT = { x: 10, y: 3 } as const;
const SHADOW_RX = 86;
const REACH = 0.93;
/** Box size in px: a share of the sky's width, between a floor and a ceiling (the spec's ~160 to 220). */
const SIZE_SHARE = 0.15;
const SIZE_MIN = 160;
const SIZE_MAX = 210;
/** Below this the cat would be a smudge (a very short sky), so he stays away instead. */
const SIZE_FLOOR = 110;
/** Where along the sky's width he may sit, from the left, and the room he keeps to the right edge (px). */
const X_FROM = 0.62;
const X_TO = 0.9;
const EDGE_ROOM = 24;
/** The fixed header's height when it cannot be read (it is `h-16`), and the air kept between it and the cat's ears. */
const HEADER_FALLBACK = 64;
const HEADER_AIR = 8;

interface Placement {
  /** The art box's top left in the host's px, and its side. */
  readonly left: number;
  readonly top: number;
  readonly size: number;
}

/** Used where nothing can be measured (no layout yet, or hidden below 760 px): the box at the host's origin. */
const UNMEASURED: Placement = { left: 0, top: 0, size: 200 };

/**
 * Where the cat stands, from the geometry of the ridge the sky draws. `Ridges` crops its 1600 x 240 viewBox with
 * `xMidYMax slice`, so the picture is scaled by max(width / 1600, height / 240), centred horizontally and pinned to the
 * bottom; the same mapping takes a point on the ridge line to px. He takes the flattest stretch of the line within the
 * right-hand part of the sky (so his shadow lies on the hill, not across a slope), and is made smaller if his ears
 * would reach the header. Returns `null` when there is no room for him.
 */
function place(host: HTMLElement): Placement | null {
  const hostBox = host.getBoundingClientRect();
  const ridge = host.parentElement?.querySelector(".sky-ridges");
  const ridgeBox = ridge?.getBoundingClientRect();
  if (!(hostBox.width > 0) || ridgeBox === undefined || !(ridgeBox.width > 0 && ridgeBox.height > 0)) {
    return UNMEASURED;
  }

  const scale = Math.max(ridgeBox.width / RIDGE_WIDTH, ridgeBox.height / RIDGE_HEIGHT);
  const originX = ridgeBox.left - hostBox.left - (RIDGE_WIDTH * scale - ridgeBox.width) / 2;
  const bottom = ridgeBox.bottom - hostBox.top;
  const toRidgeX = (px: number) => (px - originX) / scale;
  const toPxY = (y: number) => bottom - (RIDGE_HEIGHT - y) * scale;

  const preferred = Math.min(SIZE_MAX, Math.max(SIZE_MIN, hostBox.width * SIZE_SHARE));
  const k = preferred / 200;
  const reach = SHADOW_RX * k;
  const samples = [-1, -0.5, 0, 0.5, 1];
  const ridgeUnder = (px: number) => samples.map((s) => nearRidgeY(toRidgeX(px + s * reach)));

  const from = hostBox.width * X_FROM;
  const to = Math.min(hostBox.width * X_TO, hostBox.width - (200 - ANCHOR.x) * k - EDGE_ROOM);
  let best = { px: Math.max(from, Math.min(to, hostBox.width * 0.78)), spread: Number.POSITIVE_INFINITY };
  for (let px = from; px <= to; px += 6) {
    const ys = ridgeUnder(px);
    const spread = Math.max(...ys) - Math.min(...ys);
    if (spread < best.spread - 0.5) best = { px, spread };
  }

  const ys = ridgeUnder(best.px);
  const feet = toPxY(ys.reduce((sum, y) => sum + y, 0) / ys.length) + k;

  const header = document.querySelector("header")?.offsetHeight ?? HEADER_FALLBACK;
  const roomAbove = feet - (header - (hostBox.top + window.scrollY)) - HEADER_AIR;
  const size = Math.min(preferred, roomAbove / REACH);
  if (!(size >= SIZE_FLOOR)) return null;

  const fit = size / 200;
  return { left: best.px - ANCHOR.x * fit, top: feet - ANCHOR.y * fit, size };
}

function samePlacement(a: Placement | null, b: Placement | null): boolean {
  if (a === null || b === null) return a === b;
  return a.left === b.left && a.top === b.top && a.size === b.size;
}

/**
 * The programmer cat on the hero's near ridge: awake and typing under a day sky, asleep on his closed laptop under a
 * night one. It renders nothing until the client knows the time and the loading screen is gone, then hops in once and
 * settles into the loop (the motion is in cat.css, scoped to `.hero-cat`; reduced motion keeps him still).
 *
 * Layout is measured, never animated: on mount, after fonts settle and on a debounced resize. Hidden below 760 px.
 * The layer itself ignores the pointer; only the button takes it, and a click answers with a short line in a polite
 * status region (the next clean-code line by day, "shh" at night) that clears after a few seconds.
 *
 * Mount it inside a `relative` box that wraps the sky: it fills that box and finds the sky's ridges beside it.
 */
export function HeroCat({ now }: { readonly now: Date | null }) {
  const { dict } = useI18n();
  const state = useCatState(now);
  const loaderDone = useLoaderDone();
  const active = state !== null && loaderDone;

  const hostRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<Placement | null | undefined>(undefined);

  useLayoutEffect(() => {
    if (!active) return;
    const host = hostRef.current;
    if (host === null) return;

    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const measure = () => {
      if (!alive) return;
      const next = place(host);
      setPlacement((previous) => (previous !== undefined && samePlacement(previous, next) ? previous : next));
    };
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(measure, RESIZE_MS);
    };

    measure();
    window.addEventListener("resize", onResize);
    const fonts = (document as { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(measure, () => undefined);

    return () => {
      alive = false;
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [active]);

  // A flip between day and night keeps the old drawing under the new one for the length of the cross-fade.
  const [shown, setShown] = useState<CatState | null>(state);
  const [leaving, setLeaving] = useState<CatState | null>(null);
  if (state !== null && state !== shown) {
    setShown(state);
    setLeaving(shown);
  }
  useEffect(() => {
    if (leaving === null) return;
    const timer = setTimeout(() => setLeaving(null), FADE_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  // What he says when poked: one timer for the line's life, replaced by a new click and gone on unmount.
  const [line, setLine] = useState("");
  const nextQuote = useRef(0);
  const lineTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(lineTimer.current), []);

  const speak = () => {
    let text = dict.cat.sleeping;
    if (state !== "night") {
      const quotes = dict.cat.quotes;
      text = quotes[nextQuote.current % quotes.length] ?? dict.cat.sleeping;
      nextQuote.current += 1;
    }
    setLine(text);
    clearTimeout(lineTimer.current);
    lineTimer.current = setTimeout(() => setLine(""), BUBBLE_MS);
  };

  if (state === null || !loaderDone) return null;

  const box = placement === undefined ? null : (placement ?? undefined);
  const fading = leaving !== null;
  const layer = (kind: CatState, role: "in" | "out") => {
    const k = (box?.size ?? 200) / 200;
    const style: CSSProperties | undefined =
      kind === "night" ? { translate: `${NIGHT_SHIFT.x * k}px ${NIGHT_SHIFT.y * k}px` } : undefined;
    return (
      <div
        key={`${kind}-${role}`}
        className={cn("hero-cat-layer", role === "out" ? "absolute inset-0" : "relative size-full")}
        data-fade={role === "out" ? "out" : fading ? "in" : undefined}
        style={style}
      >
        <CatArt variant="hero" state={kind} className="size-full" />
      </div>
    );
  };

  return (
    <div
      ref={hostRef}
      className="hero-cat pointer-events-none absolute inset-0 hidden min-[760px]:block"
      data-print="hide"
    >
      {box ? (
        <div
          className="hero-cat-box absolute"
          style={{ left: box.left, top: box.top, width: box.size, height: box.size }}
        >
          <div className="hero-cat-hop size-full">
            <button
              type="button"
              className="hero-cat-button pointer-events-auto relative block size-full cursor-pointer"
              aria-label={dict.cat.label}
              onClick={speak}
            >
              {leaving !== null ? layer(leaving, "out") : null}
              {layer(state, "in")}
            </button>
          </div>
          <div role="status" aria-live="polite" className="hero-cat-bubble">
            {line}
          </div>
        </div>
      ) : null}
    </div>
  );
}
