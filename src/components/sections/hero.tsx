"use client";

import { FileText, Mail } from "lucide-react";
import { Sky } from "@/components/sky/sky";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { CopyButton } from "@/components/ui/copy-button";
import { profile } from "@/data/profile";
import { useI18n } from "@/hooks/use-i18n";
import { useNow } from "@/hooks/use-now";
import { formatClock, formatOffset, minutesAhead } from "@/lib/time";

const linkedin = profile.socials.find((social) => social.id === "linkedin");
const github = profile.socials.find((social) => social.id === "github");

export function Hero() {
  const { dict, language, t } = useI18n();
  const now = useNow();

  const clock =
    now === null
      ? null
      : dict.hero.clock(
          formatClock(now),
          formatOffset(minutesAhead(now.getTimezoneOffset()), language),
        );

  return (
    <section id="top" aria-labelledby="hero-name">
      <Sky now={now} />

      <div className="container-page pb-16 sm:pb-24">
        <h1 id="hero-name" className="display-name pt-1">
          {t(profile.name)}
        </h1>

        <p className="type-lead mt-6 font-medium sm:mt-8">{t(profile.headline)}</p>
        <p className="type-lead measure mt-2 text-ink-soft">{t(profile.intro)}</p>

        {profile.availability !== null ? (
          <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium">
            <span className="size-2 rounded-full bg-sun" aria-hidden />
            {t(profile.availability)}
          </p>
        ) : null}

        <p className="mt-4 hidden text-sm print:block">
          {[profile.email, profile.phone].filter(Boolean).join(", ")}
        </p>

        <div
          className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
          data-print="hide"
        >
          <div className="flex flex-wrap items-center gap-3">
            <a href={`mailto:${profile.email}`} className="btn btn-primary">
              <Mail aria-hidden className="size-4" />
              {dict.hero.emailMe}
            </a>
            <CopyButton
              value={profile.email}
              label={dict.contact.copyEmail}
              copiedLabel={dict.contact.copied}
            />
            {linkedin ? (
              <a href={linkedin.href} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
                <LinkedinIcon className="size-4" />
                {linkedin.label}
                <span className="sr-only">({dict.work.newTab})</span>
              </a>
            ) : null}
            {github ? (
              <a href={github.href} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
                <GithubIcon className="size-4" />
                {github.label}
                <span className="sr-only">({dict.work.newTab})</span>
              </a>
            ) : null}
            {profile.resumeUrl !== null ? (
              <a href={profile.resumeUrl} className="btn btn-quiet">
                <FileText aria-hidden className="size-4" />
                {dict.hero.resume}
              </a>
            ) : null}
          </div>

          <p className="tabular min-h-[1.6em] text-sm text-ink-soft" data-print="hide">
            {clock}
          </p>
        </div>
      </div>
    </section>
  );
}
