"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltipCard, readNumber, readString } from "@/components/charts/chart-tooltip";
import type { StackShare } from "@/types";

export interface StackBarsProps {
  readonly data: readonly StackShare[];
  readonly seriesLabel: string;
}

export function StackBars({ data, seriesLabel }: StackBarsProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={[...data]}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
        barCategoryGap={10}
      >
        <XAxis type="number" hide domain={[0, "dataMax"]} />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={92}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "var(--color-surface-muted)", opacity: 0.5 }}
          content={(props) => {
            if (props.active !== true || !Array.isArray(props.payload)) return null;
            const first = props.payload[0];
            const value = readNumber(first?.value);
            if (value === null) return null;
            const name = readString(first?.payload?.name) ?? "";
            const color = readString(first?.payload?.accent) ?? "var(--color-primary)";
            return (
              <ChartTooltipCard
                title={name}
                rows={[{ key: name, label: seriesLabel, value: `${value}%`, color }]}
              />
            );
          }}
        />
        <Bar dataKey="share" radius={[0, 6, 6, 0]} animationDuration={900}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.accent} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
