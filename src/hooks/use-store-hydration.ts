"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";

/**
 * The store is persisted with `skipHydration`, so the server render and the
 * first client render always agree. This kicks off rehydration once mounted.
 */
export function useStoreHydration(): void {
  useEffect(() => {
    void usePortfolioStore.persist.rehydrate();
  }, []);
}
