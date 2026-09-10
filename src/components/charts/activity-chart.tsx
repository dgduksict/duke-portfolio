"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltipCard, readNumber, readString } from "@/components/charts/chart-tooltip";
import { formatNumber } from "@/lib/format";
import type { ActivityPoint } from "@/types";

export interface ActivitySeriesLabels {
  readonly shipped: string;
  readonly reviewed: string;
  readonly automated: string;
}

export interface ActivityChartProps {
  readonly data: readonly ActivityPoint[];
  readonly labels: ActivitySeriesLabels;
}

const SERIES = [
  { key: "shipped", color: "var(--color-primary)", gradient: "gradShipped" },
  { key: "reviewed", color: "var(--color-cyan-accent)", gradient: "gradReviewed" },
  { key: "automated", color: "var(--color-violet-accent)", gradient: "gradAutomated" },
] as const;

export function ActivityChart({ data, labels }: ActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={[...data]} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <defs>
          {SERIES.map((series) => (
            <linearGradient key={series.gradient} id={series.gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series.color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={series.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          stroke="var(--color-muted-foreground)"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          stroke="var(--color-muted-foreground)"
        />
        <Tooltip
          cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1 }}
          content={(props) => {
            if (props.active !== true || !Array.isArray(props.payload)) return null;
            const rows = props.payload.flatMap((entry) => {
              const key = readString(entry.dataKey) ?? readString(entry.name);
              const value = readNumber(entry.value);
              if (key === null || value === null) return [];
              const label = labels[key as keyof ActivitySeriesLabels] ?? key;
              return [
                {
                  key,
                  label,
                  value: formatNumber(value),
                  color: entry.color ?? "var(--color-primary)",
                },
              ];
            });
            if (rows.length === 0) return null;
            return <ChartTooltipCard title={readString(props.label) ?? ""} rows={rows} />;
          }}
        />

        {SERIES.map((series) => (
          <Area
            key={series.key}
            type="monotone"
            dataKey={series.key}
            stroke={series.color}
            strokeWidth={2}
            fill={`url(#${series.gradient})`}
            activeDot={{ r: 4, strokeWidth: 0 }}
            animationDuration={900}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
