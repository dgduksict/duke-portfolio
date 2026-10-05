"use client";

import { useEffect, useState } from "react";
import { parseTimeParam, ulaanbaatarDateAt } from "@/lib/time";

const MINUTE = 60_000;

/**
 * The current time, or `null` until mounted — the server has no "now", so
 * anything time-based renders after hydration. Re-renders on each minute
 * boundary. `?time=HH:MM` pins Ulaanbaatar's clock to that time today, which
 * is how the sky is previewed at other hours.
 */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const override = parseTimeParam(new URLSearchParams(window.location.search).get("time"));
    let timer: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      const current = new Date();
      if (override) {
        setNow(ulaanbaatarDateAt(current, override.hours, override.minutes));
        return;
      }
      setNow(current);
      timer = setTimeout(update, MINUTE - (current.getTime() % MINUTE));
    };

    update();
    return () => {
      if (timer !== undefined) clearTimeout(timer);
    };
  }, []);

  return now;
}
