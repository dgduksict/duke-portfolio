import type { ComponentPropsWithRef, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------- badge */

export type BadgeTone = "neutral" | "primary" | "cyan" | "violet" | "amber";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "border-border bg-surface-muted text-muted-foreground",
  primary: "border-primary/30 bg-primary/10 text-primary",
  cyan: "border-cyan-accent/30 bg-cyan-accent/10 text-cyan-accent",
  violet: "border-violet-accent/30 bg-violet-accent/10 text-violet-accent",
  amber: "border-amber-accent/30 bg-amber-accent/10 text-amber-accent",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly tone?: BadgeTone;
  readonly children: ReactNode;
}

export function Badge({ tone = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        badgeTones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------- panel */

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
}

export function Panel({ className, children, ...props }: PanelProps) {
  return (
    <div className={cn("surface-panel rounded-2xl", className)} {...props}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ inputs */

const fieldClasses =
  "w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors duration-200 outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40 disabled:opacity-60";

export interface TextFieldProps extends ComponentPropsWithRef<"input"> {
  readonly invalid?: boolean;
}

export function TextField({ className, invalid = false, ...props }: TextFieldProps) {
  return (
    <input
      className={cn(fieldClasses, "h-11", invalid && "border-rose-accent/70 focus:border-rose-accent", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export interface TextAreaFieldProps extends ComponentPropsWithRef<"textarea"> {
  readonly invalid?: boolean;
}

export function TextAreaField({ className, invalid = false, ...props }: TextAreaFieldProps) {
  return (
    <textarea
      className={cn(
        fieldClasses,
        "resize-y py-3 leading-relaxed",
        invalid && "border-rose-accent/70 focus:border-rose-accent",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export interface FieldLabelProps extends HTMLAttributes<HTMLLabelElement> {
  readonly htmlFor: string;
  readonly children: ReactNode;
}

export function FieldLabel({ className, children, ...props }: FieldLabelProps) {
  return (
    <label
      className={cn("mb-2 block text-xs font-medium tracking-wide text-muted-foreground uppercase", className)}
      {...props}
    >
      {children}
    </label>
  );
}

/* ---------------------------------------------------------------- eyebrow */

export function Eyebrow({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase backdrop-blur",
        className,
      )}
      {...props}
    >
      <span className="size-1.5 rounded-full bg-primary" aria-hidden />
      {children}
    </span>
  );
}
