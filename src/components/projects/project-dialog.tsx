"use client";

import { ArrowUpRight, Check, X } from "lucide-react";
import Image from "next/image";
import { Button, LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { GithubIcon } from "@/components/visual/brand-icons";
import { useI18n } from "@/hooks/use-i18n";
import { formatMetric } from "@/lib/format";
import { projectCategoryLabels } from "@/lib/projects";
import type { Project } from "@/types";

export interface ProjectDialogProps {
  readonly project: Project | null;
  readonly onClose: () => void;
}

export function ProjectDialog({ project, onClose }: ProjectDialogProps) {
  const { dict, t } = useI18n();

  return (
    <Modal
      open={project !== null}
      onClose={onClose}
      labelledBy="project-dialog-title"
      className="max-w-3xl"
    >
      {project ? (
        <div className="max-h-[85vh] overflow-y-auto">
          <div className="relative h-52 overflow-hidden rounded-t-2xl sm:h-64">
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
            <div
              className="absolute inset-0 mix-blend-soft-light"
              style={{ background: `linear-gradient(150deg, ${project.accent}77, transparent 60%)` }}
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent"
              aria-hidden
            />

            <Button
              variant="secondary"
              size="icon"
              onClick={onClose}
              aria-label={dict.work.close}
              className="absolute top-4 right-4"
            >
              <X className="size-4" />
            </Button>

            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5 sm:p-6">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge tone="primary">{t(projectCategoryLabels[project.category])}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{project.year}</span>
                </div>
                <h2
                  id="project-dialog-title"
                  className="text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                  {project.title}
                </h2>
              </div>
            </div>
          </div>

          <div className="space-y-7 p-5 sm:p-7">
            <p className="text-base leading-relaxed text-pretty text-muted-foreground">
              {t(project.description)}
            </p>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {project.metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="rounded-xl border border-border bg-surface-muted/50 p-4"
                >
                  <dt className="text-xs text-muted-foreground">{t(metric.label)}</dt>
                  <dd
                    className="mt-1 font-mono text-2xl font-semibold tabular-nums"
                    style={{ color: project.accent }}
                  >
                    {formatMetric(metric.value, metric.suffix, metric.decimals)}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  {dict.work.role}
                </h3>
                <p className="text-sm leading-relaxed text-foreground">{t(project.role)}</p>
              </div>
              <div>
                <h3 className="mb-2 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  {dict.work.stack}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-border bg-surface-muted/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {dict.work.outcomes}
              </h3>
              <ul className="space-y-2.5">
                {t(project.outcomes).map((outcome) => (
                  <li key={outcome} className="flex gap-3 text-sm leading-relaxed">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {project.demoUrl !== null || project.repoUrl !== null ? (
              <div className="flex flex-wrap gap-3 border-t border-border pt-5">
                {project.demoUrl ? (
                  <LinkButton href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    {dict.work.liveSite}
                    <ArrowUpRight className="size-4" />
                  </LinkButton>
                ) : null}
                {project.repoUrl ? (
                  <LinkButton
                    variant="secondary"
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon className="size-4" />
                    {dict.work.sourceCode}
                  </LinkButton>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
