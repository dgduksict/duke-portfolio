"use client";

import { Fragment } from "react";
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
      <p className="measure text-ink-soft">{dict.stack.intro}</p>

      <div className="mt-10 grid gap-x-14 gap-y-12 md:grid-cols-2">
        {SKILL_GROUPS.map((group) => {
          const items = evidence.filter((item) => item.skill.group === group);
          const used = items.filter((item) => item.places.length > 0);
          const unused = items.filter((item) => item.places.length === 0);

          return (
            <div key={group}>
              <h3 className="text-lg font-semibold tracking-tight">{dict.stack.groups[group]}</h3>

              {used.length > 0 ? (
                <dl className="mt-3 divide-y divide-rule">
                  {used.map(({ skill, places }) => (
                    <div
                      key={skill.id}
                      className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] gap-x-4 py-2.5"
                    >
                      <dt className="font-medium">{skill.name}</dt>
                      <dd className="text-sm leading-6 text-ink-soft">
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
                <p className="mt-3 text-sm text-ink-soft">
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
