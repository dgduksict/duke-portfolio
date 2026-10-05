"use client";

import { Fragment } from "react";
import { Section } from "@/components/ui/section";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { useI18n } from "@/hooks/use-i18n";
import { formatYearRange } from "@/lib/format";

export function Experience() {
  const { dict, t } = useI18n();

  return (
    <Section id="experience" title={dict.experience.title}>
      <ol className="divide-y divide-rule">
        {experience.map((entry) => {
          const headingId = `role-${entry.id}-title`;
          const current = entry.end === null;
          const related = projects.filter((project) => project.roleId === entry.id);
          const highlights = entry.highlights ? t(entry.highlights) : [];

          return (
            <li
              key={entry.id}
              id={`role-${entry.id}`}
              aria-labelledby={headingId}
              className="grid scroll-mt-24 gap-x-8 gap-y-2 py-8 first:pt-0 sm:grid-cols-[9rem_minmax(0,1fr)]"
            >
              <p className="tabular flex items-center gap-2 self-start pt-1 text-sm text-ink-soft">
                {formatYearRange(entry.start, entry.end, dict.experience.now)}
                {current ? (
                  <>
                    <span className="size-1.5 rounded-full bg-sun" aria-hidden />
                    <span className="sr-only">{dict.experience.current}</span>
                  </>
                ) : null}
              </p>

              <div className="min-w-0">
                <h3 id={headingId} className="text-xl font-semibold tracking-tight">
                  {t(entry.role)}
                  <span className="font-normal text-ink-soft">, </span>
                  {entry.companyUrl !== null ? (
                    <a href={entry.companyUrl} target="_blank" rel="noopener noreferrer" className="link">
                      {entry.company}
                      <span className="sr-only"> ({dict.work.newTab})</span>
                    </a>
                  ) : (
                    entry.company
                  )}
                </h3>
                <p className="mt-0.5 text-sm text-ink-soft">{t(entry.location)}</p>

                <p className="measure mt-3">{t(entry.summary)}</p>

                {highlights.length > 0 ? (
                  <ul className="measure mt-3 list-disc space-y-1.5 pl-5 marker:text-ink-soft">
                    {highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                ) : null}

                {related.length > 0 ? (
                  <p className="mt-3 text-sm">
                    <span className="text-ink-soft">{dict.experience.fromThisRole} </span>
                    {related.map((project, index) => (
                      <Fragment key={project.id}>
                        <a href={`#project-${project.id}`} className="link">
                          {t(project.name)}
                        </a>
                        {index < related.length - 1 ? ", " : null}
                      </Fragment>
                    ))}
                  </p>
                ) : null}

                <ul
                  aria-label={dict.work.builtWith}
                  className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft"
                >
                  {entry.stack.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
