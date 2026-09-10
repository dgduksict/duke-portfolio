import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { SectionId } from "@/data/navigation";
import { getService } from "@/lib/pricing";
import type { QuoteInput } from "@/lib/pricing";
import { defaultQuoteInput } from "@/lib/pricing";
import { defaultProjectFilter, type CategoryFilter, type ProjectFilter, type ProjectSort } from "@/lib/projects";
import type { AddOnId, CurrencyCode, DiscountId, Language, ServiceId, TimelineId } from "@/types";

export interface PortfolioState {
  /* language ------------------------------------------------------------ */
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;

  /* chrome -------------------------------------------------------------- */
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  activeSection: SectionId;
  setActiveSection: (section: SectionId) => void;

  /* work ---------------------------------------------------------------- */
  projectFilter: ProjectFilter;
  setQuery: (query: string) => void;
  setCategory: (category: CategoryFilter) => void;
  toggleStack: (stack: string) => void;
  setSort: (sort: ProjectSort) => void;
  resetFilters: () => void;
  selectedProjectId: string | null;
  openProject: (projectId: string) => void;
  closeProject: () => void;

  /* estimator ----------------------------------------------------------- */
  quote: QuoteInput;
  setServiceId: (serviceId: ServiceId) => void;
  setScreens: (screens: number) => void;
  setIntegrations: (integrations: number) => void;
  toggleAddOn: (addOnId: AddOnId) => void;
  setTimelineId: (timelineId: TimelineId) => void;
  setSupportMonths: (months: number) => void;
  toggleDiscount: (discountId: DiscountId) => void;
  setCurrency: (currency: CurrencyCode) => void;
  resetQuote: () => void;

  /* contact ------------------------------------------------------------- */
  briefDraft: string;
  setBriefDraft: (draft: string) => void;
}

export type PortfolioSnapshot = Pick<
  PortfolioState,
  | "language"
  | "commandOpen"
  | "mobileNavOpen"
  | "activeSection"
  | "projectFilter"
  | "selectedProjectId"
  | "quote"
  | "briefDraft"
>;

export const initialPortfolioState: PortfolioSnapshot = {
  language: "en",
  commandOpen: false,
  mobileNavOpen: false,
  activeSection: "about",
  projectFilter: defaultProjectFilter,
  selectedProjectId: null,
  quote: defaultQuoteInput,
  briefDraft: "",
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

function toggleMembership<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      ...initialPortfolioState,

      setLanguage: (language) => set({ language }),
      toggleLanguage: () =>
        set((state) => ({ language: state.language === "en" ? "mn" : "en" })),

      setCommandOpen: (commandOpen) => set({ commandOpen }),
      toggleCommand: () => set((state) => ({ commandOpen: !state.commandOpen })),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      setActiveSection: (activeSection) => set({ activeSection }),

      setQuery: (query) =>
        set((state) => ({ projectFilter: { ...state.projectFilter, query } })),
      setCategory: (category) =>
        set((state) => ({ projectFilter: { ...state.projectFilter, category } })),
      toggleStack: (stack) =>
        set((state) => ({
          projectFilter: {
            ...state.projectFilter,
            stack: state.projectFilter.stack === stack ? null : stack,
          },
        })),
      setSort: (sort) => set((state) => ({ projectFilter: { ...state.projectFilter, sort } })),
      resetFilters: () => set({ projectFilter: defaultProjectFilter }),

      openProject: (selectedProjectId) => set({ selectedProjectId }),
      closeProject: () => set({ selectedProjectId: null }),

      setServiceId: (serviceId) =>
        set((state) => {
          const service = getService(serviceId);
          const screens = Math.min(
            Math.max(state.quote.screens, service.includedScreens),
            service.maxScreens,
          );
          return { quote: { ...state.quote, serviceId, screens } };
        }),
      setScreens: (screens) => set((state) => ({ quote: { ...state.quote, screens } })),
      setIntegrations: (integrations) =>
        set((state) => ({ quote: { ...state.quote, integrations } })),
      toggleAddOn: (addOnId) =>
        set((state) => ({
          quote: { ...state.quote, addOnIds: toggleMembership(state.quote.addOnIds, addOnId) },
        })),
      setTimelineId: (timelineId) => set((state) => ({ quote: { ...state.quote, timelineId } })),
      setSupportMonths: (supportMonths) =>
        set((state) => ({ quote: { ...state.quote, supportMonths } })),
      toggleDiscount: (discountId) =>
        set((state) => ({
          quote: {
            ...state.quote,
            discountIds: toggleMembership(state.quote.discountIds, discountId),
          },
        })),
      setCurrency: (currency) => set((state) => ({ quote: { ...state.quote, currency } })),
      resetQuote: () => set({ quote: defaultQuoteInput }),

      setBriefDraft: (briefDraft) => set({ briefDraft }),
    }),
    {
      name: "duke-portfolio",
      version: 2,
      storage: createJSONStorage(resolveStorage),
      // The server renders the defaults; hydration is triggered from the client
      // after mount so markup never disagrees with localStorage.
      skipHydration: true,
      partialize: (state) => ({
        language: state.language,
        quote: state.quote,
        projectFilter: state.projectFilter,
      }),
    },
  ),
);

export function resetPortfolioStore(): void {
  usePortfolioStore.setState(initialPortfolioState);
}
