"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltipCard, readNumber, readString } from "@/components/charts/chart-tooltip";

export interface RadarDatum {
  readonly label: string;
  readonly score: number;
}

export interface DomainRadarProps {
  readonly data: readonly RadarDatum[];
  readonly seriesLabel: string;
}

export function DomainRadar({ data, seriesLabel }: DomainRadarProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={[...data]} outerRadius="72%">
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis
          dataKey="label"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
        />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip
          content={(props) => {
            if (props.active !== true || !Array.isArray(props.payload)) return null;
            const first = props.payload[0];
            const value = readNumber(first?.value);
            if (value === null) return null;
            const title =
              readString(first?.payload?.label) ?? readString(props.label) ?? seriesLabel;
            return (
              <ChartTooltipCard
                title={title}
                rows={[
                  {
                    key: "score",
                    label: seriesLabel,
                    value: `${value}/100`,
                    color: "var(--color-primary)",
                  },
                ]}
              />
            );
          }}
        />
        <Radar
          name={seriesLabel}
          dataKey="score"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="var(--color-primary)"
          fillOpacity={0.22}
          animationDuration={900}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
