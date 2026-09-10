import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/**
 * Node 25 exposes its own experimental Web Storage global, which shadows the
 * jsdom implementation with an object that has no methods. Anything that
 * persists state would explode on it, so swap in a working in-memory store.
 */
function installMemoryStorage(key: "localStorage" | "sessionStorage"): void {
  const existing = globalThis[key] as Storage | undefined;
  if (existing !== undefined && typeof existing.setItem === "function") return;

  const entries = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return entries.size;
    },
    clear: () => entries.clear(),
    getItem: (name: string) => entries.get(name) ?? null,
    key: (index: number) => [...entries.keys()][index] ?? null,
    removeItem: (name: string) => {
      entries.delete(name);
    },
    setItem: (name: string, value: string) => {
      entries.set(name, String(value));
    },
  };

  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value: storage,
  });
  if (typeof window !== "undefined") {
    Object.defineProperty(window, key, { configurable: true, writable: true, value: storage });
  }
}

installMemoryStorage("localStorage");
installMemoryStorage("sessionStorage");

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

if (typeof window !== "undefined") {
  window.matchMedia =
    window.matchMedia ??
    ((query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }));

  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();

  class ResizeObserverStub implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  class IntersectionObserverStub implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: readonly number[] = [];
    disconnect(): void {}
    observe(): void {}
    unobserve(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  window.ResizeObserver = window.ResizeObserver ?? ResizeObserverStub;
  window.IntersectionObserver = window.IntersectionObserver ?? IntersectionObserverStub;
}
