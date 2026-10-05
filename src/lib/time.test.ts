import { describe, expect, it } from "vitest";
import {
  formatClock,
  formatOffset,
  minutesAhead,
  parseTimeParam,
  ulaanbaatarDateAt,
} from "@/lib/time";

describe("minutesAhead", () => {
  it("compares the viewer's zone with fixed UTC+8", () => {
    expect(minutesAhead(-480)).toBe(0); // viewer in UTC+8
    expect(minutesAhead(240)).toBe(720); // New York in summer
    expect(minutesAhead(0)).toBe(480); // London in winter
    expect(minutesAhead(-330)).toBe(150); // India
    expect(minutesAhead(-600)).toBe(-120); // Sydney in winter
  });
});

describe("formatOffset", () => {
  it("speaks in whole hours where it can", () => {
    expect(formatOffset(0, "en")).toBe("same time as you");
    expect(formatOffset(60, "en")).toBe("1 hour ahead of you");
    expect(formatOffset(360, "en")).toBe("6 hours ahead of you");
    expect(formatOffset(-120, "en")).toBe("2 hours behind you");
  });

  it("keeps the minutes of half- and quarter-hour zones", () => {
    expect(formatOffset(150, "en")).toBe("2 hours 30 minutes ahead of you");
    expect(formatOffset(135, "en")).toBe("2 hours 15 minutes ahead of you");
    expect(formatOffset(-30, "en")).toBe("30 minutes behind you");
  });

  it("has Mongolian phrasing", () => {
    expect(formatOffset(0, "mn")).toBe("танайхтай ижил цаг");
    expect(formatOffset(360, "mn")).toBe("танайхаас 6 цагаар түрүүлж байна");
    expect(formatOffset(-150, "mn")).toBe("танайхаас 2 цаг 30 минутаар хоцорч байна");
  });
});

describe("formatClock", () => {
  it("renders the Ulaanbaatar wall clock", () => {
    expect(formatClock(new Date("2026-10-05T06:32:00Z"))).toBe("14:32");
    expect(formatClock(new Date("2026-10-05T16:05:00Z"))).toBe("00:05");
  });
});

describe("parseTimeParam", () => {
  it("accepts HH:MM within a day", () => {
    expect(parseTimeParam("18:30")).toEqual({ hours: 18, minutes: 30 });
    expect(parseTimeParam("7:05")).toEqual({ hours: 7, minutes: 5 });
  });

  it("ignores anything else", () => {
    for (const value of [null, "", "abc", "25:00", "12:60", "12", "12:5", " 12:30"]) {
      expect(parseTimeParam(value)).toBeNull();
    }
  });
});

describe("ulaanbaatarDateAt", () => {
  it("moves to the given wall-clock time on the same Ulaanbaatar day", () => {
    const base = new Date("2026-10-05T03:00:00Z"); // 11:00 in Ulaanbaatar
    expect(ulaanbaatarDateAt(base, 18, 30).toISOString()).toBe("2026-10-05T10:30:00.000Z");
  });

  it("uses Ulaanbaatar's date, not UTC's", () => {
    const base = new Date("2026-10-05T20:00:00Z"); // already 04:00 on the 6th there
    expect(ulaanbaatarDateAt(base, 18, 30).toISOString()).toBe("2026-10-06T10:30:00.000Z");
  });
});
