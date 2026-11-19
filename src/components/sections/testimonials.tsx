"use client";

import { reveal } from "@/components/reveal/reveal";
import { Section } from "@/components/ui/section";
import { useI18n } from "@/hooks/use-i18n";
import type { Testimonial } from "@/types";

export interface TestimonialsProps {
  readonly items: readonly Testimonial[];
}

/** Hidden until real quotes are added to `src/data/testimonials.ts`. */
export function Testimonials({ items }: TestimonialsProps) {
  const { dict, t } = useI18n();

  if (items.length === 0) return null;

  return (
    <Section id="testimonials" title={dict.testimonials.title}>
      <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
        {items.map((item) => (
          <figure key={item.id} {...reveal} className="px-box p-5 sm:p-6">
            <blockquote className="type-lead measure">“{t(item.quote)}”</blockquote>
            <figcaption className="mt-4 text-base text-ink-soft">
              <span className="text-ink">{item.author}</span>
              {`, ${t(item.role)}, ${item.company}`}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
