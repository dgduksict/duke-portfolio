"use client";

import { useEffect, useState } from "react";
import { holidayAt, parseHolidayParam, type Holiday } from "@/lib/holiday";

/**
 * The holiday to dress the cat for, or `null` while `now` is `null` (the server has no "now") and on ordinary days.
 * `?holiday=christmas|birthday|none` is read once after mount and wins over the calendar; `none` turns it off.
 */
export function useHoliday(now: Date | null): Holiday | null {
  const [override, setOverride] = useState<Holiday | "none" | null>(null);

  useEffect(() => {
    // The query string only exists on the client, so it is read after mount, never during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOverride(parseHolidayParam(new URLSearchParams(window.location.search).get("holiday")));
  }, []);

  if (!now) return null;
  if (override === "none") return null;
  return override ?? holidayAt(now);
}
