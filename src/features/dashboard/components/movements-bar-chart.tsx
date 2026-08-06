import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { CHART_COLORS } from "@/features/dashboard/lib/chart-colors";

const chartConfig = {
  ventas: { label: "Ventas", color: CHART_COLORS.ventas },
  compras: { label: "Compras", color: CHART_COLORS.compras },
} satisfies ChartConfig;

interface MovementsBarChartProps {
  label: string;
  ventas: number;
  compras: number;
}

/** Grouped bar chart — 2 series (Ventas/Compras), reusado para "cantidad" y "monto" por separado (nunca dual-axis). */
export function MovementsBarChart({ label, ventas, compras }: MovementsBarChartProps) {
  const data = [{ label, ventas, compras }];

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-40 w-full">
      <BarChart data={data} margin={{ top: 8 }}>
        <CartesianGrid vertical={false} className="stroke-border/50" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis hide />
        <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "var(--muted)" }} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="ventas" fill="var(--color-ventas)" radius={[4, 4, 0, 0]} maxBarSize={48} />
        <Bar dataKey="compras" fill="var(--color-compras)" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ChartContainer>
  );
}
