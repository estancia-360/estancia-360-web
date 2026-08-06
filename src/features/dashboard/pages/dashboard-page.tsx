import { useEffect, useState, useCallback } from "react";
import { Gauge, Beef, TriangleAlert, ArrowLeftRight, Baby, Sprout, UtensilsCrossed, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/layout/fade-in";
import { StatTile } from "@/components/layout/stat-tile";
import { ModuleIcon } from "@/components/layout/module-icon";
import { HerdStackChart } from "@/features/dashboard/components/herd-stack-chart";
import { AlertsBarChart } from "@/features/dashboard/components/alerts-bar-chart";
import { MovementsBarChart } from "@/features/dashboard/components/movements-bar-chart";
import { BirthsTrendChart } from "@/features/dashboard/components/births-trend-chart";
import { MovementsTrendChart } from "@/features/dashboard/components/movements-trend-chart";
import { TrendLineChart } from "@/features/dashboard/components/trend-line-chart";
import { SingleHueBarChart } from "@/features/dashboard/components/single-hue-bar-chart";
import { PartToWholeStackChart } from "@/features/dashboard/components/part-to-whole-stack-chart";
import { CHART_COLORS } from "@/features/dashboard/lib/chart-colors";
import { getDashboardStats } from "@/features/dashboard/api/dashboard-api";
import type { DashboardStats } from "@/features/dashboard/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { hasProductionType, PRODUCTION_TYPE_IDS } from "@/features/subscriptions/types";
import { translateError } from "@/lib/error-messages";

function formatMonth(month: string): string {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString("es-BO", { month: "short" });
}

interface ChartBlockProps {
  title: string;
  children: React.ReactNode;
}

function ChartBlock({ title, children }: ChartBlockProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

interface SectionProps {
  icon: typeof Gauge;
  color: "green" | "orange" | "blue" | "accent";
  title: string;
  description: string;
  delay: number;
  children: React.ReactNode;
}

function Section({ icon, color, title, description, delay, children }: SectionProps) {
  return (
    <FadeIn delay={delay}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ModuleIcon icon={icon} color={color} size="sm" />
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </FadeIn>
  );
}

export function DashboardPage() {
  const { session } = useAuth();
  const { ranch } = useRanchSubscription();
  const ranchId = ranch.id;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    if (!session) return;
    getDashboardStats(ranchId, session.accessToken)
      .then((res) => setStats(res.dashboard))
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar las estadísticas.")))
      .finally(() => setIsLoading(false));
  }, [session, ranchId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = () => {
    setIsLoading(true);
    load();
  };

  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ModuleIcon icon={Gauge} color="blue" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-blue">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Estadísticas de tu estancia.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCcw data-icon="inline-start" />
          Actualizar
        </Button>
      </FadeIn>

      {isLoading || !stats ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <>
          <Section
            icon={Beef}
            color="green"
            title="Hato general"
            description={`${stats.herd.totalActive} animales activos por etapa productiva.`}
            delay={0}
          >
            <HerdStackChart cria={stats.herd.criaCount} recria={stats.herd.recriaCount} engorde={stats.herd.engordeCount} />
          </Section>

          <Section icon={TriangleAlert} color="orange" title="Alertas operativas" description="Cosas que probablemente necesitan tu atención." delay={80}>
            <AlertsBarChart
              quarantine={stats.alerts.quarantineCount}
              activeWithdrawal={stats.alerts.activeWithdrawalCount}
              pendingSales={stats.alerts.pendingSalesCount}
            />
          </Section>

          <Section icon={ArrowLeftRight} color="orange" title="Movimientos" description="Compras y ventas — este mes y tendencia de 6 meses." delay={160}>
            <div className="grid gap-4 sm:grid-cols-2">
              <MovementsBarChart label="Cantidad" ventas={stats.movements.salesCountThisMonth} compras={stats.movements.purchasesCountThisMonth} />
              <MovementsBarChart label="Monto (Bs)" ventas={stats.movements.salesAmountThisMonth} compras={stats.movements.purchasesAmountThisMonth} />
            </div>
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Tendencia de monto — últimos 6 meses</p>
              <MovementsTrendChart data={stats.trends.movements} />
            </div>
          </Section>

          {hasProductionType(ranch, PRODUCTION_TYPE_IDS.CRIA) ? (
            <Section icon={Baby} color="orange" title="Cría" description="Ciclo reproductivo y nacimientos." delay={240}>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                  <StatTile icon={Baby} color="orange" label="Preñadas activas" value={stats.breeding.activePregnancies} delay={0} />
                  <StatTile icon={Baby} color="orange" label="Partos últimos 30 días" value={stats.breeding.birthsLast30Days} delay={40} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <ChartBlock title="Partos por mes — últimos 6 meses">
                    <BirthsTrendChart data={stats.trends.births} />
                  </ChartBlock>
                  <ChartBlock title="Servicios reproductivos por mes">
                    <TrendLineChart
                      data={stats.breeding.servicesByMonth.map((r) => ({ month: formatMonth(r.month), count: r.count }))}
                      series={[{ key: "count", label: "Servicios", color: CHART_COLORS.cria }]}
                    />
                  </ChartBlock>
                  <ChartBlock title="Resultado de diagnósticos — últimos 6 meses">
                    <PartToWholeStackChart
                      segments={[
                        { key: "pregnant", label: "Preñada", color: CHART_COLORS.engorde, value: stats.breeding.diagnosisResults.pregnant },
                        { key: "empty", label: "Vacía", color: CHART_COLORS.deemphasis, value: stats.breeding.diagnosisResults.empty },
                      ]}
                    />
                  </ChartBlock>
                </div>
              </div>
            </Section>
          ) : null}

          {hasProductionType(ranch, PRODUCTION_TYPE_IDS.RECRIA) ? (
            <Section icon={Sprout} color="blue" title="Recría" description="Animales en recría y su peso promedio." delay={320}>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                  <StatTile icon={Sprout} color="blue" label="Animales activos" value={stats.rearing.activeCount} delay={0} />
                  {stats.rearing.avgWeight !== null ? (
                    <StatTile icon={Sprout} color="blue" label="Peso promedio (kg)" value={Math.round(stats.rearing.avgWeight * 10) / 10} delay={40} />
                  ) : (
                    <div className="flex items-center rounded-xl bg-card p-4 text-xs text-muted-foreground ring-1 ring-foreground/10">
                      Sin pesajes registrados.
                    </div>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <ChartBlock title="Destino de selección — histórico">
                    <PartToWholeStackChart
                      segments={[
                        { key: "replacement", label: "Reemplazo", color: CHART_COLORS.recria, value: stats.rearing.selectionBreakdown.replacement },
                        { key: "fattening", label: "Engorde", color: CHART_COLORS.engorde, value: stats.rearing.selectionBreakdown.fattening },
                        { key: "sale", label: "Venta", color: CHART_COLORS.cria, value: stats.rearing.selectionBreakdown.sale },
                      ]}
                    />
                  </ChartBlock>
                  <ChartBlock title="Peso promedio por mes">
                    <TrendLineChart
                      data={stats.rearing.weightTrend.map((r) => ({
                        month: formatMonth(r.month),
                        avgWeight: r.avgWeight !== null ? Math.round(r.avgWeight * 10) / 10 : null,
                      }))}
                      series={[{ key: "avgWeight", label: "Peso promedio (kg)", color: CHART_COLORS.recria }]}
                    />
                  </ChartBlock>
                  <ChartBlock title="Pesajes por mes">
                    <SingleHueBarChart
                      data={stats.rearing.weightTrend.map((r) => ({ label: formatMonth(r.month), value: r.count }))}
                      color={CHART_COLORS.recria}
                      valueLabel="Pesajes"
                    />
                  </ChartBlock>
                </div>
              </div>
            </Section>
          ) : null}

          {hasProductionType(ranch, PRODUCTION_TYPE_IDS.ENGORDE) ? (
            <Section icon={UtensilsCrossed} color="green" title="Engorde" description="Animales en engorde y su peso promedio." delay={400}>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                  <StatTile icon={UtensilsCrossed} color="green" label="Animales activos" value={stats.fattening.activeCount} delay={0} />
                  {stats.fattening.avgWeight !== null ? (
                    <StatTile icon={UtensilsCrossed} color="green" label="Peso promedio (kg)" value={Math.round(stats.fattening.avgWeight * 10) / 10} delay={40} />
                  ) : (
                    <div className="flex items-center rounded-xl bg-card p-4 text-xs text-muted-foreground ring-1 ring-foreground/10">
                      Sin pesajes registrados.
                    </div>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <ChartBlock title="Sistema — histórico">
                    <PartToWholeStackChart
                      segments={[
                        { key: "field", label: "Campo", color: CHART_COLORS.engorde, value: stats.fattening.systemBreakdown.field },
                        { key: "feedlot", label: "Feedlot", color: CHART_COLORS.recria, value: stats.fattening.systemBreakdown.feedlot },
                      ]}
                    />
                  </ChartBlock>
                  <ChartBlock title="Peso promedio por mes">
                    <TrendLineChart
                      data={stats.fattening.weightTrend.map((r) => ({
                        month: formatMonth(r.month),
                        avgWeight: r.avgWeight !== null ? Math.round(r.avgWeight * 10) / 10 : null,
                      }))}
                      series={[{ key: "avgWeight", label: "Peso promedio (kg)", color: CHART_COLORS.engorde }]}
                    />
                  </ChartBlock>
                  <ChartBlock title="Costo de alimentación por mes (Bs)">
                    <SingleHueBarChart
                      data={stats.fattening.feedCostByMonth.map((r) => ({ label: formatMonth(r.month), value: r.cost }))}
                      color={CHART_COLORS.engorde}
                      valueLabel="Costo (Bs)"
                    />
                  </ChartBlock>
                </div>
              </div>
            </Section>
          ) : null}
        </>
      )}
    </div>
  );
}
