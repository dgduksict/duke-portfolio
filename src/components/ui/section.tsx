import type { ReactNode } from "react";
import { PixelDivider } from "@/components/ui/pixel-divider";
import { cn } from "@/lib/utils";

export interface SectionProps {
  readonly id: string;
  readonly title: string;
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Every section below the hero: the title holds the left columns (and stays in
 * view while its section scrolls on wide screens), the content takes the rest.
 * A pixel skyline strip stands on the section's top edge in place of a flat rule.
 */
export function Section({ id, title, children, className }: SectionProps) {
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("relative py-16 sm:py-24 lg:py-28", className)}
    >
      <PixelDivider />
      <div className="container-page grid gap-x-8 gap-y-8 lg:grid-cols-12">
        <h2
          id={headingId}
          className="type-title type-title-sticky self-start lg:sticky lg:top-24 lg:col-span-3"
        >
          {title}
        </h2>
        <div className="min-w-0 lg:col-span-9">{children}</div>
      </div>
    </section>
  );
}
