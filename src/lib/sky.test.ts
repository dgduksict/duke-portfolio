import { describe, expect, it } from "vitest";
import { mixHex, SKY_KEYFRAMES, skyAt } from "@/lib/sky";

const south = (elevation: number) => skyAt({ elevation, azimuth: 180 });

describe("mixHex", () => {
  it("returns the endpoints and rounds the midpoint", () => {
    expect(mixHex("#000000", "#ffffff", 0)).toBe("#000000");
    expect(mixHex("#000000", "#ffffff", 1)).toBe("#ffffff");
    expect(mixHex("#11204f", "#173072", 0.5)).toBe("#142861");
  });
});

describe("skyAt", () => {
  it("clamps below the darkest and above the brightest keyframe", () => {
    const first = SKY_KEYFRAMES[0]!;
    const last = SKY_KEYFRAMES[SKY_KEYFRAMES.length - 1]!;
    expect(south(-40).zenith).toBe(first.zenith);
    expect(south(89).horizon).toBe(last.horizon);
  });

  it("lands exactly on a keyframe and interpolates between two", () => {
    expect(south(-6).zenith).toBe("#11204f");
    expect(south(-4).zenith).toBe("#142861");
  });

  it("shows stars only once the sun is well below the horizon", () => {
    expect(south(-12).stars).toBe(1);
    expect(south(-8).stars).toBe(0.5);
    expect(south(-4).stars).toBe(0);
    expect(south(30).stars).toBe(0);
  });

  it("brings the glow up through twilight and shows the disc from sunrise", () => {
    expect(south(-12).glowStrength).toBe(0);
    expect(south(-5).glowStrength).toBe(0.5);
    expect(south(10).glowStrength).toBe(1);
    expect(south(-3).sun).toBe(0);
    expect(south(5).sun).toBe(1);
  });

  it("places the sun by compass direction, facing south", () => {
    expect(skyAt({ elevation: 10, azimuth: 90 }).glowX).toBeCloseTo(0);
    expect(skyAt({ elevation: 10, azimuth: 180 }).glowX).toBeCloseTo(0.5);
    expect(skyAt({ elevation: 10, azimuth: 270 }).glowX).toBeCloseTo(1);
  });

  it("parks a sun behind the viewer at the nearest edge, dimmed", () => {
    const morning = skyAt({ elevation: 6, azimuth: 60 });
    const evening = skyAt({ elevation: 6, azimuth: 300 });
    expect(morning.glowX).toBe(-0.15);
    expect(evening.glowX).toBe(1.15);
    expect(morning.glowStrength).toBe(0.5);
    for (const value of [morning.glowX, morning.glowY, morning.glowSize, evening.glowY]) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("raises the sun higher in the frame as it climbs", () => {
    expect(south(60).glowY).toBeLessThan(south(10).glowY);
    expect(south(-8).glowY).toBeGreaterThan(south(0).glowY);
  });

  it("names the phase", () => {
    expect(south(-20).phase).toBe("night");
    expect(south(-7).phase).toBe("twilight");
    expect(south(3).phase).toBe("golden");
    expect(south(40).phase).toBe("day");
  });
});
