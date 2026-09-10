"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, type ReactNode } from "react";
import { useStoreHydration } from "@/hooks/use-store-hydration";
import { usePortfolioStore } from "@/store/portfolio-store";

function LanguageAttribute() {
  const language = usePortfolioStore((state) => state.language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}

export function Providers({ children }: { readonly children: ReactNode }) {
  useStoreHydration();

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <LanguageAttribute />
      {children}
    </ThemeProvider>
  );
}
