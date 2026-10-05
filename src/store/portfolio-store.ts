import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { LANGUAGES, type Language } from "@/types";

export interface PortfolioState {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export type PortfolioSnapshot = Pick<PortfolioState, "language" | "mobileNavOpen">;

export const initialPortfolioState: PortfolioSnapshot = {
  language: "en",
  mobileNavOpen: false,
};

/** Session-only fallback for when localStorage is missing or blocked. */
function createMemoryStorage(): StateStorage {
  const entries = new Map<string, string>();
  return {
    getItem: (name) => entries.get(name) ?? null,
    setItem: (name, value) => {
      entries.set(name, value);
    },
    removeItem: (name) => {
      entries.delete(name);
    },
  };
}

const memoryStorage = createMemoryStorage();

/** Uses localStorage only when it is actually usable (private modes, SSR). */
function resolveStorage(): StateStorage {
  if (typeof window === "undefined") return memoryStorage;
  try {
    const candidate = window.localStorage;
    return typeof candidate?.setItem === "function" ? candidate : memoryStorage;
  } catch {
    return memoryStorage;
  }
}

/** Reads a stored language, or `null` when there is none worth trusting. */
function storedLanguage(value: unknown): Language | null {
  if (typeof value !== "object" || value === null) return null;
  const language = (value as { language?: unknown }).language;
  return LANGUAGES.find((candidate) => candidate === language) ?? null;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      ...initialPortfolioState,
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set((state) => ({ language: state.language === "en" ? "mn" : "en" })),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
    }),
    {
      name: "duke-portfolio",
      // v2 also stored the estimator and work filters; only the language survives.
      version: 3,
      storage: createJSONStorage(resolveStorage),
      // The server renders the defaults; hydration is triggered from the client
      // after mount so markup never disagrees with localStorage.
      skipHydration: true,
      partialize: (state) => ({ language: state.language }),
      migrate: (persisted) => ({ language: storedLanguage(persisted) ?? "en" }),
      merge: (persisted, current) => ({
        ...current,
        language: storedLanguage(persisted) ?? current.language,
      }),
    },
  ),
);

export function resetPortfolioStore(): void {
  usePortfolioStore.setState(initialPortfolioState);
}
