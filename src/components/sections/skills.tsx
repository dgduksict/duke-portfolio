"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ToggleChip } from "@/components/ui/controls";
import { Panel } from "@/components/ui/primitives";
import { Reveal, Spotlight } from "@/components/visual/motion-primitives";
import { Section, SectionHeading } from "@/components/visual/section";
import { skillGroups, skills } from "@/data/skills";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import type { SkillDomain } from "@/types";

type DomainFilter = SkillDomain | "all";

function ProficiencyBar({ level, accent }: { readonly level: number; readonly accent: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: accent }}
        initial={{ width: 0 }}
        whileInView={{ width: `${level}%` }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function Skills() {
  const { dict, t } = useI18n();
  const [domain, setDomain] = useState<DomainFilter>("all");

  const visible = useMemo(
    () => (domain === "all" ? skills : skills.filter((skill) => skill.domain === domain)),
    [domain],
  );

  const activeGroup = skillGroups.find((group) => group.domain === domain);

  return (
    <Section id="skills">
      <SectionHeading
        eyebrow={dict.skills.eyebrow}
        title={dict.skills.title}
        subtitle={dict.skills.subtitle}
        action={
          <span className="font-mono text-sm text-muted-foreground tabular-nums">
            {visible.length} {dict.skills.showing}
          </span>
        }
      />

      <Reveal className="mb-8 flex flex-wrap gap-2">
        <ToggleChip active={domain === "all"} onClick={() => setDomain("all")}>
          {dict.skills.all}
        </ToggleChip>
        {skillGroups.map((group) => (
          <ToggleChip
            key={group.domain}
            active={domain === group.domain}
            onClick={() => setDomain(group.domain)}
          >
            {t(group.title)}
            <span className="font-mono text-[11px] opacity-60">{group.skills.length}</span>
          </ToggleChip>
        ))}
      </Reveal>

      <AnimatePresence mode="wait">
        {activeGroup ? (
          <motion.p
            key={activeGroup.domain}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground"
          >
            {t(activeGroup.summary)}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <motion.ul layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((skill) => (
            <motion.li
              key={skill.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Spotlight accent={skill.accent} className="h-full rounded-2xl">
                <Panel className="h-full p-4 transition-colors duration-300 hover:border-border-strong">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <a
                      href={skill.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex min-w-0 items-center gap-2.5"
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full ring-2 ring-transparent transition-all duration-200 group-hover/link:ring-current"
                        style={{ backgroundColor: skill.accent, color: skill.accent }}
                        aria-hidden
                      />
                      <span className="truncate text-sm font-medium transition-colors group-hover/link:text-primary">
                        {skill.name}
                      </span>
                    </a>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                      {skill.years} {dict.skills.years}
                    </span>
                  </div>

                  <ProficiencyBar level={skill.level} accent={skill.accent} />

                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                      {dict.skills.proficiency}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[11px] tabular-nums",
                        skill.level >= 88 ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {skill.level}
                    </span>
                  </div>
                </Panel>
              </Spotlight>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </Section>
  );
}
