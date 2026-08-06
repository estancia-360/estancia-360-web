import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { CHART_COLORS } from "@/features/dashboard/lib/chart-colors";

const chartConfig = {
  cria: { label: "Cría", color: CHART_COLORS.cria },
  recria: { label: "Recría", color: CHART_COLORS.recria },
  engorde: { label: "Engorde", color: CHART_COLORS.engorde },
} satisfies ChartConfig;

interface HerdStackChartProps {
  cria: number;
  recria: number;
  engorde: number;
}

/** Barra apilada horizontal única — part-to-whole del hato por etapa productiva. */
export function HerdStackChart({ cria, recria, engorde }: HerdStackChartProps) {
  const data = [{ name: "Hato", cria, recria, engorde }];

  return (
    <div className="flex flex-col gap-3">
      <ChartContainer config={chartConfig} className="aspect-auto h-16 w-full">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" hide />
          <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
          <Bar dataKey="cria" stackId="herd" fill="var(--color-cria)" radius={[4, 0, 0, 4]} />
          <Bar dataKey="recria" stackId="herd" fill="var(--color-recria)" />
          <Bar dataKey="engorde" stackId="herd" fill="var(--color-engorde)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartContainer>
      <div className="flex items-center justify-center gap-4 text-xs">
        {(Object.entries(chartConfig) as [keyof typeof chartConfig, (typeof chartConfig)[keyof typeof chartConfig]][]).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: cfg.color }} />
            <span className="text-muted-foreground">{cfg.label}</span>
            <span className="font-medium text-foreground">{data[0][key]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
