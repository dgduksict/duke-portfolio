"use client";

import type { ReactNode } from "react";

export interface TooltipRow {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly color: string;
}

export interface ChartTooltipCardProps {
  readonly title: ReactNode;
  readonly rows: readonly TooltipRow[];
  readonly footer?: ReactNode;
}

/** Shared tooltip shell so every chart on the page reads the same way. */
export function ChartTooltipCard({ title, rows, footer }: ChartTooltipCardProps) {
  return (
    <div className="surface-panel min-w-40 rounded-xl px-3 py-2.5 shadow-xl">
      <p className="mb-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
        {title}
      </p>
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: row.color }}
                aria-hidden
              />
              {row.label}
            </span>
            <span className="font-mono font-medium text-foreground tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
      {footer ? (
        <p className="mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
          {footer}
        </p>
      ) : null}
    </div>
  );
}

/** Recharts hands tooltip payloads through loosely; this narrows them safely. */
export function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}
