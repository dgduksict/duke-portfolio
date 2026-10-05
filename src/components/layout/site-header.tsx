"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Eyes } from "@/components/ui/eyes";
import { navItems } from "@/data/navigation";
import { profile } from "@/data/profile";
import { useActiveSection } from "@/hooks/use-active-section";
import { useI18n } from "@/hooks/use-i18n";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { usePortfolioStore } from "@/store/portfolio-store";
import { LANGUAGES } from "@/types";

/** True while the hero's sky is still under the header. */
function useOverSky(): boolean {
  const [overSky, setOverSky] = useState(true);

  useEffect(() => {
    const sky = document.querySelector("#top .sky");
    if (!sky) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOverSky(entry?.isIntersecting ?? false),
      { rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(sky);
    return () => observer.disconnect();
  }, []);

  return overSky;
}

function ThemeToggle({ label }: { readonly label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();
  const dark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className="header-control"
    >
      {dark ? <Moon aria-hidden className="size-4" /> : <Sun aria-hidden className="size-4" />}
    </button>
  );
}

export function SiteHeader() {
  const { dict, language, t } = useI18n();
  const setLanguage = usePortfolioStore((state) => state.setLanguage);
  const mobileNavOpen = usePortfolioStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = usePortfolioStore((state) => state.setMobileNavOpen);
  const active = useActiveSection();
  const overSky = useOverSky();

  const links = navItems.map((item) => ({
    id: item.id,
    href: `#${item.id}`,
    label: t(item.label),
    current: active === item.id,
  }));

  return (
    <header
      className="site-header fixed inset-x-0 top-0 z-50"
      data-over-sky={overSky && !mobileNavOpen ? "true" : "false"}
      data-print="hide"
    >
      <a href="#main" className="skip-link">
        {dict.nav.skip}
      </a>

      <div className="container-page flex h-16 items-center justify-between gap-4">
        <a href="#top" aria-label={dict.nav.home} className="flex items-center gap-2.5 rounded-md">
          <span className="text-lg font-bold tracking-tight">{t(profile.shortName)}</span>
          <Eyes />
        </a>

        <nav aria-label={dict.nav.primary} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.id}>
                <a href={link.href} aria-current={link.current ? "true" : undefined} className="nav-link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <div role="group" aria-label={dict.nav.language} className="flex items-center">
            {LANGUAGES.map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={language === code}
                onClick={() => setLanguage(code)}
                className="header-control lang-option"
              >
                {getDictionary(code).meta.languageShort}
              </button>
            ))}
          </div>
          <ThemeToggle label={dict.nav.toggleTheme} />
          <button
            type="button"
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav"
            aria-label={mobileNavOpen ? dict.nav.close : dict.nav.menu}
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="header-control md:hidden"
          >
            {mobileNavOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          </button>
        </div>
      </div>

      {mobileNavOpen ? (
        <nav id="mobile-nav" aria-label={dict.nav.primary} className="border-t border-rule md:hidden">
          <ul className="container-page grid py-3">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  aria-current={link.current ? "true" : undefined}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn("block py-3 text-lg font-medium", link.current ? "text-ink" : "text-ink-soft")}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
