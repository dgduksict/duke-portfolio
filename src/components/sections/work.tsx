"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FolderSearch, Search, X } from "lucide-react";
import { useMemo } from "react";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { Button } from "@/components/ui/button";
import { Segmented, ToggleChip } from "@/components/ui/controls";
import { TextField } from "@/components/ui/primitives";
import { Reveal } from "@/components/visual/motion-primitives";
import { Section, SectionHeading } from "@/components/visual/section";
import { projects } from "@/data/projects";
import { useI18n } from "@/hooks/use-i18n";
import {
  collectStacks,
  filterProjects,
  isFilterActive,
  projectCategoryLabels,
  type ProjectSort,
} from "@/lib/projects";
import { usePortfolioStore } from "@/store/portfolio-store";
import { PROJECT_CATEGORIES } from "@/types";

const TOP_STACK_COUNT = 8;

export function Work() {
  const { dict, t, language } = useI18n();
  const filter = usePortfolioStore((state) => state.projectFilter);
  const setQuery = usePortfolioStore((state) => state.setQuery);
  const setCategory = usePortfolioStore((state) => state.setCategory);
  const toggleStack = usePortfolioStore((state) => state.toggleStack);
  const setSort = usePortfolioStore((state) => state.setSort);
  const resetFilters = usePortfolioStore((state) => state.resetFilters);
  const selectedProjectId = usePortfolioStore((state) => state.selectedProjectId);
  const openProject = usePortfolioStore((state) => state.openProject);
  const closeProject = usePortfolioStore((state) => state.closeProject);

  const visible = useMemo(
    () => filterProjects(projects, filter, language),
    [filter, language],
  );
  const stacks = useMemo(() => collectStacks(projects).slice(0, TOP_STACK_COUNT), []);
  const selected = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [selectedProjectId],
  );

  const sortOptions: readonly { value: ProjectSort; label: string }[] = [
    { value: "featured", label: dict.work.sortFeatured },
    { value: "newest", label: dict.work.sortNewest },
    { value: "name", label: dict.work.sortName },
  ];

  return (
    <Section id="work">
      <SectionHeading
        eyebrow={dict.work.eyebrow}
        title={dict.work.title}
        subtitle={dict.work.subtitle}
        action={
          <Segmented
            ariaLabel={dict.work.sortBy}
            options={sortOptions}
            value={filter.sort}
            onChange={setSort}
            size="sm"
          />
        }
      />

      <Reveal className="mb-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <TextField
              value={filter.query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={dict.work.searchPlaceholder}
              aria-label={dict.work.search}
              className="pl-10"
            />
            {filter.query.length > 0 ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={dict.work.clear}
                className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-muted-foreground tabular-nums">
              {visible.length} {dict.work.results}
            </span>
            {isFilterActive(filter) ? (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="size-3.5" />
                {dict.work.clear}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ToggleChip active={filter.category === "all"} onClick={() => setCategory("all")}>
            {dict.work.all}
          </ToggleChip>
          {PROJECT_CATEGORIES.map((category) => (
            <ToggleChip
              key={category}
              active={filter.category === category}
              onClick={() => setCategory(category)}
            >
              {t(projectCategoryLabels[category])}
            </ToggleChip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {stacks.map((stack) => {
            const active = filter.stack === stack;
            return (
              <button
                key={stack}
                type="button"
                onClick={() => toggleStack(stack)}
                aria-pressed={active}
                className={
                  active
                    ? "rounded-md border border-primary/50 bg-primary/12 px-2 py-1 font-mono text-[11px] text-primary transition-colors"
                    : "rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                }
              >
                {stack}
              </button>
            );
          })}
        </div>
      </Reveal>

      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={openProject}
              priority={index < 3}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-panel flex flex-col items-center gap-3 rounded-2xl px-6 py-16 text-center"
        >
          <FolderSearch className="size-8 text-muted-foreground" />
          <p className="font-medium">{dict.work.empty}</p>
          <p className="text-sm text-muted-foreground">{dict.work.emptyHint}</p>
          <Button variant="secondary" size="sm" onClick={resetFilters} className="mt-2">
            {dict.work.clear}
          </Button>
        </motion.div>
      ) : null}

      <ProjectDialog project={selected} onClose={closeProject} />
    </Section>
  );
}
