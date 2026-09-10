"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Mail,
  MapPin,
  Paperclip,
  Phone,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState, type ComponentType, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { Badge, FieldLabel, Panel, TextAreaField, TextField } from "@/components/ui/primitives";
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/visual/brand-icons";
import { Reveal } from "@/components/visual/motion-primitives";
import { Section, SectionHeading } from "@/components/visual/section";
import { profile } from "@/data/profile";
import { useClipboard } from "@/hooks/use-clipboard";
import { useI18n } from "@/hooks/use-i18n";
import {
  BUDGET_BANDS,
  BUDGET_LABELS,
  emptyContactValues,
  hasErrors,
  validateContact,
  type BudgetBand,
  type ContactErrors,
  type ContactValues,
} from "@/lib/contact";
import { usePortfolioStore } from "@/store/portfolio-store";
import type { SocialLink } from "@/types";

const SOCIAL_ICONS: Record<SocialLink["icon"], ComponentType<{ className?: string }>> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  mail: Mail,
};

type Status = "idle" | "sending" | "sent";

export function Contact() {
  const { dict, t } = useI18n();
  const setBriefDraft = usePortfolioStore((state) => state.setBriefDraft);
  const { copied, copy } = useClipboard();

  const [values, setValues] = useState<ContactValues>(emptyContactValues);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [quoteAttached, setQuoteAttached] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  /**
   * The estimator hands a generated brief over through the store. Subscribing
   * to it (rather than mirroring it into state on every render) keeps whatever
   * the visitor has already typed until a new brief actually arrives.
   */
  useEffect(() => {
    const unsubscribe = usePortfolioStore.subscribe((state, previous) => {
      const draft = state.briefDraft;
      if (draft.length === 0 || draft === previous.briefDraft) return;

      setValues((current) => ({ ...current, message: draft }));
      setStatus("idle");
      setQuoteAttached(true);
      setBriefDraft("");

      if (focusTimer.current !== null) window.clearTimeout(focusTimer.current);
      focusTimer.current = window.setTimeout(() => {
        messageRef.current?.focus();
        messageRef.current?.setSelectionRange(draft.length, draft.length);
      }, 420);
    });

    return () => {
      unsubscribe();
      if (focusTimer.current !== null) window.clearTimeout(focusTimer.current);
    };
  }, [setBriefDraft]);

  const update = <K extends keyof ContactValues>(key: K, value: ContactValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (key !== "budget") {
      setErrors((current) => {
        const next = { ...current };
        delete next[key as keyof ContactErrors];
        return next;
      });
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (hasErrors(found)) return;

    setStatus("sending");
    timer.current = setTimeout(() => setStatus("sent"), 900);
  };

  const reset = () => {
    setValues(emptyContactValues);
    setErrors({});
    setQuoteAttached(false);
    setStatus("idle");
  };

  const details = [
    { id: "email", icon: Mail, label: dict.contact.email, value: profile.email },
    { id: "phone", icon: Phone, label: "Phone", value: profile.phone },
    { id: "location", icon: MapPin, label: dict.hero.basedIn, value: t(profile.location) },
    {
      id: "response",
      icon: Clock,
      label: dict.contact.responseTime,
      value: dict.contact.responseValue,
    },
  ] as const;

  return (
    <Section id="contact">
      <SectionHeading
        eyebrow={dict.contact.eyebrow}
        title={dict.contact.title}
        subtitle={dict.contact.subtitle}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-8">
        <Reveal className="space-y-5">
          <Panel className="p-6">
            <h3 className="mb-5 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              {dict.contact.directTitle}
            </h3>
            <dl className="space-y-4">
              {details.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div key={detail.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-muted/60 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-[11px] text-muted-foreground">{detail.label}</dt>
                      <dd className="truncate text-sm font-medium">{detail.value}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>

            <Button
              variant="secondary"
              size="sm"
              className="mt-5 w-full"
              onClick={() => {
                void copy(profile.email);
              }}
            >
              {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
              {copied ? dict.contact.copied : dict.contact.copyEmail}
            </Button>
          </Panel>

          <Panel className="p-6">
            <div className="flex flex-wrap gap-2">
              {profile.socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon];
                return (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:border-primary/50 hover:text-foreground"
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{social.label}</span>
                  </a>
                );
              })}
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.08}>
          <Panel className="relative overflow-hidden p-6 sm:p-7">
            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  className="flex min-h-96 flex-col items-center justify-center gap-4 text-center"
                >
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="flex size-14 items-center justify-center rounded-full bg-primary/12 text-primary"
                  >
                    <CheckCircle2 className="size-7" />
                  </motion.span>
                  <div>
                    <p className="text-lg font-medium">{dict.contact.sent}</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                      {dict.contact.sentDetail}
                    </p>
                  </div>
                  <Button variant="secondary" onClick={reset}>
                    {dict.contact.sendAnother}
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel htmlFor="contact-name">{dict.contact.name}</FieldLabel>
                      <TextField
                        id="contact-name"
                        name="name"
                        autoComplete="name"
                        value={values.name}
                        invalid={errors.name === true}
                        placeholder={dict.contact.namePlaceholder}
                        onChange={(event) => update("name", event.target.value)}
                      />
                      {errors.name ? (
                        <p className="mt-1.5 text-xs text-rose-accent">{dict.contact.errors.name}</p>
                      ) : null}
                    </div>
                    <div>
                      <FieldLabel htmlFor="contact-email">{dict.contact.email}</FieldLabel>
                      <TextField
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={values.email}
                        invalid={errors.email === true}
                        placeholder={dict.contact.emailPlaceholder}
                        onChange={(event) => update("email", event.target.value)}
                      />
                      {errors.email ? (
                        <p className="mt-1.5 text-xs text-rose-accent">
                          {dict.contact.errors.email}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <FieldLabel htmlFor="contact-budget">{dict.contact.budget}</FieldLabel>
                    <Segmented
                      ariaLabel={dict.contact.budget}
                      size="sm"
                      options={BUDGET_BANDS.map((band) => ({
                        value: band,
                        label: BUDGET_LABELS[band],
                      }))}
                      value={values.budget}
                      onChange={(band: BudgetBand) => update("budget", band)}
                    />
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <FieldLabel htmlFor="contact-message">{dict.contact.message}</FieldLabel>
                      {quoteAttached ? (
                        <Badge tone="primary" className="mb-2">
                          <Paperclip className="size-3" />
                          {dict.contact.quoteAttached}
                        </Badge>
                      ) : null}
                    </div>
                    <TextAreaField
                      id="contact-message"
                      name="message"
                      ref={messageRef}
                      rows={7}
                      value={values.message}
                      invalid={errors.message === true}
                      placeholder={dict.contact.messagePlaceholder}
                      onChange={(event) => update("message", event.target.value)}
                    />
                    {errors.message ? (
                      <p className="mt-1.5 text-xs text-rose-accent">
                        {dict.contact.errors.message}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {dict.contact.sending}
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        {dict.contact.send}
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
}
