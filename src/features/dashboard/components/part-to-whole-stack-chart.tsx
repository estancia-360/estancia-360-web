import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export interface StackSegment {
  key: string;
  label: string;
  color: string;
  value: number;
}

interface PartToWholeStackChartProps {
  segments: StackSegment[];
}

/** Barra apilada horizontal única — part-to-whole genérico, con fila de valores directos debajo. */
export function PartToWholeStackChart({ segments }: PartToWholeStackChartProps) {
  const chartConfig = Object.fromEntries(
    segments.map((s) => [s.key, { label: s.label, color: s.color }]),
  ) satisfies ChartConfig;
  const data = [Object.fromEntries([["name", "total"], ...segments.map((s) => [s.key, s.value])])];

  return (
    <div className="flex flex-col gap-3">
      <ChartContainer config={chartConfig} className="aspect-auto h-16 w-full">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" hide />
          <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
          {segments.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              stackId="stack"
              fill={`var(--color-${s.key})`}
              radius={
                segments.length === 1
                  ? [4, 4, 4, 4]
                  : i === 0
                    ? [4, 0, 0, 4]
                    : i === segments.length - 1
                      ? [0, 4, 4, 0]
                      : undefined
              }
            />
          ))}
        </BarChart>
      </ChartContainer>
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
        {segments.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-medium text-foreground">{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
