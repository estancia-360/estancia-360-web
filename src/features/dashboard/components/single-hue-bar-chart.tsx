import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

interface SingleHueBarChartProps {
  data: { label: string; value: number }[];
  color: string;
  valueLabel: string;
}

/** Bar chart genérico de un solo hue — magnitud entre bins, no identidad (sin legend). */
export function SingleHueBarChart({ data, color, valueLabel }: SingleHueBarChartProps) {
  const chartConfig = { value: { label: valueLabel, color } } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">
      <BarChart data={data} margin={{ top: 20 }}>
        <CartesianGrid vertical={false} className="stroke-border/50" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
        <YAxis hide allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} maxBarSize={56}>
          <LabelList dataKey="value" position="top" className="fill-foreground" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
