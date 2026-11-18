import type { ReactNode } from "react";
import { PixelSky } from "@/components/scene/pixel-sky";
import { Mug, Radiator, RoomLeft, RoomRight, SillPlants } from "@/components/scene/room";
import { profile } from "@/data/profile";
import { moonSpot } from "@/lib/pixel-sky";
import { skyAt } from "@/lib/sky";
import { sunPosition } from "@/lib/sun";

export interface WindowSceneProps {
  /** `null` until the client knows the time (the server never does): the glass then shows the base colour. */
  readonly now: Date | null;
  /** Rendered in the cat slot: standing on the sill, in front of the glass (the hero cat). */
  readonly children?: ReactNode;
  /**
   * Just the window and its sill (no room, no header zone, no wall or floor of its own): the loading screen's variant.
   * Same glass, frame, sill, plants and cat slot, so the cat's feet land on the sill exactly as in the hero.
   */
  readonly compact?: boolean;
}

/**
 * The hero's pixel room corner, after the reference: a wooden window whose glass shows the live sky over Ulaanbaatar
 * (`PixelSky`: flat quantised bands, grid stars, a pixel sun or moon, the Bogd Khan ridge and a skyline whose windows
 * light by the sky's phase), plants on the sill and, around it on wide screens, the room: a desk with a lamp that
 * glows by day, a picture, a floor plant, a bookshelf, the radiator under the sill. The room follows the theme (warm
 * day room in light, navy night room in dark; colours in scene.css); the glass follows the clock and `?time=HH:MM`.
 *
 * Everything is laid out on the pixel unit in scene.css with fixed cell coordinates, so the cat slot is a known box:
 * `--cat-size` square (168px, the hero cat's 28 x 28 sprite at 6px; 112px on phones), its bottom edge on the sill's
 * top, its right edge four units inside the frame's right edge. Below 760px only the window and its sill remain.
 *
 * Decorative layers are `aria-hidden` and hidden in print; the slot is not, so the cat's button stays reachable. The
 * empty strip above the window (`data-header-zone`) is what the fixed header watches to know it sits on the wall.
 */
export function WindowScene({ now, children, compact = false }: WindowSceneProps) {
  const sun =
    now === null ? null : sunPosition(now, profile.coordinates.latitude, profile.coordinates.longitude);
  const sky = sun === null ? null : skyAt(sun);
  const moon = sun === null ? null : moonSpot(sun);

  return (
    <div className={compact ? "scene scene-compact" : "scene"} data-scene="" data-print="hide">
      {compact ? null : <div className="scene-header-zone" data-header-zone="" aria-hidden="true" />}
      <div className="scene-art" aria-hidden="true">
        <div className="scene-window">
          {compact ? null : (
            <>
              <div className="scene-wainscot" />
              <div className="scene-skirting" />
              <RoomLeft />
              <RoomRight />
              <Radiator />
            </>
          )}
          <div className="scene-frame">
            <PixelSky sky={sky} moon={moon} />
          </div>
          <div className="scene-sill" />
          <SillPlants />
          {compact ? null : <Mug />}
        </div>
      </div>
      <div className="scene-cat-slot" data-cat-slot="">
        {children}
      </div>
    </div>
  );
}
