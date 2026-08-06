import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { CHART_COLORS } from "@/features/dashboard/lib/chart-colors";
import type { DashboardMonthlyBirth } from "@/features/dashboard/types";

const chartConfig = {
  count: { label: "Partos", color: CHART_COLORS.cria },
} satisfies ChartConfig;

function formatMonth(month: string): string {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString("es-BO", { month: "short" });
}

/** Line chart de un solo hue — tendencia de partos, últimos 6 meses. */
export function BirthsTrendChart({ data }: { data: DashboardMonthlyBirth[] }) {
  const chartData = data.map((d) => ({ month: formatMonth(d.month), count: d.count }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">
      <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} className="stroke-border/50" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis hide allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "var(--border)" }} />
        <Line
          dataKey="count"
          type="monotone"
          stroke="var(--color-count)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-count)", strokeWidth: 2, stroke: "#ffffff" }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
        />
      </LineChart>
    </ChartContainer>
  );
}
