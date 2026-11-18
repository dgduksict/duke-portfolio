"use client";

import { PixelIcon } from "@/components/ui/pixel-icons";
import { Section } from "@/components/ui/section";
import { Pipeline } from "@/components/work/pipeline";
import { projects } from "@/data/projects";
import { useI18n } from "@/hooks/use-i18n";
import { formatMetric } from "@/lib/format";

const hostOf = (href: string) => new URL(href).host;

export function Work() {
  const { dict, t } = useI18n();

  return (
    <Section id="work" title={dict.work.title}>
      <div className="grid gap-12">
        {projects.map((project) => {
          const headingId = `project-${project.id}-title`;
          const outcomes = project.outcomes ? t(project.outcomes) : [];
          const metrics = project.metrics ?? [];
          const stageNames = project.stages.map((stage) => t(stage.label)).join(", ");

          return (
            <article
              key={project.id}
              id={`project-${project.id}`}
              aria-labelledby={headingId}
              className="project px-box scroll-mt-24 p-5 sm:p-8"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h3 id={headingId} className="type-project">
                  {t(project.name)}
                </h3>
                <p className="flex flex-wrap items-baseline gap-x-4 text-base text-ink-soft">
                  {project.links.length === 0 ? (
                    <span>{dict.work.internal}</span>
                  ) : (
                    project.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link inline-flex items-center gap-2"
                      >
                        {hostOf(link.href)}
                        <PixelIcon name="arrow-up-right" />
                        <span className="sr-only">({dict.work.newTab})</span>
                      </a>
                    ))
                  )}
                  <span className="tabular">{project.year}</span>
                </p>
              </header>

              <p className="type-lead measure mt-3">{t(project.tagline)}</p>

              <Pipeline stages={project.stages} label={`${dict.work.howItWorks}: ${stageNames}`} />

              <div className="grid gap-x-10 gap-y-6 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                <p className="measure text-ink-soft">{t(project.description)}</p>

                <dl className="space-y-5">
                  <div>
                    <dt className="text-accent-text">{dict.work.myPart}</dt>
                    <dd className="mt-1 text-ink-soft">{t(project.part)}</dd>
                  </div>
                  {outcomes.length > 0 ? (
                    <div>
                      <dt className="text-accent-text">{dict.work.outcomes}</dt>
                      <dd className="mt-1">
                        <ul className="px-list space-y-1 text-ink-soft">
                          {outcomes.map((outcome) => (
                            <li key={outcome}>{outcome}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-accent-text">{dict.work.builtWith}</dt>
                    <dd className="mt-1">
                      <ul className="flex flex-wrap gap-x-3 gap-y-3">
                        {project.stack.map((tool) => (
                          <li key={tool} className="px-chip">
                            {tool}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>

              {metrics.length > 0 ? (
                <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.id}>
                      <dt className="text-base text-ink-soft">{t(metric.label)}</dt>
                      <dd className="tabular font-pixel text-[1.5rem] leading-tight">
                        {formatMetric(metric.value, metric.suffix, metric.decimals)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </article>
          );
        })}
      </div>
    </Section>
  );
}
