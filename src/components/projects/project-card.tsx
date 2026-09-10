"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import Image from "next/image";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Badge } from "@/components/ui/primitives";
import { GithubIcon } from "@/components/visual/brand-icons";
import { useI18n } from "@/hooks/use-i18n";
import { formatMetric } from "@/lib/format";
import { projectCategoryLabels } from "@/lib/projects";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

export interface ProjectCardProps {
  readonly project: Project;
  readonly onOpen: (projectId: string) => void;
  readonly priority?: boolean;
}

/** Tilting, spotlit card. The whole surface opens the case study. */
export function ProjectCard({ project, onOpen, priority = false }: ProjectCardProps) {
  const { dict, t } = useI18n();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [6, -6]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-7, 7]), { stiffness: 220, damping: 22 });

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const onPointerLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className="group h-full"
    >
      <article className="surface-panel relative flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-300 hover:border-border-strong">
        <button
          type="button"
          onClick={() => onOpen(project.id)}
          aria-label={`${dict.work.caseStudy}: ${project.title}`}
          className="absolute inset-0 z-20 rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />

        <div className="relative aspect-16/10 overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          <div
            className="absolute inset-0 mix-blend-soft-light"
            style={{
              background: `linear-gradient(150deg, ${project.accent}66, transparent 55%)`,
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-surface via-surface/45 to-transparent"
            aria-hidden
          />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
            <Badge tone="neutral" className="backdrop-blur-md">
              {t(projectCategoryLabels[project.category])}
            </Badge>
            {project.featured ? (
              <Badge tone="primary" className="backdrop-blur-md">
                <Star className="size-3" />
                {dict.work.featured}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {project.year}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {t(project.tagline)}
          </p>

          <dl className="mt-4 grid grid-cols-3 gap-2">
            {project.metrics.map((metric) => (
              <div key={metric.id} className="rounded-lg border border-border bg-surface-muted/50 p-2">
                <dt className="truncate text-[10px] text-muted-foreground">{t(metric.label)}</dt>
                <dd
                  className="mt-0.5 font-mono text-sm font-medium tabular-nums"
                  style={{ color: project.accent }}
                >
                  {formatMetric(metric.value, metric.suffix, metric.decimals)}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.stack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {tech}
              </span>
            ))}
            {project.stack.length > 4 ? (
              <span className="rounded-md px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                +{project.stack.length - 4}
              </span>
            ) : null}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
              {dict.work.caseStudy}
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
            <span className="relative z-30 flex items-center gap-1">
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${dict.work.sourceCode}: ${project.title}`}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                >
                  <GithubIcon className="size-4" />
                </a>
              ) : null}
              {project.demoUrl ? (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${dict.work.liveSite}: ${project.title}`}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-muted-foreground",
                    "transition-colors hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  <ArrowUpRight className="size-4" />
                </a>
              ) : null}
            </span>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
