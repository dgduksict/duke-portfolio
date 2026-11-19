"use client";

import { Fragment } from "react";
import { reveal } from "@/components/reveal/reveal";
import { Section } from "@/components/ui/section";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";
import { useI18n } from "@/hooks/use-i18n";
import { buildEvidence } from "@/lib/evidence";
import { SKILL_GROUPS } from "@/types";

const evidence = buildEvidence(skills, experience, projects);

/**
 * The tools, each followed by where it was used — links down to the role or
 * project that lists it. Tools with nothing to point at are named plainly.
 */
export function Stack() {
  const { dict, t } = useI18n();

  return (
    <Section id="stack" title={dict.stack.title}>
      <p {...reveal} className="measure text-ink-soft">
        {dict.stack.intro}
      </p>

      <div className="mt-10 grid gap-x-12 gap-y-12 md:grid-cols-2 md:items-start">
        {SKILL_GROUPS.map((group) => {
          const items = evidence.filter((item) => item.skill.group === group);
          const used = items.filter((item) => item.places.length > 0);
          const unused = items.filter((item) => item.places.length === 0);

          return (
            <div key={group} {...reveal} className="px-box p-5 sm:p-6">
              <h3 className="type-label">{dict.stack.groups[group]}</h3>

              {used.length > 0 ? (
                <dl className="px-rows mt-4">
                  {used.map(({ skill, places }) => (
                    // On a 320px phone the 8.5rem name column left the places 96px, and one long word ("ErchimLabs",
                    // "Нийтлэлийн") poked past the box. 7rem still fits the longest single-word name ("SQLAlchemy").
                    <div
                      key={skill.id}
                      className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-x-4 py-3 sm:grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)]"
                    >
                      <dt>{skill.name}</dt>
                      <dd className="text-base text-ink-soft [overflow-wrap:break-word]">
                        {places.map((place, index) => (
                          <Fragment key={place.href}>
                            <a href={place.href} className="link-quiet">
                              {t(place.label)}
                            </a>
                            {index < places.length - 1 ? ", " : null}
                          </Fragment>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {unused.length > 0 ? (
                <p className="mt-3 text-base text-ink-soft">
                  {dict.stack.alsoUsed} {unused.map((item) => item.skill.name).join(", ")}.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
