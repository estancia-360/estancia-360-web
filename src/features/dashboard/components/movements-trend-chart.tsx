import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { CHART_COLORS } from "@/features/dashboard/lib/chart-colors";
import type { DashboardMonthlyMovement } from "@/features/dashboard/types";

const chartConfig = {
  salesAmount: { label: "Ventas (Bs)", color: CHART_COLORS.ventas },
  purchasesAmount: { label: "Compras (Bs)", color: CHART_COLORS.compras },
} satisfies ChartConfig;

function formatMonth(month: string): string {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString("es-BO", { month: "short" });
}

/** Line chart de 2 series (Ventas/Compras, monto) — tendencia últimos 6 meses. */
export function MovementsTrendChart({ data }: { data: DashboardMonthlyMovement[] }) {
  const chartData = data.map((d) => ({ month: formatMonth(d.month), salesAmount: d.salesAmount, purchasesAmount: d.purchasesAmount }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">
      <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} className="stroke-border/50" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis hide />
        <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "var(--border)" }} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="salesAmount"
          type="monotone"
          stroke="var(--color-salesAmount)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-salesAmount)", strokeWidth: 2, stroke: "#ffffff" }}
        />
        <Line
          dataKey="purchasesAmount"
          type="monotone"
          stroke="var(--color-purchasesAmount)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-purchasesAmount)", strokeWidth: 2, stroke: "#ffffff" }}
        />
      </LineChart>
    </ChartContainer>
  );
}
