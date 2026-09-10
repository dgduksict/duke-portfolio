"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltipCard, readNumber, readString } from "@/components/charts/chart-tooltip";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { CurrencyCode } from "@/types";

export interface CostSlice {
  readonly id: string;
  readonly label: string;
  readonly amount: number;
  readonly accent: string;
}

export interface CostDonutProps {
  readonly slices: readonly CostSlice[];
  readonly currency: CurrencyCode;
  readonly shareLabel: string;
}

export function CostDonut({ slices, currency, shareLabel }: CostDonutProps) {
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip
          content={(props) => {
            if (props.active !== true || !Array.isArray(props.payload)) return null;
            const first = props.payload[0];
            const value = readNumber(first?.value);
            if (value === null) return null;
            const label = readString(first?.payload?.label) ?? "";
            const accent = readString(first?.payload?.accent) ?? "var(--color-primary)";
            return (
              <ChartTooltipCard
                title={label}
                rows={[
                  {
                    key: label,
                    label: shareLabel,
                    value: formatCurrency(value, currency),
                    color: accent,
                  },
                ]}
                footer={total > 0 ? formatPercent(value / total, 1) : undefined}
              />
            );
          }}
        />
        <Pie
          data={[...slices]}
          dataKey="amount"
          nameKey="label"
          innerRadius="62%"
          outerRadius="92%"
          paddingAngle={2}
          stroke="var(--color-background)"
          strokeWidth={2}
          animationDuration={650}
        >
          {slices.map((slice) => (
            <Cell key={slice.id} fill={slice.accent} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
