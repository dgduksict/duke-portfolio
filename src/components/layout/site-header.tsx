"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Command, Languages, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { Button } from "@/components/ui/button";
import { Eyes } from "@/components/visual/eyes";
import { navItems } from "@/data/navigation";
import { profile } from "@/data/profile";
import { useActiveSection } from "@/hooks/use-active-section";
import { useI18n } from "@/hooks/use-i18n";
import { getDictionary, otherLanguage } from "@/lib/i18n";
import { cn, scrollToSection } from "@/lib/utils";
import { usePortfolioStore } from "@/store/portfolio-store";

function ThemeButton({ label }: { readonly label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  // Before hydration the resolved theme is unknown; assume the default (dark)
  // so the icon does not flip on the first client render.
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="border border-transparent hover:border-border"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -70, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 70, scale: 0.7 }}
          transition={{ duration: 0.2 }}
          className="flex"
        >
          {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}

export function SiteHeader() {
  const { dict, t } = useI18n();
  const activeSection = useActiveSection();
  const language = usePortfolioStore((state) => state.language);
  const toggleLanguage = usePortfolioStore((state) => state.toggleLanguage);
  const setCommandOpen = usePortfolioStore((state) => state.setCommandOpen);
  const mobileNavOpen = usePortfolioStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = usePortfolioStore((state) => state.setMobileNavOpen);

  const nextDict = getDictionary(otherLanguage(language));

  const [condensed, setCondensed] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const go = (id: string) => {
    setMobileNavOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        className="h-0.5 origin-left bg-gradient-to-r from-primary via-cyan-accent to-violet-accent"
        style={{ scaleX: progress }}
      />

      <div
        className={cn(
          "transition-all duration-300",
          condensed
            ? "border-b border-border bg-background/72 backdrop-blur-xl"
            : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 rounded-full text-lg font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span>{t(profile.shortName)}</span>
            <Eyes />
          </button>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "relative rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full border border-border bg-surface-muted"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  <span className="relative z-10">{t(item.label)}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              aria-label={dict.nav.openCommand}
              className="hidden items-center gap-2 rounded-full border border-border bg-surface/70 py-1.5 pr-2 pl-3.5 text-sm text-muted-foreground transition-colors duration-200 hover:border-border-strong hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:inline-flex"
            >
              <Command className="size-3.5" />
              <span>{dict.nav.commandHint}</span>
              <kbd className="rounded-md border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] tracking-wider">
                ⌘K
              </kbd>
            </button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              aria-label={`${dict.nav.toggleLanguage}: ${nextDict.meta.languageName}`}
              title={`${dict.nav.toggleLanguage}: ${nextDict.meta.languageName}`}
              className="border border-transparent hover:border-border"
            >
              <span className="relative flex items-center">
                <Languages className="size-4" />
                <span className="absolute -right-2 -bottom-2 font-mono text-[9px] tracking-tight text-primary">
                  {dict.meta.languageShort}
                </span>
              </span>
            </Button>

            <ThemeButton label={dict.nav.toggleTheme} />

            <Button
              variant="primary"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => go("contact")}
            >
              {dict.nav.hireMe}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="border border-transparent hover:border-border lg:hidden"
              aria-label={mobileNavOpen ? dict.nav.close : dict.nav.menu}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileNavOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="border-b border-border bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Mobile" className="mx-auto grid max-w-6xl gap-1 px-5 py-4 sm:px-8">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * index, duration: 0.25 }}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition-colors",
                    activeSection === item.id
                      ? "bg-surface-muted text-foreground"
                      : "text-muted-foreground hover:bg-surface-muted/60 hover:text-foreground",
                  )}
                >
                  <span>{t(item.label)}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    0{item.shortcut}
                  </span>
                </motion.button>
              ))}
              <Button className="mt-2 w-full" onClick={() => go("contact")}>
                {dict.nav.hireMe}
              </Button>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
