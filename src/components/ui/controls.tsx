"use client";

import { motion } from "framer-motion";
import { useId, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ slider */

export interface SliderProps {
  readonly id?: string;
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly hint?: ReactNode;
  readonly valueLabel: ReactNode;
  readonly onChange: (value: number) => void;
}

export function Slider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  hint,
  valueLabel,
  onChange,
}: SliderProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <span className="font-mono text-sm text-primary tabular-nums">{valueLabel}</span>
      </div>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--slider-percent": `${percent}%` } as CSSProperties}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full outline-none",
          "bg-[linear-gradient(to_right,var(--primary)_0%,var(--primary)_var(--slider-percent),var(--surface-muted)_var(--slider-percent),var(--surface-muted)_100%)]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "[&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_25%,transparent)] [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110",
          "[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-primary",
        )}
      />
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------- segmented control */

export interface SegmentedOption<T extends string> {
  readonly value: T;
  readonly label: ReactNode;
  readonly title?: string;
}

export interface SegmentedProps<T extends string> {
  readonly ariaLabel: string;
  readonly options: readonly SegmentedOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly size?: "sm" | "md";
  readonly className?: string;
}

export function Segmented<T extends string>({
  ariaLabel,
  options,
  value,
  onChange,
  size = "md",
  className,
}: SegmentedProps<T>) {
  const layoutId = useId();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted/70 p-1",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-full font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
              size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
              selected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {selected ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------- toggle chip */

export interface ToggleChipProps {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
  readonly className?: string;
  readonly title?: string;
}

export function ToggleChip({ active, onClick, children, className, title }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary/50 bg-primary/12 text-primary"
          : "border-border bg-surface/60 text-muted-foreground hover:border-border-strong hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ switch */

export interface SwitchProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly label: string;
  readonly description?: string;
}

export function Switch({ checked, onChange, label, description }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-start gap-3 rounded-xl border border-border bg-surface/50 p-3 text-left transition-colors duration-200 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200",
          checked ? "bg-primary" : "bg-surface-muted border border-border",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn(
            "size-4 rounded-full bg-background shadow",
            checked ? "ml-auto" : "ml-0",
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
