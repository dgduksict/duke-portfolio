"use client";

import { useEffect } from "react";
import { SECTION_IDS, type SectionId } from "@/data/navigation";
import { usePortfolioStore } from "@/store/portfolio-store";

/**
 * Tracks which section owns the viewport and mirrors it into the store so the
 * header, command palette and progress rail all agree on one active section.
 */
export function useActiveSection(): SectionId {
  const activeSection = usePortfolioStore((state) => state.activeSection);
  const setActiveSection = usePortfolioStore((state) => state.setActiveSection);

  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (elements.length === 0) return;

    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestId: SectionId | null = null;
        let bestRatio = 0;
        for (const id of SECTION_IDS) {
          const ratio = visibility.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }

        if (bestId !== null) {
          setActiveSection(bestId);
        }
      },
      { rootMargin: "-96px 0px -45% 0px", threshold: [0.05, 0.25, 0.5, 0.75, 1] },
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [setActiveSection]);

  return activeSection;
}
