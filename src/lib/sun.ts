/**
 * Low-precision solar position (the Astronomical Almanac / NOAA approximation),
 * good to about one degree, which is far finer than a picture of a sky needs.
 */
export interface SunPosition {
  /** Degrees above the horizon; negative below it. */
  readonly elevation: number;
  /** Degrees clockwise from north, in [0, 360). */
  readonly azimuth: number;
}

export const ULAANBAATAR = { latitude: 47.9184, longitude: 106.9177 } as const;

const RAD = Math.PI / 180;
/** Days from the Unix epoch to J2000.0 (2000-01-01T12:00Z). */
const J2000 = 10_957.5;

function wrap360(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

function wrap180(degrees: number): number {
  const wrapped = wrap360(degrees);
  return wrapped > 180 ? wrapped - 360 : wrapped;
}

export function sunPosition(date: Date, latitude: number, longitude: number): SunPosition {
  const days = date.getTime() / 86_400_000 - J2000;
  const meanLongitude = wrap360(280.46 + 0.9856474 * days);
  const meanAnomaly = wrap360(357.528 + 0.9856003 * days) * RAD;
  const eclipticLongitude =
    (meanLongitude + 1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly)) * RAD;
  const obliquity = (23.439 - 0.0000004 * days) * RAD;

  const rightAscension =
    Math.atan2(Math.cos(obliquity) * Math.sin(eclipticLongitude), Math.cos(eclipticLongitude)) /
    RAD;
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLongitude));

  const siderealTime = wrap360(280.46061837 + 360.98564736629 * days + longitude);
  const hourAngle = wrap180(siderealTime - rightAscension) * RAD;
  const lat = latitude * RAD;

  const elevation = Math.asin(
    Math.sin(lat) * Math.sin(declination) +
      Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle),
  );
  const azimuth = Math.atan2(
    -Math.sin(hourAngle),
    Math.tan(declination) * Math.cos(lat) - Math.sin(lat) * Math.cos(hourAngle),
  );

  return { elevation: elevation / RAD, azimuth: wrap360(azimuth / RAD) };
}
