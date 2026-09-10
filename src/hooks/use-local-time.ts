"use client";

import { useEffect, useState } from "react";

/** Ulaanbaatar wall clock, rendered only after mount to avoid SSR drift. */
export function useLocalTime(timeZone = "Asia/Ulaanbaatar"): string | null {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    });

    const update = () => setTime(formatter.format(new Date()));
    update();
    const interval = setInterval(update, 15_000);
    return () => clearInterval(interval);
  }, [timeZone]);

  return time;
}
