import type { CSSProperties } from "react";
import { Ridges } from "@/components/sky/ridges";
import { Stars } from "@/components/sky/stars";
import { profile } from "@/data/profile";
import { skyAt } from "@/lib/sky";
import { sunPosition } from "@/lib/sun";
import { cn } from "@/lib/utils";

export interface SkyProps {
  /** `null` until the client knows the time; the base colour shows until then. */
  readonly now: Date | null;
  readonly className?: string;
}

/**
 * The sky over Ulaanbaatar at `now`, looking south at the Bogd Khan ridge.
 * All the colour and geometry comes from `skyAt`; this only hands it to CSS.
 */
export function Sky({ now, className }: SkyProps) {
  const sky =
    now === null
      ? null
      : skyAt(sunPosition(now, profile.coordinates.latitude, profile.coordinates.longitude));

  const style =
    sky === null
      ? undefined
      : ({
          "--sky-zenith": sky.zenith,
          "--sky-mid": sky.mid,
          "--sky-horizon": sky.horizon,
          "--sky-glow": sky.glow,
          "--glow-strength": sky.glowStrength.toFixed(3),
          "--glow-x": sky.glowX.toFixed(4),
          "--glow-y": sky.glowY.toFixed(4),
          "--glow-size": sky.glowSize.toFixed(3),
          "--stars": sky.stars.toFixed(3),
          "--sun-opacity": sky.sun.toFixed(3),
        } as CSSProperties);

  return (
    <div
      className={cn("sky", className)}
      data-ready={sky === null ? "false" : "true"}
      data-phase={sky?.phase}
      data-print="hide"
      style={style}
      aria-hidden
    >
      <div className="sky-paint">
        <Stars />
        <div className="sky-glow" />
        <div className="sky-sun" />
      </div>
      <Ridges />
    </div>
  );
}
