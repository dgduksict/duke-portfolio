"use client";

import { Phone } from "lucide-react";
import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/ui/brand-icons";
import { CopyButton } from "@/components/ui/copy-button";
import { Section } from "@/components/ui/section";
import { profile } from "@/data/profile";
import { useI18n } from "@/hooks/use-i18n";
import type { SocialLink } from "@/types";

const SOCIAL_ICONS: Record<SocialLink["icon"], ComponentType<SVGProps<SVGSVGElement>>> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
};

/** About and contact in one closing section: who, then how to reach him. */
export function Contact() {
  const { dict, t } = useI18n();

  return (
    <Section id="contact" title={dict.contact.title}>
      <div className="grid gap-x-12 gap-y-8 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <Image
          src="/avatar.jpg"
          alt={dict.contact.avatarAlt}
          width={735}
          height={694}
          sizes="(min-width: 768px) 14rem, 11rem"
          className="aspect-square w-full max-w-56 rounded-xl object-cover"
        />

        <div className="min-w-0">
          {t(profile.bio).map((paragraph) => (
            <p key={paragraph} className="type-lead measure mt-4 first:mt-0">
              {paragraph}
            </p>
          ))}

          <p className="mt-10">
            <a
              href={`mailto:${profile.email}`}
              className="text-[clamp(1.5rem,4vw,2.5rem)] font-semibold tracking-tight underline decoration-rule decoration-2 underline-offset-[0.18em] transition-colors hover:decoration-accent"
            >
              {profile.email}
            </a>
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <CopyButton
              value={profile.email}
              label={dict.contact.copyEmail}
              copiedLabel={dict.contact.copied}
            />
            {profile.phone !== null ? (
              <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="btn btn-quiet tabular">
                <Phone aria-hidden className="size-4" />
                <span className="sr-only">{dict.contact.phone}: </span>
                {profile.phone}
              </a>
            ) : null}
          </div>

          <h3 className="mt-10 text-sm font-semibold">{dict.contact.elsewhere}</h3>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
            {profile.socials.map((social) => {
              const Icon = SOCIAL_ICONS[social.icon];
              return (
                <li key={social.id}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link inline-flex items-center gap-2"
                  >
                    <Icon className="size-4" />
                    {social.label}
                    <span className="sr-only"> ({dict.work.newTab})</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Section>
  );
}
