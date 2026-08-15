import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { CHART_COLORS } from "@/features/dashboard/lib/chart-colors";

const chartConfig = {
  value: { label: "Cantidad", color: CHART_COLORS.alerta },
} satisfies ChartConfig;

interface AlertsBarChartProps {
  quarantine: number;
  activeWithdrawal: number;
  pendingSales: number;
}

/** Bar chart de un solo hue — 3 bins de magnitud, no identidad (no son series). */
export function AlertsBarChart({ quarantine, activeWithdrawal, pendingSales }: AlertsBarChartProps) {
  const data = [
    { label: "Cuarentena", value: quarantine },
    { label: "Retiro activo", value: activeWithdrawal },
    { label: "Ventas pendientes", value: pendingSales },
  ];

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
