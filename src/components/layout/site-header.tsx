"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Eyes } from "@/components/ui/eyes";
import { PixelIcon } from "@/components/ui/pixel-icons";
import { navItems } from "@/data/navigation";
import { profile } from "@/data/profile";
import { useActiveSection } from "@/hooks/use-active-section";
import { useI18n } from "@/hooks/use-i18n";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { getDictionary } from "@/lib/i18n";
import { usePortfolioStore } from "@/store/portfolio-store";
import { LANGUAGES } from "@/types";

/**
 * True while the header still sits on the hero scene's wall: the strip above the window (`data-header-zone`, see
 * components/scene/window-scene.tsx). Once that strip has scrolled under the header, the window would be next, so the
 * header becomes the solid beam.
 */
function useOverSky(): boolean {
  const [overSky, setOverSky] = useState(true);

  useEffect(() => {
    const sky = document.querySelector("#top [data-header-zone]");
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
      <PixelIcon name={dark ? "moon" : "sun"} cell={3} />
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
  const menuButton = useRef<HTMLButtonElement>(null);

  // Esc closes the phone menu and hands focus back to the button that opened it.
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileNavOpen(false);
      menuButton.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen, setMobileNavOpen]);

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

      <div className="container-page flex h-16 items-center justify-between gap-1 min-[23rem]:gap-4">
        <a href="#top" aria-label={dict.nav.home} className="flex items-center gap-2.5">
          <span className="font-pixel text-[1rem] leading-none">{t(profile.shortName)}</span>
          <Eyes />
        </a>

        <nav aria-label={dict.nav.primary} className="hidden md:block">
          <ul role="list" className="flex items-center gap-1">
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
            ref={menuButton}
            type="button"
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav"
            aria-label={mobileNavOpen ? dict.nav.close : dict.nav.menu}
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="header-control md:hidden"
          >
            <PixelIcon name={mobileNavOpen ? "close" : "menu"} cell={3} />
          </button>
        </div>
      </div>

      {mobileNavOpen ? (
        <nav id="mobile-nav" aria-label={dict.nav.primary} className="site-menu md:hidden">
          <ul role="list" className="container-page grid py-3">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  aria-current={link.current ? "true" : undefined}
                  onClick={() => setMobileNavOpen(false)}
                  className="nav-link my-1 w-fit py-3"
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
