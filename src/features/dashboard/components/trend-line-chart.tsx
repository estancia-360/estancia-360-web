import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";

export interface TrendLineSeries {
  key: string;
  label: string;
  color: string;
}

interface TrendLineChartProps {
  /** Filas ya formateadas: { month: "ene", <series.key>: number, ... }[] */
  data: Record<string, string | number | null>[];
  series: TrendLineSeries[];
}

/** Line chart genérico — 1 o 2 series sobre el tiempo. Legend solo si hay 2+ series. */
export function TrendLineChart({ data, series }: TrendLineChartProps) {
  const chartConfig = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }]),
  ) satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">
      <LineChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} className="stroke-border/50" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis hide allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "var(--border)" }} />
        {series.length > 1 ? <ChartLegend content={<ChartLegendContent />} /> : null}
        {series.map((s) => (
          <Line
            key={s.key}
            dataKey={s.key}
            type="monotone"
            stroke={`var(--color-${s.key})`}
            strokeWidth={2}
            connectNulls
            dot={{ r: 4, fill: `var(--color-${s.key})`, strokeWidth: 2, stroke: "#ffffff" }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
