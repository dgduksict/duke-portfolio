import { describe, expect, it } from "vitest";
import { sunPosition, ULAANBAATAR } from "@/lib/sun";

const at = (iso: string) => sunPosition(new Date(iso), ULAANBAATAR.latitude, ULAANBAATAR.longitude);

describe("sunPosition over Ulaanbaatar", () => {
  it("peaks near 65.5° in the south at the June solstice", () => {
    const { elevation, azimuth } = at("2026-06-21T04:54:00Z");
    expect(elevation).toBeGreaterThan(64.8);
    expect(elevation).toBeLessThan(66.2);
    expect(Math.abs(azimuth - 180)).toBeLessThan(3);
  });

  it("only reaches about 18.6° at the December solstice", () => {
    const { elevation } = at("2026-12-21T04:50:00Z");
    expect(elevation).toBeGreaterThan(17.9);
    expect(elevation).toBeLessThan(19.3);
  });

  it("sits about 18.6° below the horizon at midsummer midnight", () => {
    const { elevation } = at("2026-06-21T16:54:00Z");
    expect(elevation).toBeLessThan(-17.9);
    expect(elevation).toBeGreaterThan(-19.3);
  });

  it("rises due east and sets due west around the equinox", () => {
    // Six hours either side of true solar noon, which the March equation of
    // time pushes to about 05:00Z in Ulaanbaatar.
    const rise = at("2026-03-19T22:59:00Z");
    const set = at("2026-03-20T11:00:00Z");
    expect(Math.abs(rise.elevation)).toBeLessThan(1.5);
    expect(Math.abs(rise.azimuth - 90)).toBeLessThan(3);
    expect(Math.abs(set.elevation)).toBeLessThan(1.5);
    expect(Math.abs(set.azimuth - 270)).toBeLessThan(3);
  });

  it("rises in the north-east in midsummer", () => {
    const { elevation, azimuth } = at("2026-06-20T21:00:00Z");
    expect(Math.abs(elevation)).toBeLessThan(1.5);
    expect(Math.abs(azimuth - 53.6)).toBeLessThan(3);
  });

  it("always returns an azimuth in [0, 360)", () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const { azimuth } = at(`2026-10-05T${String(hour).padStart(2, "0")}:00:00Z`);
      expect(azimuth).toBeGreaterThanOrEqual(0);
      expect(azimuth).toBeLessThan(360);
    }
  });
});
