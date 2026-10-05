"use client";

import type { CSSProperties } from "react";
import { useI18n } from "@/hooks/use-i18n";
import type { PipelineStage } from "@/types";

export interface PipelineProps {
  readonly stages: readonly PipelineStage[];
  /** Read out in place of the drawing, e.g. "How it works: Crawl, Embed, …". */
  readonly label: string;
}

/**
 * How a project works, as the stages data moves through. Static by default;
 * while its project is hovered or focused, a token runs the line and each
 * stage lights as it passes (CSS only — see `.pipeline` in globals.css).
 */
export function Pipeline({ stages, label }: PipelineProps) {
  const { t } = useI18n();

  return (
    <figure className="pipeline" style={{ "--stages": stages.length } as CSSProperties}>
      <figcaption className="sr-only">{label}</figcaption>
      <ol className="pipeline-stages">
        {stages.map((stage, index) => (
          <li key={stage.id} className="pipeline-stage" style={{ "--i": index } as CSSProperties}>
            <span className="pipeline-node" aria-hidden />
            <span className="pipeline-label">{t(stage.label)}</span>
            {stage.detail ? <span className="pipeline-detail">{t(stage.detail)}</span> : null}
          </li>
        ))}
      </ol>
      <span className="pipeline-track" aria-hidden>
        <span className="pipeline-token" />
      </span>
    </figure>
  );
}
