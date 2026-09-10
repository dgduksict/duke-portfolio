"use client";

import { ArrowUp, Mail } from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/visual/brand-icons";
import { navItems } from "@/data/navigation";
import { profile } from "@/data/profile";
import { useI18n } from "@/hooks/use-i18n";
import { scrollToSection } from "@/lib/utils";
import type { SocialLink } from "@/types";

const ICONS: Record<SocialLink["icon"], ComponentType<{ className?: string }>> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  mail: Mail,
};

export function SiteFooter() {
  const { dict, t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border px-5 py-14 sm:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_auto]">
        <div>
          <p className="text-lg font-semibold tracking-tight">{t(profile.name)}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {dict.footer.sourceNote}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {profile.socials.map((social) => {
              const Icon = ICONS[social.icon];
              return (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={`${social.label} · ${social.handle}`}
                  className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-200 hover:border-primary/50 hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              );
            })}
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-2 self-start text-sm">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="text-left text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(item.label)}
            </button>
          ))}
        </nav>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUp className="size-4" />
            {dict.nav.backToTop}
          </Button>
          <p className="text-xs text-muted-foreground md:text-right">
            © {year} {t(profile.name)}. {dict.footer.rights}
          </p>
          <p className="text-xs text-muted-foreground md:text-right">{dict.footer.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}
