import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/visual/motion-primitives";
import { cn } from "@/lib/utils";

export interface SectionProps {
  readonly id: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Section({ id, children, className }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28 lg:py-32", className)}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

export interface SectionHeadingProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly align?: "left" | "center";
  readonly action?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  action,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "mb-12 flex flex-col gap-6 sm:mb-16",
        align === "center"
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-balance-tight mt-5 text-3xl font-semibold sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </Reveal>
  );
}
