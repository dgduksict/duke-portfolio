"use client";

import { profile } from "@/data/profile";
import { useI18n } from "@/hooks/use-i18n";

export function SiteFooter() {
  const { dict, t } = useI18n();

  return (
    <footer className="border-t border-rule" data-print="hide">
      <div className="container-page flex flex-col gap-3 py-10 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <p suppressHydrationWarning>
          © {new Date().getFullYear()} {t(profile.name)}
        </p>
        <a href={profile.sourceUrl} target="_blank" rel="noopener noreferrer" className="link">
          {dict.footer.source}
          <span className="sr-only"> ({dict.work.newTab})</span>
        </a>
      </div>
    </footer>
  );
}
