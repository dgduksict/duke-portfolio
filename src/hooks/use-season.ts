"use client";

import { useEffect, useState } from "react";
import { parseSeasonParam, seasonAt, type Season } from "@/lib/season";

/**
 * The season to show in the window, or `null` while `now` is `null` (the server has no "now") and outside winter and
 * summer. `?season=winter|summer|none` is read once after mount and wins over the calendar; `none` turns it off.
 */
export function useSeason(now: Date | null): Season | null {
  const [override, setOverride] = useState<Season | "none" | null>(null);

  useEffect(() => {
    // The query string only exists on the client, so it is read after mount, never during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOverride(parseSeasonParam(new URLSearchParams(window.location.search).get("season")));
  }, []);

  if (!now) return null;
  if (override === "none") return null;
  return override ?? seasonAt(now);
}
