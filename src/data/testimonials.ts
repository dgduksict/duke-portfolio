import type { Testimonial } from "@/types";

/**
 * Real quotes only, from people who agreed to be quoted. The section stays
 * hidden while this list is empty. Shape of an entry:
 *
 *   {
 *     id: "editor-in-chief",
 *     quote: { en: "…", mn: "…" },
 *     author: "Full Name",
 *     role: { en: "Editor-in-chief", mn: "Ерөнхий редактор" },
 *     company: "Mongol Content",
 *   }
 */
export const testimonials: readonly Testimonial[] = [];
