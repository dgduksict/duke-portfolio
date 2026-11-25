import { afterEach, describe, expect, it } from "vitest";
import { holidayAt, parseHolidayParam } from "@/lib/holiday";

/** The instant at which Ulaanbaatar's wall clock reads this date and time: UTC minus 8 hours. */
function ulaanbaatar(year: number, month: number, day: number, hour: number, minute: number): Date {
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute));
}

const CASES: ReadonlyArray<readonly [string, Date, "christmas" | "birthday" | null]> = [
  ["the last minute before Christmas", ulaanbaatar(2026, 11, 19, 23, 59), null],
  ["the first minute of Christmas", ulaanbaatar(2026, 11, 20, 0, 0), "christmas"],
  ["the last minute of the year", ulaanbaatar(2026, 12, 31, 23, 59), "christmas"],
  ["New Year's first minute", ulaanbaatar(2027, 1, 1, 0, 0), null],
  ["the last minute before the birthday", ulaanbaatar(2027, 1, 4, 23, 59), null],
  ["noon on the birthday", ulaanbaatar(2027, 1, 5, 12, 0), "birthday"],
  ["the first minute after the birthday", ulaanbaatar(2027, 1, 6, 0, 0), null],
];

describe("holidayAt", () => {
  const originalTz = process.env.TZ;
  afterEach(() => {
    if (originalTz === undefined) delete process.env.TZ;
    else process.env.TZ = originalTz;
  });

  for (const [name, instant, expected] of CASES) {
    it(`is ${expected ?? "no holiday"} at ${name}`, () => {
      expect(holidayAt(instant)).toBe(expected);
    });
  }

  it("does not depend on the time zone of the machine", () => {
    for (const tz of ["UTC", "Asia/Ulaanbaatar", "America/Los_Angeles", "Pacific/Kiritimati", "Pacific/Pago_Pago"]) {
      process.env.TZ = tz;
      for (const [, instant, expected] of CASES) {
        expect(holidayAt(instant), `${tz} at ${instant.toISOString()}`).toBe(expected);
      }
    }
  });
});

describe("parseHolidayParam", () => {
  it("reads the two holidays and none", () => {
    expect(parseHolidayParam("christmas")).toBe("christmas");
    expect(parseHolidayParam("birthday")).toBe("birthday");
    expect(parseHolidayParam("none")).toBe("none");
  });

  it("ignores anything unknown and no value", () => {
    expect(parseHolidayParam("easter")).toBeNull();
    expect(parseHolidayParam("")).toBeNull();
    expect(parseHolidayParam(null)).toBeNull();
  });
});
