"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Clipboard {
  readonly copied: boolean;
  readonly copy: (value: string) => Promise<boolean>;
}

/** Copies text and flips a `copied` flag for a moment, with a legacy fallback. */
export function useClipboard(resetAfterMs = 2000): Clipboard {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeout.current !== null) clearTimeout(timeout.current);
    },
    [],
  );

  const copy = useCallback(
    async (value: string) => {
      let ok = false;
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(value);
          ok = true;
        }
      } catch {
        ok = false;
      }

      if (!ok && typeof document !== "undefined") {
        const field = document.createElement("textarea");
        field.value = value;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        ok = document.execCommand("copy");
        document.body.removeChild(field);
      }

      if (ok) {
        setCopied(true);
        if (timeout.current !== null) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => setCopied(false), resetAfterMs);
      }
      return ok;
    },
    [resetAfterMs],
  );

  return { copied, copy };
}
